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
    // biome-ignore lint: dont care.
    <div
      role="button"
      onClick={() => onClick(entry)}
      className={`group ss-ship-card w-full aspect-square ${active ? "bg-cyan-300/30" : "hover:bg-cyan-200/20"}`}
    >
      <img
        draggable={false}
        src={`/ships${entry.ship.meta.spriteName}`}
        alt="ship sprite"
        className="ss-ship-img group-hover:brightness-100"
        style={{ imageRendering: "pixelated" }}
      />
      <h1 className="absolute left-1 max-w-[50%] top-1 ss-cyan-title text-xs">
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
    </div>
  )
}
