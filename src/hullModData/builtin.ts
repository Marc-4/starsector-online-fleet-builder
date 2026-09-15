/** Hidden / built-in-only hullmods (not installable in refit). */
import type { completeShip, hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"
import { addStat, cloneShip, mulStat } from "./modUtils"
// Weapon-range effect only (no ship stat): describe-only, no apply.
export function describeAdvancedTargetingCore(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["100%", "60%"])
}

// Vanilla civilian-grade penalty: 2x sensor profile, 0.5x sensor strength.
// Sensors live outside shipStats (derived from hull size in the UI), so the
// effect is exposed as multipliers consumed via getSensorMults().
export const SENSOR_PROFILE_MULT = 2
export const SENSOR_STRENGTH_MULT = 0.5

// Sensor-profile effect only (no ship stat): describe-only, no apply.
export function describeCivGrade(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["100%", "50%"])
}

const CR_DECAY_MULT = 1.5

export function applyDelicateMachinery(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "CR loss/sec", CR_DECAY_MULT, false)
  return next
}

export function describeDelicateMachinery(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%"])
}

// Conditional hard-flux dissipation while shields are up (no flat ship
// stat): describe-only, no apply.
export function describeFluxShunt(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%"])
}

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

const MAINTENANCE_MULT = 2

export function applyHighMaintenance(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "supplies/mo", MAINTENANCE_MULT)
  return next
}

export function describeHighMaintenance(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["100%"])
}

// Fighter/weapon-level effect (no ship stat, no placeholders): describe-only.
export function describeNoWeaponFlux(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [])
}

// Weapon-range effect only (no ship stat): describe-only, no apply.
export function describeTargetingSupercomputer(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["250%", "60%"])
}

// +2 fighter bays; fighter speed/damage debuff is fighter-level
// (describe-only, shared with DefectiveManufactory).
export function applyConvertedCargoBay(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "fighter bays", 2)
  return next
}

export function describeConvertedCargoBay(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["25%", "25%"])
}

// Weapon/EMP damage taken are weapon-level (no ship stat): describe-only.
export function describeDistributedFireControl(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "50%"])
}
