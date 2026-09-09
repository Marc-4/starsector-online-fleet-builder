import { useCallback, useEffect, useState } from "react"
import { getMaxCapsVents } from "#/lib/fluxLimits"
import type { fleetEntry } from "#/types"
import CommonButton from "../commonBtn"
import CombatReadinessBar from "./combatReadinessBar"
import ShipName from "./shipName"
import StatCluster from "./statCluster"

const MIN_ZOOM = 0.25
const MAX_ZOOM_DESKTOP = 2
const MAX_ZOOM_MOBILE = 1
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
  const maxZoom = isMobile ? MAX_ZOOM_MOBILE : MAX_ZOOM_DESKTOP

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)")
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    setZoom((z) => Math.min(z, maxZoom))
  }, [maxZoom])

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(maxZoom, Math.round((z + ZOOM_STEP) * 100) / 100)),
    [maxZoom]
  )
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - ZOOM_STEP) * 100) / 100)),
    []
  )
  const resetZoom = useCallback(() => setZoom(1), [])
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
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[60%] lg:top-[50%] -translate-y-1/2 flex items-center justify-center pointer-events-auto w-[72vw] h-[28vh] sm:w-[420px] sm:h-[280px] md:w-[520px] md:h-[340px] lg:w-130 lg:h-90 max-w-[90vw] max-h-[42vh] sm:max-h-[52vh] touch-manipulation"
        onWheel={handleWheel}
        onTouchStart={(e) => {
          if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX
            const dy = e.touches[0].clientY - e.touches[1].clientY
            ;(e.currentTarget as HTMLDivElement).dataset.pinchDist = String(Math.hypot(dx, dy))
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 2) {
            e.preventDefault()
            const dx = e.touches[0].clientX - e.touches[1].clientX
            const dy = e.touches[0].clientY - e.touches[1].clientY
            const cur = Math.hypot(dx, dy)
            const prev = Number((e.currentTarget as HTMLDivElement).dataset.pinchDist || cur)
            const delta = (cur - prev) / 200
            if (Math.abs(delta) > 0.02) {
              setZoom((z) => Math.min(maxZoom, Math.max(MIN_ZOOM, Math.round((z + delta) * 100) / 100)))
              ;(e.currentTarget as HTMLDivElement).dataset.pinchDist = String(cur)
            }
          }
        }}
        title="Scroll to zoom"
      >
        <img
          src={`ships/${activeTile.ship.meta.spriteName}`}
          alt="ship sprite"
          className="w-full h-full object-contain select-none [image-rendering:pixelated]"
          style={{
            imageRendering: "pixelated",
            transform: `scale(${zoom})`,
            transformOrigin: "center center"
          }}
          draggable={false}
        />
      </div>

      <div className="z-10 absolute left-1 bottom-1 gap-2 flex flex-col max-md:bottom-0.5 max-md:left-0.5 max-md:scale-[0.90] max-sm:scale-[0.80] origin-bottom-left">
        <ShipName
          hullName={activeTile.ship.meta.hullName}
          customName={activeTile.customName}
          onCustomNameChange={onCustomNameChange}
        />
        <div className=" w-fit z-10 flex items-center gap-1 bg-black/40 border border-cyan-900 rounded-xs px-1 py-1 backdrop-blur-sm">
          <CommonButton
            text="−"
            cutAllCorners
            className="px-3 py-0.5 text-sm disabled:opacity-40"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            title="Zoom out (scroll down)"
          />
          <span className="text-cyan-100 text-xs font-mono w-12 text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <CommonButton
            text="+"
            cutAllCorners
            className="px-3 py-0.5 text-sm disabled:opacity-40"
            onClick={zoomIn}
            disabled={zoom >= maxZoom}
            aria-label="Zoom in"
            title="Zoom in (scroll up)"
          />
          <div className="w-px h-6 bg-cyan-900 mx-1" />
          <CommonButton
            text="⟲"
            cutAllCorners
            className="px-2 py-0.5 text-xs"
            onClick={resetZoom}
            disabled={zoom === 1}
            aria-label="Reset zoom"
            title="Reset zoom"
          />
        </div>
      </div>
    </>
  )
}
