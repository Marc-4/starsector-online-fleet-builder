import type { fleetEntry, hullMod, weapon, weaponSlot } from "#/types"
import type { AssignedHullmod } from "../../hooks/useLoadoutOp"
import BuildInModal from "../modals/buildInModal"
import HullmodSelectionModal from "../modals/hullmodSelectionModal"
import WeaponSelectionModal from "../modals/weaponSelectionModal"

export default function ActiveShipModals({
  activeTile,
  selectedSlot,
  hullmodIds,
  remainingOpForSlot,
  remainingOp,
  assignedHullmods,
  showHullmods,
  showBuildIn,
  opOf,
  onCloseSlot,
  onSelectWeapon,
  onRemoveWeapon,
  onCloseHullmods,
  onToggleHullmod,
  onCloseBuildIn,
  onBuildIn,
}: {
  activeTile: fleetEntry
  selectedSlot: weaponSlot | null
  hullmodIds: string[]
  remainingOpForSlot: (slotId: string, opOf: (wid: string | undefined) => number) => number
  opOf: (wid: string | undefined) => number
  remainingOp: number
  assignedHullmods: AssignedHullmod[]
  showHullmods: boolean
  showBuildIn: boolean
  onCloseSlot: () => void
  onSelectWeapon: (slot: weaponSlot, w: weapon) => void
  onRemoveWeapon: (slot: weaponSlot, w: weapon) => void
  onCloseHullmods: () => void
  onToggleHullmod: (h: hullMod) => void
  onCloseBuildIn: () => void
  onBuildIn: (id: string) => void
}) {
  return (
    <>
      {selectedSlot && (
        <WeaponSelectionModal
          slot={selectedSlot}
          onClose={onCloseSlot}
          onSelect={(w) => onSelectWeapon(selectedSlot, w)}
          remainingOpForSlot={remainingOpForSlot(selectedSlot.id, opOf)}
          mountedWeaponIds={activeTile.weapons ?? {}}
          installedHullmodIds={hullmodIds}
          onRemoveWeapon={(w) => onRemoveWeapon(selectedSlot, w)}
        />
      )}
      {showHullmods && (
        <HullmodSelectionModal
          ship={activeTile.ship}
          hullSize={activeTile.ship.meta.hullSize}
          mountedHullmodIds={hullmodIds}
          remainingOp={remainingOp}
          onClose={onCloseHullmods}
          onSelect={onToggleHullmod}
        />
      )}
      {showBuildIn && (
        <BuildInModal
          assignedHullmods={assignedHullmods}
          smodCount={(activeTile.smods ?? []).length}
          onClose={onCloseBuildIn}
          onBuildIn={onBuildIn}
        />
      )}
    </>
  )
}
