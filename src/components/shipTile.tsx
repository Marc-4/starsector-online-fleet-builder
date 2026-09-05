import type { ship } from "#/types"

export default function ShipTile({
  ship,
  selectedShips,
  setSelectedShips
}: {
  ship: ship
  selectedShips: ship[]
  setSelectedShips: React.Dispatch<React.SetStateAction<ship[]>>
}) {
  return (
    <button
      onClick={() => {
        if (!selectedShips.includes(ship))
          setSelectedShips((prev) => [...prev, ship])
        else
          setSelectedShips((prev) =>
            prev.filter((s) => s.hullId !== ship.hullId)
          )
      }}
      type="button"
      className={`group flex relative items-center justify-center w-52 shrink-0 h-52 cursor-pointer ${selectedShips.includes(ship) ? "bg-cyan-300/30" : "hover:bg-cyan-200/20"}`}
    >
      <img
        src={`/ships${ship.spriteName}`}
        alt="ship sprite"
        className="max-w-full max-h-full brightness-80 group-hover:brightness-100 object-center object-contain"
      />
      <h1 className="absolute left-1 top-1 text-cyan-400 text-bold text-shadow-[0_1px_0px_rgba(0,0,0,1)] shadow-black">
        {!ship.hullName ? "N/A" : `${ship.hullName}-class`}
      </h1>
    </button>
  )
}
