import type { fleetEntry } from "#/types"
import CommonButton from "./commonBtn"

export default function SidebarShipTile({
  entry,
  removeOne,
  active = false,
  onClick
}: {
  entry: fleetEntry
  active: boolean
  removeOne: (hullid: string) => void
  onClick: (entry: fleetEntry) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(entry)}
      className={`group flex relative items-center justify-center w-full aspect-square shrink-0 cursor-pointer  ${active ? "bg-cyan-300/30" : "hover:bg-cyan-200/20"}`}
    >
      <img
        src={`/ships${entry.ship.meta.spriteName}`}
        alt="ship sprite"
        className="max-w-full max-h-full brightness-80 group-hover:brightness-100 object-center object-contain"
      />
      <h1 className="absolute left-1 max-w-[50%] top-1 text-cyan-400 text-bold text-xs text-shadow-[0_1px_0px_rgba(0,0,0,1)] shadow-black">
        {!entry.ship.meta.hullName
          ? "N/A"
          : `${entry.ship.meta.hullName}-class`}
      </h1>
      <CommonButton
        text="−"
        clipPath={false}
        className="absolute top-1 right-1 px-2 py-1 leading-none"
        onClick={(e) => {
          e.stopPropagation()
          removeOne(entry.id)
        }}
      />
    </button>
  )
}
