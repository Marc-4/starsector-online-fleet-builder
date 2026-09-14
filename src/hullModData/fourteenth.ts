import type { completeShip, hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"
import { addStat, cloneShip, mulStat } from "./modUtils"

export const ID = "fourteenth"
const ARMOR_BONUS = 100
const FLUX_MULT = 1.05
const SPEED_HANDLING_MULT = 0.92

export function applyFourteenth(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "armor rating", ARMOR_BONUS)
  mulStat(next.stats, "max flux", FLUX_MULT)
  mulStat(next.stats, "flux dissipation", FLUX_MULT)
  mulStat(next.stats, "max speed", SPEED_HANDLING_MULT)
  mulStat(next.stats, "max turn rate", SPEED_HANDLING_MULT, false)
  return next
}

export function describeFourteenth(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["100", "8%", "5%"])
}
