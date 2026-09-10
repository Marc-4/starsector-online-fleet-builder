import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { getAllShipStats, getAllWeaponStats } from "#/lib/csvParser"
import {
  decodeFleetEntries,
  encodeFleetToHash,
  hydrateFleet
} from "#/lib/fleetCodec"
import { getMaxCapsVents } from "#/lib/fluxLimits"
import { getAllShips } from "#/lib/shipParser"
import type { fleetEntry } from "#/types"
import AddShipButton from "./addShipBtn"
import ActiveShipPanel from "./data_screen/activeShipPanel"
import SidebarShipTile from "./SidebarShipTile"
import Spinner from "./spinner"

const GRID_SIZE = 25
const HULL_SIZE_ORDER: Record<string, number> = {
  CAPITAL_SHIP: 0,
  CRUISER: 1,
  DESTROYER: 2,
  FRIGATE: 3,
  FIGHTER: 4
}

export default function Screen({ children }: { children?: ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [grid, setGrid] = useState<{ rows: number; cols: number } | null>(null)
  const [bgImage, setBgImage] = useState("")
  const ready = bgImage && grid
  const [fleet, setFleet] = useState<fleetEntry[]>([])
  const [activeTile, setActiveTile] = useState<fleetEntry>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const totalFleetDP = useMemo(
    () =>
      fleet.reduce((sum, fe) => sum + (fe.ship.stats["supplies/mo"] ?? 0), 0),
    [fleet]
  )
  const sortedFleet = useMemo(
    () =>
      [...fleet].sort((a, b) => {
        const ao = HULL_SIZE_ORDER[a.ship.meta.hullSize] ?? 99
        const bo = HULL_SIZE_ORDER[b.ship.meta.hullSize] ?? 99
        if (ao !== bo) return ao - bo
        return a.ship.meta.hullName.localeCompare(b.ship.meta.hullName)
      }),
    [fleet]
  )

  const allWeaponStats = useMemo(() => getAllWeaponStats(), [])
  const opById = useMemo(
    () => new Map(allWeaponStats.map((s) => [s.id, Number(s.OPs)])),
    [allWeaponStats]
  )
  const weaponsOpOf = (weapons?: Record<string, string>) =>
    Object.values(weapons ?? {}).reduce((sum, wid) => {
      const op = opById.get(wid)
      return sum + (Number.isFinite(op) ? (op as number) : 0)
    }, 0)

  const syncHash = (next: fleetEntry[]) => {
    if (next.length === 0) {
      history.replaceState(null, "", window.location.pathname + window.location.search)
    } else {
      const hash = encodeFleetToHash(next)
      // use replaceState to avoid triggering hashchange which would re-hydrate
      // with new random ids and break activeTile identity (subsequent +/- would miss)
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}#fleet=${hash}`)
    }
  }

  const removeOne = (id: string) => {
    const next = fleet.filter((e) => e.id !== id)
    if (next.length === fleet.length) return
    if (activeTile?.id === id) setActiveTile(undefined)
    setFleet(next)
    syncHash(next)
  }

  useEffect(() => {
    let onHash: (() => void) | null = null
    let cancelled = false
    void (async () => {
      const [ships, stats] = await Promise.all([
        getAllShips(),
        getAllShipStats()
      ])
      if (cancelled) return
      const entries = decodeFleetEntries(window.location.hash)
      if (entries) setFleet(hydrateFleet(entries, ships, stats))
      onHash = () => {
        const next = decodeFleetEntries(window.location.hash)
        if (next) setFleet(hydrateFleet(next, ships, stats))
        else setFleet([])
      }
      window.addEventListener("hashchange", onHash)
    })()
    return () => {
      cancelled = true
      if (onHash) window.removeEventListener("hashchange", onHash)
    }
  }, [])
  useEffect(() => {
    setBgImage(`background${Math.floor(Math.random() * 9)}.webp`)
  }, [])

  //biome-ignore lint: we are NOT putting updateGrid in the dependency array.
  useEffect(() => {
    updateGrid()
    window.addEventListener("resize", updateGrid)
    return () => window.removeEventListener("resize", updateGrid)
  }, [])

  const onTileClick = (entry: fleetEntry) => {
    if (activeTile?.id === entry.id) setActiveTile(undefined)
    else setActiveTile(entry)
    if (window.matchMedia("(max-width: 640px)").matches) setDrawerOpen(false)
  }

  const updateEntry = (id: string, patch: Partial<Pick<fleetEntry, "capacitors" | "vents" | "cr" | "customName" | "weapons">>) => {
    setFleet((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
      syncHash(next)
      return next
    })
    setActiveTile((prev) => (prev?.id === id ? { ...prev, ...patch } : prev))
  }

  const onCapacitorsIncrement = (e?: React.MouseEvent) => {
    if (!activeTile) return
    const step = e?.shiftKey ? 5 : 1
    const id = activeTile.id
    const max = getMaxCapsVents(activeTile.ship.meta.hullSize)
    const availableOp = activeTile.ship.stats["ordnance points"]
    setFleet((prev) => {
      const idx = prev.findIndex((p) => p.id === id)
      if (idx === -1) return prev
      const cur = prev[idx].capacitors
      if (cur >= max) return prev
      const nxt = Math.min(max, cur + step)
      const weaponsOp = weaponsOpOf(prev[idx].weapons)
      const clamped = Math.min(
        nxt,
        availableOp - (prev[idx].vents ?? 0) - weaponsOp
      )
      if (clamped <= cur) return prev
      const next = [...prev]
      next[idx] = { ...next[idx], capacitors: clamped }
      syncHash(next)
      return next
    })
    setActiveTile((prev) => {
      if (!prev || prev.id !== id) return prev
      if (prev.capacitors >= max) return prev
      const nxt = Math.min(max, prev.capacitors + step)
      const clamped = Math.min(
        nxt,
        availableOp - prev.vents - weaponsOpOf(prev.weapons)
      )
      return clamped <= prev.capacitors ? prev : { ...prev, capacitors: clamped }
    })
  }
  const onCapacitorsDecrement = (e?: React.MouseEvent) => {
    if (!activeTile) return
    const step = e?.shiftKey ? 5 : 1
    const id = activeTile.id
    setFleet((prev) => {
      const idx = prev.findIndex((p) => p.id === id)
      if (idx === -1) return prev
      const cur = prev[idx].capacitors
      if (cur <= 0) return prev
      const nxt = Math.max(0, cur - step)
      if (nxt === cur) return prev
      const next = [...prev]
      next[idx] = { ...next[idx], capacitors: nxt }
      syncHash(next)
      return next
    })
    setActiveTile((prev) => {
      if (!prev || prev.id !== id) return prev
      if (prev.capacitors <= 0) return prev
      const nxt = Math.max(0, prev.capacitors - step)
      return nxt === prev.capacitors ? prev : { ...prev, capacitors: nxt }
    })
  }
  const onVentsIncrement = (e?: React.MouseEvent) => {
    if (!activeTile) return
    const step = e?.shiftKey ? 5 : 1
    const id = activeTile.id
    const max = getMaxCapsVents(activeTile.ship.meta.hullSize)
    const availableOp = activeTile.ship.stats["ordnance points"]
    setFleet((prev) => {
      const idx = prev.findIndex((p) => p.id === id)
      if (idx === -1) return prev
      const cur = prev[idx].vents
      if (cur >= max) return prev
      const nxt = Math.min(max, cur + step)
      const weaponsOp = weaponsOpOf(prev[idx].weapons)
      const clamped = Math.min(
        nxt,
        availableOp - (prev[idx].capacitors ?? 0) - weaponsOp
      )
      if (clamped <= cur) return prev
      const next = [...prev]
      next[idx] = { ...next[idx], vents: clamped }
      syncHash(next)
      return next
    })
    setActiveTile((prev) => {
      if (!prev || prev.id !== id) return prev
      if (prev.vents >= max) return prev
      const nxt = Math.min(max, prev.vents + step)
      const clamped = Math.min(
        nxt,
        availableOp - prev.capacitors - weaponsOpOf(prev.weapons)
      )
      return clamped <= prev.vents ? prev : { ...prev, vents: clamped }
    })
  }
  const onVentsDecrement = (e?: React.MouseEvent) => {
    if (!activeTile) return
    const step = e?.shiftKey ? 5 : 1
    const id = activeTile.id
    setFleet((prev) => {
      const idx = prev.findIndex((p) => p.id === id)
      if (idx === -1) return prev
      const cur = prev[idx].vents
      if (cur <= 0) return prev
      const nxt = Math.max(0, cur - step)
      if (nxt === cur) return prev
      const next = [...prev]
      next[idx] = { ...next[idx], vents: nxt }
      syncHash(next)
      return next
    })
    setActiveTile((prev) => {
      if (!prev || prev.id !== id) return prev
      if (prev.vents <= 0) return prev
      const nxt = Math.max(0, prev.vents - step)
      return nxt === prev.vents ? prev : { ...prev, vents: nxt }
    })
  }

  const onCrChange = (value: number) => {
    if (!activeTile) return
    updateEntry(activeTile.id, { cr: value })
  }

  const onCustomNameChange = (value: string) => {
    if (!activeTile) return
    updateEntry(activeTile.id, { customName: value })
  }

  const onWeaponsChange = (weapons: Record<string, string>) => {
    if (!activeTile) return
    updateEntry(activeTile.id, { weapons })
  }
  const onStrip = () => {
    if (!activeTile) return
    updateEntry(activeTile.id, { weapons: {}, capacitors: 0, vents: 0 })
  }
  const updateGrid = () => {
    if (!gridRef.current) return
    const { height, width } = gridRef.current.getBoundingClientRect()
    const rows = Math.floor(height / GRID_SIZE)
    const cols = Math.floor(width / GRID_SIZE)
    setGrid({ rows, cols })
  }
  const renderGrid = () => {
    const gridItems = []
    if (grid !== null) {
      for (let i = 0; i <= grid.cols; i++) {
        gridItems.push(
          <div
            key={`v-${i}`}
            className="absolute top-0 h-full w-0.5 opacity-10 bg-blue-300"
            style={{ left: `${i * GRID_SIZE}px` }}
          ></div>
        )
      }
      for (let i = 0; i <= grid.rows; i++) {
        gridItems.push(
          <div
            key={`h-${i}`}
            className="absolute left-0 h-0.5 w-full opacity-10 bg-blue-300"
            style={{ top: `${i * GRID_SIZE}px` }}
          ></div>
        )
      }
    }

    return gridItems
  }

  return (
    <div className="relative flex gap-0 flex-row">
      {!ready && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-gray-950">
          <Spinner />
        </div>
      )}
      {drawerOpen && (
        <button
          type="button"
          aria-label="Close fleet drawer"
          onClick={() => setDrawerOpen(false)}
          className="hidden max-sm:block fixed inset-0 z-30 bg-black/50"
        />
      )}
      <button
        type="button"
        aria-label={drawerOpen ? "Close fleet drawer" : "Open fleet drawer"}
        aria-expanded={drawerOpen}
        onClick={() => setDrawerOpen((v) => !v)}
        className="hidden max-sm:flex fixed top-2 left-2 z-50 h-9 w-9 items-center justify-center rounded-xs bg-gray-900 border border-cyan-900 text-cyan-100 shadow-lg"
      >
        <span className="text-lg leading-none">{drawerOpen ? "✕" : "☰"}</span>
      </button>
      <div
        className={`flex flex-col bg-gray-950 h-screen overflow-y-scroll
          w-[15%] max-2xl:w-[17%] max-xl:w-[19%] max-lg:w-[21%] max-md:w-[23%]
          max-sm:fixed max-sm:inset-y-0 max-sm:left-0 max-sm:z-40 max-sm:w-[78%] max-sm:max-w-[320px] max-sm:shadow-2xl max-sm:transition-transform max-sm:duration-200 max-sm:ease-out
          ${drawerOpen ? "max-sm:translate-x-0" : "max-sm:-translate-x-full"}`}
      >
        <div className="sticky top-0 z-100 bg-gray-950 text-amber-300 flex items-center justify-center gap-4 max-md:gap-2 max-sm:pl-10">
          {(() => {
            const totalShips = fleet.length
            return (
              <>
                <p>{`${totalShips === 1 ? `${totalShips} ship` : `${totalShips} ships`}`}</p>
                <div className="w-px h-4 bg-amber-300" />
                <p>{`${totalFleetDP} DP`}</p>
              </>
            )
          })()}
        </div>
        {sortedFleet.map((entry) => (
          <SidebarShipTile
            onClick={onTileClick}
            active={activeTile?.id === entry.id}
            entry={entry}
            key={entry.id}
            removeOne={removeOne}
          />
        ))}
        <AddShipButton />
      </div>
      <div
        ref={gridRef}
        id="grid"
        className="relative text-blue-200 bg-black font-semibold text-lg flex-1 h-screen bg-cover"
        style={ready ? { backgroundImage: `url(/bgs/${bgImage})` } : undefined}
      >
        <div
          id="screen"
          className="absolute inset-0 z-0 opacity-20 bg-[#49dbff]"
        ></div>
        {renderGrid()}
        <div className="relative z-10 w-full h-full">
          {activeTile && (
            <ActiveShipPanel
              activeTile={activeTile}
              onCrChange={onCrChange}
              onCapacitorsIncrement={onCapacitorsIncrement}
              onCapacitorsDecrement={onCapacitorsDecrement}
              onVentsIncrement={onVentsIncrement}
              onVentsDecrement={onVentsDecrement}
              onCustomNameChange={onCustomNameChange}
              onWeaponsChange={onWeaponsChange}
              onStrip={onStrip}
            />
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
