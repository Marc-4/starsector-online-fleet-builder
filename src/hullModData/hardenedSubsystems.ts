import type { completeShip, hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"
import { cloneShip, mulStat } from "./modUtils"

export const ID = "hardened_subsystems"
const PEAK_TIME_MULT = 1.5
const CR_LOSS_MULT = 0.75

export function applyHardenedSubsystems(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "peak CR sec", PEAK_TIME_MULT)
  mulStat(next.stats, "CR loss/sec", CR_LOSS_MULT, false)
  return next
}

export function describeHardenedSubsystems(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "25%"])
}
