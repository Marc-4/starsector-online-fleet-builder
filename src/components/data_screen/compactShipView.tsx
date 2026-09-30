import { getCrPenalty, getMaxCr } from "#/hullModData"
import type {
  fleetEntry,
  hullMod,
  shipStats,
  weapon,
  weaponSlot,
  weaponStats,
  wingStats,
} from "#/types"
import type { AssignedHullmod, BuiltInHullmod, SmoddedHullmod } from "../../hooks/useLoadoutOp"
import { MAX_ZOOM_DESKTOP, MIN_ZOOM, ZOOM_STEP } from "../../hooks/useShipZoom"
import CommonButton from "../commonBtn"
import CombatReadinessBar from "./combatReadinessBar"
import FighterBay from "./fighterBay"
import FighterBayColumn from "./fighterBayColumn"
import HoverTooltipPanel from "./hoverTooltipPanel"
import HullmodRoster from "./hullmodRoster"
import ShipDisplay from "./shipDisplay"
import ShipInfoCard from "./shipInfoCard"
import ShipName from "./shipName"
import SlotActionSheet from "./slotActionSheet"
import StatCluster from "./statCluster"
import ZoomControls from "./zoomControls"
import ActiveShipModals from "./activeShipModals"

export type CompactShipViewProps = {
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
  assignedHullmods: AssignedHullmod[]
  builtInHullmods: BuiltInHullmod[]
  smoddedHullmods: SmoddedHullmod[]
  hullmodIds: string[]
  allModIds: string[]
  visibleSlots: weaponSlot[]
  bayCount: number
  zoom: number
  setZoom: React.Dispatch<React.SetStateAction<number>>
  showArcs: boolean
  onToggleArcs: () => void
  compactTab: "weapons" | "fighters" | "hullmods" | "info"
  setCompactTab: (t: CompactShipViewProps["compactTab"]) => void
  tabsRef: React.RefObject<HTMLDivElement | null>
  statClusterProps: React.ComponentProps<typeof StatCluster>
  // slot selection
  slotAction: weaponSlot | null
  slotInfoWeapon: weapon | null
  slotInfoLoading: boolean
  selectedSlot: weaponSlot | null
  setSelectedSlot: (s: weaponSlot | null) => void
  hoveredWeapon: weapon | undefined
  setHoveredWeapon: (w: weapon | undefined) => void
  hoveredWing: wingStats | null
  setHoveredWing: (w: wingStats | null) => void
  hoveredHullmod: hullMod | null
  setHoveredHullmod: (h: hullMod | null) => void
  closeSlotAction: () => void
  clearSlotInfo: () => void
  openSlot: (slot: weaponSlot) => void
  openSlotInfo: (slot: weaponSlot) => void
  handleWheel: (e: React.WheelEvent) => void
  handleSlotShiftClick: (slot: weaponSlot) => void
  handleSlotRightClick: (slot: weaponSlot) => void
  handleBayShiftClick: (bayIndex: number) => void
  handleUnbuildSmod: (id: string) => void
  // fighter bays
  wingIdAt: (bayIndex: number) => string
  remainingOpForBay: (bayIndex: number) => number
  selectFighter: (bayIndex: number, wing: wingStats) => void
  removeFighter: (bayIndex: number) => void
  // modals
  showHullmods: boolean
  setShowHullmods: (v: boolean) => void
  showBuildIn: boolean
  setShowBuildIn: (v: boolean) => void
  remainingOpForSlot: (slotId: string, opOf: (wid: string | undefined) => number) => number
  remainingOp: number
  onSelectWeapon: (slot: weaponSlot, w: weapon) => void
  onRemoveWeapon: (slot: weaponSlot, w: weapon) => void
  onToggleHullmod: (h: hullMod) => void
  onBuildIn: (id: string) => void
  onHullmodsChange: (hullmods: string[]) => void
  onCustomNameChange: (value: string) => void
  onStrip: () => void
}

export default function CompactShipView(p: CompactShipViewProps) {
  const {
    activeTile, moddedShip, allWeaponStats, allShipStats,
    fightersOp, convertedBayFightersOp,
    assignedHullmods, builtInHullmods, smoddedHullmods,
    hullmodIds, allModIds, visibleSlots, bayCount,
  } = p
  const tabs = [
    { id: "weapons", label: `Weapons (${visibleSlots.length})` },
    { id: "fighters", label: `Fighters (${bayCount})` },
    {
      id: "hullmods",
      label: `Hullmods (${assignedHullmods.length + smoddedHullmods.length})`,
    },
    { id: "info", label: "Info" },
  ] as const

  return (
    <div className="flex flex-col gap-2 p-2 pb-8 lg:hidden">
      <div className="flex flex-col gap-2 rounded  items-end p-2">
        <CombatReadinessBar
          cr={Math.max(0, activeTile.cr - getCrPenalty(allModIds))}
          maxCr={getMaxCr(allModIds)}
        />
        <StatCluster {...p.statClusterProps} onInfoToggle={() => p.setCompactTab("info")} />
      </div>
      <div className="flex flex-col gap-2 rounded  p-2">
        <ShipName
          hullName={activeTile.ship.meta.hullName}
          customName={activeTile.customName}
          onCustomNameChange={p.onCustomNameChange}
        />
        <div
          className="flex h-[34vh] min-h-56 items-center justify-center overflow-hidden rounded touch-manipulation"
          onWheel={p.handleWheel}
        >
          <ShipDisplay
            ship={activeTile.ship.meta}
            zoom={p.zoom}
            showArcs={p.showArcs}
            onSlotClick={p.openSlot}
            onSlotShiftClick={p.handleSlotShiftClick}
            onSlotHover={(_slot, weapon) => p.setHoveredWeapon(weapon)}
            onSlotRightClick={p.handleSlotRightClick}
            mountedWeaponIds={activeTile.weapons ?? {}}
          />
        </div>
        {p.hoveredWeapon && !p.selectedSlot && !p.slotAction && (
          <div className="max-h-72 overflow-auto">
            <HoverTooltipPanel
              weapon={p.hoveredWeapon}
              allWeaponStats={allWeaponStats}
              allShipStats={allShipStats}
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <ZoomControls
            maxZoom={MAX_ZOOM_DESKTOP}
            MIN_ZOOM={MIN_ZOOM}
            ZOOM_STEP={ZOOM_STEP}
            setZoom={p.setZoom}
            zoom={p.zoom}
            showArcs={p.showArcs}
            onToggleArcs={p.onToggleArcs}
          />
          <CommonButton text="Strip" onClick={p.onStrip} className="py-1" />
        </div>
        <p className="ss-coarse-pointer-only text-xs font-normal text-blue-200/70">
          Tap a slot below to fit a weapon.
        </p>
      </div>
      <div
        ref={p.tabsRef}
        role="tablist"
        aria-label="Ship sections"
        className="ss-chip-rail sticky top-0 z-20 bg-gray-950/90 py-1 scroll-mt-2"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={p.compactTab === t.id}
            type="button"
            onClick={() => p.setCompactTab(t.id)}
            className={`shrink-0 rounded border px-3 py-2 text-sm touch-manipulation ${p.compactTab === t.id ? "border-cyan-300 bg-cyan-900 text-cyan-50" : "border-cyan-900 bg-gray-950 text-cyan-200"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {p.compactTab === "weapons" && (
        <div role="tabpanel" className="flex flex-col gap-1.5">
          {visibleSlots.length === 0 && (
            <p className="text-sm text-cyan-200/70">No weapon slots.</p>
          )}
          {visibleSlots.map((slot) => {
            const mountedId = activeTile.weapons?.[slot.id]
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => p.openSlot(slot)}
                className="flex min-h-14 items-center justify-between gap-2 rounded border border-cyan-900 bg-gray-950/70 px-3 py-2 text-left touch-manipulation"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-cyan-100">{slot.id}</span>
                  <span className="block text-xs text-cyan-200/70">
                    {slot.type} {slot.size} · {slot.mount}
                  </span>
                </span>
                <span className="shrink-0 text-right text-xs text-amber-300">
                  {mountedId ?? "Empty"}
                </span>
              </button>
            )
          })}
        </div>
      )}
      {p.compactTab === "fighters" && (
        <div role="tabpanel" className="flex flex-wrap gap-2 mt-2">
          {(moddedShip.meta.builtInWings ?? []).map((wingId) => (
            <FighterBay
              key={`${activeTile.id}-builtin-${wingId}`}
              wingId={wingId}
              locked
              onHover={p.setHoveredWing}
            />
          ))}
          {bayCount === 0 && (moddedShip.meta.builtInWings ?? []).length === 0 && (
            <p className="text-sm text-cyan-200/70">No fighter bays.</p>
          )}
          <FighterBayColumn
            entryId={activeTile.id}
            builtInWings={[]}
            bayCount={bayCount}
            wingIdAt={p.wingIdAt}
            remainingOpForBay={p.remainingOpForBay}
            onSelect={p.selectFighter}
            onRemove={p.removeFighter}
            onShiftClick={p.handleBayShiftClick}
            onHover={p.setHoveredWing}
          />
          {p.hoveredWing && (
            <div className="max-h-72 w-full overflow-auto">
              <HoverTooltipPanel
                wing={p.hoveredWing}
                allWeaponStats={allWeaponStats}
                allShipStats={allShipStats}
              />
            </div>
          )}
        </div>
      )}
      {p.compactTab === "hullmods" && (
        <div
          role="tabpanel"
          className="rounded border border-cyan-900/60 bg-gray-950/70 p-2 flex justify-end gap-2"
        >
          {p.hoveredHullmod && (
            <div className="mb-2 max-h-72 overflow-auto flex-1">
              <HoverTooltipPanel
                hullmod={p.hoveredHullmod}
                allWeaponStats={allWeaponStats}
                allShipStats={allShipStats}
              />
            </div>
          )}
          <HullmodRoster
            assignedHullmods={assignedHullmods}
            builtInHullmods={builtInHullmods}
            smoddedHullmods={smoddedHullmods}
            onHoverHullmod={p.setHoveredHullmod}
            onRemoveHullmod={(id) =>
              p.onHullmodsChange((activeTile.hullmods ?? []).filter((x) => x !== id))
            }
            onRemoveSmod={p.handleUnbuildSmod}
            onAdd={() => p.setShowHullmods(true)}
            onBuildIn={() => p.setShowBuildIn(true)}
          />
        </div>
      )}
      {p.compactTab === "info" && (
        <div role="tabpanel" className="overflow-x-auto">
          <ShipInfoCard
            ship={moddedShip}
            baseShip={activeTile.ship}
            hullmodIds={hullmodIds}
            smodIds={activeTile.smods ?? []}
            capacitors={activeTile.capacitors}
            vents={activeTile.vents}
            fightersOp={fightersOp}
            convertedBayFightersOp={convertedBayFightersOp}
          />
        </div>
      )}
      {p.slotAction && (
        <SlotActionSheet
          slot={p.slotAction}
          mountedId={activeTile.weapons?.[p.slotAction.id]}
          infoWeapon={p.slotInfoWeapon}
          infoLoading={p.slotInfoLoading}
          allWeaponStats={allWeaponStats}
          onFit={() => {
            p.setSelectedSlot(p.slotAction)
            p.closeSlotAction()
          }}
          onInfo={() => p.openSlotInfo(p.slotAction!)}
          onRemove={() => {
            p.handleSlotRightClick(p.slotAction!)
            p.closeSlotAction()
          }}
          onBack={p.clearSlotInfo}
          onClose={p.closeSlotAction}
        />
      )}
      <ActiveShipModals
        activeTile={activeTile}
        selectedSlot={p.selectedSlot}
        hullmodIds={hullmodIds}
        remainingOpForSlot={p.remainingOpForSlot}
        opOf={p.opOf}
        remainingOp={p.remainingOp}
        assignedHullmods={assignedHullmods}
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
    </div>
  )
}
