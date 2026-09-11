import { getWeaponStats } from "#/lib/csvParser"
import { BuildSprite } from "#/lib/weaponSpriteHelper"
import type { weapon, weaponStats, weaponType } from "#/types"

type Props = {
  weapon: weapon
  allWeaponStats: weaponStats[]
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
  onSelect,
  onRemove,
  onClose,
  mounted,
  disabled,
  onHoverStart,
  onHoverEnd
}: Props) {
  const stats = getWeaponStats({ weapon: w, weaponStats: allWeaponStats })

  return (
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
          ? "Mounted — click to unmount"
          : disabled
            ? "Not enough OP"
            : "Click to mount"
      }
      className={`relative w-full min-h-16 flex gap-3 px-3 py-2 border bg-gray-950/40 text-left pointer-events-auto shrink-0 ${mounted ? "border-amber-300 cursor-pointer hover:bg-cyan-900/40 hover:border-cyan-600" : disabled ? "border-cyan-950 opacity-40 cursor-not-allowed" : "border-cyan-800 cursor-pointer hover:bg-cyan-900/40 hover:border-cyan-600"}`}
    >
      <div
        className="relative border w-16 h-16 shrink-0 flex items-center justify-center overflow-hidden"
        style={{ borderColor: TYPE_COLOR_MAP[w.type] ?? "gray" }}
      >
        <BuildSprite weapon={w} naturalSize />
      </div>
      <div className="flex-1 min-w-0 ">
        <p className="text-cyan-100 text-sm truncate font-semibold w-full">
          {stats?.name ?? w.id}
        </p>
        <p className="text-amber-300 text-xs truncate">
          {stats?.primaryRoleStr}, range {stats?.range}
        </p>
      </div>
      <div className="absolute bottom-0 h-fit right-1 flex flex-col items-end gap-0 shrink-0">
        <span className="text-amber-300 text-md">
          {stats ? `${stats.OPs ?? "-"}` : ""}
        </span>
        <span className="text-gray-400 text-[10px]">ORDINANCE POINTS</span>
      </div>
    </button>
  )
}
