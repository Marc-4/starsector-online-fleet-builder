import type { weapon } from "#/types"

const DATA_BASE = `${import.meta.env.BASE_URL}data/`

const textCache = new Map<string, Promise<string>>()
function fetchWeaponText(id: string): Promise<string> {
  const path = `weapons/${id}.wpn`
  let pending = textCache.get(path)
  if (!pending) {
    pending = fetch(`${DATA_BASE}${path}`).then((res) => {
      if (!res.ok) throw new Error(`Weapon ${id} not found`)
      return res.text()
    })
    pending.catch(() => textCache.delete(path))
    textCache.set(path, pending)
  }
  return pending
}

let manifestCache: Promise<string[]> | null = null
function fetchWeaponManifest(): Promise<string[]> {
  if (!manifestCache) {
    manifestCache = fetch(`${DATA_BASE}weapon-manifest.json`).then((res) => {
      if (!res.ok)
        throw new Error(
          "Error fetching weapon manifest. Generate via `npm run generate:manifest`"
        )
      return res.json() as Promise<string[]>
    })
  }
  return manifestCache
}

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

function parseWeapon(raw: string): weapon {
  const normalized = raw.replace(/\r\n/g, "\n")
  const noComments = stripComments(normalized)
  const noTrailing = noComments.replace(/,\s*([}\]])/g, "$1")
  const noSemicolons = noTrailing.replace(/;\s*/g, ",").replace(/,\s*([}\]])/g, "$1")
  const normNums = noSemicolons.replace(/:\s*\./g, ":0.")
  // Quote bare enum values like :ROUGH, [RENDER_BARREL_BELOW] outside strings
  const quoted = normNums.replace(
    /([:\[,]\s*)([A-Z][A-Z0-9_]*)\s*(?=[,\]\}])/g,
    '$1"$2"'
  )
  try {
    const parsed = JSON.parse(quoted) as weapon
    for (const key of Object.keys(parsed)) {
      if (key.toLowerCase().includes("sprite") && typeof (parsed as Record<string, unknown>)[key] === "string") {
        const val = (parsed as Record<string, unknown>)[key] as string
        if (val.length >= 16) {
          ;(parsed as Record<string, unknown>)[key] = val.slice(16).replace(/\.png$/i, ".png")
        }
      }
    }
    return parsed
  } catch (e) {
    console.error(
      "Failed weapon JSON near:",
      quoted.split("\n").slice(0, 40).join("\n")
    )
    throw e
  }
}

export async function getAllWeapons(): Promise<weapon[]> {
  try {
    const names = await fetchWeaponManifest()
    const results = await Promise.allSettled(
      names.map((name) => getWeapon({ id: name }))
    )
    const fulfilled = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value)
    const rejected = results.filter(
      (r) => r.status === "rejected"
    ) as PromiseRejectedResult[]
    if (rejected.length) {
      console.warn(
        `Skipped ${rejected.length} weapons:`,
        rejected.map((r) => String(r.reason))
      )
    }
    return fulfilled
  } catch (e) {
    console.log(e)
    throw new Error(
      "Error fetching weapon manifest. Generate via `npm run generate:manifest`"
    )
  }
}

export async function getWeapon({ id }: { id: string }): Promise<weapon> {
  const content = await fetchWeaponText(id)
  return parseWeapon(content)
}
