import { useEffect, useMemo, useState } from "react"
import { getAllShipStats, getShipStats } from "#/lib/csvParser"
import {
  decodeFleetEntries,
  encodeFleetToHash,
  hydrateFleet
} from "#/lib/fleetCodec"
import { getAllShips, isModule } from "#/lib/shipParser"
import type { ship, shipStats } from "#/types"
import CommonButton from "../commonBtn"
import ShipFilters from "../shipFilters"
import ShipTile from "../shipTile"

export default function ShipSelectionModal({
  onClose
}: {
  onClose: () => void
}) {
  const [allShips, setAllShips] = useState<ship[]>([])
  const [selectedShips, setSelectedShips] = useState<ship[]>([])
  const [selectedShipCounts, setSelectedShipCounts] = useState<
    Record<string, number>
  >({})
  const totalShipCount = useMemo(() => {
    return allShips?.length
  }, [allShips])
  const totalSelectedShipsCount = useMemo(
    () =>
      selectedShips.reduce(
        (sum, s) => sum + (selectedShipCounts[s.hullId] ?? 1),
        0
      ),
    [selectedShips, selectedShipCounts]
  )
  const [searchString, setSearchString] = useState("")
  const [allShipStats, setAllShipStats] = useState<shipStats[]>([])
  const totalSelectedShipsDPCost = useMemo(
    () =>
      selectedShips.reduce(
        (sum, s) =>
          sum +
          (getShipStats({ ship: s, shipStats: allShipStats })?.[
            "supplies/mo"
          ] ?? 0) *
            (selectedShipCounts[s.hullId] ?? 1),
        0
      ),
    [selectedShips, allShipStats, selectedShipCounts]
  )

  const [activeStyleFilters, setActiveStyleFilters] = useState<string[]>([
    "LOW_TECH",
    "MIDLINE",
    "HIGH_TECH"
  ])
  const [activeHullSizeFilters, setActiveHullSizeFilters] = useState<string[]>(
    []
  )
  const [showModules, setShowModules] = useState(false)
  const [showSelectedFirst, setShowSelectedFirst] = useState(false)

  const filteredShips = useMemo(() => {
    const selectedIds = new Set(selectedShips.map((s) => s.hullId))
    return (
      allShips
        .filter((ship) => {
          if (searchString.length > 0) {
            const haystack = `${ship.hullId} ${ship.hullName}`.toLowerCase()
            if (!haystack.includes(searchString)) return false
          }
          if (!showModules && isModule({ ship })) return false
          const stylePass =
            activeStyleFilters.length === 0 ||
            activeStyleFilters.includes(ship.style)
          const hullSizePass =
            activeHullSizeFilters.length === 0 ||
            activeHullSizeFilters.includes(ship.hullSize)
          return stylePass && hullSizePass
        })
        // Stable sort: selected tiles bubble to the top, order kept otherwise.
        .sort((a, b) =>
          showSelectedFirst
            ? Number(selectedIds.has(b.hullId)) -
              Number(selectedIds.has(a.hullId))
            : 0
        )
    )
  }, [
    allShips,
    selectedShips,
    showSelectedFirst,
    activeStyleFilters,
    activeHullSizeFilters,
    showModules,
    searchString
  ])

  const filteredShipCount = useMemo(() => {
    return filteredShips.length
  }, [filteredShips])

  const onShipToggle = (ship: ship) => {
    if (!selectedShips.includes(ship))
      setSelectedShips((prev) => [...prev, ship])
    else {
      setSelectedShips((prev) => prev.filter((s) => s.hullId !== ship.hullId))
      setSelectedShipCounts((prev) => ({ ...prev, [ship.hullId]: 1 }))
    }
  }

  const onShipCountIncrement = (hullId: string) => {
    setSelectedShipCounts((prev) => ({
      ...prev,
      [hullId]: (prev[hullId] ?? 1) + 1
    }))
  }

  const onShipCountDecrement = (hullId: string) => {
    setSelectedShipCounts((prev) => ({
      ...prev,
      [hullId]: Math.max(1, (prev[hullId] ?? 0) - 1)
    }))
  }

  const onConfirm = () => {
    const addedIds = selectedShips.flatMap((s) =>
      Array.from({ length: selectedShipCounts[s.hullId] ?? 1 }, () => s.hullId)
    )
    const existingEntries = decodeFleetEntries(window.location.hash) ?? []
    const addedEntries = addedIds.map((hullId) => ({
      hullId,
      capacitors: 0,
      vents: 0,
      cr: 70,
      customName: "",
      weapons: {},
      fighters: [],
      hullmods: []
    }))
    const mergedEntries = [...existingEntries, ...addedEntries]
    const mergedFleet = hydrateFleet(mergedEntries, allShips, allShipStats)
    const hash = encodeFleetToHash(mergedFleet)
    window.location.hash = `fleet=${hash}`
    onClose()
  }

  useEffect(() => {
    void (async () => {
      const ships = await getAllShips()
      setAllShips(ships.sort((a, b) => a.hullName.localeCompare(b.hullName)))
    })()
  }, [])
  useEffect(() => {
    void (async () => {
      const shipStats = await getAllShipStats()
      setAllShipStats(shipStats.filter((ship) => ship.id))
    })()
  }, [])
  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ship selection"
      className="absolute inset-0 z-50 flex items-center justify-center"
    >
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-gray-950/60"
      />
      <div className="relative z-10 flex flex-col gap-2 w-[80%] h-[80%] max-md:w-[95%] max-md:h-[93%] bg-gray-950/30 p-1 border border-cyan-200 overflow-hidden">
        <div className="flex max-md:flex-col m-1 mb-0 p-1 pb-0 gap-1 justify-center max-md:justify-start">
          <div className="gap-2 flex flex-col min-w-0 flex-1 max-md:overflow-y-auto max-md:max-h-[32vh] max-md:pr-8">
            <div className="flex gap-2 items-center flex-wrap">
              <h2 className="text-cyan-200 ">Search: </h2>
              <input
                className="border border-cyan-200 w-56 max-md:w-full max-md:max-w-56 text-cyan-200"
                type="search"
                value={searchString}
                onChange={(e) =>
                  setSearchString(e.currentTarget.value.toLowerCase())
                }
              />
            </div>
            <ShipFilters
              activeHullSizeFilters={activeHullSizeFilters}
              activeStyleFilters={activeStyleFilters}
              setActiveHullSizeFilters={setActiveHullSizeFilters}
              setActiveStyleFilters={setActiveStyleFilters}
              setShowModules={setShowModules}
              showModules={showModules}
              setShowSelectedFirst={setShowSelectedFirst}
              showSelectedFirst={showSelectedFirst}
            />

            <div className="flex gap-2">
              <p className="text-cyan-200 text-xs">{`showing ${filteredShipCount} of ${totalShipCount} ships`}</p>
              <span className="text-xs text-gray-400">
                alt + click to single out a filter
              </span>
            </div>
          </div>
          <CommonButton
            text="x"
            onClick={() => onClose()}
            clipPath={false}
            className="cursor-pointer rounded-xs ml-auto max-md:ml-0 max-md:absolute max-md:top-1 max-md:right-1 w-7 h-7 px-2 font-bold hover:brightness-110 text-2xl text-cyan-200 flex items-center justify-center shrink-0"
          />
        </div>
        <div className="w-full flex-1 min-h-0 mb-4 grid grid-cols-[repeat(auto-fit,13rem)] max-md:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] justify-center gap-2 max-md:gap-1.5 content-start p-4 max-md:p-2 overflow-auto [&>*]:max-md:w-full [&>*]:max-md:h-44">
          {filteredShips.map((ship, i) => {
            return (
              <ShipTile
                ship={ship}
                selectedShips={selectedShips}
                onClick={onShipToggle}
                shipCount={selectedShipCounts[ship.hullId] ?? 1}
                onShipIncrement={onShipCountIncrement}
                onShipDecrement={onShipCountDecrement}
                key={`${ship.hullId}-${ship.hullName}-${i}`}
              />
            )
          })}
        </div>
        <div className="flex items-end justify-between gap-2 px-1 pb-1 max-md:text-sm">
          <div className="text-amber-300 flex gap-0 flex-col leading-tight">
            <p>
              {`
          Ship Count:
          ${totalSelectedShipsCount}
          `}
            </p>
            <p>{`Total DP: ${totalSelectedShipsDPCost}`} </p>
          </div>
          <CommonButton
            text="Ok"
            onClick={onConfirm}
            className="disabled:brightness-50 disabled:cursor-not-allowed shadow-2xl shadow-black w-fit"
            disabled={selectedShips.length === 0}
          />
          <div className="w-[7rem] max-md:hidden" />
        </div>
      </div>
    </div>
  )
}
