/** Installable logistics hullmods (Logistics uiTag). */
import type { completeShip, hullMod } from "#/types"
import { formatHullmodDesc, rawDesc, rawSModDesc } from "./describe"
import { addStat, byHullSize, cloneShip, mulStat } from "./modUtils"
export function applyAugmentedEngines(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "max burn", 2)
  return next
}

export function describeAugmentedEngines(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["2", "1"])
}

export function describeAugmentedEnginesSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["1"])
}

export function applyAugmentedEnginesSMod(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "max burn", 1)
  return next
}

export const INSULATED_ENGINES_MULT = 0.5
/** S-modded Insulated Engines: sensor profile reduction goes to 90%. */
export const INSULATED_ENGINES_SMOD_MULT = 0.1
export function applyInsulatedEngines(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "hitpoints", 1.1)
  return next
}

export function describeInsulatedEngines(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["100%", "10%", "50%", "100%", "90%"])
}

export function describeInsulatedEnginesSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["100%", "90%"])
}

export function describeSolarShielding(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["75%", "25%", "100%"])
}

export function describeSolarShieldingSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["100%"])
}

export function describeSurveying(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [
    "40%",
    "40%",
    "40%",
    "40%",
    "5",
    "50%"
  ])
}

export function describeSurveyingSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["50%"])
}

export function applyConvertedFighterBay(ship: completeShip): completeShip {
  const count = ship.meta.builtInWings?.length ?? 0
  if (count <= 0) return cloneShip(ship)
  const next = cloneShip(ship)
  const bays = Math.max(0, Number(next.stats["fighter bays"] ?? 0))
  ;(next.stats as Record<string, unknown>)["fighter bays"] = Math.max(
    0,
    Math.round(bays) - count
  )
  addStat(next.stats, "cargo", 50 * count)
  mulStat(next.stats, "min crew", Math.max(0.2, 0.8 ** count), false)
  next.meta = { ...ship.meta, builtInWings: [] }
  return next
}

export function describeConvertedFighterBay(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50", "20%", "80%"])
}

export function describeConvertedFighterBaySMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["15%"])
}

// -15% maintenance per converted bay. The bay count comes from the base ship:
// the base apply already stripped builtInWings by the time S-mods run.
export function applyConvertedFighterBaySMod(
  ship: completeShip,
  base: completeShip
): completeShip {
  const count = base.meta.builtInWings?.length ?? 0
  if (count <= 0) return cloneShip(ship)
  const next = cloneShip(ship)
  mulStat(next.stats, "supplies/mo", 0.85 ** count, false)
  return next
}

const BURN_BONUS = 1
const MIN_CREW_MULT = 2

// Vanilla strips civ-grade's sensor mults outright (unmodify CIVGRADE), which
// is exactly cancelled by these inverse mults when both mods are present.
export const MILITARIZED_SENSOR_PROFILE_MULT = 0.5
export const MILITARIZED_SENSOR_STRENGTH_MULT = 2

export function applyMilitarizedSubsystems(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "max burn", BURN_BONUS)
  mulStat(next.stats, "min crew", MIN_CREW_MULT)
  return next
}

export function describeMilitarizedSubsystems(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["1", "100%"])
}

export function describeMilitarizedSubsystemsSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), [])
}

// Negates the base x2 minimum-crew penalty.
export function applyMilitarizedSubsystemsSMod(
  ship: completeShip
): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "min crew", 1 / MIN_CREW_MULT, false)
  return next
}

// +30/60/100/200 max crew by size (or +30% of base, whichever is higher).
// Civilian-grade hulls (built-in civgrade) also pay +50% maintenance.
export function applyAdditionalBerthing(ship: completeShip): completeShip {
  return applyCapacityCommon(ship, "max crew", [30, 60, 100, 200])
}

export function describeAdditionalBerthing(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [
    "30",
    "60",
    "100",
    "200",
    "30%",
    "50%"
  ])
}

export function describeAdditionalBerthingSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), [])
}

// ---- §6 logistics ----

// Flat table value by hull size, or 30% of the stat — whichever is higher.
function capacityBonus(
  baseVal: number,
  hullSize: string,
  flat: [number, number, number, number]
): number {
  return Math.max(
    byHullSize(hullSize, flat),
    Math.round(Math.max(0, baseVal) * 0.3)
  )
}

function applyCapacityCommon(
  ship: completeShip,
  stat: "max crew" | "fuel" | "cargo",
  flat: [number, number, number, number]
): completeShip {
  const next = cloneShip(ship)
  addStat(
    next.stats,
    stat,
    capacityBonus(Number(next.stats[stat] ?? 0), ship.meta.hullSize, flat)
  )
  if ((ship.meta.builtInMods ?? []).includes("civgrade")) {
    mulStat(next.stats, "supplies/mo", 1.5, false)
  }
  return next
}

// S-mod doubles the capacity bonus and, on civilian hulls, negates the +50%
// maintenance penalty. The doubled bonus is computed from the UNMODIFIED base
// ship so the 30%-of-base branch stays exact instead of compounding.
function applyCapacitySMod(
  ship: completeShip,
  base: completeShip,
  stat: "max crew" | "fuel" | "cargo",
  flat: [number, number, number, number]
): completeShip {
  const next = cloneShip(ship)
  addStat(
    next.stats,
    stat,
    capacityBonus(Number(base.stats[stat] ?? 0), base.meta.hullSize, flat)
  )
  if ((base.meta.builtInMods ?? []).includes("civgrade")) {
    mulStat(next.stats, "supplies/mo", 1 / 1.5, false)
  }
  return next
}

const BERTHING_FLAT: [number, number, number, number] = [30, 60, 100, 200]

export function applyAdditionalBerthingSMod(
  ship: completeShip,
  base: completeShip
): completeShip {
  return applyCapacitySMod(ship, base, "max crew", BERTHING_FLAT)
}

export function applyAuxiliaryFuelTanks(ship: completeShip): completeShip {
  return applyCapacityCommon(ship, "fuel", [30, 60, 100, 200])
}

const FUEL_FLAT: [number, number, number, number] = [30, 60, 100, 200]

export function applyAuxiliaryFuelTanksSMod(
  ship: completeShip,
  base: completeShip
): completeShip {
  return applyCapacitySMod(ship, base, "fuel", FUEL_FLAT)
}

export function describeAuxiliaryFuelTanks(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [
    "30",
    "60",
    "100",
    "200",
    "30%",
    "50%"
  ])
}

export function describeAuxiliaryFuelTanksSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), [])
}

export function applyExpandedCargoHolds(ship: completeShip): completeShip {
  return applyCapacityCommon(ship, "cargo", [30, 60, 100, 200])
}

const CARGO_FLAT: [number, number, number, number] = [30, 60, 100, 200]

export function applyExpandedCargoHoldsSMod(
  ship: completeShip,
  base: completeShip
): completeShip {
  return applyCapacitySMod(ship, base, "cargo", CARGO_FLAT)
}

export function describeExpandedCargoHolds(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [
    "30",
    "60",
    "100",
    "200",
    "30%",
    "50%"
  ])
}

export function describeExpandedCargoHoldsSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), [])
}

export function applyEfficiencyOverhaul(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "supplies/mo", 0.8, false)
  mulStat(next.stats, "fuel/ly", 0.8, false)
  mulStat(next.stats, "min crew", 0.8, false)
  mulStat(next.stats, "cr %/day", 1.5, false)
  return next
}

export function describeEfficiencyOverhaul(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["20%", "50%"])
}

export function describeEfficiencyOverhaulSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["10%"])
}

// A further 10% off maintenance, fuel use, and minimum crew (the CR-recovery
// rate bonus is campaign-level and stays describe-only).
export function applyEfficiencyOverhaulSMod(
  ship: completeShip
): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "supplies/mo", 0.9, false)
  mulStat(next.stats, "fuel/ly", 0.9, false)
  mulStat(next.stats, "min crew", 0.9, false)
  return next
}

// Fleet sensors and combat vision are fleet-level (describe-only).
export function describeHighResSensors(mod: hullMod): string {
  void mod
  return [
    "Increases the fleet's sensor strength by 50/75/100/150 based on hull size, with diminishing returns from multiple ships.",
    "Requires at least 10% combat readiness to function."
  ].join("\n\n")
}

export function describeHighResSensorsSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["1000", "1500", "2000", "2500"])
}

// Fleet burn is fleet-level (describe-only).
export function describeDriveFieldStabilizer(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["1", "200"])
}

// Salvage percentages are campaign-level (describe-only).
export function describeRepairGantry(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["10%", "25%", "30%", "40%", "20%"])
}

// Raid strength is campaign-level (describe-only).
export function describeGroundSupport(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["100"])
}

export function describeAdvancedGroundSupport(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["200"])
}

export const PHASE_FIELD_PROFILE_MULT = 0.5

export function describePhaseField(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%"])
}

// ---- §6 fighter / carrier ----

// Replacement decay/recovery are fighter-level (describe-only); crew is a ship stat.
export function applyExpandedDeckCrew(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  const bays = Math.max(0, Math.round(Number(next.stats["fighter bays"] ?? 0)))
  addStat(next.stats, "min crew", 20 * bays)
  return next
}

export function describeExpandedDeckCrew(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["15%", "25%", "20"])
}

// Pilot losses are fighter-level (describe-only).
export function describeRecoveryShuttles(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["75%"])
}

export function describeRecoveryShuttlesSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["95%"])
}

export function applyConvertedHangar(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "fighter bays", 1)
  addStat(next.stats, "min crew", 20)
  return next
}

/**
 * Vanilla Converted Hangar: +1 DP and +1 supply-to-recover per 5 OP spent on
 * fighters (fighter OP / 5 rounded up), minimum +1 once installed — even with
 * empty bays.
 */
export function getConvertedHangarDeploymentDelta(ctx: {
  fightersOp: number
}): number {
  return Math.max(1, Math.ceil(ctx.fightersOp / 5))
}

export function describeConvertedHangar(mod: hullMod): string {
  void mod
  return [
    "Adds a fighter bay to the ship using an improvised converted hangar.",
    "Increases fighter refit time by 1.5x, and the fighter replacement rate decays and recovers 1.5x more slowly.",
    "Increases the minimum crew required by 20 to account for pilots and fighter crews.",
    "Increases the ship's deployment points and supply cost to recover by 1 for every 5 ordnance points spent on fighters, or by at least 1 point."
  ].join("\n\n")
}

export function describeConvertedHangarSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["10%", "25%"])
}

export function applyVastHangar(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "fighter bays", 1)
  return next
}

export function describeVastHangar(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["1"])
}

// Fighter damage/range are fighter-level (describe-only).
export function describeDefensiveTargetingArray(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%"])
}

export function describeDefensiveTargetingArraySMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["100"])
}

// Refill mechanics are combat behavior (describe-only).
export function describeBDeck(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["40%", "100%"])
}

export function describeFighterChassisStorage(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [])
}
