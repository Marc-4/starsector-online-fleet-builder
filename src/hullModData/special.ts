/** §7 threat / dweller hullmods (fragment-spawn mechanics: describe-only). */
import type { hullMod } from "#/types"
import { formatHullmodDesc, rawDesc, rawSModDesc } from "./describe"
import type { HullmodTable } from "./describe"

export function describeFragmentSwarm(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [
    "20",
    "40",
    "60",
    "100",
    "1",
    "2",
    "3",
    "5"
  ])
}

export function describeFragmentSwarmSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["20%", "50%"])
}

export function describeSecondaryFabricator(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["30%"])
}

export function describeSecondaryFabricatorSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["50%"])
}

export function describeFragmentCoordinator(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["60%"])
}

export function describeFragmentCoordinatorSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["100%"])
}

export function describeShroudedMantle(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["50%"])
}

export function describeShroudedMantleSMod(mod: hullMod): string {
  return formatHullmodDesc(rawSModDesc(mod), ["50%"])
}

export function describeShroudedThunderhead(mod: hullMod): string {
  void mod
  return [
    "Fires rift lightning bolts at locations recently hit by this ship's weapons.",
    "The amount of damage and the flux generated depend on the size of the ship the hullmod is installed on. The probability of a bolt being fired increases with the number of hits landed over the previous 5 seconds. Bolts are not triggered by weapons dealing soft flux damage, such as beams.",
    "Crew casualties in combat are increased by 50%."
  ].join("\n\n")
}

export function describeShroudedLens(mod: hullMod): string {
  void mod
  return [
    'The "lens" (in the loosest sense of the word) focuses on nearby objects, seemingly random. Deals 75 Energy damage and generates 75 flux.',
    "The rate of fire depends on the size of the ship the hullmod is installed on. Can not be turned off during combat operations, and continues to function even if the ship is venting flux or overloaded.",
    "Crew casualties in combat are increased by 50%."
  ].join("\n\n")
}

export function tablesShroudedThunderhead(mod: hullMod): HullmodTable[] {
  void mod

  return [
    {
      head: ["Ship size", "Damage", "EMP", "Flux cost"],
      rows: [
        ["Frigate", "200", "400", "200"],
        ["Destroyer", "300", "600", "300"],
        ["Cruiser", "400", "800", "400"],
        ["Capital", "500", "1000", "500"]
      ]
    }
  ]
}

export function tablesShroudedLens(mod: hullMod): HullmodTable[] {
  void mod
  return [
    {
      head: ["Ship size", "Attacks / sec", "Flux / sec"],
      rows: [
        ["Frigate", "1", "75"],
        ["Destroyer", "2", "150"],
        ["Cruiser", "3", "225"],
        ["Capital", "4", "300"]
      ]
    }
  ]
}

export function describeThreatHull(mod: hullMod): string {
  void mod
  return [
    "Threat hulls have a number of shared properties.",
    "Sensor profile reduced to 0.",
    "Target leading accuracy increased to maximum for all weapons, including missiles. Effect of enemy ECM rating reduced by 50%. Weapon and engine damage is reduced by 50%. EMP damage take is reduced by 50%. In addition, repairs of damaged but functional weapons and engines can continue while they are under fire."
  ].join("\n\n")
}
