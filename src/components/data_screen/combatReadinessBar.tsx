export default function CombatReadinessBar({
  cr,
  onChange
}: {
  cr: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex p-2 w-fit flex-col justify-center shadow-md">
      <div className="flex gap-2 items-center">
        <div className="relative w-80 h-4 rounded-xs border border-cyan-700 bg-linear-to-b from-[#cefafe] via-white to-[#cefafe] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gray-950 pointer-events-none"
            style={{ width: `${100 - cr}%`, right: 0, left: "auto" }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-950 pointer-events-none -translate-x-1/2 shadow-[0.5px_0_5px_0.5px_rgba(255,255,255,0.9)]"
            style={{ left: `${cr}%` }}
            aria-hidden
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-950 pointer-events-none -translate-x-1/2"
            style={{ left: `${cr - 1}%` }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={cr}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Combat Readiness"
          />
        </div>
        <p className="text-amber-300 text-base w-12 text-right">{cr}%</p>
      </div>
      <h1 className="text-cyan-100">Combat Readiness</h1>
    </div>
  )
}
