import type { completeShip, hullMod } from "#/types"
import {
  describeAccelShields,
  describeAccelShieldsSMod,
  describeAdvancedOptics,
  describeArmoredWeapons,
  applyArmoredWeapons,
  describeArmoredWeaponsSMod,
  describeAutoRepair,
  describeAutoRepairSMod,
  describeAuxThrusters,
  applyAuxThrusters,
  describeAuxThrustersSMod,
  describeBlastDoors,
  applyBlastDoors,
  describeBlastDoorsSMod,
  describeDedicatedCore,
  describeDedicatedCoreSMod,
  describeEccm,
  describeEccmSMod,
  describeExtendedShields,
  applyExtendedShields,
  describeExtendedShieldsSMod,
  describeFrontShieldEmitter,
  applyFrontShieldEmitter,
  describeFrontShieldEmitterSMod,
  describeFrontShieldGenerator,
  applyFrontShieldGenerator,
  describeHardenedShieldEmitter,
  applyHardenedShieldEmitter,
  describeHeavyArmor,
  applyHeavyArmor,
  describeHeavyArmorSMod,
  describeMagazines,
  describeMagazinesSMod,
  describeMissileRacks,
  describeMissileRacksSMod,
  describeOmniShieldEmitter,
  applyOmniShieldEmitter,
  describeOmniShieldEmitterSMod,
  describePointDefenseAI,
  describePointDefenseAISMod,
  describeReinforcedBulkheads,
  applyReinforcedBulkheads,
  describeStabilizedShields,
  applyStabilizedShields,
  describeStabilizedShieldsSMod,
  describeTargetingUnit,
  describeTurretGyros,
  describeTurretGyrosSMod,
  describeUnstableInjector,
  applyUnstableInjector
} from "./combat"
import {
  describeAugmentedEngines,
  applyAugmentedEngines,
  describeAugmentedEnginesSMod,
  describeInsulatedEngines,
  applyInsulatedEngines,
  describeInsulatedEnginesSMod,
  describeSolarShielding,
  describeSolarShieldingSMod,
  describeSurveying,
  describeSurveyingSMod,
  describeConvertedFighterBay,
  applyConvertedFighterBay,
  describeConvertedFighterBaySMod,
  describeMilitarizedSubsystems,
  applyMilitarizedSubsystems,
  describeMilitarizedSubsystemsSMod,
  describeAdditionalBerthing,
  applyAdditionalBerthing,
  describeAdditionalBerthingSMod
} from "./logistics"
import {
  describeHardenedSubsystems,
  applyHardenedSubsystems,
  describeFluxCoil,
  applyFluxCoil,
  describeFluxCoilSMod,
  describeFluxDistributor,
  applyFluxDistributor,
  describeFluxDistributorSMod,
  describeFluxBreakers,
  describeFluxBreakersSMod
} from "./general"
import {
  describeAdvancedTargetingCore,
  describeCivGrade,
  SENSOR_PROFILE_MULT,
  SENSOR_STRENGTH_MULT,
  describeDelicateMachinery,
  applyDelicateMachinery,
  describeFluxShunt,
  describeFourteenth,
  applyFourteenth,
  describeHighMaintenance,
  applyHighMaintenance,
  describeNoWeaponFlux,
  describeTargetingSupercomputer,
  describeConvertedCargoBay,
  applyConvertedCargoBay,
  describeDistributedFireControl
} from "./builtin"
import {
  describeCompromisedArmor,
  applyCompromisedArmor,
  describeCompromisedHull,
  applyCompromisedHull,
  describeDegradedDriveField,
  applyDegradedDriveField,
  DEGRADED_DRIVE_SENSOR_MULT,
  describeDegradedEngines,
  applyDegradedEngines,
  describeFaultyPowerGrid,
  applyFaultyPowerGrid,
  FAULTY_GRID_SENSOR_MULT,
  describePhaseCoilInstability,
  applyPhaseCoilInstability,
  describeDefectiveManufactory,
  applyDefectiveManufactory,
  describeCompromisedStorage,
  applyCompromisedStorage,
  describeDamagedFlightDeck,
  applyDamagedFlightDeck,
  describeFragileSubsystems,
  applyFragileSubsystems,
  describeIncreasedMaintenance,
  applyIncreasedMaintenance,
  describeStructuralDamage,
  applyStructuralDamage,
  describeGlitchedSensors,
  applyGlitchedSensors,
  GLITCHED_SENSOR_STRENGTH_MULT,
  describeMalfunctioningComms,
  applyMalfunctioningComms,
  describeErraticInjector,
  applyErraticInjector,
  describeFaultyAutomatedSystems,
  applyFaultyAutomatedSystems,
  describeDamagedMounts,
  applyDamagedMounts,
  describeDegradedLifeSupport,
  applyDegradedLifeSupport,
  describeDegradedShields,
  applyDegradedShields
} from "./dmods"
import {
  describeSafetyOverrides,
  applySafetyOverrides,
  describeAssaultPackage,
  applyAssaultPackage,
  describeShieldShunt,
  applyShieldShunt,
  describeShieldShuntSMod
} from "./combat"
import {
  describeAuxiliaryFuelTanks,
  applyAuxiliaryFuelTanks,
  describeAuxiliaryFuelTanksSMod,
  describeExpandedCargoHolds,
  applyExpandedCargoHolds,
  describeExpandedCargoHoldsSMod,
  describeEfficiencyOverhaul,
  applyEfficiencyOverhaul,
  describeEfficiencyOverhaulSMod,
  describeHighResSensors,
  describeHighResSensorsSMod,
  describeDriveFieldStabilizer,
  describeRepairGantry,
  describeGroundSupport,
  describeAdvancedGroundSupport,
  PHASE_FIELD_PROFILE_MULT,
  describePhaseField,
  describeExpandedDeckCrew,
  applyExpandedDeckCrew,
  describeRecoveryShuttles,
  describeRecoveryShuttlesSMod,
  describeConvertedHangar,
  applyConvertedHangar,
  describeConvertedHangarSMod,
  describeVastHangar,
  applyVastHangar,
  describeDefensiveTargetingArray,
  describeDefensiveTargetingArraySMod,
  describeBDeck,
  describeFighterChassisStorage,
  MILITARIZED_SENSOR_PROFILE_MULT,
  MILITARIZED_SENSOR_STRENGTH_MULT
} from "./logistics"
import {
  describeNavRelay,
  describeEcmPackage,
  describeOperationsCenter,
  describeBallisticRangefinder,
  describeEnergyBoltCoherer,
  describeHighScatterAmp,
  describeHighScatterAmpSMod,
  describeMissileAutoloader,
  describeMissileAutoloaderSMod,
  describeMissileReload,
  describeHeavyBallisticsIntegration,
  describePdIntegration,
  describeAdaptivePhaseCoils,
  describeExperimentalPhaseCoils,
  describePhaseAnchor,
  describeEscortPackage,
  describeEscortPackageSMod,
  describeNeuralInterface,
  describeNeuralInterfaceSMod,
  describeNeuralIntegrator,
  describeNeuralIntegratorSMod,
  describeTerminatorCore,
  describeSharedFluxSink,
  describeAblativeArmor,
  describeAutomatedShip,
  applyAutomatedShip,
  describeRuggedConstruction,
  applyRuggedConstruction,
  describeDesignCompromises,
  DESIGN_COMPROMISES_FLUX_MULT,
  describeAndradaMods,
  applyAndradaMods
} from "./general"
import {
  describeFragmentSwarm,
  describeFragmentSwarmSMod,
  describeSecondaryFabricator,
  describeSecondaryFabricatorSMod,
  describeFragmentCoordinator,
  describeFragmentCoordinatorSMod,
  describeShroudedMantle,
  describeShroudedMantleSMod,
  describeShroudedThunderhead,
  describeShroudedLens
} from "./special"
export type HullmodImpl = {
  /** Flat stat mutation. Absent when the mod touches no ship stat directly. */
  apply?: (ship: completeShip) => completeShip
  /** Complete description string with `%s` placeholders filled. */
  describe: (mod: hullMod) => string
  /** S-mod bonus string with `%s` placeholders filled. Absent when no S-mod bonus. */
  describeSMod?: (mod: hullMod) => string
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
    apply: applyMilitarizedSubsystems, describeSMod: describeMilitarizedSubsystemsSMod
  },
  no_weapon_flux: { describe: describeNoWeaponFlux },
  distributed_fire_control: { describe: describeDistributedFireControl },
  reinforcedhull: { describe: describeReinforcedBulkheads, apply: applyReinforcedBulkheads },
  supercomputer: { describe: describeTargetingSupercomputer },
  unstable_injector: { describe: describeUnstableInjector, apply: applyUnstableInjector },
  advancedshieldemitter: { describe: describeAccelShields, describeSMod: describeAccelShieldsSMod },
  turretgyros: { describe: describeTurretGyros, describeSMod: describeTurretGyrosSMod },
  armoredweapons: { describe: describeArmoredWeapons, apply: applyArmoredWeapons, describeSMod: describeArmoredWeaponsSMod },
  augmentedengines: { describe: describeAugmentedEngines, apply: applyAugmentedEngines, describeSMod: describeAugmentedEnginesSMod },
  autorepair: { describe: describeAutoRepair, describeSMod: describeAutoRepairSMod },
  auxiliarythrusters: { describe: describeAuxThrusters, apply: applyAuxThrusters, describeSMod: describeAuxThrustersSMod },
  blast_doors: { describe: describeBlastDoors, apply: applyBlastDoors, describeSMod: describeBlastDoorsSMod },
  eccm: { describe: describeEccm, describeSMod: describeEccmSMod },
  magazines: { describe: describeMagazines, describeSMod: describeMagazinesSMod },
  missleracks: { describe: describeMissileRacks, describeSMod: describeMissileRacksSMod },
  extendedshieldemitter: { describe: describeExtendedShields, apply: applyExtendedShields, describeSMod: describeExtendedShieldsSMod },
  fluxbreakers: { describe: describeFluxBreakers, describeSMod: describeFluxBreakersSMod },
  fluxcoil: { describe: describeFluxCoil, apply: applyFluxCoil, describeSMod: describeFluxCoilSMod },
  fluxdistributor: { describe: describeFluxDistributor, apply: applyFluxDistributor, describeSMod: describeFluxDistributorSMod },
  heavyarmor: { describe: describeHeavyArmor, apply: applyHeavyArmor, describeSMod: describeHeavyArmorSMod },
  insulatedengine: { describe: describeInsulatedEngines, apply: applyInsulatedEngines, describeSMod: describeInsulatedEnginesSMod },
  solar_shielding: { describe: describeSolarShielding, describeSMod: describeSolarShieldingSMod },
  stabilizedshieldemitter: { describe: describeStabilizedShields, apply: applyStabilizedShields, describeSMod: describeStabilizedShieldsSMod },
  surveying_equipment: { describe: describeSurveying, describeSMod: describeSurveyingSMod },
  converted_fighterbay: { describe: describeConvertedFighterBay, apply: applyConvertedFighterBay, describeSMod: describeConvertedFighterBaySMod },
  additional_berthing: { describe: describeAdditionalBerthing, apply: applyAdditionalBerthing, describeSMod: describeAdditionalBerthingSMod },
  advancedoptics: { describe: describeAdvancedOptics },
  dedicated_targeting_core: { describe: describeDedicatedCore, describeSMod: describeDedicatedCoreSMod },
  targetingunit: { describe: describeTargetingUnit },
  comp_armor: { describe: describeCompromisedArmor, apply: applyCompromisedArmor },
  comp_storage: { describe: describeCompromisedStorage, apply: applyCompromisedStorage },
  damaged_deck: { describe: describeDamagedFlightDeck, apply: applyDamagedFlightDeck },
  fragile_subsystems: { describe: describeFragileSubsystems, apply: applyFragileSubsystems },
  increased_maintenance: { describe: describeIncreasedMaintenance, apply: applyIncreasedMaintenance },
  comp_structure: { describe: describeStructuralDamage, apply: applyStructuralDamage },
  glitched_sensors: { describe: describeGlitchedSensors, apply: applyGlitchedSensors },
  malfunctioning_comms: { describe: describeMalfunctioningComms, apply: applyMalfunctioningComms },
  erratic_injector: { describe: describeErraticInjector, apply: applyErraticInjector },
  faulty_auto: { describe: describeFaultyAutomatedSystems, apply: applyFaultyAutomatedSystems },
  damaged_mounts: { describe: describeDamagedMounts, apply: applyDamagedMounts },
  degraded_life_support: { describe: describeDegradedLifeSupport, apply: applyDegradedLifeSupport },
  degraded_shields: { describe: describeDegradedShields, apply: applyDegradedShields },
  comp_hull: { describe: describeCompromisedHull, apply: applyCompromisedHull },
  degraded_drive_field: { describe: describeDegradedDriveField, apply: applyDegradedDriveField },
  degraded_engines: { describe: describeDegradedEngines, apply: applyDegradedEngines },
  faulty_grid: { describe: describeFaultyPowerGrid, apply: applyFaultyPowerGrid },
  unstable_coils: { describe: describePhaseCoilInstability, apply: applyPhaseCoilInstability },
  defective_manufactory: { describe: describeDefectiveManufactory, apply: applyDefectiveManufactory },
  frontemitter: { describe: describeFrontShieldEmitter, apply: applyFrontShieldEmitter, describeSMod: describeFrontShieldEmitterSMod },
  adaptiveshields: { describe: describeOmniShieldEmitter, apply: applyOmniShieldEmitter, describeSMod: describeOmniShieldEmitterSMod },
  frontshield: { describe: describeFrontShieldGenerator, apply: applyFrontShieldGenerator },
  converted_bay: { describe: describeConvertedCargoBay, apply: applyConvertedCargoBay },
  pointdefenseai: { describe: describePointDefenseAI, describeSMod: describePointDefenseAISMod },
  safetyoverrides: { describe: describeSafetyOverrides, apply: applySafetyOverrides },
  assault_package: { describe: describeAssaultPackage, apply: applyAssaultPackage },
  shield_shunt: { describe: describeShieldShunt, apply: applyShieldShunt, describeSMod: describeShieldShuntSMod },
  auxiliary_fuel_tanks: { describe: describeAuxiliaryFuelTanks, apply: applyAuxiliaryFuelTanks, describeSMod: describeAuxiliaryFuelTanksSMod },
  expanded_cargo_holds: { describe: describeExpandedCargoHolds, apply: applyExpandedCargoHolds, describeSMod: describeExpandedCargoHoldsSMod },
  efficiency_overhaul: { describe: describeEfficiencyOverhaul, apply: applyEfficiencyOverhaul, describeSMod: describeEfficiencyOverhaulSMod },
  hiressensors: { describe: describeHighResSensors, describeSMod: describeHighResSensorsSMod },
  drive_field_stabilizer: { describe: describeDriveFieldStabilizer },
  repair_gantry: { describe: describeRepairGantry },
  ground_support: { describe: describeGroundSupport },
  advanced_ground_support: { describe: describeAdvancedGroundSupport },
  phasefield: { describe: describePhaseField },
  expanded_deck_crew: { describe: describeExpandedDeckCrew, apply: applyExpandedDeckCrew },
  recovery_shuttles: { describe: describeRecoveryShuttles, describeSMod: describeRecoveryShuttlesSMod },
  converted_hangar: { describe: describeConvertedHangar, apply: applyConvertedHangar, describeSMod: describeConvertedHangarSMod },
  vast_hangar: { describe: describeVastHangar, apply: applyVastHangar },
  defensive_targeting_array: { describe: describeDefensiveTargetingArray, describeSMod: describeDefensiveTargetingArraySMod },
  bdeck: { describe: describeBDeck },
  chassis_storage: { describe: describeFighterChassisStorage },
  nav_relay: { describe: describeNavRelay },
  ecm: { describe: describeEcmPackage },
  operations_center: { describe: describeOperationsCenter },
  ballistic_rangefinder: { describe: describeBallisticRangefinder },
  coherer: { describe: describeEnergyBoltCoherer },
  high_scatter_amp: { describe: describeHighScatterAmp, describeSMod: describeHighScatterAmpSMod },
  missile_autoloader: { describe: describeMissileAutoloader, describeSMod: describeMissileAutoloaderSMod },
  missile_reload: { describe: describeMissileReload },
  hbi: { describe: describeHeavyBallisticsIntegration },
  pdintegration: { describe: describePdIntegration },
  adaptive_coils: { describe: describeAdaptivePhaseCoils },
  ex_phase_coils: { describe: describeExperimentalPhaseCoils },
  phase_anchor: { describe: describePhaseAnchor },
  escort_package: { describe: describeEscortPackage, describeSMod: describeEscortPackageSMod },
  neural_interface: { describe: describeNeuralInterface, describeSMod: describeNeuralInterfaceSMod },
  neural_integrator: { describe: describeNeuralIntegrator, describeSMod: describeNeuralIntegratorSMod },
  terminator_core: { describe: describeTerminatorCore },
  shared_flux_sink: { describe: describeSharedFluxSink },
  ablative_armor: { describe: describeAblativeArmor },
  automated: { describe: describeAutomatedShip, apply: applyAutomatedShip },
  rugged: { describe: describeRuggedConstruction, apply: applyRuggedConstruction },
  design_compromises: { describe: describeDesignCompromises },
  andrada_mods: { describe: describeAndradaMods, apply: applyAndradaMods },
  fragment_swarm: { describe: describeFragmentSwarm, describeSMod: describeFragmentSwarmSMod },
  secondary_fabricator: { describe: describeSecondaryFabricator, describeSMod: describeSecondaryFabricatorSMod },
  fragment_coordinator: { describe: describeFragmentCoordinator, describeSMod: describeFragmentCoordinatorSMod },
  shrouded_mantle: { describe: describeShroudedMantle, describeSMod: describeShroudedMantleSMod },
  shrouded_thunderhead: { describe: describeShroudedThunderhead },
  shrouded_lens: { describe: describeShroudedLens },
}

/** Complete description string for a hullmod row (raw CSV text if unimplemented). */
export function describeHullmod(mod: hullMod): string {
  const impl = HULLMOD_IMPLS[mod.id]
  if (!impl) return mod.desc ?? ""
  return impl.describe(mod)
}

/**
 * S-mod bonus string with `%s` placeholders filled.
 * Returns null when the hullmod has no S-mod bonus text.
 */
export function describeHullmodSMod(mod: hullMod): string | null {
  const impl = HULLMOD_IMPLS[mod.id]?.describeSMod
  if (!impl || !mod.sModDesc) return null
  return impl(mod)
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

export type SensorMults = { profile: number; strength: number }

const SENSOR_MULTS: Record<string, SensorMults> = {
  civgrade: {
    profile: SENSOR_PROFILE_MULT,
    strength: SENSOR_STRENGTH_MULT
  },
  degraded_drive_field: {
    profile: DEGRADED_DRIVE_SENSOR_MULT,
    strength: 1
  },
  faulty_grid: {
    profile: FAULTY_GRID_SENSOR_MULT,
    strength: 1
  },
  glitched_sensors: {
    profile: 1,
    strength: GLITCHED_SENSOR_STRENGTH_MULT
  },
  phasefield: {
    profile: PHASE_FIELD_PROFILE_MULT,
    strength: 1
  },
  militarized_subsystems: {
    profile: MILITARIZED_SENSOR_PROFILE_MULT,
    strength: MILITARIZED_SENSOR_STRENGTH_MULT
  }
}

/**
 * Final flux total multiplier (Design Compromises hits capacity and
 * dissipation after caps/vents and other hullmods; applyHullmods only sees
 * base stats, so this scales the display totals).
 */
export function getFluxMult(ids: string[]): number {
  return ids.includes("design_compromises") ? DESIGN_COMPROMISES_FLUX_MULT : 1
}

/**
 * Vent bonus multiplier (Safety Overrides doubles dissipation including vents;
 * applyHullmods only sees base stats, so the vent leg is scaled at display).
 */
export function getVentMult(ids: string[]): number {
  return ids.includes("safetyoverrides") ? 2 : 1
}

/**
 * Max-CR point reductions by hullmod id (percentage points off the 100% max).
 * Like sensors, max CR lives outside shipStats, so it chains here.
 */
export const CR_MAX_REDUCTIONS: Record<string, number> = {
  faulty_auto: 5,
  degraded_life_support: 5,
  increased_maintenance: 5
}

/** Total max-CR point reduction for a hullmod id list. */
export function getCrPenalty(ids: string[]): number {
  let total = 0
  for (const id of ids) total += CR_MAX_REDUCTIONS[id] ?? 0
  return total
}

/** Effective max CR (percent) after hullmod reductions. */
export function getMaxCr(ids: string[]): number {
  return Math.max(0, 100 - getCrPenalty(ids))
}

/**
 * Combined sensor multipliers for a hullmod id list (sensors live outside
 * shipStats, so they chain here instead of in applyHullmods).
 */
export function getSensorMults(ids: string[]): SensorMults {
  let profile = 1
  let strength = 1
  for (const id of ids) {
    const mults = SENSOR_MULTS[id]
    if (!mults) continue
    profile *= mults.profile
    strength *= mults.strength
  }
  return { profile, strength }
}
