import type { hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"

export const ID = "supercomputer"
// Weapon-range effect only (no ship stat): describe-only, no apply.
export function describeTargetingSupercomputer(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["250%", "60%"])
}
