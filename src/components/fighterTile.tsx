import { useEffect, useState } from "react"
import { getWingHullIds } from "#/lib/csvParser"
import type { ship, shipStats, wingStats } from "#/types"
import CommonButton from "./commonBtn"
import FighterSprite from "./fighterSprite"
import FighterTooltip from "./fighterTooltip"

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
  const hullIds = getWingHullIds(w)
  const ship =
    allShips.find((s) => hullIds.includes(s.hullId)) ?? null
  const hullId = ship?.hullId ?? null
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

  // Touch has no hover and the modal's tooltip sidecar is desktop-only,
  // so small-screen rows get an info button that opens the tooltip in a sheet.
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    if (!showInfo) return
    // Capture phase runs before the modal's own Esc listener, so Esc
    // closes just this sheet instead of the whole picker.
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        ev.stopPropagation()
        setShowInfo(false)
      }
    }
    window.addEventListener("keydown", handler, true)
    return () => window.removeEventListener("keydown", handler, true)
  }, [showInfo])

  return (
    <>
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
          <FighterSprite
            ship={ship}
            variant={w.variant}
            className="max-h-full max-w-full"
          />
        ) : (
          <div className="absolute inset-0 border border-cyan-800 bg-cyan-900/30" />
        )}
      </div>
      <div className="flex-1 min-w-0 max-lg:pr-10">
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
        <span className="text-gray-400 text-[11px]">ORDINANCE POINTS</span>
      </div>
      <span className="absolute top-1 right-1 lg:hidden">
        <span
          role="button"
          tabIndex={0}
          aria-label={`Show ${name} info`}
          title={`${name} info`}
          onClick={(e) => {
            e.stopPropagation()
            setShowInfo(true)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              e.stopPropagation()
              setShowInfo(true)
            }
          }}
            className="relative flex h-4 w-4 items-center justify-center rounded-full border border-cyan-700 text-[10px] leading-none text-cyan-200 touch-manipulation bg-gray-950/80 after:absolute after:-inset-2 after:content-['']"
        >
          i
        </span>
      </span>
    </button>
    {showInfo && (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${name} info`}
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      >
        <button
          type="button"
          aria-label="Close fighter info"
          onClick={() => setShowInfo(false)}
          className="absolute inset-0 bg-gray-950/60 cursor-default"
        />
        <div className="relative z-10 flex w-full sm:w-96 max-h-[80dvh] flex-col gap-2 overflow-auto rounded-t-2xl sm:rounded-none border border-cyan-200 bg-gray-950 p-2 shadow-xl">
          <FighterTooltip wing={w} allShipStats={allShipStats} />
          <CommonButton
            text="Close"
            clipPath={false}
            onClick={() => setShowInfo(false)}
            className="py-2"
          />
        </div>
      </div>
    )}
    </>
  )
}
