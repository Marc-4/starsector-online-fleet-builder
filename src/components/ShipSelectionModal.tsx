import { useEffect, useState, type KeyboardEventHandler } from "react"
import { getAllShips } from "#/lib/shipParser"
import type { ship } from "#/types"
import CommonButton from "./commonBtn"
import ShipTile from "./shipTile"

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

  useEffect(() => {
    void (async () => {
      const ships = await getAllShips()
      setShipSelection(
        ships.sort((a, b) => a.hullName.localeCompare(b.hullName))
      )
    })()
  }, [])

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
        <CommonButton
          text="x"
          onClick={() => onClose()}
          clipPath={false}
          className="relative cursor-pointer rounded-xs top-2 right-2 ml-auto w-7 h-7 px-2 font-bold hover:brightness-110 text-2xl text-cyan-200 flex items-center justify-center"
        />
        <div className="w-full h-full grid grid-cols-[repeat(auto-fit,13rem)] justify-center gap-2 content-start p-4 overflow-auto">
          {shipSelection.map((ship, i) => {
            return (
              <ShipTile
                ship={ship}
                selectedShips={selectedShips}
                setSelectedShips={setSelectedShips}
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
