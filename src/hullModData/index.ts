import type { completeShip, hullMod } from "#/types"
import {
  applyConvertedCargoBay,
  applyDelicateMachinery,
  applyFourteenth,
  applyHighMaintenance,
  describeAdvancedTargetingCore,
  describeCivGrade,
  describeConvertedCargoBay,
  describeDelicateMachinery,
  describeDistributedFireControl,
  describeFluxShunt,
  describeFourteenth,
  describeHighMaintenance,
  describeNoWeaponFlux,
  describeTargetingSupercomputer,
  SENSOR_PROFILE_MULT,
  SENSOR_STRENGTH_MULT
} from "./builtin"
import {
  applyArmoredWeapons,
  applyAssaultPackage,
  applyAuxThrusters,
  applyBlastDoors,
  applyExtendedShields,
  applyExtendedShieldsSMod,
  applyFrontShieldEmitter,
  applyFrontShieldEmitterSMod,
  applyFrontShieldGenerator,
  applyHardenedShieldEmitter,
  applyHeavyArmor,
  applyOmniShieldEmitter,
  applyOmniShieldEmitterSMod,
  applyReinforcedBulkheads,
  applySafetyOverrides,
  applyShieldShunt,
  applyShieldShuntSMod,
  applyStabilizedShields,
  applyUnstableInjector,
  describeAccelShields,
  describeAccelShieldsSMod,
  describeAdvancedOptics,
  describeArmoredWeapons,
  describeArmoredWeaponsSMod,
  describeAssaultPackage,
  describeAutoRepair,
  describeAutoRepairSMod,
  describeAuxThrusters,
  describeAuxThrustersSMod,
  describeBlastDoors,
  describeBlastDoorsSMod,
  describeDedicatedCore,
  describeDedicatedCoreSMod,
  describeEccm,
  describeEccmSMod,
  describeExtendedShields,
  describeExtendedShieldsSMod,
  describeFrontShieldEmitter,
  describeFrontShieldEmitterSMod,
  describeFrontShieldGenerator,
  describeHardenedShieldEmitter,
  describeHeavyArmor,
  describeHeavyArmorSMod,
  describeMagazines,
  describeMagazinesSMod,
  describeMissileRacks,
  describeMissileRacksSMod,
  describeOmniShieldEmitter,
  describeOmniShieldEmitterSMod,
  describePointDefenseAI,
  describePointDefenseAISMod,
  describeReinforcedBulkheads,
  describeSafetyOverrides,
  describeShieldShunt,
  describeShieldShuntSMod,
  describeStabilizedShields,
  describeStabilizedShieldsSMod,
  describeTargetingUnit,
  describeTurretGyros,
  describeTurretGyrosSMod,
  describeUnstableInjector
} from "./combat"
import type { HullmodTable } from "./describe"
import {
  applyCompromisedArmor,
  applyCompromisedHull,
  applyCompromisedStorage,
  applyDamagedFlightDeck,
  applyDamagedMounts,
  applyDefectiveManufactory,
  applyDegradedDriveField,
  applyDegradedEngines,
  applyDegradedLifeSupport,
  applyDegradedShields,
  applyErraticInjector,
  applyFaultyAutomatedSystems,
  applyFaultyPowerGrid,
  applyFragileSubsystems,
  applyGlitchedSensors,
  applyIncreasedMaintenance,
  applyMalfunctioningComms,
  applyPhaseCoilInstability,
  applyStructuralDamage,
  DEGRADED_DRIVE_SENSOR_MULT,
  describeCompromisedArmor,
  describeCompromisedHull,
  describeCompromisedStorage,
  describeDamagedFlightDeck,
  describeDamagedMounts,
  describeDefectiveManufactory,
  describeDegradedDriveField,
  describeDegradedEngines,
  describeDegradedLifeSupport,
  describeDegradedShields,
  describeErraticInjector,
  describeFaultyAutomatedSystems,
  describeFaultyPowerGrid,
  describeFragileSubsystems,
  describeGlitchedSensors,
  describeIncreasedMaintenance,
  describeMalfunctioningComms,
  describePhaseCoilInstability,
  describeStructuralDamage,
  FAULTY_GRID_SENSOR_MULT,
  GLITCHED_SENSOR_STRENGTH_MULT
} from "./dmods"
import {
  applyAndradaMods,
  applyAutomatedShip,
  applyFluxCoil,
  applyFluxCoilSMod,
  applyFluxDistributor,
  applyFluxDistributorSMod,
  applyHardenedSubsystems,
  applyRuggedConstruction,
  DESIGN_COMPROMISES_FLUX_MULT,
  describeAblativeArmor,
  describeAdaptivePhaseCoils,
  describeAndradaMods,
  describeAutomatedShip,
  describeBallisticRangefinder,
  describeDesignCompromises,
  describeEcmPackage,
  describeEnergyBoltCoherer,
  describeEscortPackage,
  describeEscortPackageSMod,
  describeExperimentalPhaseCoils,
  describeFluxBreakers,
  describeFluxBreakersSMod,
  describeFluxCoil,
  describeFluxCoilSMod,
  describeFluxDistributor,
  describeFluxDistributorSMod,
  describeHardenedSubsystems,
  describeHeavyBallisticsIntegration,
  describeHighScatterAmp,
  describeHighScatterAmpSMod,
  describeMissileAutoloader,
  describeMissileAutoloaderSMod,
  describeMissileReload,
  describeNavRelay,
  describeNeuralIntegrator,
  describeNeuralIntegratorSMod,
  describeNeuralInterface,
  describeNeuralInterfaceSMod,
  describeOperationsCenter,
  describePdIntegration,
  describePhaseAnchor,
  describeRuggedConstruction,
  describeSharedFluxSink,
  describeTerminatorCore,
  getHeavyBallisticsIntegrationDiscount,
  tablesBallisticRangefinder,
  tablesMissileAutoloader
} from "./general"
import {
  applyAdditionalBerthing,
  applyAdditionalBerthingSMod,
  applyAugmentedEngines,
  applyAugmentedEnginesSMod,
  applyAuxiliaryFuelTanks,
  applyAuxiliaryFuelTanksSMod,
  applyConvertedFighterBay,
  applyConvertedFighterBaySMod,
  applyConvertedHangar,
  applyEfficiencyOverhaul,
  applyEfficiencyOverhaulSMod,
  applyExpandedCargoHolds,
  applyExpandedCargoHoldsSMod,
  applyExpandedDeckCrew,
  applyInsulatedEngines,
  applyMilitarizedSubsystems,
  applyMilitarizedSubsystemsSMod,
  applyVastHangar,
  describeAdditionalBerthing,
  describeAdditionalBerthingSMod,
  describeAdvancedGroundSupport,
  describeAugmentedEngines,
  describeAugmentedEnginesSMod,
  describeAuxiliaryFuelTanks,
  describeAuxiliaryFuelTanksSMod,
  describeBDeck,
  describeConvertedFighterBay,
  describeConvertedFighterBaySMod,
  describeConvertedHangar,
  describeConvertedHangarSMod,
  describeDefensiveTargetingArray,
  describeDefensiveTargetingArraySMod,
  describeDriveFieldStabilizer,
  describeEfficiencyOverhaul,
  describeEfficiencyOverhaulSMod,
  describeExpandedCargoHolds,
  describeExpandedCargoHoldsSMod,
  describeExpandedDeckCrew,
  describeFighterChassisStorage,
  describeGroundSupport,
  describeHighResSensors,
  describeHighResSensorsSMod,
  describeInsulatedEngines,
  describeInsulatedEnginesSMod,
  describeMilitarizedSubsystems,
  describeMilitarizedSubsystemsSMod,
  describePhaseField,
  describeRecoveryShuttles,
  describeRecoveryShuttlesSMod,
  describeRepairGantry,
  describeSolarShielding,
  describeSolarShieldingSMod,
  describeSurveying,
  describeSurveyingSMod,
  describeVastHangar,
  getConvertedHangarDeploymentDelta,
  INSULATED_ENGINES_MULT,
  INSULATED_ENGINES_SMOD_MULT,
  MILITARIZED_SENSOR_PROFILE_MULT,
  MILITARIZED_SENSOR_STRENGTH_MULT,
  PHASE_FIELD_PROFILE_MULT
} from "./logistics"
import {
  describeFragmentCoordinator,
  describeFragmentCoordinatorSMod,
  describeFragmentSwarm,
  describeFragmentSwarmSMod,
  describeSecondaryFabricator,
  describeSecondaryFabricatorSMod,
  describeShroudedLens,
  describeShroudedMantle,
  describeShroudedMantleSMod,
  describeShroudedThunderhead,
  describeThreatHull,
  tablesShroudedLens,
  tablesShroudedThunderhead
} from "./special"

export type { HullmodTable } from "./describe"

export type DeploymentCostCtx = {
  /** Total OP spent on fitted fighter wings. */
  fightersOp: number
  hullSize: string
}

export type WeaponOpCtx = {
  weaponId: string
  /** Mount size from the .wpn spec (SMALL/MEDIUM/LARGE). */
  size: string
  /** Effective mount type (mountTypeOverride wins, e.g. Mining Blaster). */
  mountType: string
  /** Base OP cost from weapon_data.csv. */
  baseOp: number
}

export type HullmodImpl = {
  /**
   * Flat stat mutation. Absent when the mod touches no ship stat directly.
   * Receives the unmodified base ship alongside: vanilla percent bonuses
   * (modifyPercent) key off base values, so mods like Shield Shunt need it
   * to stay exact when other mods already changed the stat.
   */
  apply?: (ship: completeShip, base: completeShip) => completeShip
  /**
   * S-mod bonus stat mutation. Runs after ALL base applies, only for ids in
   * the player's `smods` list (hull-native built-ins never count as S-mods).
   * Receives the unmodified base ship alongside so bonuses computed from base
   * values (e.g. capacity doublings) stay exact instead of compounding.
   * Absent when the S-mod bonus touches no modeled ship stat — most S-mods
   * are weapon/fighter/fleet/campaign-level and stay describe-only.
   */
  applySMod?: (ship: completeShip, base: completeShip) => completeShip
  /**
   * Loadout-aware deployment/supply cost delta. Absent when the mod does not
   * touch deployment cost. Receives fighter OP because apply() only sees base
   * ship stats (e.g. Converted Hangar: ceil(fightersOp / 5), min 1).
   */
  getDeploymentCostDelta?: (ctx: DeploymentCostCtx) => number
  /**
   * Flat OP discount for a mounted weapon (e.g. Heavy Ballistics
   * Integration: -10 for large ballistics). Absent when the mod does not
   * touch weapon OP. Returning 0 = no effect on that weapon.
   */
  getWeaponOpDiscount?: (ctx: WeaponOpCtx) => number
  /** Complete description string with `%s` placeholders filled. */
  describe: (mod: hullMod) => string
  /** S-mod bonus string with `%s` placeholders filled. Absent when no S-mod bonus. */
  describeSMod?: (mod: hullMod) => string
  /** Structured tables rendered below the description. Absent when not needed. */
  tables?: (mod: hullMod) => HullmodTable[]
}

/**
 * Built-in marker mods with no player-facing text: applied mechanically but
 * never rendered in the built-in roster (e.g. Dweller visuals on Dweller hulls).
 */
export const HIDDEN_BUILTIN_MOD_IDS: ReadonlySet<string> = new Set([
  "dweller_hullmod"
])

/** Vanilla-style cap on player-built S-mods per ship. */
export const MAX_SMODS = 2

/**
 * S-mods whose effect is a drawback (the price of freeing OP): Heavy Armor
 * hurts maneuverability, Missile Racks slow missile fire rate, Fragment Swarm
 * cuts max CR and raises maintenance. Tooltips render these as "S-mod
 * penalty" in orange instead of lime.
 */
export const DETRIMENTAL_SMOD_IDS: ReadonlySet<string> = new Set([
  "heavyarmor",
  "missleracks",
  "fragment_swarm"
])

export const HULLMOD_IMPLS: Record<string, HullmodImpl> = {
  advancedcore: { describe: describeAdvancedTargetingCore },
  civgrade: { describe: describeCivGrade },
  delicate: {
    describe: describeDelicateMachinery,
    apply: applyDelicateMachinery
  },
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
  high_maintenance: {
    describe: describeHighMaintenance,
    apply: applyHighMaintenance
  },
  militarized_subsystems: {
    describe: describeMilitarizedSubsystems,
    apply: applyMilitarizedSubsystems,
    applySMod: applyMilitarizedSubsystemsSMod,
    describeSMod: describeMilitarizedSubsystemsSMod
  },
  no_weapon_flux: { describe: describeNoWeaponFlux },
  distributed_fire_control: { describe: describeDistributedFireControl },
  reinforcedhull: {
    describe: describeReinforcedBulkheads,
    apply: applyReinforcedBulkheads
  },
  supercomputer: { describe: describeTargetingSupercomputer },
  unstable_injector: {
    describe: describeUnstableInjector,
    apply: applyUnstableInjector
  },
  advancedshieldemitter: {
    describe: describeAccelShields,
    describeSMod: describeAccelShieldsSMod
  },
  turretgyros: {
    describe: describeTurretGyros,
    describeSMod: describeTurretGyrosSMod
  },
  armoredweapons: {
    describe: describeArmoredWeapons,
    apply: applyArmoredWeapons,
    describeSMod: describeArmoredWeaponsSMod
  },
  augmentedengines: {
    describe: describeAugmentedEngines,
    apply: applyAugmentedEngines,
    applySMod: applyAugmentedEnginesSMod,
    describeSMod: describeAugmentedEnginesSMod
  },
  autorepair: {
    describe: describeAutoRepair,
    describeSMod: describeAutoRepairSMod
  },
  auxiliarythrusters: {
    describe: describeAuxThrusters,
    apply: applyAuxThrusters,
    describeSMod: describeAuxThrustersSMod
  },
  blast_doors: {
    describe: describeBlastDoors,
    apply: applyBlastDoors,
    describeSMod: describeBlastDoorsSMod
  },
  eccm: { describe: describeEccm, describeSMod: describeEccmSMod },
  magazines: {
    describe: describeMagazines,
    describeSMod: describeMagazinesSMod
  },
  missleracks: {
    describe: describeMissileRacks,
    describeSMod: describeMissileRacksSMod
  },
  extendedshieldemitter: {
    describe: describeExtendedShields,
    apply: applyExtendedShields,
    applySMod: applyExtendedShieldsSMod,
    describeSMod: describeExtendedShieldsSMod
  },
  fluxbreakers: {
    describe: describeFluxBreakers,
    describeSMod: describeFluxBreakersSMod
  },
  fluxcoil: {
    describe: describeFluxCoil,
    apply: applyFluxCoil,
    applySMod: applyFluxCoilSMod,
    describeSMod: describeFluxCoilSMod
  },
  fluxdistributor: {
    describe: describeFluxDistributor,
    apply: applyFluxDistributor,
    applySMod: applyFluxDistributorSMod,
    describeSMod: describeFluxDistributorSMod
  },
  heavyarmor: {
    describe: describeHeavyArmor,
    apply: applyHeavyArmor,
    describeSMod: describeHeavyArmorSMod
  },
  insulatedengine: {
    describe: describeInsulatedEngines,
    apply: applyInsulatedEngines,
    describeSMod: describeInsulatedEnginesSMod
  },
  solar_shielding: {
    describe: describeSolarShielding,
    describeSMod: describeSolarShieldingSMod
  },
  stabilizedshieldemitter: {
    describe: describeStabilizedShields,
    apply: applyStabilizedShields,
    describeSMod: describeStabilizedShieldsSMod
  },
  surveying_equipment: {
    describe: describeSurveying,
    describeSMod: describeSurveyingSMod
  },
  converted_fighterbay: {
    describe: describeConvertedFighterBay,
    apply: applyConvertedFighterBay,
    applySMod: applyConvertedFighterBaySMod,
    describeSMod: describeConvertedFighterBaySMod
  },
  additional_berthing: {
    describe: describeAdditionalBerthing,
    apply: applyAdditionalBerthing,
    applySMod: applyAdditionalBerthingSMod,
    describeSMod: describeAdditionalBerthingSMod
  },
  advancedoptics: { describe: describeAdvancedOptics },
  dedicated_targeting_core: {
    describe: describeDedicatedCore,
    describeSMod: describeDedicatedCoreSMod
  },
  targetingunit: { describe: describeTargetingUnit },
  comp_armor: {
    describe: describeCompromisedArmor,
    apply: applyCompromisedArmor
  },
  comp_storage: {
    describe: describeCompromisedStorage,
    apply: applyCompromisedStorage
  },
  damaged_deck: {
    describe: describeDamagedFlightDeck,
    apply: applyDamagedFlightDeck
  },
  fragile_subsystems: {
    describe: describeFragileSubsystems,
    apply: applyFragileSubsystems
  },
  increased_maintenance: {
    describe: describeIncreasedMaintenance,
    apply: applyIncreasedMaintenance
  },
  comp_structure: {
    describe: describeStructuralDamage,
    apply: applyStructuralDamage
  },
  glitched_sensors: {
    describe: describeGlitchedSensors,
    apply: applyGlitchedSensors
  },
  malfunctioning_comms: {
    describe: describeMalfunctioningComms,
    apply: applyMalfunctioningComms
  },
  erratic_injector: {
    describe: describeErraticInjector,
    apply: applyErraticInjector
  },
  faulty_auto: {
    describe: describeFaultyAutomatedSystems,
    apply: applyFaultyAutomatedSystems
  },
  damaged_mounts: {
    describe: describeDamagedMounts,
    apply: applyDamagedMounts
  },
  degraded_life_support: {
    describe: describeDegradedLifeSupport,
    apply: applyDegradedLifeSupport
  },
  degraded_shields: {
    describe: describeDegradedShields,
    apply: applyDegradedShields
  },
  comp_hull: { describe: describeCompromisedHull, apply: applyCompromisedHull },
  degraded_drive_field: {
    describe: describeDegradedDriveField,
    apply: applyDegradedDriveField
  },
  degraded_engines: {
    describe: describeDegradedEngines,
    apply: applyDegradedEngines
  },
  faulty_grid: {
    describe: describeFaultyPowerGrid,
    apply: applyFaultyPowerGrid
  },
  unstable_coils: {
    describe: describePhaseCoilInstability,
    apply: applyPhaseCoilInstability
  },
  defective_manufactory: {
    describe: describeDefectiveManufactory,
    apply: applyDefectiveManufactory
  },
  frontemitter: {
    describe: describeFrontShieldEmitter,
    apply: applyFrontShieldEmitter,
    applySMod: applyFrontShieldEmitterSMod,
    describeSMod: describeFrontShieldEmitterSMod
  },
  adaptiveshields: {
    describe: describeOmniShieldEmitter,
    apply: applyOmniShieldEmitter,
    applySMod: applyOmniShieldEmitterSMod,
    describeSMod: describeOmniShieldEmitterSMod
  },
  frontshield: {
    describe: describeFrontShieldGenerator,
    apply: applyFrontShieldGenerator
  },
  converted_bay: {
    describe: describeConvertedCargoBay,
    apply: applyConvertedCargoBay
  },
  pointdefenseai: {
    describe: describePointDefenseAI,
    describeSMod: describePointDefenseAISMod
  },
  safetyoverrides: {
    describe: describeSafetyOverrides,
    apply: applySafetyOverrides
  },
  assault_package: {
    describe: describeAssaultPackage,
    apply: applyAssaultPackage
  },
  shield_shunt: {
    describe: describeShieldShunt,
    apply: applyShieldShunt,
    applySMod: applyShieldShuntSMod,
    describeSMod: describeShieldShuntSMod
  },
  auxiliary_fuel_tanks: {
    describe: describeAuxiliaryFuelTanks,
    apply: applyAuxiliaryFuelTanks,
    applySMod: applyAuxiliaryFuelTanksSMod,
    describeSMod: describeAuxiliaryFuelTanksSMod
  },
  expanded_cargo_holds: {
    describe: describeExpandedCargoHolds,
    apply: applyExpandedCargoHolds,
    applySMod: applyExpandedCargoHoldsSMod,
    describeSMod: describeExpandedCargoHoldsSMod
  },
  efficiency_overhaul: {
    describe: describeEfficiencyOverhaul,
    apply: applyEfficiencyOverhaul,
    applySMod: applyEfficiencyOverhaulSMod,
    describeSMod: describeEfficiencyOverhaulSMod
  },
  hiressensors: {
    describe: describeHighResSensors,
    describeSMod: describeHighResSensorsSMod
  },
  drive_field_stabilizer: { describe: describeDriveFieldStabilizer },
  repair_gantry: { describe: describeRepairGantry },
  ground_support: { describe: describeGroundSupport },
  advanced_ground_support: { describe: describeAdvancedGroundSupport },
  phasefield: { describe: describePhaseField },
  expanded_deck_crew: {
    describe: describeExpandedDeckCrew,
    apply: applyExpandedDeckCrew
  },
  recovery_shuttles: {
    describe: describeRecoveryShuttles,
    describeSMod: describeRecoveryShuttlesSMod
  },
  converted_hangar: {
    describe: describeConvertedHangar,
    apply: applyConvertedHangar,
    getDeploymentCostDelta: getConvertedHangarDeploymentDelta,
    describeSMod: describeConvertedHangarSMod
  },
  vast_hangar: { describe: describeVastHangar, apply: applyVastHangar },
  defensive_targeting_array: {
    describe: describeDefensiveTargetingArray,
    describeSMod: describeDefensiveTargetingArraySMod
  },
  bdeck: { describe: describeBDeck },
  chassis_storage: { describe: describeFighterChassisStorage },
  nav_relay: { describe: describeNavRelay },
  ecm: { describe: describeEcmPackage },
  operations_center: { describe: describeOperationsCenter },
  ballistic_rangefinder: {
    describe: describeBallisticRangefinder,
    tables: tablesBallisticRangefinder
  },
  coherer: { describe: describeEnergyBoltCoherer },
  high_scatter_amp: {
    describe: describeHighScatterAmp,
    describeSMod: describeHighScatterAmpSMod
  },
  missile_autoloader: {
    describe: describeMissileAutoloader,
    describeSMod: describeMissileAutoloaderSMod,
    tables: tablesMissileAutoloader
  },
  missile_reload: { describe: describeMissileReload },
  hbi: {
    describe: describeHeavyBallisticsIntegration,
    getWeaponOpDiscount: getHeavyBallisticsIntegrationDiscount
  },
  pdintegration: { describe: describePdIntegration },
  adaptive_coils: { describe: describeAdaptivePhaseCoils },
  ex_phase_coils: { describe: describeExperimentalPhaseCoils },
  phase_anchor: { describe: describePhaseAnchor },
  escort_package: {
    describe: describeEscortPackage,
    describeSMod: describeEscortPackageSMod
  },
  neural_interface: {
    describe: describeNeuralInterface,
    describeSMod: describeNeuralInterfaceSMod
  },
  neural_integrator: {
    describe: describeNeuralIntegrator,
    describeSMod: describeNeuralIntegratorSMod
  },
  terminator_core: { describe: describeTerminatorCore },
  shared_flux_sink: { describe: describeSharedFluxSink },
  ablative_armor: { describe: describeAblativeArmor },
  automated: { describe: describeAutomatedShip, apply: applyAutomatedShip },
  rugged: {
    describe: describeRuggedConstruction,
    apply: applyRuggedConstruction
  },
  design_compromises: { describe: describeDesignCompromises },
  andrada_mods: { describe: describeAndradaMods, apply: applyAndradaMods },
  fragment_swarm: {
    describe: describeFragmentSwarm,
    describeSMod: describeFragmentSwarmSMod
  },
  secondary_fabricator: {
    describe: describeSecondaryFabricator,
    describeSMod: describeSecondaryFabricatorSMod
  },
  fragment_coordinator: {
    describe: describeFragmentCoordinator,
    describeSMod: describeFragmentCoordinatorSMod
  },
  shrouded_mantle: {
    describe: describeShroudedMantle,
    describeSMod: describeShroudedMantleSMod
  },
  shrouded_thunderhead: {
    describe: describeShroudedThunderhead,
    tables: tablesShroudedThunderhead
  },
  shrouded_lens: { describe: describeShroudedLens, tables: tablesShroudedLens },
  threat_hullmod: { describe: describeThreatHull }
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

/** Structured tables for a hullmod tooltip (empty when it has none). */
export function getHullmodTables(mod: hullMod): HullmodTable[] {
  return HULLMOD_IMPLS[mod.id]?.tables?.(mod) ?? []
}

/** Chain flat stat mods over a ship, skipping unknown ids and describe-only mods. */
export function applyHullmods(
  ship: completeShip,
  ids: string[],
  smodIds: string[] = []
): completeShip {
  let next = ship
  for (const id of ids) {
    const apply = HULLMOD_IMPLS[id]?.apply
    if (apply) next = apply(next, ship)
  }
  // S-mod bonuses stack on top of every base effect (e.g. Adaptive Shields
  // divides the arc AFTER the base ×0.7 penalty). Only player-built S-mods
  // qualify — hull-native built-ins in `ids` never receive their S-mod bonus.
  const smodded = new Set(smodIds)
  for (const id of smodded) {
    const applySMod = HULLMOD_IMPLS[id]?.applySMod
    if (applySMod) next = applySMod(next, ship)
  }
  return next
}

/**
 * Total deployment/supply cost delta for a hullmod id list.
 * Loadout-aware (needs fighter OP); 0 when no mod touches deployment cost.
 */
export function getDeploymentCostDelta(
  ids: string[],
  ctx: DeploymentCostCtx
): number {
  let total = 0
  for (const id of ids) total += HULLMOD_IMPLS[id]?.getDeploymentCostDelta?.(ctx) ?? 0
  return total
}

/**
 * Effective deployment cost + supply recovery cost after hullmods.
 * Vanilla deployment cost tracks base monthly supplies, so the delta bumps
 * both `supplies/mo` (DP) and `supplies/rec` by the same amount.
 */
export function getEffectiveDeploymentCost(
  baseShip: completeShip,
  ids: string[],
  ctx: DeploymentCostCtx
): { dp: number; suppliesRec: number; delta: number } {
  const delta = getDeploymentCostDelta(ids, ctx)
  const baseDp = Number(baseShip.stats["supplies/mo"] ?? 0)
  const baseRec = Number(baseShip.stats["supplies/rec"] ?? 0)
  return {
    dp: baseDp + delta,
    suppliesRec: baseRec + delta,
    delta
  }
}

/**
 * Total flat weapon OP discount for one mounted weapon across a hullmod id
 * list. Needs the weapon's size/mount type, which live in the .wpn spec
 * (not the CSV stats) — callers resolve those via getWeaponMountInfoMap().
 */
export function getWeaponOpDiscount(
  ids: string[],
  ctx: WeaponOpCtx
): number {
  let total = 0
  for (const id of ids)
    total += HULLMOD_IMPLS[id]?.getWeaponOpDiscount?.(ctx) ?? 0
  return total
}

export function getEffectiveWeaponOp(
  baseOp: number,
  ids: string[],
  ctx: Omit<WeaponOpCtx, "baseOp">
): number {
  const base = Number.isFinite(baseOp) ? baseOp : 0
  return Math.max(0, base - getWeaponOpDiscount(ids, { ...ctx, baseOp: base }))
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
  insulatedengine: {
    profile: INSULATED_ENGINES_MULT,
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
 * S-modded Insulated Engines reduce the profile to 90% (×0.1) instead of 50%.
 */
export function getSensorMults(ids: string[], smodIds: string[] = []): SensorMults {
  const smodded = new Set(smodIds)
  let profile = 1
  let strength = 1
  for (const id of ids) {
    if (id === "insulatedengine" && smodded.has(id)) {
      profile *= INSULATED_ENGINES_SMOD_MULT
      continue
    }
    const mults = SENSOR_MULTS[id]
    if (!mults) continue
    profile *= mults.profile
    strength *= mults.strength
  }
  return { profile, strength }
}
