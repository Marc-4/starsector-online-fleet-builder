/** Installable general-purpose ("Special") hullmods. */
import type { completeShip, hullMod } from "#/types"
import {
  formatHullmodDesc,
  rawDesc,
  rawSModDesc,
  type HullmodTable
} from "./describe"
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
  addStat(
    next.stats,
    "max flux",
    byHullSize(ship.meta.hullSize, [600, 1200, 1800, 3000])
  )
  return next
}

export function describeFluxCoil(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [
    "600",
    "1200",
    "1800",
    "3000",
    "200",
    "400",
    "600",
    "1000"
  ])
}

export function describeFluxCoilSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["200", "400", "600", "1000"])
}

// S-mod top-up stacks on the base coil, matching a maxed capacitor layout.
export function applyFluxCoilSMod(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(
    next.stats,
    "max flux",
    byHullSize(ship.meta.hullSize, [200, 400, 600, 1000])
  )
  return next
}

export function applyFluxDistributor(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(
    next.stats,
    "flux dissipation",
    byHullSize(ship.meta.hullSize, [30, 60, 90, 150])
  )
  return next
}

export function describeFluxDistributor(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [
    "30",
    "60",
    "90",
    "150",
    "10",
    "20",
    "30",
    "50"
  ])
}

export function describeFluxDistributorSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["10", "20", "30", "50"])
}

// S-mod top-up stacks on the base distributor, matching maxed vents.
export function applyFluxDistributorSMod(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  addStat(
    next.stats,
    "flux dissipation",
    byHullSize(ship.meta.hullSize, [10, 20, 30, 50])
  )
  return next
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
  void mod
  return [
    "Utilizes targeting data from the ship's largest ballistic slot to benefit certain weapons, extending the base range of typical ballistic weapons to match similar but larger weapons. Greatly benefits hybrid weapons. Point-defense weapons are unaffected.",
    "The range bonus is based on the size of the largest ballistic slot, and the increased base range is capped, but still subject to other modifiers."
  ].join("\n\n")
}

export function tablesBallisticRangefinder(mod: hullMod): HullmodTable[] {
  void mod
  return [
    {
      caption: "Affects small and medium ballistic weapons.",
      head: ["Largest b. slot", "Small wpn", "Medium wpn", "Range cap"],
      rows: [
        ["Small / Medium", "+100", "---", "800"],
        ["Large", "+200", "+100", "900"]
      ]
    },
    {
      caption: "Affects hybrid weapons of all sizes.",
      head: ["Largest b. slot", "Small", "Medium", "Large", "Range cap"],
      rows: [
        ["Small / Medium", "+200", "+100", "+100", "800"],
        ["Large", "+400", "+200", "+100", "900"]
      ]
    }
  ]
}

export function describeEnergyBoltCoherer(mod: hullMod): string {
  void mod
  return [
    "Increases the range of the ship's energy bolt weapons by 200 for uncrewed ships, and by 100 for crewed ships.",
    "Crewed ships suffer 50% more crew casualties in combat."
  ].join("\n\n")
}

export function describeHighScatterAmp(mod: hullMod): string {
  void mod
  return [
    "Beam weapons deal 10% more damage and deal hard flux to shields.",
    "Reduces the portion of the range of beam weapons that is above 200 units by 50%. The base range is affected.",
    "Incompatible with Advanced Optics."
  ].join("\n\n")
}

export function describeHighScatterAmpSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["5%"])
}

export function describeMissileAutoloader(mod: hullMod): string {
  void mod
  return [
    "A combat-rated autoloader that provides a limited number of reloads, out of a shared reload capacity, to missile weapons installed in small missile mounts.",
    "Does not affect weapons that do not use ammo or already regenerate it, or are mounted in any other type of slot. Reload size is not affected by skills or hullmods that increase missile ammo capacity."
  ].join("\n\n")
}

export function describeMissileAutoloaderSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["10"])
}

export function tablesMissileAutoloader(mod: hullMod): HullmodTable[] {
  void mod
  return [
    {
      head: ["Ship size", "Small missiles", "Reload capacity"],
      rows: [
        ["Frigate", "2+", "4"],
        ["Frigate", "1", "6"],
        ["Destroyer", "2+", "4"],
        ["Destroyer", "1", "9"],
        ["Cruiser", "4+", "8"],
        ["Cruiser", "3", "12"],
        ["Cruiser", "1-2", "15"],
        ["Capital", "7+", "10"],
        ["Capital", "4-6", "18"],
        ["Capital", "1-3", "24"]
      ]
    }
  ]
}

export function describeMissileReload(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [])
}

export function describeHeavyBallisticsIntegration(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["10"])
}

export function getHeavyBallisticsIntegrationDiscount(ctx: {
  size: string
  mountType: string
}): number {
  return ctx.size === "LARGE" && ctx.mountType === "BALLISTIC" ? 10 : 0
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
  return formatHullmodDesc(rawDesc(mod), [
    "700",
    "25%",
    "10%",
    "20%",
    "doubled"
  ])
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

// Flux penalty applies to the final totals (after caps/vents and other
// hullmods), so it is applied at display via getFluxMult, not here.
export const DESIGN_COMPROMISES_FLUX_MULT = 0.6

export function describeDesignCompromises(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [
    "40%",
    "15%",
    "50%",
    "100%",
    "Converted Hangar",
    "1"
  ])
}

export function applyAndradaMods(ship: completeShip): completeShip {
  const next = cloneShip(ship)
  mulStat(next.stats, "flux dissipation", 0.95, false)
  return next
}

export function describeAndradaMods(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["10%", "5%", "25%"])
}
