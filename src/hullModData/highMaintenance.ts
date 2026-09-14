import type { completeShip, hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"
import { cloneShip, mulStat } from "./modUtils"

export const ID = "high_maintenance"
const MAINTENANCE_MULT = 2

export function applyHighMaintenance(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "supplies/mo", MAINTENANCE_MULT)
  return next
}

export function describeHighMaintenance(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["100%"])
}
