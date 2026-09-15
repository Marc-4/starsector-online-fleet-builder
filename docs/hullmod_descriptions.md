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
- CompromisedStructure.java — 0.8x armor + hull.
- GlitchedSensorArray.java — 0.9x range, 0.5x sensors.
- MalfunctioningComms.java — 0.6x fighter range.
- DefectiveManufactory.java — fighters -25% speed, +25% damage taken.
- DamagedFlightDeck.java — +30% refit time.
- FragileSubsystems.java — -30% peak time, +30% CR loss.
- CompromisedStorage.java — 0.75x crew/cargo/fuel.
- IncreasedMaintenance.java — +30% supply + min-crew, -5% max CR.
- ErraticInjector.java — +50% fuel use, -10 zero-flux boost.
- FaultyAutomatedSystems.java — +50% min-crew, -5% max CR.
- DamagedWeaponMounts.java — 0.75x turn, +30% recoil.
- DegradedLifeSupport.java — 0.5x max crew, -5% max CR.
- DegradedShields.java — +10% shield damage taken.

4. Content-adding/removing: shields, bays, weapons

- FrontShieldEmitter — force omni→front, +arc; S-mod: -shield damage
- OmniShieldEmitter — force front→omni, -arc unless S-modded
- FrontShieldGenerator — give shieldless ship 90° front shield; -20% speed
- ConvertedCargoBay — +2 fighter bays, fighter speed -25%, figher damage taken +25%
- ConvertedFighterBay — remove all bays → +cargo/-crew per bay
- IntegratedPointDefenseAI — PD ignores flares/best leading; S-mod: make all small non-missile weapons PD (describe only)

5. Combat behavior scripts + overhaul mods

- SafetyOverrides — archetypal complex mod: hull-size speed, always-on 0-flux boost, 2x dissipation, 0.33x peak time, no venting, 450-range cap

6. Logistics — capacity / upkeep

- AdditionalBerthing.java — +30/60/100/200 crew by F/D/C/Cap (min 30% base), S-mod x2. Civ hulls: +50% maintenance unless S-modded.
- AuxiliaryFuelTanks.java — +30/60/100/200 fuel, same min/S-mod/civ rules as above.
- ExpandedCargoHolds.java — +30/60/100/200 cargo, same min/S-mod/civ rules.
- EfficiencyOverhaul.java — -20% maintenance/fuel/min-crew (0.8x), +50% CR recovery + repair rate. S-mod: -30% (0.7x).
- HighResSensors.java — +50/75/100/150 fleet sensors by size, diminishing returns, needs 10% CR. S-mod: +1000/1500/2000/2500 combat vision.
- MilitarizedSubsystems.java — +1 burn, removes civ sensor penalty. Tradeoff: +100% min-crew unless S-modded.
- DriveFieldStabilizer.java — +1 fleet burn, +200 sensor profile, stacks.
- RepairGantry.java — +10/25/30/40% salvage by size, +20% of that to post-battle loot.
- GroundSupport.java / AdvancedGroundSupport.java — +100 / +200 raid strength.
- PhaseField.java — self profile 0.5x, reduces fleet detection range, needs 10% CR.
  Fighter / carrier
- ExpandedDeckCrew.java — replacement decay 0.85x (-15%), recovery +25%, +20 crew/bay.
- RecoveryShuttles.java — pilot losses 0.25x (-75%), S-mod 0.05x (-95%).
- ConvertedHangar.java — +1 bay, refit 1.5x slower, +20 crew, +DP by fighter OP/5. S-mod: +10% replacement cruiser / +25% capital.
- VastHangar.java — +1 Converted Hangar bay, removes all its penalties.
- DefensiveTargetingArray.java — fighters locked to ship, +50% vs fighters/missiles. S-mod: +100 fighter weapon range.
- BDeck.java / FighterChassisStorage.java — once-per-battle refill to full when rate ≤40% / rate never decays.

7. Threat / Dweller

- FragmentSwarmHullmod.java — swarm 20/40/60/100 by size, respawn 1/2/3/5/s. S-mod: -20% max CR, +50% maintenance.
- SecondaryFabricatorHullmod.java — +30% respawn (+50% S-mod).
- FragmentCoordinatorHullmod.java — +60% swarm size (+100% S-mod).
- ShroudedMantle.java — recoil away on hull damage, +50% casualties, lunge 250 speed/4s/10s CD. S-mod: 50% rift heal.
- ShroudedThunderhead.java — 200-500 dmg lightning, 3000 range, 0.22-0.44s refire.
- ShroudedLens.java — auto-mine 400 range/50 radius, 75 dmg, 0.9-1.1s refire, up to 4x RoF on capitals.
-

8. Others
   Combat / fleet support

- NavRelay.java — +2/3/4/5% fleet speed by size.
- ECMPackage.java — +1/2/3/4 ECM by size.
- OperationsCenter.java — +2.5/s CP recovery, flagship only.
- BallisticRangefinder.java — small +100/100/200, medium +100, capped 800/800/900. Destroyer+.
- EnergyBoltCoherer.java — +200 range uncrewed / +100 crewed, crewed +50% casualties.
- HighScatterAmp.java — beams +10% damage (+15% S-mod), deal hard flux, but >200 range halved. Blocks Advanced Optics.
- MissileAutoloader.java — reloads small missiles in small mounts, capacity by count e.g. F6/D9/C15, cooldown 5s (10s S-mod penalty).
- PeriodicMissileReload.java — refills all missiles every 10-15s.
- HeavyBallisticsIntegration.java — -10 OP cost on large ballistics.
- PDIntegration.java — -OP on small PD, +% PD damage.
- AdaptivePhaseCoils.java — +50% hard-flux threshold before phased speed bottoms out.
- ExperimentalPhaseCoils.java — cloak cooldown 0.2x (-80%).
- PhaseAnchor.java — cloak activation 0 flux, 2x dissipation/RoF while phased, 1x emergency dive costing 100% DP in CR.
- EscortPackage.java — near larger ally (700su): +25% maneuver, +10% speed, +20% range, x2 for destroyer near capital. S-mod destroyer: -10% shield damage.
- AssaultPackage.java — +10% hull, +5% armor, +10% flux, acts as combat ship.
- ShieldShunt.java — remove shields, +15% armor (+30% S-mod).
- NeuralInterface.java / NeuralIntegrator.java — pilot 2 ships, instant swap, free system use. Integrator: auto-ships only, +10% DP/supply cost.
- TerminatorCore.java — +100% vs missiles/fighters, beams +300 range, 2x turn, ignores flares.
- SharedFluxSink.java — shares 50% dissipation to modules, 20% hard flux.
- AblativeArmor.java — effective armor 0.1x (10%).
- DistributedFireControl.java — weapon + EMP damage taken 0.5x.
- Automated.java — no crew, -100% max CR in player fleet.
- RuggedConstruction.java — d-mod effect/chance 0.5x, recovery cost 0.5x, always recoverable.
- DesignCompromises.java — -40% flux, -15% ballistic range, -50% missile RoF, +100% energy flux, free Converted Hangar.
- AndradaMods.java — +10% casualties, -5% dissipation, +25% repair time.
