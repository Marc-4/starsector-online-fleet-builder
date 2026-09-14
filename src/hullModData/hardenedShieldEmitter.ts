import type { completeShip, hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"
import { cloneShip, mulStat } from "./modUtils"

export const ID = "hardenedshieldemitter"
const DAMAGE_TAKEN_MULT = 0.8

export function applyHardenedShieldEmitter(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  // -20% damage taken by shields == shield efficiency (flux/damage) x0.8.
  mulStat(next.stats, "shield efficiency", DAMAGE_TAKEN_MULT, false)
  return next
}

export function describeHardenedShieldEmitter(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["20%"])
}
