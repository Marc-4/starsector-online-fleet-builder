import type { projectile } from "#/types"

const projModules = import.meta.glob<string>("../weaponData/proj/*.proj", {
  query: "?raw",
  import: "default",
  eager: false
})

function stripComments(s: string): string {
  return s
    .split("\n")
    .map((line) => {
      let inStr = false,
        esc = false
      for (let i = 0; i < line.length; i++) {
        const c = line[i]
        if (esc) {
          esc = false
          continue
        }
        if (c === "\\") {
          if (inStr) esc = true
          continue
        }
        if (c === '"') {
          inStr = !inStr
          continue
        }
        if (c === "#" && !inStr) return line.slice(0, i)
      }
      return line
    })
    .join("\n")
}

function parseProjectile(raw: string, fallbackId: string): projectile {
  const normalized = raw.replace(/\r\n/g, "\n")
  const noComments = stripComments(normalized)
  const noTrailing = noComments.replace(/,\s*([}\]])/g, "$1")
  const noSemicolons = noTrailing.replace(/;\s*/g, ",").replace(/,\s*([}\]])/g, "$1")
  const normNums = noSemicolons.replace(/:\s*\./g, ":0.")
  const quoted = normNums.replace(
    /([:\[,]\s*)([A-Z][A-Z0-9_]*)\s*(?=[,\]\}])/g,
    '$1"$2"'
  )
  // Strip Java float suffixes (0.5f, 0f) — common in .proj engine specs.
  const noFloatSuffix = quoted.replace(/(\d)f(?=[,\]\}\s])/g, "$1")
  const parsed = JSON.parse(noFloatSuffix) as projectile & Record<string, unknown>
  if (!parsed.id) parsed.id = fallbackId
  return parsed as projectile
}

/** Map a .proj `sprite` source path to its public URL, or null when the
 *  tube should render empty (graphics/fx/empty.png, missing sprite). */
export function resolveProjectileSpriteUrl(
  sprite: string | undefined | null
): string | null {
  if (!sprite || typeof sprite !== "string") return null
  if (sprite.includes("graphics/fx/empty")) return null
  const m = sprite.match(/^graphics\/([^?#]+?)\.png$/i)
  if (!m) return null
  const base = m[1]
  // Only missiles + drone missiles render on racks. Anything else (e.g.
  // unexpected fx paths) still resolves by basename under /missiles as a
  // last resort, but fx/empty is already excluded above.
  if (base.startsWith("missiles/")) return `${base}.webp`
  if (base.startsWith("ships/drones/")) return `${base}.webp`
  return `missiles/${base.split("/").pop()}.webp`
}

const cache = new Map<string, projectile | null>()
const idIndex = new Map<string, string>()
let indexPromise: Promise<void> | null = null

async function ensureIndex(): Promise<void> {
  if (indexPromise) return indexPromise
  indexPromise = (async () => {
    const entries = Object.entries(projModules)
    const results = await Promise.allSettled(
      entries.map(async ([key, loader]) => {
        const content = await loader()
        const fallbackId = key.split("/").pop()?.replace(/\.proj$/, "") ?? key
        try {
          const parsed = parseProjectile(content, fallbackId)
          return { key, parsed }
        } catch (e) {
          console.warn(`Failed to parse projectile ${fallbackId}:`, e)
          return { key, parsed: null }
        }
      })
    )
    for (const r of results) {
      if (r.status !== "fulfilled" || !r.value.parsed) continue
      const { key, parsed } = r.value
      const p = parsed as projectile
      cache.set(p.id, p)
      // Also cache by filename so direct hits skip the index next time.
      const stem = key.split("/").pop()?.replace(/\.proj$/, "")
      if (stem && stem !== p.id && !cache.has(stem)) cache.set(stem, p)
      if (!idIndex.has(p.id)) idIndex.set(p.id, key)
    }
  })()
  return indexPromise
}

export async function getProjectile({
  id
}: {
  id: string
}): Promise<projectile | null> {
  if (cache.has(id)) return cache.get(id) ?? null
  const directKey = `../weaponData/proj/${id}.proj`
  const direct = projModules[directKey]
  if (direct) {
    try {
      const content = await direct()
      const parsed = parseProjectile(content, id)
      cache.set(id, parsed)
      cache.set(parsed.id, parsed)
      idIndex.set(parsed.id, directKey)
      return parsed
    } catch (e) {
      console.warn(`Failed to parse projectile ${id}:`, e)
      cache.set(id, null)
      return null
    }
  }
  // Filename may differ from .proj id (e.g. locust_srm.proj holds id
  // "locust"). Fall back to a full index scan keyed by parsed id.
  await ensureIndex()
  return cache.get(id) ?? null
}
