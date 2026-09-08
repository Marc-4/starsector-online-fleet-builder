import { useEffect, useMemo, useState } from "react"
import { getAllShipStats, getShipStats } from "#/lib/csvParser"
import { getAllShips, isModule } from "#/lib/shipParser"
import type { ship, shipStats } from "#/types"
import CommonButton from "./commonBtn"
import ShipFilters from "./shipFilters"
import ShipTile from "./shipTile"

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

  const filteredShips = useMemo(() => {
    return allShips.filter((ship) => {
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
  }, [
    allShips,
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
        className="absolute inset-0 bg-black/60"
      />
      <div className="relative z-10 flex flex-col gap-2 w-[80%] h-[80%] bg-black/30 p-1 border border-cyan-200">
        <div className="flex m-1 mb-0 p-1 pb-0 gap-1 justify-center ">
          <div className="gap-2 flex flex-col">
            <div className="flex gap-2 items-center">
              <h2 className="text-cyan-200 ">Search: </h2>
              <input
                className="border border-cyan-100 w-56 max-[470px]:w-40 text-cyan-200"
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
            />
            <p className="text-cyan-200 text-xs">{`showing ${filteredShipCount} of ${totalShipCount} ships`}</p>
          </div>
          <CommonButton
            text="x"
            onClick={() => onClose()}
            clipPath={false}
            className="cursor-pointer rounded-xs ml-auto w-7 h-7 px-2 font-bold hover:brightness-110 text-2xl text-cyan-200 flex items-center justify-center"
          />
        </div>
        <div className="w-full h-full mb-4 grid grid-cols-[repeat(auto-fit,13rem)] justify-center gap-2 content-start p-4 overflow-auto">
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
        <CommonButton
          text="Ok"
          className="disabled:brightness-50 shadow-2xl shadow-black w-fit absolute bottom-2 left-0 right-0 mx-auto"
          disabled={selectedShips.length === 0}
        />
        <div className="absolute left-0 bottom-0 text-amber-300 flex gap-0 flex-col">
          <p>
            {`
          Ship Count:
          ${totalSelectedShipsCount}
          `}
          </p>
          <p>{`Total DP: ${totalSelectedShipsDPCost}`} </p>
        </div>
      </div>
    </div>
  )
}
