import { useEffect, useState } from "react"
import { getAllWingStats, getWingHullIds } from "#/lib/csvParser"
import { getCachedShips } from "#/lib/shipParser"
import type { ship, wingStats } from "#/types"
import FighterSprite from "../fighterSprite"
import FighterSelectionModal from "../modals/fighterSelectionModal"

export default function FighterBay({
  wingId,
  remainingOpForBay,
  locked,
  onSelect,
  onRemove,
  onHover,
  onShiftClick
}: {
  wingId?: string
  remainingOpForBay?: number
  /** Built-in wing: sprite display only, no selection. */
  locked?: boolean
  onSelect?: (wing: wingStats) => void
  onRemove?: () => void
  onHover?: (wing: wingStats | null) => void
  /** Shift-click on the bay (quick-mount last wing). */
  onShiftClick?: () => void
}) {
  const [isFighterSelectionModalOpen, setIsFighterSelectionModalOpen] =
    useState(false)
  const [allShips, setAllShips] = useState<ship[]>([])
  const [allWingStats, setAllWingStats] = useState<wingStats[]>([])
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const wings = await getAllWingStats()
      if (!cancelled) setAllWingStats(wings)
    })()
    return () => {
      cancelled = true
    }
  }, [])
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

  const hullIds = wing ? getWingHullIds(wing) : []
  const fighterShip = hullIds.length
    ? (allShips.find((s) => hullIds.includes(s.hullId)) ?? null)
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
        {fighterShip ? (
          <FighterSprite
            ship={fighterShip}
            variant={wing?.variant}
            className="pointer-events-none"
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
      <div className="relative h-fit w-fit">
        <button
          type="button"
          aria-label={wingId ? `Fighter bay: ${wingId}` : "Select fighter wing"}
          title={wingId || "Empty fighter bay. click to select"}
          onClick={(e) => {
            if (e.shiftKey) {
              onShiftClick?.()
              return
            }
            setIsFighterSelectionModalOpen(true)
          }}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
          onFocus={hoverIn}
          onBlur={hoverOut}
          onContextMenu={(e) => {
            e.preventDefault()
            if (wingId) onRemove?.()
          }}
          className="w-20 h-20 border-cyan-800 border bg-gray-950 cursor-pointer touch-manipulation hover:border-cyan-600 flex items-center justify-center overflow-hidden"
        >
          {fighterShip && (
            <FighterSprite
              ship={fighterShip}
              variant={wing?.variant}
              className="max-h-full max-w-full pointer-events-none"
            />
          )}
        </button>
        {wingId && onRemove && (
          <button
            type="button"
            aria-label={`Remove ${wingId} from fighter bay`}
            title="Remove wing"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-cyan-700 bg-gray-950 text-sm leading-none text-cyan-100 shadow-lg touch-manipulation"
          >
            ×
          </button>
        )}
      </div>
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
