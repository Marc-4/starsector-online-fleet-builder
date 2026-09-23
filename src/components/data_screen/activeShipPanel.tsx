import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  getCrPenalty,
  getFluxMult,
  getMaxCr,
  getVentMult,
  MAX_SMODS
} from "#/hullModData"
import { getAllShipStats } from "#/lib/csvParser"
import { getMaxCapsVents } from "#/lib/fluxLimits"
import { getModifiedStat } from "#/lib/statModifier"
import { canMountWeapon } from "#/lib/weaponCompat"
import { getWeapon } from "#/lib/weaponParser"
import type {
  fleetEntry,
  hullMod,
  shipStats,
  weapon,
  weaponSlot,
  wingStats
} from "#/types"
import { useLoadoutOp } from "../../hooks/useLoadoutOp"
import { useLayoutMode } from "../../hooks/useLayoutMode"
import CommonButton from "../commonBtn"
import FighterTooltip from "../fighterTooltip"
import HullmodTooltip from "../hullmodTooltip"
import BuildInModal from "../modals/buildInModal"
import HullmodSelectionModal from "../modals/hullmodSelectionModal"
import WeaponSelectionModal from "../modals/weaponSelectionModal"
import WeaponTooltip from "../weaponTooltip"
import CombatReadinessBar from "./combatReadinessBar"
import FighterBay from "./fighterBay"
import HullmodRoster from "./hullmodRoster"
import ShipDisplay from "./shipDisplay"
import ShipInfoCard from "./shipInfoCard"
import ShipName from "./shipName"
import StatCluster from "./statCluster"
import ZoomControls from "./zoomControls"

const MIN_ZOOM = 0.5
const MAX_ZOOM_DESKTOP = 1.5
const ZOOM_STEP = 0.1

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
  const [zoom, setZoom] = useState(1)
  const { compact, coarse } = useLayoutMode()
  const [showArcs, setShowArcs] = useState(true)
  const [compactTab, setCompactTab] = useState<
    "weapons" | "fighters" | "hullmods" | "info"
  >("weapons")
  const [slotAction, setSlotAction] = useState<weaponSlot | null>(null)
  const [slotInfoWeapon, setSlotInfoWeapon] = useState<weapon | null>(null)
  const [slotInfoLoading, setSlotInfoLoading] = useState(false)
  const slotInfoReqRef = useRef(0)

  const closeSlotAction = useCallback(() => {
    slotInfoReqRef.current += 1
    setSlotInfoLoading(false)
    setSlotInfoWeapon(null)
    setSlotAction(null)
  }, [])
  const [selectedSlot, setSelectedSlot] = useState<weaponSlot | null>(null)
  const [lastSlottedId, setLastSlottedId] = useState<string | null>(null)
  const [lastSlottedWingId, setLastSlottedWingId] = useState<string | null>(
    null
  )
  const [hoveredWeapon, setHoveredWeapon] = useState<weapon | undefined>(
    undefined
  )
  const [hoveredWing, setHoveredWing] = useState<wingStats | null>(null)
  const [hoveredHullmod, setHoveredHullmod] = useState<hullMod | null>(null)
  const [showHullmods, setShowHullmods] = useState(false)
  const [showBuildIn, setShowBuildIn] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [allShipStats, setAllShipStats] = useState<shipStats[]>([])
  const maxZoom = MAX_ZOOM_DESKTOP

  const {
    allWeaponStats,
    allWingStats,
    opOf,
    wingOpOf,
    weaponsOp,
    fightersOp,
    convertedBayFightersOp,
    weaponFluxPerSecond,
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
  } = useLoadoutOp(activeTile)

  const allModIds = useMemo(
    () => [
      ...(activeTile.ship.meta.builtInMods ?? []),
      ...(activeTile.hullmods ?? []),
      ...(activeTile.smods ?? [])
    ],
    [activeTile.ship.meta.builtInMods, activeTile.hullmods, activeTile.smods]
  )
  const fluxMult = getFluxMult(allModIds)

  const handleBayShiftClick = useCallback(
    (bayIndex: number) => {
      if (activeTile.fighters?.[bayIndex]) return
      if (!lastSlottedWingId) return
      const wing = allWingStats.find((w) => w.id === lastSlottedWingId)
      if (!wing) return
      if (wouldExceedFighterOp(bayIndex, wing.id)) return
      const next = [...(activeTile.fighters ?? [])]
      next[bayIndex] = wing.id
      onFightersChange(next)
    },
    [
      activeTile.fighters,
      allWingStats,
      lastSlottedWingId,
      onFightersChange,
      wouldExceedFighterOp
    ]
  )

  const handleSlotShiftClick = useCallback(
    async (slot: weaponSlot) => {
      if (!lastSlottedId) return
      let w: weapon
      try {
        w = await getWeapon({ id: lastSlottedId })
      } catch {
        return
      }
      if (!canMountWeapon(slot, w)) return
      if (wouldExceedOp(slot.id, w.id)) return
      onWeaponsChange({ ...activeTile.weapons, [slot.id]: w.id })
    },
    [lastSlottedId, activeTile.weapons, onWeaponsChange, wouldExceedOp]
  )

  const handleBuildIn = useCallback(
    (id: string) => {
      const current = activeTile.hullmods ?? []
      const smods = activeTile.smods ?? []
      if (!current.includes(id)) return
      if (smods.includes(id)) return
      if (smods.length >= MAX_SMODS) return
      onHullmodsChange(current.filter((x) => x !== id))
      onSmodsChange([...smods, id])
      setShowBuildIn(false)
    },
    [activeTile.hullmods, activeTile.smods, onHullmodsChange, onSmodsChange]
  )

  const handleUnbuildSmod = useCallback(
    (id: string) => {
      const smods = activeTile.smods ?? []
      if (!smods.includes(id)) return
      // Un-building restores the OP cost — block when the loadout is full.
      if (wouldExceedSmodRemovalOp(id)) return
      onSmodsChange(smods.filter((x) => x !== id))
      onHullmodsChange([...(activeTile.hullmods ?? []), id])
    },
    [
      activeTile.smods,
      activeTile.hullmods,
      onSmodsChange,
      onHullmodsChange,
      wouldExceedSmodRemovalOp
    ]
  )

  useEffect(() => {
    setZoom((z) => Math.min(z, maxZoom))
  }, [maxZoom])

  // biome-ignore lint: activeTile is required to reset selectedSlot.
  useEffect(() => {
    setSelectedSlot(null)
    setSlotInfoWeapon(null)
    setSlotInfoLoading(false)
    setSlotAction(null)
    setHoveredWeapon(undefined)
    setHoveredWing(null)
    setHoveredHullmod(null)
  }, [activeTile])

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

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
      setZoom((z) => {
        const next = Math.round((z + delta) * 100) / 100
        return Math.min(maxZoom, Math.max(MIN_ZOOM, next))
      })
    },
    [maxZoom]
  )

  const handleSlotRightClick = (slot: weaponSlot) => {
    if (!activeTile.weapons?.[slot.id]) return
    const next = { ...activeTile.weapons }
    delete next[slot.id]
    onWeaponsChange(next)
  }

  const tabsRef = useRef<HTMLDivElement>(null)
  // Compact layout: the ? button jumps to the Info tab instead of a popover.
  const scrollToInfoTab = useCallback(() => {
    setCompactTab("info")
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    tabsRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    })
  }, [])

  const openSlot = (slot: weaponSlot) => {
    setHoveredWeapon(undefined)
    setSlotInfoWeapon(null)
    setSlotInfoLoading(false)
    if (coarse && activeTile.weapons?.[slot.id]) setSlotAction(slot)
    else setSelectedSlot(slot)
  }

  const openSlotInfo = (slot: weaponSlot) => {
    const wid = activeTile.weapons?.[slot.id]
    if (!wid) return
    const req = ++slotInfoReqRef.current
    setSlotInfoWeapon(null)
    setSlotInfoLoading(true)
    void getWeapon({ id: wid })
      .then((w) => {
        if (slotInfoReqRef.current === req) setSlotInfoWeapon(w)
      })
      .catch(() => {
        if (slotInfoReqRef.current === req) setSlotInfoWeapon(null)
      })
      .finally(() => {
        if (slotInfoReqRef.current === req) setSlotInfoLoading(false)
      })
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
  const statClusterProps = {
    spentOp,
    showInfo,
    onInfoToggle: () => setShowInfo((v) => !v),
    availableOp,
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
        capacitors: activeTile.capacitors
      }).total * fluxMult
    ),
    fluxCapacityBase: getModifiedStat(activeTile.ship.stats, "max flux").base,
    fluxDissipation: Math.round(
      getModifiedStat(moddedShip.stats, "flux dissipation", {
        vents: activeTile.vents * getVentMult(allModIds)
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
    weaponFluxPerSecond,
    onCapacitorsIncrement,
    onCapacitorsDecrement,
    onVentsIncrement,
    onVentsDecrement
  }
  const hullmodIds = [
    ...(activeTile.ship.meta.builtInMods ?? []),
    ...(activeTile.hullmods ?? []),
    ...(activeTile.smods ?? [])
  ]
  const fighterBayProps = (bayIndex: number) => ({
    remainingOpForBay:
      availableOp -
      (activeTile.capacitors + activeTile.vents + weaponsOp + fightersOp) +
      wingOpOf(activeTile.fighters?.[bayIndex]),
    onSelect: (wing: wingStats) => {
      const next = [...(activeTile.fighters ?? [])]
      if (next[bayIndex] === wing.id) {
        next[bayIndex] = ""
        onFightersChange(next.filter(Boolean).length ? next : [])
        return
      }
      if (wouldExceedFighterOp(bayIndex, wing.id)) return
      next[bayIndex] = wing.id
      setLastSlottedWingId(wing.id)
      onFightersChange(next)
    },
    onRemove: () => {
      const next = [...(activeTile.fighters ?? [])]
      next[bayIndex] = ""
      onFightersChange(next.filter(Boolean).length ? next : [])
    }
  })

  if (compact) {
    const tabs = [
      { id: "weapons", label: `Weapons (${visibleSlots.length})` },
      { id: "fighters", label: `Fighters (${bayCount})` },
      {
        id: "hullmods",
        label: `Hullmods (${assignedHullmods.length + smoddedHullmods.length})`
      },
      { id: "info", label: "Info" }
    ] as const
    return (
      <div className="flex flex-col gap-2 p-2 pb-8 lg:hidden">
        <div className="flex flex-col gap-2 rounded  items-end p-2">
          <CombatReadinessBar
            cr={Math.max(0, activeTile.cr - getCrPenalty(allModIds))}
            maxCr={getMaxCr(allModIds)}
          />
          <StatCluster {...statClusterProps} onInfoToggle={scrollToInfoTab} />
        </div>
        <div className="flex flex-col gap-2 rounded  p-2">
          <ShipName
            hullName={activeTile.ship.meta.hullName}
            customName={activeTile.customName}
            onCustomNameChange={onCustomNameChange}
          />
          <div
            className="flex h-[34vh] min-h-56 items-center justify-center overflow-hidden rounded touch-manipulation"
            onWheel={handleWheel}
          >
            <ShipDisplay
              ship={activeTile.ship.meta}
              zoom={zoom}
              showArcs={showArcs}
              onSlotClick={openSlot}
              onSlotShiftClick={handleSlotShiftClick}
              onSlotHover={(_slot, weapon) => setHoveredWeapon(weapon)}
              onSlotRightClick={handleSlotRightClick}
              mountedWeaponIds={activeTile.weapons ?? {}}
            />
          </div>
          {hoveredWeapon && !selectedSlot && !slotAction && (
            <div className="max-h-72 overflow-auto">
              <WeaponTooltip
                weapon={hoveredWeapon}
                allWeaponStats={allWeaponStats}
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <ZoomControls
              maxZoom={maxZoom}
              MIN_ZOOM={MIN_ZOOM}
              ZOOM_STEP={ZOOM_STEP}
              setZoom={setZoom}
              zoom={zoom}
              showArcs={showArcs}
              onToggleArcs={() => setShowArcs((v) => !v)}
            />
            <CommonButton text="Strip" onClick={onStrip} className="py-1" />
          </div>
          <p className="ss-coarse-pointer-only text-xs font-normal text-blue-200/70">
            Tap a slot below to fit a weapon.
          </p>
        </div>
        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Ship sections"
          className="ss-chip-rail sticky top-0 z-20 bg-gray-950/90 py-1 scroll-mt-2"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={compactTab === t.id}
              type="button"
              onClick={() => setCompactTab(t.id)}
              className={`shrink-0 rounded border px-3 py-2 text-sm touch-manipulation ${compactTab === t.id ? "border-cyan-300 bg-cyan-900 text-cyan-50" : "border-cyan-900 bg-gray-950 text-cyan-200"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {compactTab === "weapons" && (
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
                  onClick={() => openSlot(slot)}
                  className="flex min-h-14 items-center justify-between gap-2 rounded border border-cyan-900 bg-gray-950/70 px-3 py-2 text-left touch-manipulation"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-cyan-100">
                      {slot.id}
                    </span>
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
        {compactTab === "fighters" && (
          <div role="tabpanel" className="flex flex-wrap gap-2 mt-2">
            {(moddedShip.meta.builtInWings ?? []).map((wingId) => (
              <FighterBay
                key={`${activeTile.id}-builtin-${wingId}`}
                wingId={wingId}
                locked
                onHover={setHoveredWing}
              />
            ))}
            {bayCount === 0 &&
              (moddedShip.meta.builtInWings ?? []).length === 0 && (
                <p className="text-sm text-cyan-200/70">No fighter bays.</p>
              )}
            {Array.from({ length: bayCount }, (_, bayIndex) => (
              <FighterBay
                key={`${activeTile.id}-bay-${bayIndex}`}
                wingId={activeTile.fighters?.[bayIndex] ?? ""}
                {...fighterBayProps(bayIndex)}
                onShiftClick={() => handleBayShiftClick(bayIndex)}
                onHover={setHoveredWing}
              />
            ))}
            {hoveredWing && (
              <div className="max-h-72 w-full overflow-auto">
                <FighterTooltip
                  wing={hoveredWing}
                  allShipStats={allShipStats}
                />
              </div>
            )}
          </div>
        )}
        {compactTab === "hullmods" && (
          <div
            role="tabpanel"
            className="rounded border border-cyan-900/60 bg-gray-950/70 p-2 flex justify-end gap-2"
          >
            {hoveredHullmod && (
              <div className="mb-2 max-h-72 overflow-auto flex-1">
                <HullmodTooltip hullmod={hoveredHullmod} />
              </div>
            )}
            <HullmodRoster
              assignedHullmods={assignedHullmods}
              builtInHullmods={builtInHullmods}
              smoddedHullmods={smoddedHullmods}
              onHoverHullmod={setHoveredHullmod}
              onRemoveHullmod={(id) =>
                onHullmodsChange(
                  (activeTile.hullmods ?? []).filter((x) => x !== id)
                )
              }
              onRemoveSmod={handleUnbuildSmod}
              onAdd={() => setShowHullmods(true)}
              onBuildIn={() => setShowBuildIn(true)}
            />
          </div>
        )}
        {compactTab === "info" && (
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
        {slotAction && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Slot ${slotAction.id}`}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          >
            <button
              type="button"
              aria-label="Close slot actions"
              onClick={closeSlotAction}
              className="absolute inset-0 bg-gray-950/60"
            />
            <div className="relative z-10 w-full max-h-[92dvh] overflow-auto rounded-t-2xl border border-cyan-200 bg-gray-950 p-3 sm:w-96 sm:rounded-none">
              <h2 className="text-sm text-cyan-200">
                {slotAction.id} • {slotAction.type} {slotAction.size}
              </h2>
              <p className="mb-2 text-xs text-cyan-200/70">
                Mounted: {activeTile.weapons?.[slotAction.id] ?? "Empty"}
              </p>
              {slotInfoWeapon || slotInfoLoading ? (
                <div className="flex flex-col gap-2">
                  {slotInfoLoading && !slotInfoWeapon ? (
                    <p className="text-cyan-200/60 text-sm text-center py-8 animate-pulse">
                      Loading weapon info…
                    </p>
                  ) : (
                    slotInfoWeapon && (
                      <div className="max-h-[60dvh] overflow-auto">
                        <WeaponTooltip
                          weapon={slotInfoWeapon}
                          allWeaponStats={allWeaponStats}
                        />
                      </div>
                    )
                  )}
                  <CommonButton
                    text="Back"
                    clipPath={false}
                    onClick={() => {
                      slotInfoReqRef.current += 1
                      setSlotInfoLoading(false)
                      setSlotInfoWeapon(null)
                    }}
                    className="py-2"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <CommonButton
                    text="Fit / Replace weapon"
                    onClick={() => {
                      setSelectedSlot(slotAction)
                      closeSlotAction()
                    }}
                    className="py-2"
                  />
                  {activeTile.weapons?.[slotAction.id] && (
                    <>
                      <CommonButton
                        text="Info"
                        onClick={() => openSlotInfo(slotAction)}
                        className="py-2"
                      />
                      <CommonButton
                        text="Remove weapon"
                        onClick={() => {
                          handleSlotRightClick(slotAction)
                          closeSlotAction()
                        }}
                        className="py-2"
                      />
                    </>
                  )}
                  <CommonButton
                    text="Close"
                    clipPath={false}
                    onClick={closeSlotAction}
                    className="py-2"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {selectedSlot && (
          <WeaponSelectionModal
            slot={selectedSlot}
            onClose={() => setSelectedSlot(null)}
            onSelect={(w) => {
              if (wouldExceedOp(selectedSlot.id, w.id)) return
              onWeaponsChange({
                ...activeTile.weapons,
                [selectedSlot.id]: w.id
              })
              setLastSlottedId(w.id)
            }}
            remainingOpForSlot={
              availableOp -
              (activeTile.capacitors +
                activeTile.vents +
                weaponsOp +
                fightersOp) +
              opOf(activeTile.weapons?.[selectedSlot.id])
            }
            mountedWeaponIds={activeTile.weapons ?? {}}
            installedHullmodIds={hullmodIds}
            onRemoveWeapon={(w) => {
              if (activeTile.weapons?.[selectedSlot.id] !== w.id) return
              const next = { ...activeTile.weapons }
              delete next[selectedSlot.id]
              onWeaponsChange(next)
            }}
          />
        )}
        {showHullmods && (
          <HullmodSelectionModal
            ship={activeTile.ship}
            hullSize={activeTile.ship.meta.hullSize}
            mountedHullmodIds={[
              ...(activeTile.hullmods ?? []),
              ...(activeTile.smods ?? [])
            ]}
            remainingOp={availableOp - spentOp}
            onClose={() => setShowHullmods(false)}
            onSelect={(h) => {
              const current = activeTile.hullmods ?? []
              const smods = activeTile.smods ?? []
              if (smods.includes(h.id)) return
              if (current.includes(h.id)) {
                onHullmodsChange(current.filter((id) => id !== h.id))
              } else {
                if (wouldExceedHullmodOp(h.id)) return
                onHullmodsChange([...current, h.id])
              }
            }}
          />
        )}
        {showBuildIn && (
          <BuildInModal
            assignedHullmods={assignedHullmods}
            smodCount={(activeTile.smods ?? []).length}
            onClose={() => setShowBuildIn(false)}
            onBuildIn={handleBuildIn}
          />
        )}
      </div>
    )
  }

  return (
    <>
      <div className="absolute top-1 left-1 right-1 z-20 flex flex-col gap-2 min-[1127px]:flex-row min-[1127px]:items-start min-[1127px]:justify-between pointer-events-none">
        <div className="pointer-events-auto max-[1127px]:w-fit max-[1127px]:self-end origin-top-left">
          <CombatReadinessBar
            cr={Math.max(0, activeTile.cr - getCrPenalty(allModIds))}
            maxCr={getMaxCr(allModIds)}
          />
        </div>
        <div className="pointer-events-auto flex flex-col lg:ml-auto max-[1127px]:self-end origin-top-right">
          <StatCluster
            spentOp={spentOp}
            showInfo={showInfo}
            onInfoToggle={() => setShowInfo((v) => !v)}
            availableOp={availableOp}
            topSpeed={moddedShip.stats["max speed"]}
            topSpeedBase={activeTile.ship.stats["max speed"]}
            armor={moddedShip.stats["armor rating"]}
            armorBase={activeTile.ship.stats["armor rating"]}
            hull={moddedShip.stats.hitpoints}
            hullBase={activeTile.ship.stats.hitpoints}
            capacitors={activeTile.capacitors}
            maxCapacitors={getMaxCapsVents(activeTile.ship.meta.hullSize)}
            vents={activeTile.vents}
            maxVents={getMaxCapsVents(activeTile.ship.meta.hullSize)}
            fluxCapacity={Math.round(
              getModifiedStat(moddedShip.stats, "max flux", {
                capacitors: activeTile.capacitors
              }).total * fluxMult
            )}
            fluxCapacityBase={
              getModifiedStat(activeTile.ship.stats, "max flux").base
            }
            fluxDissipation={Math.round(
              getModifiedStat(moddedShip.stats, "flux dissipation", {
                vents: activeTile.vents * getVentMult(allModIds)
              }).total * fluxMult
            )}
            fluxDissipationBase={
              getModifiedStat(activeTile.ship.stats, "flux dissipation").base
            }
            shieldEfficiency={moddedShip.stats["shield efficiency"]}
            shieldEfficiencyBase={activeTile.ship.stats["shield efficiency"]}
            shieldArc={moddedShip.stats["shield arc"]}
            shieldArcBase={activeTile.ship.stats["shield arc"]}
            shieldUpkeep={moddedShip.stats["shield upkeep"]}
            shieldUpkeepBase={activeTile.ship.stats["shield upkeep"]}
            phaseActivationCost={moddedShip.stats["phase cost"]}
            phaseActivationCostBase={activeTile.ship.stats["phase cost"]}
            phaseUpkeep={moddedShip.stats["phase upkeep"]}
            phaseUpkeepBase={activeTile.ship.stats["phase upkeep"]}
            weaponFluxPerSecond={weaponFluxPerSecond}
            onCapacitorsIncrement={onCapacitorsIncrement}
            onCapacitorsDecrement={onCapacitorsDecrement}
            onVentsIncrement={onVentsIncrement}
            onVentsDecrement={onVentsDecrement}
          />
          <div className="flex justify-end w-full">
            <HullmodRoster
              assignedHullmods={assignedHullmods}
              builtInHullmods={builtInHullmods}
              smoddedHullmods={smoddedHullmods}
              onHoverHullmod={setHoveredHullmod}
              onRemoveHullmod={(id) =>
                onHullmodsChange(
                  (activeTile.hullmods ?? []).filter((x) => x !== id)
                )
              }
              onRemoveSmod={handleUnbuildSmod}
              onAdd={() => setShowHullmods(true)}
              onBuildIn={() => setShowBuildIn(true)}
            />
          </div>
        </div>
      </div>
      {showInfo && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setShowInfo(false)}
            className="absolute inset-0 z-30 bg-transparent cursor-default"
          />
          <div className="absolute left-1 top-16 z-40 w-[calc(100%-0.5rem)] max-w-5xl overflow-x-auto">
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
        </>
      )}
      <div className="flex flex-col gap-1 absolute left-2 top-[25%] w-fit h-fit">
        {(moddedShip.meta.builtInWings ?? []).map((wingId) => (
          <FighterBay
            key={`${activeTile.id}-builtin-${wingId}`}
            wingId={wingId}
            locked
            onHover={setHoveredWing}
          />
        ))}
        {Array.from(
          {
            length: Math.max(
              0,
              (moddedShip.stats["fighter bays"] ?? 0) -
                (moddedShip.meta.builtInWings ?? []).length
            )
          },
          (_, i) => i
        ).map((bayIndex) => (
          <FighterBay
            key={`${activeTile.id}-bay-${bayIndex}`}
            wingId={activeTile.fighters?.[bayIndex] ?? ""}
            remainingOpForBay={
              availableOp -
              (activeTile.capacitors +
                activeTile.vents +
                weaponsOp +
                fightersOp) +
              wingOpOf(activeTile.fighters?.[bayIndex])
            }
            onSelect={(wing) => {
              const next = [...(activeTile.fighters ?? [])]
              if (next[bayIndex] === wing.id) {
                next[bayIndex] = ""
                onFightersChange(next.filter(Boolean).length ? next : [])
                return
              }
              if (wouldExceedFighterOp(bayIndex, wing.id)) return
              next[bayIndex] = wing.id
              setLastSlottedWingId(wing.id)
              onFightersChange(next)
            }}
            onShiftClick={() => handleBayShiftClick(bayIndex)}
            onRemove={() => {
              const next = [...(activeTile.fighters ?? [])]
              next[bayIndex] = ""
              onFightersChange(next.filter(Boolean).length ? next : [])
            }}
            onHover={setHoveredWing}
          />
        ))}
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 max-sm:left-1/2 max-sm:top-[70%] sm:max-xl:left-[38%] sm:max-xl:top-[62%] top-[50%] -translate-y-1/2 z-[25] flex items-center justify-center pointer-events-auto w-[72vw] h-[28vh] sm:w-[420px] sm:h-[280px] md:w-[520px] md:h-[340px] lg:w-130 lg:h-90 max-w-[90vw] max-h-[42vh] sm:max-h-[52vh] touch-manipulation"
        onWheel={handleWheel}
        onTouchStart={(e) => {
          if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX
            const dy = e.touches[0].clientY - e.touches[1].clientY
            ;(e.currentTarget as HTMLDivElement).dataset.pinchDist = String(
              Math.hypot(dx, dy)
            )
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 2) {
            e.preventDefault()
            const dx = e.touches[0].clientX - e.touches[1].clientX
            const dy = e.touches[0].clientY - e.touches[1].clientY
            const cur = Math.hypot(dx, dy)
            const prev = Number(
              (e.currentTarget as HTMLDivElement).dataset.pinchDist || cur
            )
            const delta = (cur - prev) / 200
            if (Math.abs(delta) > 0.02) {
              setZoom((z) =>
                Math.min(
                  maxZoom,
                  Math.max(MIN_ZOOM, Math.round((z + delta) * 100) / 100)
                )
              )
              ;(e.currentTarget as HTMLDivElement).dataset.pinchDist =
                String(cur)
            }
          }
        }}
        title="Scroll to zoom"
      >
        <ShipDisplay
          ship={activeTile.ship.meta}
          zoom={zoom}
          showArcs={showArcs}
          onSlotClick={(slot) => {
            setHoveredWeapon(undefined)
            setSelectedSlot(slot)
          }}
          onSlotShiftClick={handleSlotShiftClick}
          onSlotHover={(_slot, weapon) => setHoveredWeapon(weapon)}
          onSlotRightClick={handleSlotRightClick}
          mountedWeaponIds={activeTile.weapons ?? {}}
        />
      </div>
      {(hoveredWeapon || hoveredWing || hoveredHullmod) && !selectedSlot && (
        <div className="absolute left-1 top-16 z-30 w-[35%] lg:w-[50%] xl:w-[45%] h-fit overflow-auto pointer-events-none">
          {hoveredWeapon ? (
            <WeaponTooltip
              weapon={hoveredWeapon}
              allWeaponStats={allWeaponStats}
            />
          ) : hoveredWing ? (
            <FighterTooltip wing={hoveredWing} allShipStats={allShipStats} />
          ) : (
            hoveredHullmod && <HullmodTooltip hullmod={hoveredHullmod} />
          )}
        </div>
      )}
      {selectedSlot && (
        <WeaponSelectionModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSelect={(w) => {
            if (wouldExceedOp(selectedSlot.id, w.id)) return
            onWeaponsChange({ ...activeTile.weapons, [selectedSlot.id]: w.id })
            setLastSlottedId(w.id)
          }}
          remainingOpForSlot={
            availableOp -
            (activeTile.capacitors +
              activeTile.vents +
              weaponsOp +
              fightersOp) +
            opOf(activeTile.weapons?.[selectedSlot.id])
          }
          mountedWeaponIds={activeTile.weapons ?? {}}
          installedHullmodIds={[
            ...(activeTile.ship.meta.builtInMods ?? []),
            ...(activeTile.hullmods ?? []),
            ...(activeTile.smods ?? [])
          ]}
          onRemoveWeapon={(w) => {
            // Unmount only from the currently open slot.
            if (activeTile.weapons?.[selectedSlot.id] !== w.id) return
            const next = { ...activeTile.weapons }
            delete next[selectedSlot.id]
            onWeaponsChange(next)
          }}
        />
      )}
      {showHullmods && (
        <HullmodSelectionModal
          ship={activeTile.ship}
          hullSize={activeTile.ship.meta.hullSize}
          mountedHullmodIds={[
            ...(activeTile.hullmods ?? []),
            ...(activeTile.smods ?? [])
          ]}
          remainingOp={availableOp - spentOp}
          onClose={() => setShowHullmods(false)}
          onSelect={(h) => {
            const current = activeTile.hullmods ?? []
            const smods = activeTile.smods ?? []
            // S-mods are managed via the Build in modal — don't toggle them here.
            if (smods.includes(h.id)) return
            if (current.includes(h.id)) {
              onHullmodsChange(current.filter((id) => id !== h.id))
            } else {
              if (wouldExceedHullmodOp(h.id)) return
              onHullmodsChange([...current, h.id])
            }
          }}
        />
      )}
      {showBuildIn && (
        <BuildInModal
          assignedHullmods={assignedHullmods}
          smodCount={(activeTile.smods ?? []).length}
          onClose={() => setShowBuildIn(false)}
          onBuildIn={handleBuildIn}
        />
      )}

      <div className="z-10 absolute left-1 bottom-1 gap-2 flex flex-col origin-bottom-left">
        <ShipName
          hullName={activeTile.ship.meta.hullName}
          customName={activeTile.customName}
          onCustomNameChange={onCustomNameChange}
        />
        <div className="flex gap-2">
          <ZoomControls
            maxZoom={maxZoom}
            MIN_ZOOM={MIN_ZOOM}
            ZOOM_STEP={ZOOM_STEP}
            setZoom={setZoom}
            zoom={zoom}
            showArcs={showArcs}
            onToggleArcs={() => setShowArcs((v) => !v)}
          />
          <CommonButton text="Strip" onClick={onStrip} />
        </div>
      </div>
    </>
  )
}
