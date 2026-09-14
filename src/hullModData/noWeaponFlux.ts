import type { hullMod } from "#/types"
import { formatHullmodDesc, rawDesc } from "./describe"

export const ID = "no_weapon_flux"
// Fighter/weapon-level effect (no ship stat, no placeholders): describe-only.
export function describeNoWeaponFlux(mod: hullMod): string {
  return formatHullmodDesc(rawDesc(mod), [])
}
