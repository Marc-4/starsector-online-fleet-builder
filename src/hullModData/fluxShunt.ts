import type { hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"

export const ID = "fluxshunt"
// Conditional hard-flux dissipation while shields are up (no flat ship
// stat): describe-only, no apply.
export function describeFluxShunt(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%"])
}
