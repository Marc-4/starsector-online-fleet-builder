import { getAllShips, getShip } from "#/lib/shipParser"
import type { ship } from "#/types"
import { useEffect, useState } from "react"

export default function ShipSelectionModal({
  onClose
}: {
  onClose: () => void
}) {
  const [shipSelection, setShipSelection] = useState<ship[]>([])
  const [selectedShips, setSelectedShips] = useState<ship[]>([])

  useEffect(() => {
    void (async () => {
      const ships = await getAllShips()
      setShipSelection(
        ships.sort((a, b) => a.hullName.localeCompare(b.hullName))
      )
    })()
  }, [])
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
      <div className="relative z-10 flex flex-col gap-1 w-[80%] h-[80%] bg-black p-1 border border-cyan-200">
        <button
          type="button"
          onClick={() => onClose()}
          className="relative cursor-pointer top-0 ml-auto w-7 h-7 font-bold hover:text-white hover:border-white text-2xl text-cyan-200 flex items-center justify-center border border-t-cyan-100 rounded-sm"
        >
          x
        </button>
        <div className="w-full h-full grid grid-cols-[repeat(auto-fit,13rem)] justify-center gap-2 content-start p-4 overflow-auto">
          {shipSelection.map((ship, i) => {
            return (
              <div
                key={i}
                className="group flex relative items-center justify-center w-52 shrink-0 h-52 cursor-pointer hover:bg-white/50"
              >
                <img
                  src={`/ships${ship.spriteName}`}
                  alt="ship sprite"
                  className="max-w-full max-h-full brightness-80 group-hover:brightness-100 object-center object-contain"
                />
                <h1 className="absolute left-1 top-1 text-cyan-400 text-bold text-shadow-[0_1px_0px_rgba(0,0,0,1)] shadow-black">
                  {!ship.hullName ? "¯\\(ツ)/¯" :
                    `${ship.hullName}-class`
                  }
                </h1>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
