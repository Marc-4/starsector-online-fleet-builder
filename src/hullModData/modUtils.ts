import type { completeShip, hullMod, shipStats } from "#/types"

type StatKey = keyof shipStats

function num(stats: shipStats, key: StatKey): number {
  const n = Number(stats[key] ?? 0)
  return Number.isFinite(n) ? n : 0
}

/** Multiply a numeric stat, rounding pools to integers. */
export function mulStat(
  stats: shipStats,
  key: StatKey,
  mult: number,
  round = true
): void {
  const v = num(stats, key) * mult
  ;(stats as Record<string, unknown>)[key as string] = round
    ? Math.round(v)
    : Math.round(v * 10000) / 10000
}

/** Add a flat amount to a numeric stat (rounded to integer pools). */
export function addStat(stats: shipStats, key: StatKey, amount: number): void {
  ;(stats as Record<string, unknown>)[key as string] = Math.round(
    num(stats, key) + amount
  )
}

/** Shallow-clone a ship so mods never mutate the input. */
export function cloneShip(ship: completeShip): completeShip {
  return { meta: ship.meta, stats: { ...ship.stats } }
}

/** Per-hull-size flat table, e.g. [frigate, destroyer, cruiser, capital]. */
export function byHullSize(
  hullSize: string,
  table: [number, number, number, number]
): number {
  switch ((hullSize || "").toUpperCase()) {
    case "FRIGATE":
      return table[0]
    case "DESTROYER":
      return table[1]
    case "CRUISER":
      return table[2]
    default:
      return table[3]
  }
}

export type { completeShip, hullMod }
