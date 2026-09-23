import { useEffect, useState } from "react"
import { getHullModDesignType, resolveHullModSpriteUrl } from "#/lib/csvParser"
import type { hullMod } from "#/types"
import CommonButton from "./commonBtn"
import HullmodTooltip from "./hullmodTooltip"

function costColor(_cost: number): string {
  return "text-amber-300"
}

export default function HullmodTile({
  hullmod,
  cost,
  installed,
  requiresDock,
  locked,
  disabledReason,
  disabled,
  onSelect,
  onHover
}: {
  hullmod: hullMod
  cost: number
  installed: boolean
  requiresDock: boolean
  locked?: boolean
  disabledReason?: string | null
  disabled?: boolean
  onSelect?: (hullmod: hullMod) => void
  onHover: (h: hullMod | null) => void
}) {
  const designType = getHullModDesignType(hullmod)
  const isCommon = designType.toLowerCase() === "common"
  const spriteUrl = resolveHullModSpriteUrl(hullmod.sprite)
  // Touch has no hover and the modal's tooltip sidecar is desktop-only,
  // so mobile rows get an info button that opens the tooltip in a sheet.
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
        disabled={locked}
        title={
          disabledReason ??
          (disabled && !installed ? "Not enough OP" : undefined)
        }
        onClick={() => {
          if (locked) return
          if (disabled && !installed) return
          onSelect?.(hullmod)
        }}
        onMouseEnter={() => onHover(hullmod)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(hullmod)}
        onBlur={() => onHover(null)}
        className={`grid w-full grid-cols-[2rem_minmax(0,1fr)_auto_auto_2rem] sm:grid-cols-[2rem_minmax(0,1fr)_10rem_5rem_6rem] items-center gap-2 px-2 py-2 sm:py-1 min-h-12 text-left text-sm touch-manipulation ${locked ? "cursor-default opacity-60" : disabled && !installed ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-cyan-950/60"}`}
      >
        {spriteUrl ? (
          <img
            src={spriteUrl}
            alt=""
            draggable={false}
            className="h-8 w-8 object-contain"
            loading="lazy"
          />
        ) : (
          <span className="h-8 w-8 border border-cyan-800 bg-cyan-900/30" />
        )}
        <span
          className={`truncate max-sm:text-xs ${installed ? "text-amber-300" : "text-cyan-100"}`}
        >
          {hullmod.name}
        </span>
        <span
          className={`truncate text-center text-xs max-sm:hidden ${isCommon ? "text-cyan-200/50" : "text-lime-400/80"}`}
        >
          {designType}
        </span>
        <span className={`text-center ${costColor(cost)}`}>{cost}</span>
        <span className="text-center text-xs text-cyan-200/60">
          {locked ? (
            <span className="text-cyan-200/50">Built-in</span>
          ) : installed ? (
            <span className="text-amber-300">✓</span>
          ) : requiresDock ? (
            "Dock"
          ) : (
            ""
          )}
        </span>
        <span className="flex justify-center lg:hidden">
          <span
            role="button"
            tabIndex={0}
            aria-label={`Show ${hullmod.name} info`}
            title={`${hullmod.name} info`}
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
            className="relative flex h-4 w-4 items-center justify-center rounded-full border border-cyan-700 text-[10px] leading-none text-cyan-200 touch-manipulation after:absolute after:-inset-2 after:content-['']"
          >
            i
          </span>
        </span>
      </button>
      {showInfo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${hullmod.name} info`}
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        >
          <button
            type="button"
            aria-label="Close hullmod info"
            onClick={() => setShowInfo(false)}
            className="absolute inset-0 bg-gray-950/60 cursor-default"
          />
          <div className="relative z-10 flex w-full sm:w-96 max-h-[80dvh] flex-col gap-2 overflow-auto rounded-t-2xl sm:rounded-none border border-cyan-200 bg-gray-950 p-2 shadow-xl">
            <HullmodTooltip hullmod={hullmod} />
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
