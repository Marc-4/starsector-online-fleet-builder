import { resolveHullModSpriteUrl } from "#/lib/csvParser"
import type { hullMod } from "#/types"
import CommonButton from "../commonBtn"
import type { AssignedHullmod, BuiltInHullmod } from "../../hooks/useLoadoutOp"

type Props = {
  assignedHullmods: AssignedHullmod[]
  builtInHullmods: BuiltInHullmod[]
  onHoverHullmod: (mod: hullMod | null) => void
  onRemoveHullmod: (id: string) => void
  onAdd: () => void
}

export default function HullmodRoster({
  assignedHullmods,
  builtInHullmods,
  onHoverHullmod,
  onRemoveHullmod,
  onAdd
}: Props) {
  return (
    <div className="flex gap-1 flex-col items-end">
      <div className="flex flex-col gap-1 items-end max-h-56 overflow-y-auto">
        {builtInHullmods.map(({ id, mod }) => {
          const spriteUrl = resolveHullModSpriteUrl(mod.sprite)
          return (
            <button
              type="button"
              key={`built-in-${id}`}
              title="Built into this hull"
              className="flex items-center gap-1 text-sm"
              onMouseEnter={() => onHoverHullmod(mod)}
              onMouseLeave={() => onHoverHullmod(null)}
              onFocus={() => onHoverHullmod(mod)}
              onBlur={() => onHoverHullmod(null)}
              onTouchStart={() => onHoverHullmod(mod)}
              onTouchEnd={() => onHoverHullmod(null)}
              onTouchCancel={() => onHoverHullmod(null)}
            >
              <span className="text-white font-bold [-webkit-text-stroke:0.5px_var(--color-gray-950)]">
                {mod.name}
              </span>
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
            </button>
          )
        })}
        {assignedHullmods.map(({ id, mod, cost }) => {
          const spriteUrl = resolveHullModSpriteUrl(mod.sprite)
          return (
            <button
              type="button"
              key={id}
              className="flex items-center gap-1 text-sm"
              onMouseEnter={() => onHoverHullmod(mod)}
              onMouseLeave={() => onHoverHullmod(null)}
              onFocus={() => onHoverHullmod(mod)}
              onBlur={() => onHoverHullmod(null)}
              onTouchStart={() => onHoverHullmod(mod)}
              onTouchEnd={() => onHoverHullmod(null)}
              onTouchCancel={() => onHoverHullmod(null)}
            >
              <span className="text-cyan-100">{mod.name}</span>
              <span className="text-amber-300 text-lg font-bold ">{cost}</span>

              <CommonButton
                cutAllCorners
                text="-"
                aria-label={`Remove ${mod.name}`}
                className=" w-fit px-3"
                onClick={() => onRemoveHullmod(id)}
              />
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
            </button>
          )
        })}
      </div>
      <CommonButton
        text="Add"
        className="w-32 py-0.5 self-end"
        onClick={onAdd}
      />
      <CommonButton
        disabled
        text="Build in"
        className="w-32 disabled:opacity-50 disabled:cursor-not-allowed bg-lime-700 py-0.5 self-end"
      />
    </div>
  )
}
