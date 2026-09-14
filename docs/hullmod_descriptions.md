1. Pure flat stat mods

- AdvancedTargetingCore.java — +100% ballistic/energy range, -40% PD range
- CivGrade.java — civilian penalty: +100% sensor profile, 0.5x sensor strength
- DelicateMachinery.java — +50% CR decay after peak time
- FluxShunt.java — dissipate hard flux at 50% rate with shields up
- Fourteenth.java — skin buff: +100 armor, 1.05x flux cap/dissipation, 0.92x speed/handling
- HardenedShieldEmitter.java — -20% shield damage, 0.5x shield pierce chance
- HardenedSubsystems.java — +50% peak time, 0.75x CR loss
- HighMaintenance.java — 2x supplies/month
- Militarized.java — deprecated: armor/flux/speed/burn buff by hull-size
- NoWeaponFlux.java — weapon flux cost 0x (fighter tuning)
- ReinforcedBulkheads.java — +40% hull, never break apart / always recoverable
- TargetingSupercomputer.java — +250% weapon range, -190% PD range, +sight/accuracy
- UnstableInjector.java — +flat speed by hull-size, 0.85x range, +refit time

2. Stat mods with S-mod bonus (or penalty) 

- AcceleratedShieldEmitter.java — shield turn/unfold, 2x when S-modded
- AdvancedTurretGyros.java — turret turn; S-mod: +vs missiles/fighters/small ships
- ArmoredWeapons.java — weapon HP/armor/recoil; S-mod: +RoF
- AugmentedEngines.java — +2 burn, +1 more S-modded
- AutomatedRepairUnit.java — faster weapon/engine repair; S-mod: even faster + shorter overload
- AuxiliaryThrusters.java — maneuverability; S-mod: 0-flux boost bonus
- BlastDoors.java — +hull, fewer crew losses; S-mod: fewer losses
- ECCMPackage.java — missile ECCM/speed/guidance, less EW penalty; S-mod: full immunity
- ExpandedMagazines.java — +ammo; S-mod: +regen
- ExpandedMissileRacks.java — +100% missile ammo; S-mod: -20% missile RoF penalty
- ExtendedShieldEmitter.java — +60° arc, +120° S-modded
- FluxBreakers.java — -EMP damage, +vent rate; S-mod: more vent
- FluxCoilAdjunct.java / FluxDistributor.java — +flux cap/dissipation by hull-size; S-mod: extra flat
- HeavyArmor.java — +150/300/400/500 armor by hull-size; S-mod: -25% maneuver penalty
- InsulatedEngines.java — engine HP/hull/sensor profile; S-mod: stronger
- SolarShielding.java — -energy damage, -corona effect; S-mod: immune
- StabilizedShieldEmitter.java — 0.5x shield upkeep; S-mod: hard→soft flux conversion
- SurveyingEquipment.java — -survey cost by hull-size, 2x S-modded, fleet-wide tooltip
- ConvertedFighterBay.java — also S-mod: -maintenance/month per bay (see #4)
  Gated stat mods:
- AdvancedOptics.java — +beam range, -turn rate; blocked if HIGH_SCATTER_AMP
- DedicatedTargetingCore.java — cruiser/capital-only +range by 35/50% range; incompatible with ITU; S-mod increase values to 40/60%
- IntegratedTargetingUnit.java — +range by hull-size 10/20/40/60%

3. D-mods — permanent debuffs
- CompromisedArmor.java — 0.8x armor
- CompromisedHull.java — 0.7x hull
- DegradedDriveField.java — -1 burn, +50% sensor profile
- DegradedEngines.java — 0.85x speed/maneuver
- FaultyPowerGrid.java — 0.85x flux cap/dissipation, +50% sensor profile
- PhaseCoilInstability.java — 0.5x phase time, 0.7x peak time, +30%CR loss

4. Content-adding/removing: shields, bays, weapons 

- FrontShieldEmitter.java — force omni→front, +arc; S-mod: -shield damage
- OmniShieldEmitter.java — force front→omni, -arc unless S-modded
- FrontShieldGenerator.java — give shieldless ship 90° front shield; -20% speed
- ConvertedCargoBay.java — +2 fighter bays (debuff delegated to DefectiveManufactory)
- ConvertedFighterBay.java — remove all bays → +cargo/-crew per bay
- IntegratedPointDefenseAI.java — PD ignores flares/best leading; S-mod: make all small non-missile weapons PD

5. Combat behavior scripts + overhaul mods
- SafetyOverrides.java — archetypal complex mod: hull-size speed, always-on 0-flux boost, 2x dissipation, 0.33x peak time, no venting, 450-range cap
