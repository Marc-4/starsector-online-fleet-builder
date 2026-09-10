import { useCallback, useEffect, useMemo, useState } from "react"
import { getAllWeaponStats, getWeaponFluxPerSecond } from "#/lib/csvParser"
import { getMaxCapsVents } from "#/lib/fluxLimits"
import { canMountWeapon } from "#/lib/weaponCompat"
import { getWeapon } from "#/lib/weaponParser"
import type { fleetEntry, weapon, weaponSlot } from "#/types"
import WeaponSelectionModal from "../modals/weaponSelectionModal"
import CombatReadinessBar from "./combatReadinessBar"
import FighterBay from "./fighterBay"
import ShipDisplay from "./shipDisplay"
import ShipName from "./shipName"
import StatCluster from "./statCluster"
import ZoomControls from "./zoomControls"
import CommonButton from "../commonBtn"

const MIN_ZOOM = 1
const MAX_ZOOM_DESKTOP = 2
const MAX_ZOOM_MOBILE = 1.5
const ZOOM_STEP = 0.25

type Props = {
  activeTile: fleetEntry
  onCrChange: (value: number) => void
  onCapacitorsIncrement: (e?: React.MouseEvent) => void
  onCapacitorsDecrement: (e?: React.MouseEvent) => void
  onVentsIncrement: (e?: React.MouseEvent) => void
  onVentsDecrement: (e?: React.MouseEvent) => void
  onCustomNameChange: (value: string) => void
  onWeaponsChange: (weapons: Record<string, string>) => void
  onStrip: () => void
}

export default function ActiveShipPanel({
  activeTile,
  onCrChange,
  onCapacitorsIncrement,
  onCapacitorsDecrement,
  onVentsIncrement,
  onVentsDecrement,
  onCustomNameChange,
  onWeaponsChange,
  onStrip
}: Props) {
  const [zoom, setZoom] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<weaponSlot | null>(null)
  const [lastSlottedId, setLastSlottedId] = useState<string | null>(null)
  const maxZoom = isMobile ? MAX_ZOOM_MOBILE : MAX_ZOOM_DESKTOP

  const allWeaponStats = useMemo(() => getAllWeaponStats(), [])
  const opById = useMemo(
    () => new Map(allWeaponStats.map((s) => [s.id, Number(s.OPs)])),
    [allWeaponStats]
  )
  const opOf = useCallback(
    (wid: string | undefined) => {
      if (!wid) return 0
      const op = opById.get(wid)
      return Number.isFinite(op) ? (op as number) : 0
    },
    [opById]
  )
  const weaponsOp = useMemo(() => {
    return Object.values(activeTile.weapons ?? {}).reduce(
      (sum, wid) => sum + opOf(wid),
      0
    )
  }, [activeTile.weapons, opOf])
  const fluxById = useMemo(
    () =>
      new Map(
        allWeaponStats.map((s) => [s.id, Math.round(getWeaponFluxPerSecond(s))])
      ),
    [allWeaponStats]
  )
  const fluxOf = useCallback(
    (wid: string | undefined) => {
      if (!wid) return 0
      const f = fluxById.get(wid)
      return Number.isFinite(f) ? (f as number) : 0
    },
    [fluxById]
  )
  const weaponFluxPerSecond = useMemo(() => {
    return Object.values(activeTile.weapons ?? {}).reduce(
      (sum, wid) => sum + fluxOf(wid),
      0
    )
  }, [activeTile.weapons, fluxOf])
  const availableOp = activeTile.ship.stats["ordnance points"] ?? 0
  const spentOp = activeTile.capacitors + activeTile.vents + weaponsOp

  const wouldExceedOp = useCallback(
    (slotId: string, weaponId: string) => {
      const currentOp = opOf(activeTile.weapons?.[slotId])
      const nextOp = opOf(weaponId)
      return (
        activeTile.capacitors +
          activeTile.vents +
          weaponsOp -
          currentOp +
          nextOp >
        availableOp
      )
    },
    [
      activeTile.capacitors,
      activeTile.vents,
      activeTile.weapons,
      availableOp,
      opOf,
      weaponsOp
    ]
  )

  // Shift-click a slot: mount the last-slotted weapon if it fits, else nothing.
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
  }, [activeTile])

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
          <CombatReadinessBar cr={activeTile.cr} onChange={onCrChange} />
        </div>
        <div className="pointer-events-auto lg:ml-auto max-lg:self-end origin-top-right">
          <StatCluster
            spentOp={spentOp}
            availableOp={availableOp}
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
            weaponFluxPerSecond={weaponFluxPerSecond}
            onCapacitorsIncrement={onCapacitorsIncrement}
            onCapacitorsDecrement={onCapacitorsDecrement}
            onVentsIncrement={onVentsIncrement}
            onVentsDecrement={onVentsDecrement}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1 absolute left-2 top-[25%] w-fit h-fit">
        {Array.from(
          { length: activeTile.ship.stats["fighter bays"] },
          (_, i) => i + 1
        ).map((fb) => (
          <FighterBay key={fb} />
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
          onSlotClick={setSelectedSlot}
          onSlotShiftClick={handleSlotShiftClick}
          onSlotRightClick={(slot) => {
            if (!activeTile.weapons?.[slot.id]) return
            const next = { ...activeTile.weapons }
            delete next[slot.id]
            onWeaponsChange(next)
          }}
          mountedWeaponIds={activeTile.weapons ?? {}}
        />
      </div>
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
            (activeTile.capacitors + activeTile.vents + weaponsOp) +
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
