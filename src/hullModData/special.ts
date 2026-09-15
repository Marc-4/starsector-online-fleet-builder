/** §7 threat / dweller hullmods (fragment-spawn mechanics: describe-only). */
import type { hullMod } from "#/types"
import { formatHullmodDesc, rawDesc, rawSModDesc } from "./describe"

export function describeFragmentSwarm(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), ["20", "40", "60", "100", "1", "2", "3", "5"])
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
  return formatHullmodDesc(rawDesc(mod), [])
}

export function describeShroudedLens(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [])
}
