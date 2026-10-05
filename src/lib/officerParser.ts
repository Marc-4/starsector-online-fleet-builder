import type {
  officer,
  officerNameEntry,
  officerPersonality,
  officerSkillDef,
  officerSkillMeta,
  officerType,
} from "#/types"
import { fetchCsvText, parseCsv } from "./csvParser"

const DATA_BASE = `${import.meta.env.BASE_URL}data/`
const BASE = import.meta.env.BASE_URL || "/"

export const OFFICER_MAX_LEVEL = 8
export const OFFICER_MAX_SKILLS = 8
export const OFFICER_TYPE_MAX_LEVEL: Record<officer["type"], number> = {
  captain: 15,
  officer: 5,
  "ai-core": 8,
}

/** Max level for an officer of the given type. Plain officers cap at 5. */
export function maxLevelForType(type: officer["type"]): number {
  return OFFICER_TYPE_MAX_LEVEL[type] ?? OFFICER_MAX_LEVEL
}
export const OFFICER_TYPE_MAX_SKILLS: Record<officer["type"], number> = {
  captain: 15,
  officer: 5,
  "ai-core": 8,
}

/** Max skills for an officer of the given type (matches the level cap). */
export function maxSkillsForType(type: officer["type"]): number {
  return OFFICER_TYPE_MAX_SKILLS[type] ?? OFFICER_MAX_SKILLS
}

/** Selectable skill cap: officer level, bounded by the type cap. */
export function maxSkillsForOfficer(officer: Pick<officer, "type" | "level">): number {
  return Math.min(
    Math.max(1, officer.level),
    maxSkillsForType(officer.type ?? "officer"),
  )
}
export const OFFICER_SKILL_TIERS: Record<number, number> = {
  1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 4, 7: 5, 8: 5,
  9: 5, 10: 5, 11: 5, 12: 5, 13: 5, 14: 5, 15: 5,
}

// .skill files are officer-specific JSON-with-comments (like .wpn/.ship),
// so their fetch + comment-stripping lives here, not in csvParser.
const skillTextCache = new Map<string, Promise<string>>()
function fetchSkillText(id: string): Promise<string> {
  const path = `characters/skills/${id}.skill`
  let pending = skillTextCache.get(path)
  if (!pending) {
    pending = fetch(`${DATA_BASE}${path}`).then((res) => {
      if (!res.ok) throw new Error(`Skill ${id} not found`)
      return res.text()
    })
    pending.catch(() => skillTextCache.delete(path))
    skillTextCache.set(path, pending)
  }
  return pending
}

function stripSkillComments(s: string): string {
  return s
    .split("\n")
    .map((line) => {
      let inStr = false
      for (let i = 0; i < line.length; i++) {
        const c = line[i]
        if (c === '"') inStr = !inStr
        if (c === "#" && !inStr) return line.slice(0, i)
      }
      return line
    })
    .join("\n")
    .replace(/,\s*([}\]])/g, "$1")
}

// ---- personalities ----

let personalitiesCache: Promise<officerPersonality[]> | null = null
export function getAllPersonalities(): Promise<officerPersonality[]> {
  if (!personalitiesCache) {
    personalitiesCache = fetchCsvText("characters/personalities.csv").then((text) =>
      parseCsv<Record<string, unknown>>(text)
        .filter((r) => r.id && !String(r.id).startsWith("#"))
        .map((r) => ({
          id: String(r.id),
          name: String(r.name ?? r.id),
          desc: String(r.desc ?? ""),
        })),
    )
  }
  return personalitiesCache
}

// ---- names ----

let namesCache: Promise<officerNameEntry[]> | null = null
export function getAllNames(): Promise<officerNameEntry[]> {
  if (!namesCache) {
    namesCache = fetchCsvText("characters/person_names.csv").then((text) =>
      parseCsv<officerNameEntry>(text).filter(
        (r) => r.name && !String(r.name).startsWith("#"),
      ),
    )
  }
  return namesCache
}

function pick<T>(arr: T[], rand: () => number = Math.random): T {
  return arr[Math.floor(rand() * arr.length)]
}

/** Random full name for a gender, optionally filtered by category. */
export async function randomOfficerName(opts?: {
  gender?: "m" | "f"
  category?: string
  rand?: () => number
}): Promise<{ first: string; last: string; gender: "m" | "f" }> {
  const rand = opts?.rand ?? Math.random
  const gender = opts?.gender ?? (rand() < 0.5 ? "m" : "f")
  let names = await getAllNames()
  if (opts?.category) names = names.filter((n) => n.category === opts.category)
  const matchGender = (n: officerNameEntry) =>
    !n.gender || n.gender === gender || n.gender.includes(gender)
  const uses = (n: officerNameEntry, u: string) => (n.usage ?? "").includes(u)
  const firsts = names.filter((n) => matchGender(n) && uses(n, "f"))
  const lasts = names.filter((n) => uses(n, "l"))
  const first = firsts.length ? pick(firsts, rand).name : gender === "f" ? "Alex" : "John"
  const last = lasts.length ? pick(lasts, rand).name : "Smith"
  return { first, last, gender }
}

// ---- skills ----

let skillMetaCache: Promise<officerSkillMeta[]> | null = null
export function getAllOfficerSkillMeta(): Promise<officerSkillMeta[]> {
  if (!skillMetaCache) {
    skillMetaCache = fetchCsvText("characters/skills/skill_data.csv").then((text) =>
      parseCsv<Record<string, unknown>>(text)
        .filter((r) => r.id && !String(r.id).startsWith("#"))
        .map((r) => ({
          id: String(r.id),
          name: String(r.name || r.id),
          tier: r.tier == null || r.tier === "" ? null : Number(r.tier),
          description: String(r.description ?? ""),
          icon: r.icon ? String(r.icon) : null,
          tags: r.tags ? String(r.tags) : null,
          combatOfficer:
            String(r["combat officer"] ?? "").toUpperCase() === "TRUE",
        })),
    )
  }
  return skillMetaCache
}

/** Skills an officer can actually pick (combat-officer flagged, not npc_only/deprecated). */
export async function getPickableOfficerSkills(): Promise<officerSkillMeta[]> {
  const all = await getAllOfficerSkillMeta()
  return all.filter((s) => {
    if (!s.combatOfficer) return false
    const tags = (s.tags ?? "").toLowerCase()
    if (tags.includes("npc_only") || tags.includes("deprecated")) return false
    return true
  })
}

/** Captain (player) skill pool: every skill, including non-combat ones.
 *  `aptitude_*` rows are tree icons, not skills. */
export async function getPickableCaptainSkills(): Promise<officerSkillMeta[]> {
  const all = await getAllOfficerSkillMeta()
  return all.filter((s) => {
    if (s.id.startsWith("aptitude_")) return false
    const tags = (s.tags ?? "").toLowerCase()
    if (tags.includes("npc_only") || tags.includes("deprecated")) return false
    return true
  })
}

const skillDefCache = new Map<string, Promise<officerSkillDef | null>>()
/** Quote bare (unquoted) enum values vanilla .skill files use for scope etc.
 *  e.g. `"scope":CUSTOM` -> `"scope":"CUSTOM"`. */
function quoteBareSkillValues(s: string): string {
  return s.replace(
    /("[A-Za-z0-9_]+"(\s*:\s*))(ALL_SHIPS|ALL_COMBAT_SHIPS|PILOTED_SHIP|FLEET|CHARACTER|CUSTOM|SHIP)(?=[\s,\}\]])/g,
    `$1"$3"`,
  )
}

/** Regex fallback so a single unparseable field never hides the whole skill. */
function parseSkillDefFallback(
  id: string,
  raw: string,
): officerSkillDef | null {
  const gov =
    raw.match(/"governingAptitude"\s*:\s*"([^"]+)"/)?.[1] ??
    raw.match(/governingAptitude\s*:\s*"?([A-Za-z0-9_]+)"?/)?.[1] ??
    null
  if (!gov && !raw.includes(id)) return null
  const scope =
    raw.match(/"scope"\s*:\s*"([^"]+)"/)?.[1] ??
    raw.match(/"scope"\s*:\s*([A-Za-z0-9_]+)/)?.[1] ??
    null
  return {
    id,
    governingAptitude: gov,
    elite: /"elite"\s*:\s*true/.test(raw),
    scope,
  } as officerSkillDef
}

export function getOfficerSkillDef(id: string): Promise<officerSkillDef | null> {
  let pending = skillDefCache.get(id)
  if (!pending) {
    pending = fetchSkillText(id)
      .then((raw) => {
        const cleaned = quoteBareSkillValues(stripSkillComments(raw))
        try {
          const parsed = JSON.parse(cleaned) as Record<string, unknown>
          return {
            id: String(parsed.id ?? id),
            governingAptitude: parsed.governingAptitude
              ? String(parsed.governingAptitude)
              : null,
            elite: parsed.elite === true,
            scope: parsed.scope ? String(parsed.scope) : null,
          } as officerSkillDef
        } catch {
          return parseSkillDefFallback(id, raw)
        }
      })
      .catch(() => null)
    skillDefCache.set(id, pending)
  }
  return pending
}

/** Public URL for a skill icon. CSV stores e.g. `graphics/icons/skills/x.png`, served as webp. */
export function resolveSkillIconUrl(icon: string | null | undefined): string | null {
  const s = (icon ?? "").trim()
  if (!s) return null
  const base = s.split("/").pop() ?? s
  return `skills/${base.replace(/\.png$/i, ".webp")}`
}

// ---- portraits ----

export const PORTRAIT_GROUPS: { label: string; prefix: string }[] = [
  { label: "Standard", prefix: "portrait" },
  { label: "Hegemony", prefix: "portrait_hegemony" },
  { label: "Diktat", prefix: "portrait_diktat" },
  { label: "League", prefix: "portrait_league" },
  { label: "Luddic", prefix: "portrait_luddic" },
  { label: "Pirates", prefix: "portrait_pirate" },
  { label: "Mercenary", prefix: "portrait_mercenary" },
  { label: "Corporate", prefix: "portrait_corporate" },
  { label: "AI", prefix: "portrait_ai" },
]

export function resolvePortraitUrl(file: string): string {
  const clean = file.replace(/^portraits\//, "")
  return `${BASE}portraits/${clean}`
}

/** Portrait filenames grouped for the picker. Served from `public/portraits/`.
 *  A manifest would be ideal; until then this curates the known vanilla set
 *  so the modal can render without directory listing. */
export function getPortraitChoices(): { file: string; url: string; group: string }[] {
  const files: { file: string; group: string }[] = []
  const push = (file: string, group: string) => files.push({ file, group })
  for (let i = 12; i <= 49; i++) {
    if (i === 19) continue
    push(`portrait${i}.png`, "Standard")
  }
  const ranges: [string, string, number, number][] = [
    ["portrait_hegemony", "Hegemony", 1, 17],
    ["portrait_diktat", "Diktat", 1, 16],
    ["portrait_league", "League", 0, 14],
    ["portrait_luddic", "Luddic", 0, 16],
    ["portrait_pirate", "Pirates", 1, 22],
    ["portrait_mercenary", "Mercenary", 1, 8],
    ["portrait_corporate", "Corporate", 1, 11],
  ]
  for (const [prefix, group, from, to] of ranges) {
    for (let i = from; i <= to; i++) {
      push(`${prefix}${String(i).padStart(2, "0")}.png`, group)
    }
  }
  push("portrait_ai1.png", "AI")
  push("portrait_ai1b.png", "AI")
  push("portrait_ai2.png", "AI")
  push("portrait_ai2b.png", "AI")
  push("portrait_ai3.png", "AI")
  push("portrait_ai3b.png", "AI")
  return files.map((f) => ({ ...f, url: resolvePortraitUrl(f.file) }))
}

export function randomPortrait(rand: () => number = Math.random): string {
  return pick(getPortraitChoices(), rand).file
}

// ---- officer factory / validation ----

/** Create a level-1 officer with random name/portrait. Caller adds skills on level-up. */
export async function createOfficer(opts?: {
  gender?: "m" | "f"
  type?: officerType
  rand?: () => number
}): Promise<officer> {
  const rand = opts?.rand ?? Math.random
  const { first, last, gender } = await randomOfficerName({
    gender: opts?.gender,
    rand,
  })
  return {
    id: crypto.randomUUID(),
    firstName: first,
    lastName: last,
    gender,
    portrait: randomPortrait(rand),
    personality: "steady",
    type: opts?.type ?? "officer",
    level: 1,
    eliteSkills: [],
    skills: [],
  }
}

/** Skill tier unlocked at a given level (captain tiering). */
export function skillTierForLevel(level: number): number {
  return OFFICER_SKILL_TIERS[Math.min(Math.max(level, 1), 15)] ?? 1
}

/**
 * Captain tier ladders. Each aptitude groups its CSV tiers into visual
 * rungs (matching the in-game tree); `requires[i]` = skill points needed
 * across all lower rungs to take a skill in rung `i`.
 * One taken skill = one point. Sources: skill_data.csv reqPoints,
 * AptitudeDesc ("top tier requires 4, second top-tier skill +2 lower"),
 * Fractal "Skill Changes, Part 1" (combat 8+2, leadership 6+2+2,
 * technology 2+2+4+2, industry 3+2+3+2).
 */
export const CAPTAIN_TIER_LADDERS: Record<
  string,
  { tiers: number[][]; requires: number[] }
> = {
  combat: { tiers: [[1, 2, 3, 4], [5]], requires: [0, 4] },
  leadership: { tiers: [[1, 2, 3], [4], [5]], requires: [0, 3, 4] },
  technology: { tiers: [[1], [2], [4], [5]], requires: [0, 1, 2, 4] },
  industry: { tiers: [[1], [3], [4], [5]], requires: [0, 1, 2, 4] },
}

/** Extra lower-tier points needed for the 2nd capstone in an aptitude. */
export const CAPTAIN_SECOND_CAPSTONE_EXTRA = 2

/** Rung index of a CSV tier within its aptitude ladder (-1 = not gated). */
export function captainSkillRung(aptitude: string, csvTier: number | null): number {
  const ladder = CAPTAIN_TIER_LADDERS[aptitude.toLowerCase()]
  if (!ladder || csvTier == null) return -1
  return ladder.tiers.findIndex((rung) => rung.includes(csvTier))
}

/** Prerequisite check for a captain skill. Returns a reason when blocked. */
export function captainTierBlockReason(opts: {
  takenIds: string[]
  skill: officerSkillMeta
  metaById: Map<string, officerSkillMeta>
  aptitudeOf: (id: string) => string | undefined
}): string | null {
  const aptitude = opts.aptitudeOf(opts.skill.id)?.toLowerCase()
  if (!aptitude) return null
  const ladder = CAPTAIN_TIER_LADDERS[aptitude]
  if (!ladder) return null
  const rung = captainSkillRung(aptitude, opts.skill.tier)
  if (rung <= 0) return null
  let lower = 0
  let topTaken = 0
  for (const id of opts.takenIds) {
    if (opts.aptitudeOf(id)?.toLowerCase() !== aptitude) continue
    const meta = opts.metaById.get(id)
    if (!meta) continue
    const r = captainSkillRung(aptitude, meta.tier)
    if (r >= 0 && r < rung) lower += 1
    else if (
      r === rung &&
      rung === ladder.tiers.length - 1 &&
      id !== opts.skill.id
    )
      topTaken += 1
  }
  let need = ladder.requires[rung] ?? 0
  // 2nd capstone in the same aptitude costs +2 points in lower tiers
  // (6 lower + 2 capstones = 8 total in the aptitude).
  if (rung === ladder.tiers.length - 1 && topTaken >= 1)
    need += CAPTAIN_SECOND_CAPSTONE_EXTRA
  if (lower < need)
    return `Requires ${need} ${aptitude} ${need === 1 ? "point" : "points"} in lower tiers (${lower}/${need})`
  return null
}

/** Validate a skill pick: known, pickable, not duplicate, under cap.
 *  Captains additionally follow their aptitude tier ladders. */
export async function canPickSkill(
  officer: officer,
  skill: officerSkillMeta,
): Promise<string | null> {
  if (officer.skills.includes(skill.id)) return "Skill already taken"
  const maxSkills = maxSkillsForOfficer(officer)
  if (officer.skills.length >= maxSkills) return `Max ${maxSkills} skills`
  const pickable =
    officer.type === "captain"
      ? await getPickableCaptainSkills()
      : await getPickableOfficerSkills()
  if (!pickable.some((s) => s.id === skill.id)) return "Not an officer skill"
  if (officer.type === "captain") {
    const metas = await getAllOfficerSkillMeta()
    const metaById = new Map(metas.map((m) => [m.id, m]))
    const defs = await Promise.all(
      [...officer.skills, skill.id].map((id) => getOfficerSkillDef(id)),
    )
    const aptitudeById = new Map<string, string>()
    ;[...officer.skills, skill.id].forEach((id, i) => {
      const gov = defs[i]?.governingAptitude
      if (gov) aptitudeById.set(id, gov)
    })
    return captainTierBlockReason({
      takenIds: officer.skills,
      skill,
      metaById,
      aptitudeOf: (id) => aptitudeById.get(id),
    })
  }
  return null
}
