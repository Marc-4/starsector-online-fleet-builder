import { useEffect, useRef, useState } from "react"
import type { fleetEntry } from "#/types"
import ShipDisplay from "./data_screen/shipDisplay"
import CommonButton from "./commonBtn"

export default function SidebarShipTile({
  entry,
  removeOne,
  active = false,
  onClick
}: {
  entry: fleetEntry
  active: boolean
  removeOne: (hullid: string) => void
  onClick: (entry: fleetEntry) => void
}) {
  // Measure the tile so ships scale with it.
  const meta = entry.ship.meta
  const tileRef = useRef<HTMLDivElement>(null)
  const [tileSize, setTileSize] = useState(0)
  useEffect(() => {
    const el = tileRef.current
    if (!el) return
    const measure = () => setTileSize(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  // Fixed fill fraction per hull size: capitals fill the tile, smaller
  // hulls stay proportionally smaller. Tune per class here.
  const FILL_BY_HULL_SIZE: Record<string, number> = {
    CAPITAL_SHIP: 1,
    CRUISER: 1,
    DESTROYER: 0.60,
    FRIGATE: 0.5,
    FIGHTER: 0.1
  }
  const maxDim = Math.max(meta.width, meta.height, 1)
  const fill = FILL_BY_HULL_SIZE[meta.hullSize] ?? 0.5
  const targetMax = tileSize > 0 ? tileSize * fill : 0
  const zoom = targetMax > 0 ? targetMax / maxDim : 0.5

  return (
    // biome-ignore lint: dont care.
    <div
      role="button"
      ref={tileRef}
      onClick={() => onClick(entry)}
      className={`group ss-ship-card w-full aspect-square ${active ? "bg-cyan-300/30" : "hover:bg-cyan-200/20"}`}
    >
      <div className="absolute inset-0 flex brightness-80 items-center justify-center overflow-hidden group-hover:brightness-100 pointer-events-none">
        <ShipDisplay
          ship={meta}
          zoom={zoom}
          mountedWeaponIds={entry.weapons ?? {}}
          showArcs={false}
        />
      </div>
      <h1 className="absolute left-1 max-w-[50%] top-1 ss-cyan-title text-xs">
        {!entry.ship.meta.hullName
          ? "N/A"
          : `${entry.ship.meta.hullName}-class`}
      </h1>
      <CommonButton
        text="−"
        clipPath={false}
        className="absolute top-1 right-1 px-2 py-1 leading-none"
        onClick={(e) => {
          e.stopPropagation()
          removeOne(entry.id)
        }}
      />
    </div>
  )
}
