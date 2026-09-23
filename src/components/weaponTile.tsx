import { useEffect, useState } from "react"
import { getWeaponStats } from "#/lib/csvParser"
import { getWeaponMountType } from "#/lib/weaponCompat"
import { BuildSprite } from "#/lib/weaponSpriteHelper"
import type { weapon, weaponStats, weaponType } from "#/types"
import CommonButton from "./commonBtn"
import WeaponTooltip from "./weaponTooltip"

type Props = {
  weapon: weapon
  allWeaponStats: weaponStats[]
  /** Effective OP cost after hullmod discounts; falls back to CSV OPs. */
  opCost?: number
  onSelect?: (weapon: weapon) => void
  onRemove?: (weapon: weapon) => void
  mounted?: boolean
  disabled?: boolean
  onClose: () => void
  onHoverStart: (weapon: weapon) => void
  onHoverEnd:() => void
}

export const TYPE_COLOR_MAP: Record<weaponType, string> = {
  BALLISTIC: "yellow",
  ENERGY: "cyan",
  MISSILE: "green",
  HYBRID: "orange",
  COMPOSITE: "lime",
  SYNERGY: "turquoise",
  UNIVERSAL: "gray",
  SYSTEM: "gray",
  DECORATIVE: "gray"
} as const

export default function WeaponTile({
  weapon: w,
  allWeaponStats,
  opCost,
  onSelect,
  onRemove,
  onClose,
  mounted,
  disabled,
  onHoverStart,
  onHoverEnd
}: Props) {
  const stats = getWeaponStats({ weapon: w, weaponStats: allWeaponStats })
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
      onMouseEnter={() => onHoverStart(w)}
      onMouseLeave={() => onHoverEnd()}
      onTouchStart={() => onHoverStart(w)}
      onFocus={() => onHoverStart(w)}
      onBlur={() => onHoverEnd()}
      type="button"
      disabled={disabled && !mounted}
      onClick={() => {
        if (mounted) {
          onRemove?.(w)
        } else {
          if (disabled) return
          onSelect?.(w)
        }
        onClose()
      }}
      title={
        mounted
          ? "Mounted. click to unmount"
          : disabled
            ? "Not enough OP"
            : "Click to mount"
      }
      className={`relative w-full min-h-16 flex gap-3 px-3 py-2 border bg-gray-950/40 text-left pointer-events-auto shrink-0 touch-manipulation ${mounted ? "border-amber-300 cursor-pointer hover:bg-cyan-900/40 hover:border-cyan-600" : disabled ? "border-cyan-950 opacity-40 cursor-not-allowed" : "border-cyan-800 cursor-pointer hover:bg-cyan-900/40 hover:border-cyan-600"}`}
    >
      <div
        className="relative border w-16 h-16 shrink-0 flex items-center justify-center overflow-hidden"
        style={{ borderColor: TYPE_COLOR_MAP[getWeaponMountType(w)] ?? "gray" }}
      >
        <BuildSprite weapon={w} naturalSize />
      </div>
      <div className="flex-1 min-w-0 max-lg:pr-10">
        <p className="text-cyan-100 text-sm truncate font-semibold w-full">
          {stats?.name ?? w.id}
        </p>
        <p className="text-amber-300 text-xs truncate">
          {stats?.primaryRoleStr}, range {stats?.range}
        </p>
      </div>
      <div className="absolute bottom-0 h-fit right-1 flex flex-col items-end gap-0 shrink-0">
        <span className="text-amber-300 text-md">
          {opCost ?? (stats ? `${stats.OPs ?? "-"}` : "")}
        </span>
        <span className="text-gray-400 text-[11px]">ORDINANCE POINTS</span>
      </div>
      <span className="absolute top-1 right-1 lg:hidden">
        <span
          role="button"
          tabIndex={0}
          aria-label={`Show ${stats?.name ?? w.id} info`}
          title={`${stats?.name ?? w.id} info`}
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
        aria-label={`${stats?.name ?? w.id} info`}
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      >
        <button
          type="button"
          aria-label="Close weapon info"
          onClick={() => setShowInfo(false)}
          className="absolute inset-0 bg-gray-950/60 cursor-default"
        />
        <div className="relative z-10 flex w-full sm:w-96 max-h-[80dvh] flex-col gap-2 overflow-auto rounded-t-2xl sm:rounded-none border border-cyan-200 bg-gray-950 p-2 shadow-xl">
          <WeaponTooltip weapon={w} allWeaponStats={allWeaponStats} />
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
