import { type ReactNode, useEffect, useRef, useState } from "react"
import { getAllShipStats } from "#/lib/csvParser"
import {
  decodeFleetIds,
  encodeFleetToHash,
  hydrateFleet
} from "#/lib/fleetCodec"
import { getAllShips } from "#/lib/shipParser"
import type { fleetEntry } from "#/types"
import AddShipButton from "./addShipBtn"
import CommonButton from "./commonBtn"
import Spinner from "./spinner"

const GRID_SIZE = 25

export default function Screen({ children }: { children?: ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [grid, setGrid] = useState<{ rows: number; cols: number } | null>(null)
  const [bgImage, setBgImage] = useState("")
  const ready = bgImage && grid
  const [fleet, setFleet] = useState<fleetEntry[]>([])

  const removeOne = (hullId: string) => {
    const idx = fleet.findIndex((e) => e.ship.meta.hullId === hullId)
    if (idx === -1) return
    const next = fleet
      .map((e, i) => (i === idx ? { ...e, count: e.count - 1 } : e))
      .filter((e) => e.count > 0)
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
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
          <Spinner />
        </div>
      )}
      <div className="flex flex-col w-[15%] max-2xl:w-[17%] max-xl:w-[19%] max-lg:w-[21%] max-md:w-[23%] max-sm:w-[25%] bg-black h-screen overflow-y-scroll">
        {fleet
          .flatMap((e) =>
            Array.from({ length: e.count }, (_, i) => ({
              entry: e,
              key: `${e.ship.meta.hullId}-${i}`
            }))
          )
          .map(({ entry, key }) => (
            <div
              key={key}
              className="group flex relative items-center justify-center w-full aspect-square shrink-0 cursor-pointer hover:bg-cyan-200/20"
            >
              <img
                src={`/ships${entry.ship.meta.spriteName}`}
                alt="ship sprite"
                className="max-w-full max-h-full brightness-80 group-hover:brightness-100 object-center object-contain"
              />
              <h1 className="absolute left-1 top-1 text-cyan-400 text-bold text-xs text-shadow-[0_1px_0px_rgba(0,0,0,1)] shadow-black">
                {!entry.ship.meta.hullName
                  ? "N/A"
                  : `${entry.ship.meta.hullName}-class`}
              </h1>
              <CommonButton
                text="−"
                clipPath={false}
                className="absolute top-1 right-1 px-2 py-1 text-sm leading-none"
                onClick={(e) => {
                  e.stopPropagation()
                  removeOne(entry.ship.meta.hullId)
                }}
              />
            </div>
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
        <div className="relative z-10 w-full h-full">{children}</div>
      </div>
    </div>
  )
}
