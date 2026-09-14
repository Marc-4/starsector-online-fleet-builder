import type { completeShip, hullMod } from "#/types"
import { describeAdvancedTargetingCore } from "./advancedTargetingCore"
import { describeCivGrade } from "./civGrade"
import { describeDelicateMachinery, applyDelicateMachinery } from "./delicateMachinery"
import { describeFluxShunt } from "./fluxShunt"
import { describeFourteenth, applyFourteenth } from "./fourteenth"
import {
  describeHardenedShieldEmitter,
  applyHardenedShieldEmitter
} from "./hardenedShieldEmitter"
import {
  describeHardenedSubsystems,
  applyHardenedSubsystems
} from "./hardenedSubsystems"
import { describeHighMaintenance, applyHighMaintenance } from "./highMaintenance"
import {
  describeMilitarizedSubsystems,
  applyMilitarizedSubsystems
} from "./militarizedSubsystems"
import { describeNoWeaponFlux } from "./noWeaponFlux"
import {
  describeReinforcedBulkheads,
  applyReinforcedBulkheads
} from "./reinforcedBulkheads"
import { describeTargetingSupercomputer } from "./targetingSupercomputer"
import { describeUnstableInjector, applyUnstableInjector } from "./unstableInjector"

export type HullmodImpl = {
  /** Flat stat mutation. Absent when the mod touches no ship stat directly. */
  apply?: (ship: completeShip) => completeShip
  /** Complete description string with `%s` placeholders filled. */
  describe: (mod: hullMod) => string
}

export const HULLMOD_IMPLS: Record<string, HullmodImpl> = {
  advancedcore: { describe: describeAdvancedTargetingCore },
  civgrade: { describe: describeCivGrade },
  delicate: { describe: describeDelicateMachinery, apply: applyDelicateMachinery },
  fluxshunt: { describe: describeFluxShunt },
  fourteenth: { describe: describeFourteenth, apply: applyFourteenth },
  hardenedshieldemitter: {
    describe: describeHardenedShieldEmitter,
    apply: applyHardenedShieldEmitter
  },
  hardened_subsystems: {
    describe: describeHardenedSubsystems,
    apply: applyHardenedSubsystems
  },
  high_maintenance: { describe: describeHighMaintenance, apply: applyHighMaintenance },
  militarized_subsystems: {
    describe: describeMilitarizedSubsystems,
    apply: applyMilitarizedSubsystems
  },
  no_weapon_flux: { describe: describeNoWeaponFlux },
  reinforcedhull: { describe: describeReinforcedBulkheads, apply: applyReinforcedBulkheads },
  supercomputer: { describe: describeTargetingSupercomputer },
  unstable_injector: { describe: describeUnstableInjector, apply: applyUnstableInjector }
}

/** Complete description string for a hullmod row (raw CSV text if unimplemented). */
export function describeHullmod(mod: hullMod): string {
  const impl = HULLMOD_IMPLS[mod.id]
  if (!impl) return mod.desc ?? ""
  return impl.describe(mod)
}

/** Chain flat stat mods over a ship, skipping unknown ids and describe-only mods. */
export function applyHullmods(ship: completeShip, ids: string[]): completeShip {
  let next = ship
  for (const id of ids) {
    const apply = HULLMOD_IMPLS[id]?.apply
    if (apply) next = apply(next)
  }
  return next
}
