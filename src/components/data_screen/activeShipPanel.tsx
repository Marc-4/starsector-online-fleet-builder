import { useCallback, useEffect, useState } from "react"
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
import CommonButton from "../commonBtn"
import FighterTooltip from "../fighterTooltip"
import HullmodTooltip from "../hullmodTooltip"
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
import { useLoadoutOp } from "./useLoadoutOp"
import ZoomControls from "./zoomControls"

const MIN_ZOOM = 1
const MAX_ZOOM_DESKTOP = 1.5
const MAX_ZOOM_MOBILE = 1.5
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
  onStrip
}: Props) {
  const [zoom, setZoom] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
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
  const [showInfo, setShowInfo] = useState(false)
  const [allShipStats, setAllShipStats] = useState<shipStats[]>([])
  const maxZoom = isMobile ? MAX_ZOOM_MOBILE : MAX_ZOOM_DESKTOP

  const {
    allWeaponStats,
    allWingStats,
    opOf,
    wingOpOf,
    weaponsOp,
    fightersOp,
    weaponFluxPerSecond,
    availableOp,
    spentOp,
    assignedHullmods,
    builtInHullmods,
    moddedShip,
    wouldExceedOp,
    wouldExceedFighterOp,
    wouldExceedHullmodOp
  } = useLoadoutOp(activeTile)

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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1200px)")
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    setZoom((z) => Math.min(z, maxZoom))
  }, [maxZoom])

  // biome-ignore lint: activeTile is required to reset selectedSlot.
  useEffect(() => {
    setSelectedSlot(null)
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

  return (
    <>
      <div className="absolute top-1 left-1 right-1 z-20 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between pointer-events-none">
        <div className="pointer-events-auto max-lg:w-fit max-lg:self-end origin-top-left">
          <CombatReadinessBar cr={activeTile.cr} />
        </div>
        <div className="pointer-events-auto flex flex-col lg:ml-auto max-lg:self-end origin-top-right">
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
            fluxCapacity={
              getModifiedStat(moddedShip.stats, "max flux", {
                capacitors: activeTile.capacitors
              }).total
            }
            fluxCapacityBase={
              getModifiedStat(activeTile.ship.stats, "max flux").base
            }
            fluxDissipation={
              getModifiedStat(moddedShip.stats, "flux dissipation", {
                vents: activeTile.vents
              }).total
            }
            fluxDissipationBase={
              getModifiedStat(activeTile.ship.stats, "flux dissipation").base
            }
            shieldEfficiency={moddedShip.stats["shield efficiency"]}
            shieldEfficiencyBase={activeTile.ship.stats["shield efficiency"]}
            weaponFluxPerSecond={weaponFluxPerSecond}
            onCapacitorsIncrement={onCapacitorsIncrement}
            onCapacitorsDecrement={onCapacitorsDecrement}
            onVentsIncrement={onVentsIncrement}
            onVentsDecrement={onVentsDecrement}
          />
          <HullmodRoster
            assignedHullmods={assignedHullmods}
            builtInHullmods={builtInHullmods}
            onHoverHullmod={setHoveredHullmod}
            onRemoveHullmod={(id) =>
              onHullmodsChange(
                (activeTile.hullmods ?? []).filter((x) => x !== id)
              )
            }
            onAdd={() => setShowHullmods(true)}
          />
        </div>
      </div>
      {showInfo && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setShowInfo(false)}
            className="absolute inset-0 z-30 bg-transparent cursor-default"
          />
          <div className="absolute left-1 top-16 z-40 max-w-[calc(100%-0.5rem)] overflow-x-auto">
            <ShipInfoCard
              ship={activeTile.ship}
              capacitors={activeTile.capacitors}
              vents={activeTile.vents}
            />
          </div>
        </>
      )}
      <div className="flex flex-col gap-1 absolute left-2 top-[25%] w-fit h-fit">
        {(activeTile.ship.meta.builtInWings ?? []).map((wingId) => (
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
              (activeTile.ship.stats["fighter bays"] ?? 0) -
                (activeTile.ship.meta.builtInWings ?? []).length
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
        className="absolute left-1/2 -translate-x-1/2 top-[60%] lg:top-[50%] -translate-y-1/2 flex items-center justify-center pointer-events-auto w-[72vw] h-[28vh] sm:w-[420px] sm:h-[280px] md:w-[520px] md:h-[340px] lg:w-130 lg:h-90 max-w-[90vw] max-h-[42vh] sm:max-h-[52vh] touch-manipulation"
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
          onSlotClick={(slot) => {
            setHoveredWeapon(undefined)
            setSelectedSlot(slot)
          }}
          onSlotShiftClick={handleSlotShiftClick}
          onSlotHover={(_slot, weapon) => setHoveredWeapon(weapon)}
          onSlotRightClick={(slot) => {
            if (!activeTile.weapons?.[slot.id]) return
            const next = { ...activeTile.weapons }
            delete next[slot.id]
            onWeaponsChange(next)
          }}
          mountedWeaponIds={activeTile.weapons ?? {}}
        />
      </div>
      {(hoveredWeapon || hoveredWing || hoveredHullmod) && !selectedSlot && (
        <div className="absolute left-1 top-16 z-30 w-96 max-w-[80vw] h-fit overflow-auto pointer-events-none">
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
          mountedHullmodIds={activeTile.hullmods ?? []}
          remainingOp={availableOp - spentOp}
          onClose={() => setShowHullmods(false)}
          onSelect={(h) => {
            const current = activeTile.hullmods ?? []
            if (current.includes(h.id)) {
              onHullmodsChange(current.filter((id) => id !== h.id))
            } else {
              if (wouldExceedHullmodOp(h.id)) return
              onHullmodsChange([...current, h.id])
            }
          }}
        />
      )}

      <div className="z-10 absolute left-1 bottom-1 gap-2 flex flex-col max-md:bottom-0.5 max-md:left-0.5 max-md:scale-[0.90] max-sm:scale-[0.80] origin-bottom-left">
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
          />
          <CommonButton text="Strip" onClick={onStrip} />
        </div>
      </div>
    </>
  )
}
