import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import {
  getAllHullMods,
  getAllShipStats,
  getAllWeaponStats,
  getAllWingStats,
  getHullModCost
} from "#/lib/csvParser"
import {
  decodeFleetEntries,
  encodeFleetToHash,
  hydrateFleet
} from "#/lib/fleetCodec"
import { getMaxCapsVents } from "#/lib/fluxLimits"
import { getDeploymentCostDelta, getEffectiveWeaponOp } from "#/hullModData"
import { getAllShips } from "#/lib/shipParser"
import { useWeaponMountInfo } from "#/hooks/useWeaponMountInfo"
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
  const [bgLoaded, setBgLoaded] = useState(false)
  const ready = bgLoaded && grid
  const [fleet, setFleet] = useState<fleetEntry[]>([])
  const [activeTile, setActiveTile] = useState<fleetEntry>()
  const prevFleetLenRef = useRef(0)

  useEffect(() => {
    if (activeTile && !fleet.some((e) => e.id === activeTile.id)) {
      setActiveTile(
        prevFleetLenRef.current === 0 && fleet.length > 0 ? fleet[0] : undefined
      )
    } else if (
      prevFleetLenRef.current === 0 &&
      fleet.length > 0 &&
      !activeTile
    ) {
      setActiveTile(fleet[0])
    }
    prevFleetLenRef.current = fleet.length
  }, [fleet, activeTile])
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
  const allWingStats = useMemo(() => getAllWingStats(), [])
  const wingOpById = useMemo(
    () => new Map(allWingStats.map((s) => [s.id, Number(s["op cost"])])),
    [allWingStats]
  )
  const mountInfo = useWeaponMountInfo()
  const weaponsOpOf = (
    weapons?: Record<string, string>,
    entry?: Pick<fleetEntry, "hullmods" | "smods" | "ship">
  ) =>
    Object.values(weapons ?? {}).reduce((sum, wid) => {
      const op = opById.get(wid)
      const base = Number.isFinite(op) ? (op as number) : 0
      const info = mountInfo.get(wid)
      if (!info || !entry) return sum + base
      return (
        sum +
        getEffectiveWeaponOp(
          base,
          [...(entry.ship.meta.builtInMods ?? []), ...(entry.hullmods ?? []), ...(entry.smods ?? [])],
          { weaponId: wid, size: info.size, mountType: info.mountType }
        )
      )
    }, 0)
  const fightersOpOf = (fighters?: string[]) =>
    (fighters ?? []).reduce((sum, wingId) => {
      if (!wingId) return sum
      const op = wingOpById.get(wingId)
      return sum + (Number.isFinite(op) ? (op as number) : 0)
    }, 0)
  const hullModById = useMemo(
    () => new Map(getAllHullMods().map((h) => [h.id, h])),
    []
  )
  // S-mods cost 0 OP, so only regular installs count toward hullmod OP.
  const hullmodsOpOf = (hullmods?: string[], hullSize?: string) =>
    (hullmods ?? []).reduce((sum, id) => {
      const mod = hullModById.get(id)
      return sum + (mod ? getHullModCost(mod, hullSize) : 0)
    }, 0)
  const totalFleetDP = useMemo(
    () =>
      fleet.reduce((sum, fe) => {
        const base = fe.ship.stats["supplies/mo"] ?? 0
        const delta = getDeploymentCostDelta(
          [...(fe.ship.meta.builtInMods ?? []), ...(fe.hullmods ?? []), ...(fe.smods ?? [])],
          {
            fightersOp: fightersOpOf(fe.fighters),
            hullSize: fe.ship.meta.hullSize
          }
        )
        return sum + base + delta
      }, 0),
    // biome-ignore lint: fightersOpOf/wingOpById are derived from allWingStats.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fleet, allWingStats]
  )

  const syncHash = (next: fleetEntry[]) => {
    if (next.length === 0) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      )
    } else {
      const hash = encodeFleetToHash(next)
      // use replaceState to avoid triggering hashchange which would re-hydrate
      // with new random ids and break activeTile identity (subsequent +/- would miss)
      history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}#fleet=${hash}`
      )
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
    const img = `background${Math.floor(Math.random() * 9)}.webp`
    setBgLoaded(false)
    setBgImage(img)
    const pre = new Image()
    pre.onload = () => setBgLoaded(true)
    pre.onerror = () => setBgLoaded(true)
    pre.src = `bgs/${img}`
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
  }

  const updateEntry = (
    id: string,
    patch: Partial<
      Pick<
        fleetEntry,
        | "capacitors"
        | "vents"
        | "cr"
        | "customName"
        | "weapons"
        | "fighters"
        | "hullmods"
        | "smods"
      >
    >
  ) => {
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
      const loadoutOp =
        weaponsOpOf(prev[idx].weapons, prev[idx]) +
        fightersOpOf(prev[idx].fighters) +
        hullmodsOpOf(prev[idx].hullmods, prev[idx].ship.meta.hullSize)
      const clamped = Math.min(
        nxt,
        availableOp - (prev[idx].vents ?? 0) - loadoutOp
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
        availableOp -
          prev.vents -
          weaponsOpOf(prev.weapons, prev) -
          fightersOpOf(prev.fighters) -
          hullmodsOpOf(prev.hullmods, prev.ship.meta.hullSize)
      )
      return clamped <= prev.capacitors
        ? prev
        : { ...prev, capacitors: clamped }
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
      const loadoutOp =
        weaponsOpOf(prev[idx].weapons, prev[idx]) +
        fightersOpOf(prev[idx].fighters) +
        hullmodsOpOf(prev[idx].hullmods, prev[idx].ship.meta.hullSize)
      const clamped = Math.min(
        nxt,
        availableOp - (prev[idx].capacitors ?? 0) - loadoutOp
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
        availableOp -
          prev.capacitors -
          weaponsOpOf(prev.weapons, prev) -
          fightersOpOf(prev.fighters) -
          hullmodsOpOf(prev.hullmods, prev.ship.meta.hullSize)
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

  const onCustomNameChange = (value: string) => {
    if (!activeTile) return
    updateEntry(activeTile.id, { customName: value })
  }

  const onWeaponsChange = (weapons: Record<string, string>) => {
    if (!activeTile) return
    updateEntry(activeTile.id, { weapons })
  }
  const onFightersChange = (fighters: string[]) => {
    if (!activeTile) return
    updateEntry(activeTile.id, { fighters })
  }
  const onHullmodsChange = (hullmods: string[]) => {
    if (!activeTile) return
    updateEntry(activeTile.id, { hullmods })
  }
  const onSmodsChange = (smods: string[]) => {
    if (!activeTile) return
    updateEntry(activeTile.id, { smods })
  }
  const onStrip = () => {
    if (!activeTile) return
    updateEntry(activeTile.id, {
      weapons: {},
      fighters: [],
      hullmods: [],
      smods: [],
      capacitors: 0,
      vents: 0
    })
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
    <div
      className="relative flex h-dvh w-full flex-col gap-2 bg-gray-950 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-4 lg:flex-row lg:gap-0 lg:p-6"
      style={bgImage ? { backgroundImage: `url(bgs/${bgImage})` } : undefined}
    >
      {!ready && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-gray-950">
          <Spinner />
        </div>
      )}
      <div
        className="flex shrink-0 items-stretch gap-2 overflow-x-auto overflow-y-hidden pb-1 lg:h-full
          lg:w-[15%] lg:max-2xl:w-[17%] lg:max-xl:w-[19%] lg:max-lg:w-[21%]
          lg:flex-col lg:gap-0 lg:overflow-x-hidden lg:overflow-y-auto lg:bg-gray-950/70 lg:pb-0"
      >
        <div className="sticky left-0 z-10 flex shrink-0 items-center gap-3 self-center bg-gray-950/85 px-2 py-1 text-sm text-amber-300 backdrop-blur-sm lg:w-full lg:justify-center lg:self-auto lg:bg-transparent lg:py-4 lg:text-base">
          {(() => {
            const totalShips = fleet.length
            return (
              <>
                <p>{`${totalShips === 1 ? `${totalShips} ship` : `${totalShips} ships`}`}</p>
                <div className="h-4 w-px bg-amber-300" />
                <p>{`${totalFleetDP} DP`}</p>
              </>
            )
          })()}
        </div>
        {sortedFleet.map((entry) => (
          <div
            key={entry.id}
            className="w-24 shrink-0 sm:w-28 lg:w-full lg:shrink"
          >
            <SidebarShipTile
              onClick={onTileClick}
              active={activeTile?.id === entry.id}
              entry={entry}
              removeOne={removeOne}
            />
          </div>
        ))}
        <div className="w-24 shrink-0 sm:w-28 lg:w-full lg:shrink-0">
          <AddShipButton />
        </div>
      </div>
      <div
        ref={gridRef}
        id="grid"
        className="relative min-h-0 flex-1 overflow-y-auto bg-gray-950/50 font-semibold text-lg bg-cover text-blue-200 lg:h-full lg:overflow-hidden"
      >
        <div
          id="screen"
          className="absolute inset-0 z-0 opacity-20 bg-[#49dbff]"
        ></div>
        {renderGrid()}
        <div className="relative z-10 w-full min-h-full">
          {activeTile && (
            <ActiveShipPanel
              activeTile={activeTile}
              onCapacitorsIncrement={onCapacitorsIncrement}
              onCapacitorsDecrement={onCapacitorsDecrement}
              onVentsIncrement={onVentsIncrement}
              onVentsDecrement={onVentsDecrement}
              onCustomNameChange={onCustomNameChange}
              onWeaponsChange={onWeaponsChange}
              onFightersChange={onFightersChange}
              onHullmodsChange={onHullmodsChange}
              onSmodsChange={onSmodsChange}
              onStrip={onStrip}
            />
          )}
          {children}
        </div>
        <div className="ss-fine-pointer-only pointer-events-none absolute bottom-6 right-3 z-20 text-right text-xs font-normal text-blue-200/70 leading-tight">
          <p>right click to remove weapon/fighter</p>
          <p>shift + click to place the previously placed weapon/fighter</p>
        </div>
      </div>
    </div>
  )
}
