1. Pure flat stat mods

- AdvancedTargetingCore — +100% ballistic/energy range, -40% PD range
- CivGrade — civilian penalty: +100% sensor profile, 0.5x sensor strength
- DelicateMachinery — +50% CR decay after peak time
- FluxShunt — dissipate hard flux at 50% rate with shields up
- Fourteenth — skin buff: +100 armor, 1.05x flux cap/dissipation, 0.92x speed/handling
- HardenedShieldEmitter — -20% shield damage, 0.5x shield pierce chance
- HardenedSubsystems — +50% peak time, 0.75x CR loss
- HighMaintenance — 2x supplies/month
- Militarized — deprecated: armor/flux/speed/burn buff by hull-size
- NoWeaponFlux — weapon flux cost 0x (fighter tuning)
- ReinforcedBulkheads — +40% hull, never break apart / always recoverable
- TargetingSupercomputer — +250% weapon range, -190% PD range, +sight/accuracy
- UnstableInjector — +flat speed by hull-size, 0.85x range, +refit time

2. Stat mods with S-mod bonus (or penalty) 

- AcceleratedShieldEmitter — shield turn/unfold, 2x when S-modded
- AdvancedTurretGyros — turret turn; S-mod: +vs missiles/fighters/small ships
- ArmoredWeapons — weapon HP/armor/recoil; S-mod: +RoF
- AugmentedEngines — +2 burn, +1 more S-modded
- AutomatedRepairUnit — faster weapon/engine repair; S-mod: even faster + shorter overload
- AuxiliaryThrusters — maneuverability; S-mod: 0-flux boost bonus
- BlastDoors — +hull, fewer crew losses; S-mod: fewer losses
- ECCMPackage — missile ECCM/speed/guidance, less EW penalty; S-mod: full immunity
- ExpandedMagazines — +ammo; S-mod: +regen
- ExpandedMissileRacks — +100% missile ammo; S-mod: -20% missile RoF penalty
- ExtendedShieldEmitter — +60° arc, +120° S-modded
- FluxBreakers — -EMP damage, +vent rate; S-mod: more vent
- FluxCoilAdjunct / FluxDistributor — +flux cap/dissipation by hull-size; S-mod: extra flat
- HeavyArmor — +150/300/400/500 armor by hull-size; S-mod: -25% maneuver penalty
- InsulatedEngines — engine HP/hull/sensor profile; S-mod: stronger
- SolarShielding — -energy damage, -corona effect; S-mod: immune
- StabilizedShieldEmitter — 0.5x shield upkeep; S-mod: hard→soft flux conversion
- SurveyingEquipment — -survey cost by hull-size, 2x S-modded, fleet-wide tooltip
- ConvertedFighterBay — also S-mod: -maintenance/month per bay (see #4)
  Gated stat mods:
- AdvancedOptics — +beam range, -turn rate; blocked if HIGH_SCATTER_AMP
- DedicatedTargetingCore — cruiser/capital-only +range by 35/50% range; incompatible with ITU; S-mod increase values to 40/60%
- IntegratedTargetingUnit — +range by hull-size 10/20/40/60%

3. D-mods — permanent debuffs
- CompromisedArmor — 0.8x armor
- CompromisedHull — 0.7x hull
- DegradedDriveField — -1 burn, +50% sensor profile
- DegradedEngines — 0.85x speed/maneuver
- FaultyPowerGrid — 0.85x flux cap/dissipation, +50% sensor profile
- PhaseCoilInstability — 0.5x phase time, 0.7x peak time, +30%CR loss

4. Content-adding/removing: shields, bays, weapons 

- FrontShieldEmitter — force omni→front, +arc; S-mod: -shield damage
- OmniShieldEmitter — force front→omni, -arc unless S-modded
- FrontShieldGenerator — give shieldless ship 90° front shield; -20% speed
- ConvertedCargoBay — +2 fighter bays (debuff delegated to DefectiveManufactory)
- ConvertedFighterBay — remove all bays → +cargo/-crew per bay
- IntegratedPointDefenseAI — PD ignores flares/best leading; S-mod: make all small non-missile weapons PD

5. Combat behavior scripts + overhaul mods
- SafetyOverrides — archetypal complex mod: hull-size speed, always-on 0-flux boost, 2x dissipation, 0.33x peak time, no venting, 450-range cap
