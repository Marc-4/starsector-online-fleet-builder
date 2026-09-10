import { getWeaponStats } from "#/lib/csvParser"
import { BuildSprite } from "#/lib/weaponSpriteHelper"
import type { weapon, weaponStats } from "#/types"

type Props = {
  weapon: weapon
  allWeaponStats: weaponStats[]
  onSelect?: (weapon: weapon) => void
}

export default function WeaponTile({
  weapon: w,
  allWeaponStats,
  onSelect
}: Props) {
  const stats = getWeaponStats({ weapon: w, weaponStats: allWeaponStats })
  const manufacturer = (stats?.["tech/manufacturer"] || "Common")
    .toString()
    .trim()

  // Static mount preview rendered by BuildSprite (see weaponSpriteAnalysis.md
  // §§1-2: layered under/base/gun + loaded missiles at offsets, all at
  // natural PNG size). Beams: base only. Rotary (numFrames): first frame.
  // Missiles with RENDER_LOADED_MISSILES: base + missile sprites at offsets.

  return (
    <button
      type="button"
      onClick={() => onSelect?.(w)}
      className="w-full min-h-14 cursor-pointer flex items-center gap-3 px-3 py-2 border border-cyan-800 bg-gray-950/40 hover:bg-cyan-900/40 hover:border-cyan-600 text-left pointer-events-auto shrink-0"
    >
      <div className="relative w-20 h-20 shrink-0 flex items-center justify-center overflow-hidden">
        <BuildSprite weapon={w} naturalSize />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-cyan-100 text-sm truncate font-semibold">
          {stats?.name ?? w.id}
        </p>
        <p
          className="text-cyan-300 text-xs truncate"
          title={manufacturer || undefined}
        >
          {w.type} • {w.size} • {w.specClass}
          {manufacturer ? ` • ${manufacturer}` : ""}
        </p>
      </div>
      <div className="flex flex-col items-end gap-0 shrink-0">
        <span className="text-amber-300 text-xs">
          {stats ? `${stats.OPs ?? "-"} OP` : ""}
        </span>
        <span className="text-cyan-200 text-[10px]">
          {stats?.range ? `${stats.range} su` : ""}
        </span>
      </div>
    </button>
  )
}
