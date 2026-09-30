import { useEffect, useMemo, useRef, useState } from "react"
import { getAllShipStats } from "#/lib/csvParser"
import type { fleetEntry, shipStats, weaponSlot } from "#/types"
import { useLayoutMode } from "../../hooks/useLayoutMode"
import { useLoadoutActions } from "../../hooks/useLoadoutActions"
import { useLoadoutOp } from "../../hooks/useLoadoutOp"
import { MAX_ZOOM_DESKTOP, useShipZoom } from "../../hooks/useShipZoom"
import { useShiftMount, useSlotSelection } from "../../hooks/useSlotSelection"
import { useStatClusterProps } from "../../hooks/useStatClusterProps"
import CompactShipView from "./compactShipView"
import DesktopShipView from "./desktopShipView"

type Props = {
  activeTile: fleetEntry
  onCapacitorsIncrement: (e?: React.MouseEvent) => void
  onCapacitorsDecrement: (e?: React.MouseEvent) => void
  onVentsIncrement: (e?: React.MouseEvent) => void
  onVentsDecrement: (e?: React.MouseEvent) => void
  onCustomNameChange: (value: string) => void
  onWeaponsChange: (weapons: Record<string, string>) => void
  onFightersChange: (fighters: string[]) => void
  onHullmodsChange: (hullmods: string[]) => void
  onSmodsChange: (smods: string[]) => void
  onStrip: () => void
}

export default function ActiveShipPanel({
  activeTile,
  onCapacitorsIncrement,
  onCapacitorsDecrement,
  onVentsIncrement,
  onVentsDecrement,
  onCustomNameChange,
  onWeaponsChange,
  onFightersChange,
  onHullmodsChange,
  onSmodsChange,
  onStrip
}: Props) {
  const { zoom, setZoom, handleWheel, handlePinchMove, handlePinchStart } =
    useShipZoom(MAX_ZOOM_DESKTOP)
  const { compact, coarse } = useLayoutMode()
  const [showArcs, setShowArcs] = useState(true)
  const [compactTab, setCompactTab] = useState<
    "weapons" | "fighters" | "hullmods" | "info"
  >("weapons")
  const [showHullmods, setShowHullmods] = useState(false)
  const [showBuildIn, setShowBuildIn] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [allShipStats, setAllShipStats] = useState<shipStats[]>([])

  const loadout = useLoadoutOp(activeTile)
  const {
    allWeaponStats,
    allWingStats,
    opOf,
    wingOpOf,
    weaponsOp,
    fightersOp,
    convertedBayFightersOp,
    availableOp,
    spentOp,
    assignedHullmods,
    builtInHullmods,
    smoddedHullmods,
    moddedShip,
    wouldExceedOp,
    wouldExceedFighterOp,
    wouldExceedHullmodOp,
    wouldExceedSmodRemovalOp
  } = loadout

  const sel = useSlotSelection(activeTile)
  const { handleSlotShiftClick, handleBayShiftClick, handleSlotRightClick } =
    useShiftMount(activeTile, {
      lastSlottedId: sel.lastSlottedId,
      lastSlottedWingId: sel.lastSlottedWingId,
      allWingStats,
      wouldExceedOp,
      wouldExceedFighterOp,
      onWeaponsChange,
      onFightersChange
    })

  const actions = useLoadoutActions(activeTile, {
    onWeaponsChange,
    onFightersChange,
    onHullmodsChange,
    onSmodsChange,
    wouldExceedOp,
    wouldExceedFighterOp,
    wouldExceedHullmodOp,
    wouldExceedSmodRemovalOp,
    wingOpOf,
    availableOp,
    weaponsOp,
    fightersOp,
    setLastSlottedId: sel.setLastSlottedId,
    setLastSlottedWingId: sel.setLastSlottedWingId
  })

  const allModIds = useMemo(
    () => [
      ...(activeTile.ship.meta.builtInMods ?? []),
      ...(activeTile.hullmods ?? []),
      ...(activeTile.smods ?? [])
    ],
    [activeTile.ship.meta.builtInMods, activeTile.hullmods, activeTile.smods]
  )

  const statClusterProps = useStatClusterProps(activeTile, loadout, {
    showInfo,
    onInfoToggle: () => setShowInfo((v) => !v),
    onCapacitorsIncrement,
    onCapacitorsDecrement,
    onVentsIncrement,
    onVentsDecrement
  })

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const stats = await getAllShipStats()
      if (!cancelled) setAllShipStats(stats)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // biome-ignore lint: intentional
  useEffect(() => {
    setShowInfo(false)
  }, [activeTile])

  useEffect(() => {
    if (!showInfo) return
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setShowInfo(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [showInfo])

  const tabsRef = useRef<HTMLDivElement>(null)

  const openSlot = (slot: weaponSlot) => {
    sel.setHoveredWeapon(undefined)
    sel.clearSlotInfo()
    if (coarse && activeTile.weapons?.[slot.id]) sel.setSlotAction(slot)
    else sel.setSelectedSlot(slot)
  }

  const visibleSlots = useMemo(
    () =>
      (activeTile.ship.meta.weaponSlots ?? []).filter(
        (s) => s.mount !== "HIDDEN"
      ),
    [activeTile.ship.meta.weaponSlots]
  )
  const bayCount = Math.max(
    0,
    (moddedShip.stats["fighter bays"] ?? 0) -
      (moddedShip.meta.builtInWings ?? []).length
  )

  const shared = {
    activeTile,
    moddedShip,
    allWeaponStats,
    allShipStats,
    availableOp,
    spentOp,
    weaponsOp,
    fightersOp,
    convertedBayFightersOp,
    opOf,
    assignedHullmods,
    builtInHullmods,
    smoddedHullmods,
    hullmodIds: actions.hullmodIds,
    allModIds,
    bayCount,
    zoom,
    setZoom,
    showArcs,
    onToggleArcs: () => setShowArcs((v) => !v),
    statClusterProps,
    selectedSlot: sel.selectedSlot,
    setSelectedSlot: sel.setSelectedSlot,
    hoveredWeapon: sel.hoveredWeapon,
    setHoveredWeapon: sel.setHoveredWeapon,
    hoveredWing: sel.hoveredWing,
    setHoveredWing: sel.setHoveredWing,
    hoveredHullmod: sel.hoveredHullmod,
    setHoveredHullmod: sel.setHoveredHullmod,
    handleWheel,
    handleSlotShiftClick,
    handleSlotRightClick,
    handleBayShiftClick,
    handleUnbuildSmod: actions.handleUnbuildSmod,
    wingIdAt: (bayIndex: number) => activeTile.fighters?.[bayIndex] ?? "",
    remainingOpForBay: actions.remainingOpForBay,
    selectFighter: actions.selectFighter,
    removeFighter: actions.removeFighter,
    showHullmods,
    setShowHullmods,
    showBuildIn,
    setShowBuildIn,
    remainingOpForSlot: actions.remainingOpForSlot,
    remainingOp: availableOp - spentOp,
    onSelectWeapon: (slot: weaponSlot, w: { id: string }) => {
      if (wouldExceedOp(slot.id, w.id)) return
      onWeaponsChange({ ...activeTile.weapons, [slot.id]: w.id })
      sel.setLastSlottedId(w.id)
    },
    onRemoveWeapon: (slot: weaponSlot, w: { id: string }) => {
      if (activeTile.weapons?.[slot.id] !== w.id) return
      const next = { ...activeTile.weapons }
      delete next[slot.id]
      onWeaponsChange(next)
    },
    onToggleHullmod: (h: { id: string }) => actions.toggleHullmod(h.id),
    onBuildIn: (id: string) => actions.handleBuildIn(id, () => setShowBuildIn(false)),
    onHullmodsChange,
    onCustomNameChange,
    onStrip
  }

  if (compact) {
    return (
      <CompactShipView
        {...shared}
        visibleSlots={visibleSlots}
        compactTab={compactTab}
        setCompactTab={setCompactTab}
        tabsRef={tabsRef}
        slotAction={sel.slotAction}
        slotInfoWeapon={sel.slotInfoWeapon}
        slotInfoLoading={sel.slotInfoLoading}
        closeSlotAction={sel.closeSlotAction}
        clearSlotInfo={sel.clearSlotInfo}
        openSlot={openSlot}
        openSlotInfo={sel.openSlotInfo}
      />
    )
  }

  return (
    <DesktopShipView
      {...shared}
      wingOpOf={wingOpOf}
      showInfo={showInfo}
      setShowInfo={setShowInfo}
      handlePinchStart={handlePinchStart}
      handlePinchMove={handlePinchMove}
    />
  )
}
