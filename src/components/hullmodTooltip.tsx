import { describeHullmod } from "#/hullModData"
import type { hullMod } from "#/types"

export default function HullmodTooltip({ hullmod }: { hullmod: hullMod }) {
  return (
    <div className="flex w-full font-serif flex-col gap-1 border border-cyan-200 bg-gray-950 p-2 text-lg">
      <p className="text-cyan-200">{hullmod.name}</p>
      {hullmod.desc && (
        <p className="whitespace-pre-line leading-tight text-md text-cyan-50/90">
          {describeHullmod(hullmod)}
        </p>
      )}
      {hullmod.sModDesc && (
        <>
          <p className="bg-lime-900/60 py-0.5 text-center text-md text-lime-200">
            S-mod bonus
          </p>
          <p className="whitespace-pre-line text-md leading-tight text-cyan-100/90">
            {hullmod.sModDesc}
          </p>
        </>
      )}
    </div>
  )
}
