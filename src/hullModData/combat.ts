/** Installable combat-performance hullmods (weapons/shields/engines/defenses). */
import type { completeShip, hullMod } from "#/types"
import { formatHullmodDesc, rawDesc, rawSModDesc } from "./describe"
import { addStat, byHullSize, cloneShip, mulStat } from "./modUtils"
const DAMAGE_TAKEN_MULT = 0.8

export function applyHardenedShieldEmitter(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  // -20% damage taken by shields == shield efficiency (flux/damage) x0.8.
  mulStat(next.stats, "shield efficiency", DAMAGE_TAKEN_MULT, false)
  return next
}

export function describeHardenedShieldEmitter(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["20%"])
}

const HULL_MULT = 1.4

export function applyReinforcedBulkheads(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "hitpoints", HULL_MULT)
  return next
}

export function describeReinforcedBulkheads(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["40%"])
}

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

export function describeAccelShields(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["100%", "100%", "100%"])
}


export function describeAccelShieldsSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["100%"])
}

export function describeTurretGyros(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "15%", "15%"])
}


export function describeTurretGyrosSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["15%", "15%"])
}

export function applyArmoredWeapons(
  ship: completeShip,
  base: completeShip
): completeShip {
  const next = cloneShip(ship)
  // Vanilla percent semantics: +10% of BASE armor, stacking additively with
  // other bonuses (e.g. 400 base + 100 Heavy Armor -> +40, not +50).
  const baseArmor = Math.max(0, Number(base.stats["armor rating"] ?? 0))
  addStat(next.stats, "armor rating", baseArmor * 0.1)
  return next
}

export function describeArmoredWeapons(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "50%", "10%", "10%", "10%"])
}


export function describeArmoredWeaponsSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["10%"])
}

export function describeAutoRepair(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["25%", "50%", "25%"])
}


export function describeAutoRepairSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["50%", "25%"])
}

export function applyAuxThrusters(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "max turn rate", 1.5, false)
  return next
}

export function describeAuxThrusters(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "50%", "doubles"])
}


export function describeAuxThrustersSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["50%", "doubles"])
}

export function applyBlastDoors(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "hitpoints", 1.2)
  return next
}

export function describeBlastDoors(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["20%", "60%", "85%"])
}


export function describeBlastDoorsSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["85%"])
}

export function describeEccm(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["75%", "10%", "10%", "50%"])
}


export function describeEccmSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), [])
}

export function describeMagazines(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "25%"])
}


export function describeMagazinesSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["25%"])
}

export function describeMissileRacks(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["100%", "20%"])
}


export function describeMissileRacksSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["20%"])
}

export function applyExtendedShields(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "shield arc", 60)
  return next
}

export function describeExtendedShields(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["60", "60"])
}


export function describeExtendedShieldsSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["60"])
}

// S-mod widening stacks on top of the base +60 arc.
export function applyExtendedShieldsSMod(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "shield arc", 60)
  return next
}

export function applyHeavyArmor(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "armor rating", byHullSize(ship.meta.hullSize, [150, 300, 400, 500]))
  return next
}

export function describeHeavyArmor(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["150", "300", "400", "500", "25%"])
}


export function describeHeavyArmorSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["25%"])
}

export function applyStabilizedShields(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "shield upkeep", 0.5, false)
  return next
}

export function describeStabilizedShields(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "10%"])
}


export function describeStabilizedShieldsSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["10%"])
}

export function describeAdvancedOptics(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["200", "25%"])
}

export function describeDedicatedCore(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["35%", "50%", "40%", "60%"])
}


export function describeDedicatedCoreSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["40%", "60%"])
}

export function describeTargetingUnit(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["10%", "20%", "40%", "60%"])
}

export function applyFrontShieldEmitter(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  ;(next.stats as Record<string, unknown>)["shield type"] = "FRONT"
  mulStat(next.stats, "shield arc", 2)
  return next
}

export function describeFrontShieldEmitter(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["100%"])
}

export function describeFrontShieldEmitterSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["5%"])
}

// -5% shield damage taken == shield efficiency (flux/damage) x0.95.
export function applyFrontShieldEmitterSMod(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "shield efficiency", 0.95, false)
  return next
}

export function applyOmniShieldEmitter(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  ;(next.stats as Record<string, unknown>)["shield type"] = "OMNI"
  mulStat(next.stats, "shield arc", 0.7)
  return next
}

export function describeOmniShieldEmitter(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["30%"])
}

export function describeOmniShieldEmitterSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), [])
}

// Negates the base x0.7 arc penalty. Runs after the base apply (see
// applyHullmods), so dividing restores the original arc.
export function applyOmniShieldEmitterSMod(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "shield arc", 1 / 0.7)
  return next
}

export function applyFrontShieldGenerator(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  // Only grants a shield when the hull has none; the engine penalty applies
  // whenever the mod is installed.
  const arc = Number(next.stats["shield arc"] ?? 0)
  if (!Number.isFinite(arc) || arc <= 0) {
    ;(next.stats as Record<string, unknown>)["shield type"] = "FRONT"
    ;(next.stats as Record<string, unknown>)["shield arc"] = 90
  }
  mulStat(next.stats, "max speed", 0.8, false)
  return next
}

export function describeFrontShieldGenerator(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["90", "20%"])
}

// Pure combat-behavior (targeting/PD classification): describe-only.
export function describePointDefenseAI(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%"])
}

export function describePointDefenseAISMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), [])
}

// Overhaul mod: flat stat parts only (0-flux boost, no venting, range cap
// and acceleration are combat behavior with no ship stat).
export function applySafetyOverrides(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "max speed", byHullSize(ship.meta.hullSize, [50, 30, 20, 20]))
  mulStat(next.stats, "flux dissipation", 2)
  mulStat(next.stats, "peak CR sec", 1 / 3, false)
  return next
}

export function describeSafetyOverrides(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50", "30", "20", "2", "3", "450"])
}

export function applyAssaultPackage(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "hitpoints", 1.1)
  mulStat(next.stats, "armor rating", 1.05, false)
  mulStat(next.stats, "max flux", 1.1)
  return next
}

export function describeAssaultPackage(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["10%", "5%", "10%"])
}

export function applyShieldShunt(
  ship: completeShip,
  base: completeShip
): completeShip {
  const next = cloneShip(ship)
  ;(next.stats as Record<string, unknown>)["shield type"] = "NONE"
  ;(next.stats as Record<string, unknown>)["shield arc"] = 0
  // Vanilla uses modifyPercent: +15% of BASE armor, stacking additively with
  // other bonuses (e.g. 1500 base + 500 Heavy Armor -> +225, not +300).
  const baseArmor = Math.max(0, Number(base.stats["armor rating"] ?? 0))
  addStat(next.stats, "armor rating", baseArmor * 0.15)
  return next
}

export function describeShieldShunt(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["15%"])
}

export function describeShieldShuntSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["15%"])
}

// S-mod bonus is additive: another +15% of BASE armor on top
// (e.g. 1500 -> 1725 -> 1950), not a second x1.15 multiplier (= 1984).
export function applyShieldShuntSMod(
  ship: completeShip,
  base: completeShip
): completeShip {
  const next = cloneShip(ship)
  const baseArmor = Math.max(0, Number(base.stats["armor rating"] ?? 0))
  addStat(next.stats, "armor rating", baseArmor * 0.15)
  return next
}
