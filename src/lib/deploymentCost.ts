import {
  getDeploymentCostDelta,
  getEffectiveDeploymentCost
} from "#/hullModData"
import type { completeShip, fleetEntry } from "#/types"

/**
 * Single choke point for deployment cost. Base DP tracks `supplies/mo`;
 * hullmods with `getDeploymentCostDelta` (e.g. Converted Hangar) add to both
 * DP and `supplies/rec`. All DP displays should go through here (or
 * `useLoadoutOp`, which wraps it) instead of reading `supplies/mo` directly.
 */
export function getEntryDeploymentCost(
  entry: Pick<fleetEntry, "ship" | "hullmods" | "smods" | "fighters"> & {
    ship: completeShip
  },
  fightersOp: number
): { dp: number; suppliesRec: number; delta: number } {
  const ids = [
    ...(entry.ship.meta.builtInMods ?? []),
    ...(entry.hullmods ?? []),
    ...(entry.smods ?? [])
  ]
  return getEffectiveDeploymentCost(entry.ship, ids, {
    fightersOp,
    hullSize: entry.ship.meta.hullSize
  })
}

export { getDeploymentCostDelta, getEffectiveDeploymentCost }
