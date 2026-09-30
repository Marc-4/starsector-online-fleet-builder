import { useMemo } from "react"
import { getVentMult } from "#/hullModData"
import { getFluxMult } from "#/hullModData"
import { getMaxCapsVents } from "#/lib/fluxLimits"
import { getModifiedStat } from "#/lib/statModifier"
import type { fleetEntry } from "#/types"
import type { useLoadoutOp } from "./useLoadoutOp"

type Loadout = ReturnType<typeof useLoadoutOp>

/** Single source for StatCluster props (compact + desktop shared this verbatim). */
export function useStatClusterProps(
  activeTile: fleetEntry,
  loadout: Pick<Loadout, "moddedShip" | "spentOp" | "availableOp" | "weaponFluxPerSecond">,
  opts: {
    showInfo: boolean
    onInfoToggle: () => void
    onCapacitorsIncrement: (e?: React.MouseEvent) => void
    onCapacitorsDecrement: (e?: React.MouseEvent) => void
    onVentsIncrement: (e?: React.MouseEvent) => void
    onVentsDecrement: (e?: React.MouseEvent) => void
  }
) {
  return useMemo(() => {
    const { moddedShip } = loadout
    const allModIds = [
      ...(activeTile.ship.meta.builtInMods ?? []),
      ...(activeTile.hullmods ?? []),
      ...(activeTile.smods ?? []),
    ]
    const fluxMult = getFluxMult(allModIds)
    return {
      spentOp: loadout.spentOp,
      showInfo: opts.showInfo,
      onInfoToggle: opts.onInfoToggle,
      availableOp: loadout.availableOp,
      topSpeed: moddedShip.stats["max speed"],
      topSpeedBase: activeTile.ship.stats["max speed"],
      armor: moddedShip.stats["armor rating"],
      armorBase: activeTile.ship.stats["armor rating"],
      hull: moddedShip.stats.hitpoints,
      hullBase: activeTile.ship.stats.hitpoints,
      capacitors: activeTile.capacitors,
      maxCapacitors: getMaxCapsVents(activeTile.ship.meta.hullSize),
      vents: activeTile.vents,
      maxVents: getMaxCapsVents(activeTile.ship.meta.hullSize),
      fluxCapacity: Math.round(
        getModifiedStat(moddedShip.stats, "max flux", {
          capacitors: activeTile.capacitors,
        }).total * fluxMult
      ),
      fluxCapacityBase: getModifiedStat(activeTile.ship.stats, "max flux").base,
      fluxDissipation: Math.round(
        getModifiedStat(moddedShip.stats, "flux dissipation", {
          vents: activeTile.vents * getVentMult(allModIds),
        }).total * fluxMult
      ),
      fluxDissipationBase: getModifiedStat(
        activeTile.ship.stats,
        "flux dissipation"
      ).base,
      shieldEfficiency: moddedShip.stats["shield efficiency"],
      shieldEfficiencyBase: activeTile.ship.stats["shield efficiency"],
      shieldArc: moddedShip.stats["shield arc"],
      shieldArcBase: activeTile.ship.stats["shield arc"],
      shieldUpkeep: moddedShip.stats["shield upkeep"],
      shieldUpkeepBase: activeTile.ship.stats["shield upkeep"],
      phaseActivationCost: moddedShip.stats["phase cost"],
      phaseActivationCostBase: activeTile.ship.stats["phase cost"],
      phaseUpkeep: moddedShip.stats["phase upkeep"],
      phaseUpkeepBase: activeTile.ship.stats["phase upkeep"],
      weaponFluxPerSecond: loadout.weaponFluxPerSecond,
      onCapacitorsIncrement: opts.onCapacitorsIncrement,
      onCapacitorsDecrement: opts.onCapacitorsDecrement,
      onVentsIncrement: opts.onVentsIncrement,
      onVentsDecrement: opts.onVentsDecrement,
    }
  }, [activeTile, loadout, opts])
}
