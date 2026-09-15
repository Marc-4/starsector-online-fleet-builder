/** Damage hullmods (dmod tag): permanent debuffs with recovery discount. */
import type { completeShip, hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"
import { addStat, cloneShip, mulStat } from "./modUtils"
export function applyCompromisedArmor(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "armor rating", 0.8)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeCompromisedArmor(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["20%", "20%"])
}

export function applyCompromisedHull(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "hitpoints", 0.7)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeCompromisedHull(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["30%", "20%"])
}

export const DEGRADED_DRIVE_SENSOR_MULT = 1.5

export function applyDegradedDriveField(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "max burn", -1)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeDegradedDriveField(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["1", "50%", "20%"])
}

export function applyDegradedEngines(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "max speed", 0.85, false)
  mulStat(next.stats, "max turn rate", 0.85, false)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeDegradedEngines(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["15%", "20%"])
}

export const FAULTY_GRID_SENSOR_MULT = 1.5

export function applyFaultyPowerGrid(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "max flux", 0.85)
  mulStat(next.stats, "flux dissipation", 0.85)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeFaultyPowerGrid(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["15%", "15%", "50%", "20%"])
}

// Phase-time bonus has no ship stat (describe-only); peak time, CR decay
// rate and recovery cost do.
export function applyPhaseCoilInstability(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "peak CR sec", 0.7, false)
  mulStat(next.stats, "CR loss/sec", 1.3, false)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describePhaseCoilInstability(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "30%", "30%", "20%"])
}

// Fighter speed/damage are fighter-level (describe-only); recovery is a ship stat.
export function applyDefectiveManufactory(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeDefectiveManufactory(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["25%", "25%", "20%"])
}

export function applyCompromisedStorage(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "max crew", 0.75)
  mulStat(next.stats, "cargo", 0.75)
  mulStat(next.stats, "fuel", 0.75)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeCompromisedStorage(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["25%", "20%"])
}

// Refit time is fighter-level (describe-only); recovery is a ship stat.
export function applyDamagedFlightDeck(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeDamagedFlightDeck(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["30%", "20%"])
}

export function applyFragileSubsystems(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "peak CR sec", 0.7, false)
  mulStat(next.stats, "CR loss/sec", 1.3, false)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeFragileSubsystems(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["30%", "30%", "20%"])
}

// Max CR has no ship stat (describe-only); maintenance, crew and recovery do.
export function applyIncreasedMaintenance(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "supplies/mo", 1.3, false)
  mulStat(next.stats, "min crew", 1.3, false)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeIncreasedMaintenance(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["30%", "30%", "5%", "20%"])
}

export function applyStructuralDamage(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "armor rating", 0.8)
  mulStat(next.stats, "hitpoints", 0.8)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeStructuralDamage(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["20%", "20%", "20%"])
}

export const GLITCHED_SENSOR_STRENGTH_MULT = 0.5

// Weapon range is weapon-level (describe-only); sensors and recovery are ship-level.
export function applyGlitchedSensors(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeGlitchedSensors(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["10%", "50%", "20%"])
}

// Fighter engagement range is fighter-level (describe-only).
export function applyMalfunctioningComms(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeMalfunctioningComms(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["40%", "20%"])
}

// Zero-flux boost has no ship stat (describe-only); fuel use and recovery do.
export function applyErraticInjector(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "fuel/ly", 1.5, false)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeErraticInjector(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "10", "20%"])
}

// Max CR has no ship stat (describe-only); crew and recovery do.
export function applyFaultyAutomatedSystems(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "min crew", 1.5, false)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeFaultyAutomatedSystems(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "5%", "20%"])
}

// Weapon turn rate and recoil are weapon-level (describe-only).
export function applyDamagedMounts(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeDamagedMounts(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["25%", "30%", "20%"])
}

// Max CR has no ship stat (describe-only); crew capacity and recovery do.
export function applyDegradedLifeSupport(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "max crew", 0.5)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeDegradedLifeSupport(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "5%", "20%"])
}

export function applyDegradedShields(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  // +10% damage taken by shields == shield efficiency (flux/damage) x1.1.
  mulStat(next.stats, "shield efficiency", 1.1, false)
  mulStat(next.stats, "supplies/rec", 0.8, false)
  return next
}

export function describeDegradedShields(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["10%", "20%"])
}
