import type { completeShip, hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"
import { addStat, byHullSize, cloneShip } from "./modUtils"

export const ID = "unstable_injector"
// Vanilla: 25/20/15/15 su/s by hull size; -15% non-missile range and +25%
// fighter replacement time are weapon/fighter-level (no ship stat), describe-only.
const SPEED_BONUS: [number, number, number, number] = [25, 20, 15, 15]

export function applyUnstableInjector(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "max speed", byHullSize(ship.meta.hullSize, SPEED_BONUS))
  return next
}

export function describeUnstableInjector(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["25", "20", "15", "15", "15%", "25%"])
}
