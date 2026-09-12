import { useEffect, useMemo, useState } from "react"
import { getAllWingStats, getWingHullId } from "#/lib/csvParser"
import { getCachedShips } from "#/lib/shipParser"
import type { ship, wingStats } from "#/types"
import FighterSelectionModal from "../modals/fighterSelectionModal"

export default function FighterBay({
  wingId,
  remainingOpForBay,
  locked,
  onSelect,
  onRemove,
  onHover
}: {
  wingId?: string
  remainingOpForBay?: number
  /** Built-in wing: sprite display only, no selection. */
  locked?: boolean
  onSelect?: (wing: wingStats) => void
  onRemove?: () => void
  onHover?: (wing: wingStats | null) => void
}) {
  const [isFighterSelectionModalOpen, setIsFighterSelectionModalOpen] =
    useState(false)
  const [allShips, setAllShips] = useState<ship[]>([])
  const allWingStats = useMemo(() => getAllWingStats(), [])
  const wing = wingId
    ? (allWingStats.find((w) => w.id === wingId) ?? null)
    : null

  useEffect(() => {
    let cancelled = false
    void getCachedShips().then((ships) => {
      if (!cancelled) setAllShips(ships)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const hullId = wing ? getWingHullId(wing) : null
  const sprite = hullId
    ? (allShips.find((s) => s.hullId === hullId)?.spriteName ?? null)
    : null

  const hoverIn = () => {
    if (wing) onHover?.(wing)
  }
  const hoverOut = () => {
    if (wing) onHover?.(null)
  }

  if (locked) {
    return (
      <div
        aria-label={wingId ? `Built-in wing ${wingId}` : "Built-in fighter bay"}
        title={
          wingId
            ? `Built-in wing: ${wingId} (cannot be changed)`
            : "Built-in fighter bay"
        }
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        className="w-20 h-20 border border-amber-300/60 bg-gray-950 flex items-center justify-center overflow-hidden cursor-not-allowed"
      >
        {sprite ? (
          <img
            draggable={false}
            src={`ships${sprite}`}
            alt={wingId ?? ""}
            className="max-h-full max-w-full object-contain"
            style={{ imageRendering: "smooth" }}
          />
        ) : (
          <span className="text-amber-200/80 text-[10px] px-1 text-center">
            {wingId || ""}
          </span>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        aria-label={wingId ? `Fighter bay: ${wingId}` : "Select fighter wing"}
        title={wingId || "Empty fighter bay — click to select"}
        onClick={() => setIsFighterSelectionModalOpen(true)}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        onFocus={hoverIn}
        onBlur={hoverOut}
        onContextMenu={(e) => {
          e.preventDefault()
          if (wingId) onRemove?.()
        }}
        className="w-20 h-20 border-cyan-800 border bg-gray-950 cursor-pointer hover:border-cyan-600 flex items-center justify-center overflow-hidden"
      >
        {sprite ? (
          <img
            draggable={false}
            src={`ships${sprite}`}
            alt={wingId ?? ""}
            className="max-h-full max-w-full object-contain pointer-events-none"
            style={{ imageRendering: "smooth" }}
          />
        ) : (
          <span className="text-cyan-200 text-[10px] px-1 text-center">
            {wingId || ""}
          </span>
        )}
      </button>
      {isFighterSelectionModalOpen && (
        <FighterSelectionModal
          onClose={() => setIsFighterSelectionModalOpen(false)}
          onSelect={onSelect}
          mountedWingId={wingId}
          remainingOpForSlot={remainingOpForBay}
        />
      )}
    </>
  )
}
