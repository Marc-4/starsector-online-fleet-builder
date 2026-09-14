import type { completeShip, hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"
import { cloneShip, mulStat } from "./modUtils"

export const ID = "delicate"
const CR_DECAY_MULT = 1.5

export function applyDelicateMachinery(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "CR loss/sec", CR_DECAY_MULT, false)
  return next
}

export function describeDelicateMachinery(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%"])
}
