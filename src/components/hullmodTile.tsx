import { getHullModDesignType, resolveHullModSpriteUrl } from "#/lib/csvParser"
import type { hullMod } from "#/types"

function costColor(cost: number): string {
  if (cost >= 25) return "text-amber-400"
  if (cost >= 15) return "text-yellow-300"
  return "text-amber-200/90"
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
  onClose,
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
  onClose: () => void
  onHover: (h: hullMod | null) => void
}) {
  const designType = getHullModDesignType(hullmod)
  const isCommon = designType.toLowerCase() === "common"
  const spriteUrl = resolveHullModSpriteUrl(hullmod.sprite)
  return (
    <button
      type="button"
      disabled={locked}
      title={
        disabledReason ?? (disabled && !installed ? "Not enough OP" : undefined)
      }
      onClick={() => {
        if (locked) return
        if (disabled && !installed) return
        onSelect?.(hullmod)
        onClose()
      }}
      onMouseEnter={() => onHover(hullmod)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(hullmod)}
      onBlur={() => onHover(null)}
      className={`grid w-full grid-cols-[2rem_minmax(0,1fr)_10rem_5rem_6rem] items-center gap-2 px-2 py-1 text-left text-sm ${locked ? "cursor-default opacity-60" : disabled && !installed ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-cyan-950/60"}`}
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
        className={`truncate ${installed ? "text-amber-300" : "text-cyan-100"}`}
      >
        {hullmod.name}
      </span>
      <span
        className={`truncate text-center text-xs ${isCommon ? "text-cyan-200/50" : "text-lime-400/80"}`}
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
    </button>
  )
}
