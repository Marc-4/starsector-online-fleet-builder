import type { fleetEntry } from "#/types"
import { getMaxCapsVents } from "#/lib/fluxLimits"
import CombatReadinessBar from "./combatReadinessBar"
import StatCluster from "./statCluster"

type Props = {
  activeTile: fleetEntry
  onCrChange: (value: number) => void
  onCapacitorsIncrement: (e?: React.MouseEvent) => void
  onCapacitorsDecrement: (e?: React.MouseEvent) => void
  onVentsIncrement: (e?: React.MouseEvent) => void
  onVentsDecrement: (e?: React.MouseEvent) => void
}

export default function ActiveShipPanel({
  activeTile,
  onCrChange,
  onCapacitorsIncrement,
  onCapacitorsDecrement,
  onVentsIncrement,
  onVentsDecrement,
}: Props) {
  return (
    <>
      <div>
        <CombatReadinessBar cr={activeTile.cr} onChange={onCrChange} />
      </div>
      <div className="absolute right-1 top-1">
        <StatCluster
          spentOp={activeTile.capacitors + activeTile.vents}
          availableOp={activeTile.ship.stats["ordnance points"]}
          topSpeed={activeTile.ship.stats["max speed"]}
          armor={activeTile.ship.stats["armor rating"]}
          hull={activeTile.ship.stats.hitpoints}
          capacitors={activeTile.capacitors}
          maxCapacitors={getMaxCapsVents(activeTile.ship.meta.hullSize)}
          vents={activeTile.vents}
          maxVents={getMaxCapsVents(activeTile.ship.meta.hullSize)}
          fluxCapacity={activeTile.ship.stats["max flux"]}
          fluxDissipation={activeTile.ship.stats["flux dissipation"]}
          shieldEfficiency={activeTile.ship.stats["shield efficiency"]}
          onCapacitorsIncrement={onCapacitorsIncrement}
          onCapacitorsDecrement={onCapacitorsDecrement}
          onVentsIncrement={onVentsIncrement}
          onVentsDecrement={onVentsDecrement}
        />
      </div>
    </>
  )
}
