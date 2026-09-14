import type { completeShip, hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"
import { cloneShip, mulStat } from "./modUtils"

export const ID = "reinforcedhull"
const HULL_MULT = 1.4

export function applyReinforcedBulkheads(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "hitpoints", HULL_MULT)
  return next
}

export function describeReinforcedBulkheads(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["40%"])
}
