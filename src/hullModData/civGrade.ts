import type { hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"

export const ID = "civgrade"
// Sensor-profile effect only (no ship stat): describe-only, no apply.
export function describeCivGrade(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["100%", "50%"])
}
