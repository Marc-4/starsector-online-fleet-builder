import type { hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"

export const ID = "advancedcore"
// Weapon-range effect only (no ship stat): describe-only, no apply.
export function describeAdvancedTargetingCore(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["100%", "60%"])
}
