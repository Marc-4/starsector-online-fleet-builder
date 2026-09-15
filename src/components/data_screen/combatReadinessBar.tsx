export default function CombatReadinessBar({
  cr,
  maxCr = 100
}: {
  cr: number
  /** Effective max CR after hullmod reductions (default 100). */
  maxCr?: number
}) {
  const penalty = Math.max(0, Math.round((100 - maxCr) * 10000) / 10000)
  return (
    <div className="flex p-2 w-fit flex-col justify-center">
      <div className="flex gap-2 items-center">
        <div className="relative w-80 max-sm:w-56 h-4 ss-cr-bar">
          <div
            className="absolute inset-y-0 left-0 bg-gray-950 pointer-events-none"
            style={{ width: `${100 - cr}%`, right: 0, left: "auto" }}
          />
          {penalty > 0 && (
            <div
              className="absolute inset-y-0 bg-gray-950/60 pointer-events-none"
              style={{ width: `${penalty}%`, right: 0, left: "auto" }}
              title={`Max CR reduced to ${maxCr}% by hullmods`}
            />
          )}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-950 pointer-events-none -translate-x-1/2 shadow-[0.5px_0_5px_0.5px_rgba(255,255,255,0.9)]"
            style={{ left: `${cr}%` }}
            aria-hidden
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-950 pointer-events-none -translate-x-1/2"
            style={{ left: `${cr - 1}%` }}
          />
          <div
            role="progressbar"
            aria-label="Combat Readiness"
            aria-valuenow={cr}
            aria-valuemin={0}
            aria-valuemax={maxCr}
            className="absolute inset-0 w-full h-full"
          />
        </div>
        <p className="ss-amber text-base w-12 text-right">{cr}%</p>
      </div>
      <h1 className="text-cyan-100">Combat Readiness</h1>
    </div>
  )
}
