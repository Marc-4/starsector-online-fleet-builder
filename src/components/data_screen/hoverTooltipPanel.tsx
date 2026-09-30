import type { hullMod, shipStats, weapon, weaponStats, wingStats } from "#/types"
import FighterTooltip from "../fighterTooltip"
import HullmodTooltip from "../hullmodTooltip"
import WeaponTooltip from "../weaponTooltip"

export default function HoverTooltipPanel({
  weapon,
  wing,
  hullmod,
  allWeaponStats,
  allShipStats,
}: {
  weapon?: weapon | null
  wing?: wingStats | null
  hullmod?: hullMod | null
  allWeaponStats: weaponStats[]
  allShipStats: shipStats[]
}) {
  if (weapon) return <WeaponTooltip weapon={weapon} allWeaponStats={allWeaponStats} />
  if (wing) return <FighterTooltip wing={wing} allShipStats={allShipStats} />
  if (hullmod) return <HullmodTooltip hullmod={hullmod} />
  return null
}
