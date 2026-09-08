import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { getAllShipStats } from "#/lib/csvParser"
import {
  decodeFleetIds,
  encodeFleetToHash,
  hydrateFleet
} from "#/lib/fleetCodec"
import { getAllShips } from "#/lib/shipParser"
import type { fleetEntry } from "#/types"
import AddShipButton from "./addShipBtn"
import CombatReadinessBar from "./data_screen/combatReadinessBar"
import StatCluster from "./data_screen/statCluster"
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

  const removeOne = (id: string) => {
    const next = fleet.filter((e) => e.id !== id)
    if (next.length === fleet.length) return
    if (activeTile?.id === id) setActiveTile(undefined)
    setFleet(next)
    if (next.length === 0) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      )
    } else {
      window.location.hash = `fleet=${encodeFleetToHash(next)}`
    }
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
      const ids = decodeFleetIds(window.location.hash)
      if (ids) setFleet(hydrateFleet(ids, ships, stats))
      onHash = () => {
        const next = decodeFleetIds(window.location.hash)
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
      <div className="flex flex-col w-[15%] max-2xl:w-[17%] max-xl:w-[19%] max-lg:w-[21%] max-md:w-[23%] max-sm:w-[25%] bg-gray-950 h-screen overflow-y-scroll">
        <div className="sticky top-0 z-100 bg-gray-950 text-amber-300 flex items-center justify-center gap-4 max-md:gap-2">
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
            <>
              <div>
                <CombatReadinessBar
                  cr={activeTile.cr}
                  onChange={(value) => {
                    setFleet((prev) =>
                      prev.map((e) =>
                        e.id === activeTile.id ? { ...e, cr: value } : e
                      )
                    )
                    setActiveTile((prev) =>
                      prev ? { ...prev, cr: value } : prev
                    )
                  }}
                />
              </div>
              <div className="absolute right-1 top-1">
                <StatCluster
                  OP={activeTile.ship.stats["ordnance points"]}
                  topSpeed={activeTile.ship.stats["max speed"]}
                  armor={activeTile.ship.stats["armor rating"]}
                  hull={activeTile.ship.stats.hitpoints}
                  capacitors={30}
                  vents={30}
                  fluxCapacity={activeTile.ship.stats["max flux"]}
                  fluxDissipation={activeTile.ship.stats["flux dissipation"]}
                  shieldEfficiency={activeTile.ship.stats["shield efficiency"]}
                />
              </div>
            </>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
