import type { weapon } from "#/types"
import manifest from "../weaponData/manifest.json"

const weapons = import.meta.glob<string>("../weaponData/*.wpn", {
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
    return JSON.parse(quoted) as weapon
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
    const names = manifest as string[]
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
  const key = `../weaponData/${id}.wpn`
  const loader = weapons[key]
  if (!loader) throw new Error(`Weapon ${id} not found`)
  const content = await loader()
  return parseWeapon(content)
}
