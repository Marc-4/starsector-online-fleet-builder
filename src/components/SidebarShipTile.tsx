import { useEffect, useMemo, useRef, useState } from "react"
import {
  getAllHullMods,
  getAllWeaponStats,
  getAllWingStats,
  getHullModCost
} from "#/lib/csvParser"
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

  const FILL_BY_HULL_SIZE: Record<string, number> = {
    CAPITAL_SHIP: 1,
    CRUISER: 1,
    DESTROYER: 0.6,
    FRIGATE: 0.5,
    FIGHTER: 0.1
  }
  const maxDim = Math.max(meta.width, meta.height, 1)
  const fill = FILL_BY_HULL_SIZE[meta.hullSize] ?? 0.5
  const targetMax = tileSize > 0 ? tileSize * fill : 0
  const zoom = targetMax > 0 ? targetMax / maxDim : 0.5

  const unspentOp = useMemo(() => {
    const available = entry.ship.stats["ordnance points"] ?? 0
    const weaponOpById = new Map(
      getAllWeaponStats().map((s) => [s.id, Number(s.OPs)])
    )
    const wingOpById = new Map(
      getAllWingStats().map((s) => [s.id, Number(s["op cost"])])
    )
    const hullModById = new Map(getAllHullMods().map((h) => [h.id, h]))
    const num = (n: unknown) => (Number.isFinite(Number(n)) ? Number(n) : 0)
    let spent = entry.capacitors + entry.vents
    for (const wid of Object.values(entry.weapons ?? {})) {
      spent += num(weaponOpById.get(wid))
    }
    for (const wingId of entry.fighters ?? []) {
      if (wingId) spent += num(wingOpById.get(wingId))
    }
    for (const id of entry.hullmods ?? []) {
      const mod = hullModById.get(id)
      if (mod) spent += getHullModCost(mod, meta.hullSize)
    }
    return available - spent
  }, [entry, meta.hullSize])

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
          showEmptySlots={false}
        />
      </div>
      <h1 className="absolute left-1 max-w-[80%] top-1 ss-cyan-title text-xs">
        {!entry.ship.meta.hullName
          ? "N/A"
          : `${entry.ship.meta.hullName}-class`}
      </h1>
      {unspentOp && (
        <p className="absolute left-1 bottom-1 text-amber-300 ss-soft-text-shadow text-lg">
          {unspentOp} Unspent OP
        </p>
      )}
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
