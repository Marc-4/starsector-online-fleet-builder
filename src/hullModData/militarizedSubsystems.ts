import type { completeShip, hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"
import { addStat, cloneShip, mulStat } from "./modUtils"

export const ID = "militarized_subsystems"
// Current (non-deprecated) version: +1 max burn, min crew x2 (S-mod negates crew).
const BURN_BONUS = 1
const MIN_CREW_MULT = 2

export function applyMilitarizedSubsystems(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "max burn", BURN_BONUS)
  mulStat(next.stats, "min crew", MIN_CREW_MULT)
  return next
}

export function describeMilitarizedSubsystems(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["1", "100%"])
}
