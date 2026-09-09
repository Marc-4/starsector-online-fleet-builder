import { useCallback, useEffect, useState } from "react"
import { getMaxCapsVents } from "#/lib/fluxLimits"
import type { fleetEntry } from "#/types"
import CombatReadinessBar from "./combatReadinessBar"
import ShipDisplay from "./shipDisplay"
import ShipName from "./shipName"
import StatCluster from "./statCluster"
import ZoomControls from "./zoomControls"
import FighterBay from "./fighterBay"
import WeaponSelectionModal from "../weaponSelectionModal"
import type { weaponSlot } from "#/types"

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
}

export default function ActiveShipPanel({
  activeTile,
  onCrChange,
  onCapacitorsIncrement,
  onCapacitorsDecrement,
  onVentsIncrement,
  onVentsDecrement,
  onCustomNameChange
}: Props) {
  const [zoom, setZoom] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<weaponSlot | null>(null)
  const maxZoom = isMobile ? MAX_ZOOM_MOBILE : MAX_ZOOM_DESKTOP

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
        <ShipDisplay ship={activeTile.ship.meta} zoom={zoom} onSlotClick={setSelectedSlot} />
      </div>
      {selectedSlot && (
        <WeaponSelectionModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
      )}

      <div className="z-10 absolute left-1 bottom-1 gap-2 flex flex-col max-md:bottom-0.5 max-md:left-0.5 max-md:scale-[0.90] max-sm:scale-[0.80] origin-bottom-left">
        <ShipName
          hullName={activeTile.ship.meta.hullName}
          customName={activeTile.customName}
          onCustomNameChange={onCustomNameChange}
        />
        <ZoomControls
          maxZoom={maxZoom}
          MIN_ZOOM={MIN_ZOOM}
          ZOOM_STEP={ZOOM_STEP}
          setZoom={setZoom}
          zoom={zoom}
        />
      </div>
    </>
  )
}
