import { getWingHullId } from "#/lib/csvParser"
import type { ship, shipStats, wingStats } from "#/types"

type Props = {
  wing: wingStats
  allShips: ship[]
  allShipStats: shipStats[]
  onSelect?: (wing: wingStats) => void
  onClose: () => void
  onHover?: (wing: wingStats | null) => void
  mounted?: boolean
  disabled?: boolean
}

export default function FighterTile({
  wing: w,
  allShips,
  allShipStats,
  onSelect,
  onClose,
  onHover,
  mounted,
  disabled
}: Props) {
  const hullId = getWingHullId(w)
  const ship = allShips.find((s) => s.hullId === hullId) ?? null
  const stats = allShipStats.find((s) => s.id === hullId) ?? null
  const name = stats?.name ?? ship?.hullName ?? w.variant ?? w.id
  const role = w["role desc"] ?? w.role ?? ""
  const isDisabled = Boolean(disabled && !mounted)
  const tileTitle = mounted
    ? "Mounted in this bay - click to remove"
    : isDisabled
      ? "Not enough OP"
      : "Click to mount"
  const borderClass = mounted
    ? "border-amber-300 cursor-pointer hover:bg-cyan-900/40 hover:border-cyan-600"
    : isDisabled
      ? "border-cyan-950 opacity-40 cursor-not-allowed"
      : "border-cyan-800 cursor-pointer hover:bg-cyan-900/40 hover:border-cyan-600 focus-visible:bg-cyan-900/40 focus-visible:border-cyan-600"

  return (
    <button
      type="button"
      onMouseEnter={() => onHover?.(w)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(w)}
      onBlur={() => onHover?.(null)}
      disabled={isDisabled}
      onClick={() => {
        if (isDisabled) return
        onSelect?.(w)
        onClose()
      }}
      title={tileTitle}
      className={
        "relative w-full min-h-16 flex gap-3 px-3 py-2 border bg-gray-950/40 text-left pointer-events-auto shrink-0 " +
        borderClass
      }
    >
      <div className="relative border border-cyan-700 w-16 h-16 shrink-0 flex items-center justify-center overflow-hidden">
        {ship ? (
          <img
            draggable={false}
            src={`ships${ship.spriteName}`}
            alt=""
            className="max-h-full max-w-full object-contain"
            style={{ imageRendering: "smooth" }}
          />
        ) : (
          <div className="absolute inset-0 border border-cyan-800 bg-cyan-900/30" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-cyan-100 text-sm truncate font-semibold w-full">
          {name}
        </p>
        <p className="text-amber-300 text-xs truncate">
          {role}
          {w.range ? `, range ${w.range}` : ""}
        </p>
      </div>
      <div className="absolute bottom-0 h-fit right-1 flex flex-col items-end gap-0 shrink-0">
        <span className="text-amber-300 text-md">
          {w["op cost"] ?? "-"}
        </span>
        <span className="text-gray-400 text-[10px]">ORDINANCE POINTS</span>
      </div>
    </button>
  )
}
