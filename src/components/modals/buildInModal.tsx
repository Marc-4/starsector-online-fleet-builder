import { useEffect, useState } from "react"
import { MAX_SMODS } from "#/hullModData"
import { resolveHullModSpriteUrl } from "#/lib/csvParser"
import type { hullMod } from "#/types"
import type { AssignedHullmod } from "../../hooks/useLoadoutOp"
import CommonButton from "../commonBtn"
import HullmodTooltip from "../hullmodTooltip"

export default function BuildInModal({
  assignedHullmods,
  smodCount,
  onClose,
  onBuildIn
}: {
  assignedHullmods: AssignedHullmod[]
  smodCount: number
  onClose: () => void
  onBuildIn: (id: string) => void
}) {
  const [hovered, setHovered] = useState<hullMod | null>(null)
  const full = smodCount >= MAX_SMODS
  // 0-OP hullmods gain nothing from being built in — leave them out so they
  // don't waste one of the limited S-mod slots.
  const buildable = assignedHullmods.filter(({ cost }) => cost > 0)

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-transparent cursor-default"
      />
      <div className="fixed inset-0 z-40 flex gap-1 w-[90%] max-lg:flex-col mx-auto h-full justify-center items-center pointer-events-none">
        {hovered ? (
          <div className="flex w-[95%] sm:w-[80%] lg:w-[85%] xl:w-[80%] 2xl:w-[70%] min-w-80 h-fit max-h-full overflow-auto">
            <HullmodTooltip hullmod={hovered} />
          </div>
        ) : (
          <div
            className="flex w-[95%] sm:w-[80%] lg:w-[85%] xl:w-[80%] 2xl:w-[70%] min-w-80 opacity-0 h-64 pointer-events-none"
            aria-hidden="true"
          />
        )}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Build in hullmod"
          className="relative flex items-center w-full min-w-80 justify-center pointer-events-none bg-gray-950"
        >
          <div className="flex w-full z-40 flex-col gap-2 p-1 border border-lime-200 pointer-events-auto shadow-xl">
            <div className="flex m-1 mb-0 p-1 pb-0 gap-1 justify-between items-start">
              <div className="flex flex-col">
                <h2 className="text-lime-200 text-sm">
                  Build in hullmod ({smodCount}/{MAX_SMODS})
                </h2>
                <p className="text-cyan-200/60 text-xs">
                  {full
                    ? "S-mod limit reached — un-build one to swap."
                    : "Built-in hullmods cost 0 OP and gain their S-mod bonus."}
                </p>
              </div>
              <CommonButton
                text="x"
                onClick={onClose}
                clipPath={false}
                className="cursor-pointer rounded-xs w-7 h-7 px-2 font-bold hover:brightness-110 text-xl text-cyan-200 flex items-center justify-center shrink-0"
              />
            </div>

            <div className="w-full flex-1 flex flex-col gap-0 p-2 pt-0 max-h-72 min-h-72 overflow-auto">
              {buildable.length === 0 && (
                <div className="text-cyan-200/60 text-sm text-center py-8">
                  {assignedHullmods.length === 0
                    ? "No hullmods installed — install one first, then build it in."
                    : "Nothing worth building in — the installed hullmods already cost 0 OP."}
                </div>
              )}
              {buildable.map(({ id, mod }) => {
                const spriteUrl = resolveHullModSpriteUrl(mod.sprite)
                return (
                  <button
                    type="button"
                    onClick={() => {
                      if (full) return
                      onBuildIn(id)
                    }}
                    key={id}
                    onMouseEnter={() => setHovered(mod)}
                    onMouseLeave={() => setHovered(null)}
                    className={`grid w-full ${full ? "cursor-not-allowed brightness-50" : "cursor-pointer hover:bg-cyan-950/60"} grid-cols-[2rem_minmax(0,1fr)_5rem_8rem] items-center gap-2 px-2 py-1 text-left text-sm `}
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
                    <span className="truncate text-cyan-100">{mod.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
