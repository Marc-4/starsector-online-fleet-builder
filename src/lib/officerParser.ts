import type {
  officer,
  officerNameEntry,
  officerPersonality,
  officerSkillDef,
  officerSkillMeta,
} from "#/types"
import { fetchCsvText, parseCsv } from "./csvParser"

const DATA_BASE = `${import.meta.env.BASE_URL}data/`
const BASE = import.meta.env.BASE_URL || "/"

export const OFFICER_MAX_LEVEL = 8
export const OFFICER_MAX_SKILLS = 8
export const OFFICER_SKILL_TIERS: Record<number, number> = {
  1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 4, 7: 5, 8: 5,
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

const skillDefCache = new Map<string, Promise<officerSkillDef | null>>()
export function getOfficerSkillDef(id: string): Promise<officerSkillDef | null> {
  let pending = skillDefCache.get(id)
  if (!pending) {
    pending = fetchSkillText(id)
      .then((raw) => {
        const parsed = JSON.parse(stripSkillComments(raw)) as Record<string, unknown>
        return {
          id: String(parsed.id ?? id),
          governingAptitude: parsed.governingAptitude
            ? String(parsed.governingAptitude)
            : null,
          elite: parsed.elite === true,
          scope: parsed.scope ? String(parsed.scope) : null,
        } as officerSkillDef
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

/** Create a level-1 officer with random name/portrait/personality. Caller adds skills on level-up. */
export async function createOfficer(opts?: {
  gender?: "m" | "f"
  rand?: () => number
}): Promise<officer> {
  const rand = opts?.rand ?? Math.random
  const { first, last, gender } = await randomOfficerName({
    gender: opts?.gender,
    rand,
  })
  const personalities = await getAllPersonalities()
  return {
    id: crypto.randomUUID(),
    firstName: first,
    lastName: last,
    gender,
    portrait: randomPortrait(rand),
    personality: personalities.length ? pick(personalities, rand).id : "steady",
    level: 1,
    eliteSkills: [],
    skills: [],
  }
}

/** Skill tier required to unlock at a given officer level (vanilla gating). */
export function skillTierForLevel(level: number): number {
  return OFFICER_SKILL_TIERS[Math.min(Math.max(level, 1), 8)] ?? 1
}

/** Validate a skill pick: known, pickable, tier-gated, not duplicate, under cap. */
export async function canPickSkill(
  officer: officer,
  skill: officerSkillMeta,
  newLevel = officer.level,
): Promise<string | null> {
  if (officer.skills.includes(skill.id)) return "Skill already taken"
  if (officer.skills.length >= OFFICER_MAX_SKILLS) return "Max 8 skills"
  const pickable = await getPickableOfficerSkills()
  if (!pickable.some((s) => s.id === skill.id)) return "Not an officer skill"
  if ((skill.tier ?? 1) > skillTierForLevel(newLevel))
    return `Requires level ${Object.keys(OFFICER_SKILL_TIERS).find(
      (l) => OFFICER_SKILL_TIERS[Number(l)] === skill.tier,
    ) ?? newLevel}+`
  return null
}
