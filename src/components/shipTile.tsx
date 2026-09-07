import type { ship } from "#/types"
import CommonButton from "./commonBtn"

export default function ShipTile({
  ship,
  selectedShips,
  onClick,
  shipCount,
  onShipIncrement,
  onShipDecrement
}: {
  ship: ship
  selectedShips: ship[]
  onClick: (ship: ship) => void
  shipCount: number
  onShipIncrement: (hullId: string) => void
  onShipDecrement: (hullId: string) => void
}) {
  return (
    <div
      tabIndex={0}
      aria-pressed={selectedShips.includes(ship)}
      aria-label={`Select ${ship.hullName}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick(ship)
        }
      }}
      onClick={() => onClick(ship)}
      role="button"
      className={`group flex relative items-center justify-center w-52 shrink-0 h-52 cursor-pointer ${selectedShips.includes(ship) ? "bg-cyan-400/30" : "hover:bg-cyan-200/20"}`}
    >
      <img
        src={`/ships${ship.spriteName}`}
        alt="ship sprite"
        className="max-w-full max-h-full brightness-80 group-hover:brightness-100 object-center object-contain"
      />
      <h1 className="absolute left-1 top-1 text-cyan-400 text-bold text-shadow-[0_1px_0px_rgba(0,0,0,1)] shadow-black">
        {!ship.hullName ? "N/A" : `${ship.hullName}-class`}
      </h1>

      {selectedShips.includes(ship) && (
        <div className="flex absolute bottom-1 left-1 right-1 gap-1 items-center justify-between">
          <p className="text-amber-300 font-bold mr-auto ml-2">{shipCount}</p>
          <CommonButton
            onClick={(e) => {
              e.stopPropagation()
              onShipIncrement(ship.hullId)
            }}
            text="+"
            className="px-4"
            clipPath={false}
          />
          <CommonButton
            disabled={shipCount <= 1}
            onClick={(e) => {
              e.stopPropagation()
              onShipDecrement(ship.hullId)
            }}
            text="-"
            className="px-4 disabled:brightness-70"
            clipPath={false}
          />
        </div>
      )}
    </div>
  )
}
