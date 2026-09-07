import type { ship, shipSkin } from "#/types"
import manifest from "../shipData/manifest.json"

const ships = import.meta.glob<string>("../shipData/*.ship", {
  query: "?raw",
  import: "default",
  eager: false
})
const skins = import.meta.glob<string>("../shipData/skins/*.skin", {
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

function parseSkin(raw: string) {
  const normalized = raw.replace(/\r\n/g, "\n")
  const noComments = stripComments(normalized)
  const noTrailing = noComments.replace(/,\s*([}\]])/g, "$1")
  const normNums = noTrailing.replace(/:\s*\./g, ":0.")
  // Quote bare enum values like :SYNERGY, [CIVILIAN] outside strings
  const quoted = normNums.replace(
    /([:\[,]\s*)([A-Z][A-Z0-9_]*)\s*(?=[,\]\}])/g,
    '$1"$2"'
  )
  try {
    return JSON.parse(quoted)
  } catch (e) {
    console.error(
      "Failed skin JSON near:",
      quoted.split("\n").slice(30, 40).join("\n")
    )
    throw e
  }
}

// Function to merge skin data structure on to base ship
function mergeSkin(base: ship, skin: shipSkin): ship {
  const merged = structuredClone(base)
  merged.hullId = skin.skinHullId
  // identity overrides
  if (skin.hullName) merged.hullName = skin.hullName
  if (skin.spriteName)
    merged.spriteName = skin.spriteName.slice(14).replace(/\.png/i, ".webp")
  if (skin.style) merged.style = skin.style
  if (skin.coversColor) merged.coversColor = skin.coversColor

  // deletions
  merged.weaponSlots = merged.weaponSlots?.filter(
    (slot) => !skin.removeWeaponSlots?.includes(slot.id)
  )
  merged.builtInMods = merged.builtInMods?.filter(
    (mod) => !skin.removeBuiltInMods?.includes(mod)
  )
  merged.engineSlots = merged.engineSlots?.filter(
    (_, i) => !skin.removeEngineSlots?.includes(i)
  )
  if (skin.removeBuiltInWeapons && merged.builtInWeapons)
    for (const k of skin.removeBuiltInWeapons) delete merged.builtInWeapons[k]

  // weapon slot mutation
  for (const [id, patch] of Object.entries(skin.weaponSlotChanges ?? {})) {
    const slot = merged.weaponSlots?.find((s) => s.id === id)
    if (slot) Object.assign(slot, patch)
  }

  // additions from skin to base hull
  if (skin.builtInMods)
    merged.builtInMods = [...(merged.builtInMods ?? []), ...skin.builtInMods]
  if (skin.builtInWeapons)
    merged.builtInWeapons = {
      ...(merged.builtInWeapons ?? {}),
      ...skin.builtInWeapons
    }
  if (skin.builtInWings) merged.builtInWings = skin.builtInWings

  return merged
}

export async function getAllShips(): Promise<ship[]> {
  try {
    const names = manifest as string[]
    const results = await Promise.allSettled(
      names.map((name) => getShip({ name }))
    )
    const fulfilled = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value)
    const rejected = results.filter(
      (r) => r.status === "rejected"
    ) as PromiseRejectedResult[]
    if (rejected.length) {
      console.warn(
        `Skipped ${rejected.length} hulls with missing base:`,
        rejected.map((r) => String(r.reason))
      )
    }
    return fulfilled
  } catch (e) {
    console.log(e)
    throw new Error("Error fetching manifest")
  }
}

export async function getShip({ name }: { name: string }): Promise<ship> {
  const shipKey = `../shipData/${name}.ship`
  if (ships[shipKey]) {
    const loader = ships[shipKey]
    if (!loader) throw new Error(`Ship ${name} not found`)

    const content = await loader()
    const shipJson = JSON.parse(content) as ship
    shipJson.spriteName = shipJson.spriteName
      .slice(14)
      .replace(/\.png$/i, ".webp")
    return shipJson
  } else {
    const skinKey = `../shipData/skins/${name}.skin`
    const skinLoader = skins[skinKey]
    if (!skinLoader) throw new Error(`Ship skin ${name} not found`)
    const skin = parseSkin(await skinLoader()) as shipSkin
    const base = await getShip({ name: skin.baseHullId })
    return mergeSkin(base, skin)
  }
}

export function isModule({ ship }: { ship: ship }): boolean {
  return (
    !!ship.moduleAnchor ||
    ship.hullId.startsWith("module_") ||
    ship.hullId.endsWith("_module") ||
    ship.hullId.includes("station") ||
    ship.hullId.toLowerCase().includes("armour")
  )
}
