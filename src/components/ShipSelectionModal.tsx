import { useEffect, useMemo, useState } from "react"
import { getAllShips, isModule } from "#/lib/shipParser"
import type { ship } from "#/types"
import CommonButton from "./commonBtn"
import ShipTile from "./shipTile"
import ToggleButton from "./toggleButton"

// NOTE: LOW TECH GANG STAYS ON TOP
const SHIP_STYLE_FILTERS = [
  "LOW_TECH",
  "MIDLINE",
  "HIGH_TECH",
  "THREAT",
  "DWELLER",
  "OMEGA"
]

const HULL_SIZE_FILTERS = [
  "FIGHTER",
  "FRIGATE",
  "DESTROYER",
  "CRUISER",
  "CAPITAL_SHIP"
]

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
  const [searchString, setSearchString] = useState("")

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

  const onStyleFilterToggle = (
    filter: string,
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e?.altKey) {
      setActiveStyleFilters([filter])
      return
    }
    if (activeStyleFilters.includes(filter))
      setActiveStyleFilters((prev) => prev.filter((f) => f !== filter))
    else {
      setActiveStyleFilters((prev) => [...prev, filter])
    }
  }

  const onHullSizeFilterToggle = (
    filter: string,
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e?.altKey) {
      setActiveHullSizeFilters([filter])
      return
    }
    if (activeHullSizeFilters.includes(filter))
      setActiveHullSizeFilters((prev) => prev.filter((f) => f !== filter))
    else {
      setActiveHullSizeFilters((prev) => [...prev, filter])
    }
  }

  const onShowModuleToggle = () => {
    setShowModules((prev) => !prev)
  }

  useEffect(() => {
    void (async () => {
      const ships = await getAllShips()
      setAllShips(ships.sort((a, b) => a.hullName.localeCompare(b.hullName)))
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
                className="border border-cyan-100 w-[50%] text-cyan-200"
                type="search"
                value={searchString}
                onChange={(e) =>
                  setSearchString(e.currentTarget.value.toLowerCase())
                }
              />
            </div>
            <div className="flex gap-2 items-center">
              <h2
                title="alt+click on filters for inverse behavior."
                className="text-cyan-200"
              >
                Filters:{" "}
              </h2>
              <div className="flex gap-1 flex-wrap w-full">
                {SHIP_STYLE_FILTERS.map((style) => (
                  <ToggleButton
                    title="alt+click on filters for inverse behavior."
                    key={style}
                    active={activeStyleFilters.includes(style)}
                    onClick={(e) => onStyleFilterToggle(style, e)}
                    text={style.toLowerCase().replace("_", " ")}
                  />
                ))}
                <div className="w-px h-8 bg-cyan-200" />
                {HULL_SIZE_FILTERS.map((size) => (
                  <ToggleButton
                    title="alt+click on filters for inverse behavior."
                    key={size}
                    active={activeHullSizeFilters.includes(size)}
                    onClick={(e) => onHullSizeFilterToggle(size, e)}
                    text={size.toLowerCase().replace("_", " ")}
                  />
                ))}
                <div className="w-px h-8 bg-cyan-200" />
                <ToggleButton
                  title="alt+click on filters for inverse behavior."
                  active={showModules}
                  onClick={() => onShowModuleToggle()}
                  text={"Modules"}
                />
                <CommonButton
                  text="reset"
                  onClick={() => {
                    setActiveStyleFilters(["LOW_TECH", "MIDLINE", "HIGH_TECH"])
                    setActiveHullSizeFilters([])
                  }}
                />
              </div>
            </div>
            <p className="text-cyan-200 text-xs">{`showing ${filteredShipCount} of ${totalShipCount} ships`}</p>
          </div>
          <CommonButton
            text="x"
            onClick={() => onClose()}
            clipPath={false}
            className="cursor-pointer rounded-xs ml-auto w-7 h-7 px-2 font-bold hover:brightness-110 text-2xl text-cyan-200 flex items-center justify-center"
          />
        </div>
        <div className="w-full h-full mb-8 grid grid-cols-[repeat(auto-fit,13rem)] justify-center gap-2 content-start p-4 overflow-auto">
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
          className="disabled:brightness-50 shadow-2xl shadow-black w-fit absolute bottom-4 left-1/2"
          disabled={selectedShips.length === 0}
        />
      </div>
    </div>
  )
}
