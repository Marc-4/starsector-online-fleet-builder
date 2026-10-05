import { getCrPenalty, getMaxCr } from "#/hullModData"
import type {
  fleetEntry,
  hullMod,
  shipStats,
  weapon,
  weaponSlot,
  weaponStats,
  wingStats
} from "#/types"
import type {
  AssignedHullmod,
  BuiltInHullmod,
  SmoddedHullmod
} from "../../hooks/useLoadoutOp"
import { MAX_ZOOM_DESKTOP, MIN_ZOOM, ZOOM_STEP } from "../../hooks/useShipZoom"
import { useState } from "react"
import type { officer } from "#/types"
import CommonButton from "../commonBtn"
import OfficerSelectionModal from "../modals/officerSelectionModal"
import ActiveShipModals from "./activeShipModals"
import CombatReadinessBar from "./combatReadinessBar"
import FighterBayColumn from "./fighterBayColumn"
import HoverTooltipPanel from "./hoverTooltipPanel"
import HullmodRoster from "./hullmodRoster"
import OfficerPortrait from "./officerPortrait"
import ShipDisplay from "./shipDisplay"
import ShipInfoCard from "./shipInfoCard"
import ShipName from "./shipName"
import StatCluster from "./statCluster"
import ZoomControls from "./zoomControls"

export type DesktopShipViewProps = {
  activeTile: fleetEntry
  moddedShip: fleetEntry["ship"]
  allWeaponStats: weaponStats[]
  allShipStats: shipStats[]
  availableOp: number
  spentOp: number
  weaponsOp: number
  fightersOp: number
  convertedBayFightersOp: number
  opOf: (wid: string | undefined) => number
  wingOpOf: (wid: string | undefined) => number
  assignedHullmods: AssignedHullmod[]
  builtInHullmods: BuiltInHullmod[]
  smoddedHullmods: SmoddedHullmod[]
  hullmodIds: string[]
  allModIds: string[]
  bayCount: number
  zoom: number
  setZoom: React.Dispatch<React.SetStateAction<number>>
  showArcs: boolean
  onToggleArcs: () => void
  showInfo: boolean
  setShowInfo: (f: (v: boolean) => boolean) => void
  statClusterProps: React.ComponentProps<typeof StatCluster>
  selectedSlot: weaponSlot | null
  setSelectedSlot: (s: weaponSlot | null) => void
  hoveredWeapon: weapon | undefined
  setHoveredWeapon: (w: weapon | undefined) => void
  hoveredWing: wingStats | null
  setHoveredWing: (w: wingStats | null) => void
  hoveredHullmod: hullMod | null
  setHoveredHullmod: (h: hullMod | null) => void
  handleWheel: (e: React.WheelEvent) => void
  handlePinchStart: (e: React.TouchEvent<HTMLDivElement>) => void
  handlePinchMove: (e: React.TouchEvent<HTMLDivElement>) => void
  handleSlotShiftClick: (slot: weaponSlot) => void
  handleSlotRightClick: (slot: weaponSlot) => void
  handleBayShiftClick: (bayIndex: number) => void
  handleUnbuildSmod: (id: string) => void
  wingIdAt: (bayIndex: number) => string
  remainingOpForBay: (bayIndex: number) => number
  selectFighter: (bayIndex: number, wing: wingStats) => void
  removeFighter: (bayIndex: number) => void
  showHullmods: boolean
  setShowHullmods: (v: boolean) => void
  showBuildIn: boolean
  setShowBuildIn: (v: boolean) => void
  remainingOpForSlot: (
    slotId: string,
    opOf: (wid: string | undefined) => number
  ) => number
  remainingOp: number
  onSelectWeapon: (slot: weaponSlot, w: weapon) => void
  onRemoveWeapon: (slot: weaponSlot, w: weapon) => void
  onToggleHullmod: (h: hullMod) => void
  onBuildIn: (id: string) => void
  onHullmodsChange: (hullmods: string[]) => void
  onCustomNameChange: (value: string) => void
  onOfficerChange: (officer: officer | undefined) => void
  onStrip: () => void
}

export default function DesktopShipView(p: DesktopShipViewProps) {
  const { activeTile, moddedShip } = p
  const [showOfficer, setShowOfficer] = useState(false)
  return (
    <>
      <div className="absolute top-1 left-1 right-1 z-20 flex flex-col gap-2 min-[1127px]:flex-row min-[1127px]:items-start min-[1127px]:justify-between pointer-events-none">
        <div className="pointer-events-auto max-[1127px]:w-fit max-[1127px]:self-end origin-top-left">
          <CombatReadinessBar
            cr={Math.max(0, activeTile.cr - getCrPenalty(p.allModIds))}
            maxCr={getMaxCr(p.allModIds)}
          />
        </div>
        <div className="pointer-events-auto flex flex-col lg:ml-auto max-[1127px]:self-end origin-top-right">
          <StatCluster {...p.statClusterProps} />
          <div className="flex justify-end w-full">
            <HullmodRoster
              assignedHullmods={p.assignedHullmods}
              builtInHullmods={p.builtInHullmods}
              smoddedHullmods={p.smoddedHullmods}
              onHoverHullmod={p.setHoveredHullmod}
              onRemoveHullmod={(id) =>
                p.onHullmodsChange(
                  (activeTile.hullmods ?? []).filter((x) => x !== id)
                )
              }
              onRemoveSmod={p.handleUnbuildSmod}
              onAdd={() => p.setShowHullmods(true)}
              onBuildIn={() => p.setShowBuildIn(true)}
            />
          </div>
        </div>
      </div>
      {p.showInfo && (
        <>
          <div
            aria-hidden="true"
            onClick={() => p.setShowInfo(() => false)}
            className="absolute inset-0 z-30 bg-transparent cursor-default"
          />
          <div className="absolute left-1 top-16 z-40 w-[calc(100%-0.5rem)] max-w-5xl overflow-x-auto">
            <ShipInfoCard
              ship={moddedShip}
              baseShip={activeTile.ship}
              hullmodIds={p.hullmodIds}
              smodIds={activeTile.smods ?? []}
              capacitors={activeTile.capacitors}
              vents={activeTile.vents}
              fightersOp={p.fightersOp}
              convertedBayFightersOp={p.convertedBayFightersOp}
            />
          </div>
        </>
      )}
      <div className="absolute left-2 top-20 flex flex-col gap-1">
        <OfficerPortrait
          officer={activeTile.assignedOfficer}
          onClick={() => setShowOfficer(true)}
        />
      </div>
      {showOfficer && (
        <OfficerSelectionModal
          officer={activeTile.assignedOfficer}
          onClose={() => setShowOfficer(false)}
          onSave={(officer) => {
            p.onOfficerChange(officer)
            setShowOfficer(false)
          }}
          onRemove={() => {
            p.onOfficerChange(undefined)
            setShowOfficer(false)
          }}
        />
      )}
      <div className="flex flex-col gap-1 absolute left-2 top-60 w-fit h-fit">
        <FighterBayColumn
          entryId={activeTile.id}
          builtInWings={moddedShip.meta.builtInWings ?? []}
          bayCount={p.bayCount}
          wingIdAt={p.wingIdAt}
          remainingOpForBay={p.remainingOpForBay}
          onSelect={p.selectFighter}
          onRemove={p.removeFighter}
          onShiftClick={p.handleBayShiftClick}
          onHover={p.setHoveredWing}
        />
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 max-sm:left-1/2 max-sm:top-[70%] sm:max-xl:left-[38%] sm:max-xl:top-[62%] top-[50%] -translate-y-1/2 z-[25] flex items-center justify-center pointer-events-auto w-[72vw] h-[28vh] sm:w-[420px] sm:h-[280px] md:w-[520px] md:h-[340px] lg:w-130 lg:h-90 max-w-[90vw] max-h-[42vh] sm:max-h-[52vh] touch-manipulation"
        onWheel={p.handleWheel}
        onTouchStart={p.handlePinchStart}
        onTouchMove={p.handlePinchMove}
        title="Scroll to zoom"
      >
        <ShipDisplay
          ship={activeTile.ship.meta}
          zoom={p.zoom}
          showArcs={p.showArcs}
          onSlotClick={(slot) => {
            p.setHoveredWeapon(undefined)
            p.setSelectedSlot(slot)
          }}
          onSlotShiftClick={p.handleSlotShiftClick}
          onSlotHover={(_slot, weapon) => p.setHoveredWeapon(weapon)}
          onSlotRightClick={p.handleSlotRightClick}
          mountedWeaponIds={activeTile.weapons ?? {}}
        />
      </div>
      {(p.hoveredWeapon || p.hoveredWing || p.hoveredHullmod) &&
        !p.selectedSlot && (
          <div className="absolute left-1 top-16 z-30 w-[35%] lg:w-[50%] xl:w-[45%] h-fit overflow-auto pointer-events-none">
            <HoverTooltipPanel
              weapon={p.hoveredWeapon}
              wing={p.hoveredWing}
              hullmod={p.hoveredHullmod}
              allWeaponStats={p.allWeaponStats}
              allShipStats={p.allShipStats}
            />
          </div>
        )}
      <ActiveShipModals
        activeTile={activeTile}
        selectedSlot={p.selectedSlot}
        hullmodIds={p.hullmodIds}
        remainingOpForSlot={p.remainingOpForSlot}
        opOf={p.opOf}
        remainingOp={p.remainingOp}
        assignedHullmods={p.assignedHullmods}
        showHullmods={p.showHullmods}
        showBuildIn={p.showBuildIn}
        onCloseSlot={() => p.setSelectedSlot(null)}
        onSelectWeapon={p.onSelectWeapon}
        onRemoveWeapon={p.onRemoveWeapon}
        onCloseHullmods={() => p.setShowHullmods(false)}
        onToggleHullmod={p.onToggleHullmod}
        onCloseBuildIn={() => p.setShowBuildIn(false)}
        onBuildIn={p.onBuildIn}
      />
      <div className="z-10 absolute left-1 bottom-1 gap-2 flex flex-col origin-bottom-left">
        <ShipName
          hullName={activeTile.ship.meta.hullName}
          customName={activeTile.customName}
          onCustomNameChange={p.onCustomNameChange}
        />
        <div className="flex gap-2">
          <ZoomControls
            maxZoom={MAX_ZOOM_DESKTOP}
            MIN_ZOOM={MIN_ZOOM}
            ZOOM_STEP={ZOOM_STEP}
            setZoom={p.setZoom}
            zoom={p.zoom}
            showArcs={p.showArcs}
            onToggleArcs={p.onToggleArcs}
          />
          <CommonButton text="Strip" onClick={p.onStrip} />
        </div>
      </div>
    </>
  )
}
