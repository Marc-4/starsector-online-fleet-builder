/** Installable general-purpose ("Special") hullmods. */
import type { completeShip, hullMod } from "#/types"
import { formatHullmodDesc, rawDesc, rawSModDesc } from "./describe"
import { addStat, byHullSize, cloneShip, mulStat } from "./modUtils"
const PEAK_TIME_MULT = 1.5
const CR_LOSS_MULT = 0.75

export function applyHardenedSubsystems(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "peak CR sec", PEAK_TIME_MULT)
  mulStat(next.stats, "CR loss/sec", CR_LOSS_MULT, false)
  return next
}

export function describeHardenedSubsystems(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "25%"])
}

export function applyFluxCoil(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "max flux", byHullSize(ship.meta.hullSize, [600, 1200, 1800, 3000]))
  return next
}

export function describeFluxCoil(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["600", "1200", "1800", "3000", "200", "400", "600", "1000"])
}


export function describeFluxCoilSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["200", "400", "600", "1000"])
}

export function applyFluxDistributor(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(next.stats, "flux dissipation", byHullSize(ship.meta.hullSize, [30, 60, 90, 150]))
  return next
}

export function describeFluxDistributor(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["30", "60", "90", "150", "10", "20", "30", "50"])
}


export function describeFluxDistributorSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["10", "20", "30", "50"])
}

export function describeFluxBreakers(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "25%", "25%"])
}


export function describeFluxBreakersSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["25%"])
}

// ---- §8 combat / fleet support (fleet- and weapon-level: describe-only) ----

export function describeNavRelay(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["2%", "3%", "4%", "5%"])
}

export function describeEcmPackage(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["1", "2", "3", "4"])
}

export function describeOperationsCenter(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["2.5"])
}

export function describeBallisticRangefinder(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [])
}

export function describeEnergyBoltCoherer(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [])
}

export function describeHighScatterAmp(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [])
}

export function describeHighScatterAmpSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["15%"])
}

export function describeMissileAutoloader(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [])
}

export function describeMissileAutoloaderSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["10"])
}

export function describeMissileReload(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [])
}

export function describeHeavyBallisticsIntegration(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["10"])
}

export function describePdIntegration(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["4", "50%"])
}

export function describeAdaptivePhaseCoils(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "50%", "75%"])
}

export function describeExperimentalPhaseCoils(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["80%"])
}

export function describePhaseAnchor(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["0", "100%", "100%"])
}

export function describeEscortPackage(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["700", "25%", "10%", "20%", "doubled"])
}

export function describeEscortPackageSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["10%"])
}

export function describeNeuralInterface(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["be controlled", "60"])
}

export function describeNeuralInterfaceSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), [])
}

export function describeNeuralIntegrator(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["be controlled", "60", "10%"])
}

export function describeNeuralIntegratorSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), [])
}

export function describeTerminatorCore(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["100%", "300"])
}

export function describeSharedFluxSink(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "20%"])
}

export function describeAblativeArmor(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["10%"])
}

// ---- §8 with ship-stat effects ----

export function applyAutomatedShip(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  ;(next.stats as Record<string, unknown>)["min crew"] = 0
  return next
}

export function describeAutomatedShip(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [])
}

export function applyRuggedConstruction(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "supplies/rec", 0.5, false)
  return next
}

export function describeRuggedConstruction(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%", "50%", "50%"])
}

export function applyDesignCompromises(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "max flux", 0.6)
  mulStat(next.stats, "flux dissipation", 0.6)
  return next
}

export function describeDesignCompromises(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["40%", "15%", "50%", "100%", "Converted Hangar", "1"])
}

export function applyAndradaMods(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "flux dissipation", 0.95, false)
  return next
}

export function describeAndradaMods(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["10%", "5%", "25%"])
}
