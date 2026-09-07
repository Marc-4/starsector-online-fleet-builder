import { useEffect, useState } from "react"
import { getAllShips } from "#/lib/shipParser"
import type { ship } from "#/types"
import CommonButton from "./commonBtn"
import ShipTile from "./shipTile"
import ToggleButton from "./toggleButton"

// NOTE: LOW TECH GANG STAYS ON TOP
const SHIP_STYLE_FILTERS = [
  "LOW_TECH",
  "HIGH_TECH",
  "MIDLINE",
  "THREAT",
  "DWELLER",
  "OMEGA"
]

export default function ShipSelectionModal({
  onClose
}: {
  onClose: () => void
}) {
  const [shipSelection, setShipSelection] = useState<ship[]>([])
  const [selectedShips, setSelectedShips] = useState<ship[]>([])
  const [selectedShipCounts, setSelectedShipCounts] = useState<
    Record<string, number>
  >({})
  const [activeStyleFilters, setActiveStyleFilters] =
    useState<string[]>(SHIP_STYLE_FILTERS)

  const [activeHullSizeFilters, setActiveHulSizeFilters] = useState<string[]>(
    []
  )

  useEffect(() => {
    void (async () => {
      const ships = await getAllShips()
      setShipSelection(
        ships.sort((a, b) => a.hullName.localeCompare(b.hullName))
      )
    })()
  }, [])

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

  const onFilterToggle = (filter: string) => {
    if (activeStyleFilters.includes(filter))
      setActiveStyleFilters((prev) => prev.filter((f) => f !== filter))
    else {
      setActiveStyleFilters((prev) => [...prev, filter])
    }
  }

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
      <div className="relative z-10 flex flex-col gap-4 w-[80%] h-[80%] bg-black p-1 border border-cyan-200">
        <div className="flex m-1 p-1 gap-1 justify-center ">
          <div className="gap-2 flex flex-col">
            <div className="flex gap-2 items-center">
              <h2 className="text-cyan-200 ">Search: </h2>
              <input
                className="border border-cyan-100 w-[50%] text-cyan-200"
                type="search"
              />
            </div>
            <div className="flex gap-2 items-center">
              <h2 className="text-cyan-200">Filters: </h2>
              <div className="flex gap-1 flex-wrap w-full">
                {SHIP_STYLE_FILTERS.map((style) => (
                  <ToggleButton
                    key={style}
                    active={activeStyleFilters.includes(style)}
                    onClick={() => onFilterToggle(style)}
                    text={style.toLowerCase().replace("_", " ")}
                  />
                ))}
              </div>
            </div>
          </div>
          <CommonButton
            text="x"
            onClick={() => onClose()}
            clipPath={false}
            className="cursor-pointer rounded-xs ml-auto w-7 h-7 px-2 font-bold hover:brightness-110 text-2xl text-cyan-200 flex items-center justify-center"
          />
        </div>
        <div className="w-full h-full grid grid-cols-[repeat(auto-fit,13rem)] justify-center gap-2 content-start p-4 overflow-auto">
          {shipSelection.map((ship, i) => {
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
          className="disabled:brightness-50 shadow-2xl shadow-black w-fit absolute bottom-4 left-1/2"
          disabled={selectedShips.length === 0}
        />
      </div>
    </div>
  )
}
