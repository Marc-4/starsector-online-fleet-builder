import type { completeShip } from "#/types"

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 leading-tight">
      <span className="text-gray-200/90 whitespace-nowrap">{label}</span>
      <span className="text-right whitespace-nowrap">{value}</span>
    </div>
  )
}

function fmt(n: unknown) {
  if (n === null || n === undefined || n === "") return "—"
  if (typeof n === "number") return Number.isFinite(n) ? String(n) : "—"
  return String(n)
}

function sensorProfileByHullSize(hullSize: string) {
  switch (hullSize) {
    case "FRIGATE":
      return 30
    case "DESTROYER":
      return 60
    case "CRUISER":
      return 90
    case "CAPITAL_SHIP":
      return 150
    default:
      return 30
  }
}

function hullSizeLabel(hullSize: string) {
  if (hullSize === "CAPITAL_SHIP") return "Capital"
  const s = hullSize.toLowerCase().replace(/_/g, " ")
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

function shieldLabel(stats: completeShip["stats"]) {
  const type = String(stats["shield type"] ?? "").toUpperCase()
  if (type.includes("PHASE")) return "Phase Cloak"
  if (type.includes("NONE") || !stats["shield arc"]) return "—"
  if (type.includes("OMNI")) return "Omni Shield"
  if (type.includes("FRONT")) return "Front Shield"
  return fmt(stats["shield type"])
}

export default function ShipInfoCard({
  ship,
  capacitors = 0,
  vents = 0
}: {
  ship: completeShip
  capacitors?: number
  vents?: number
}) {
  const s = ship.stats
  const m = ship.meta

  const fluxCapBonus = capacitors * 200
  const fluxDissBonus = vents * 25
  const fluxCapTotal = Number(s["max flux"] ?? 0) + fluxCapBonus
  const fluxDissTotal = Number(s["flux dissipation"] ?? 0) + fluxDissBonus

  return (
    <div
      role="dialog"
      aria-label={`${m.hullName} info`}
      className="w-[980px] max-w-[94vw] font-serif text-lg bg-black/95 border border-gray-700 px-5 py-2 shadow-2xl"
    >
      <div className="grid grid-cols-2 text-center text-cyan-100 bg-cyan-800 border-b border-gray-700 pb-0.5 mb-1">
        <p>Logistical data</p>
        <p>Combat performance</p>
      </div>

      <div className="grid grid-cols-[1.7fr_1fr] gap-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-0.5 text-white">
            <Row
              label="CR per deployment"
              value={
                <span className="text-gray-100">{fmt(s["CR to deploy"])}%</span>
              }
            />
            <Row
              label="Recovery rate (per day)"
              value={
                <span className="text-gray-100">{fmt(s["cr %/day"])}%</span>
              }
            />
            <Row
              label="Recovery cost (supplies)"
              value={
                <span className="text-gray-100">{fmt(s["supplies/rec"])}</span>
              }
            />
            <Row
              label="Deployment points"
              value={
                <span className="text-gray-100">{fmt(s["fleet pts"])}</span>
              }
            />
            <Row
              label="Peak performance (sec)"
              value={
                <span className="text-gray-100">{fmt(s["peak CR sec"])}</span>
              }
            />
            <Row
              label="Crew complement"
              value={
                <span className="text-amber-300">{fmt(s["min crew"])}</span>
              }
            />
            <Row
              label="Hull size"
              value={
                <span className="text-amber-300">
                  {hullSizeLabel(m.hullSize)}
                </span>
              }
            />
            <Row
              label="Ordnance points"
              value={
                <span className="text-amber-300">
                  {fmt(s["ordnance points"])}
                </span>
              }
            />
          </div>
          <div className="flex flex-col gap-0.5 text-white">
            <Row
              label="Maintenance (supplies/mo)"
              value={
                <span className="text-gray-100">{fmt(s["supplies/mo"])}</span>
              }
            />
            <Row
              label="Cargo capacity"
              value={<span className="text-gray-100">{fmt(s.cargo)}</span>}
            />
            <Row
              label="Maximum crew"
              value={
                <span className="text-teal-300">{fmt(s["max crew"])}</span>
              }
            />
            <Row
              label="Skeleton crew required"
              value={
                <span className="text-orange-400">{fmt(s["min crew"])}</span>
              }
            />
            <Row
              label="Fuel capacity"
              value={<span className="text-orange-400">{fmt(s.fuel)}</span>}
            />
            <Row
              label="Maximum burn"
              value={
                <span className="text-gray-100">{fmt(s["max burn"])}</span>
              }
            />
            <Row
              label="Fuel / light year, jump cost"
              value={<span className="text-gray-100">{fmt(s["fuel/ly"])}</span>}
            />
            <Row
              label="Sensor profile"
              value={
                <span className="text-gray-100">
                  {sensorProfileByHullSize(m.hullSize)}
                </span>
              }
            />
            <Row
              label="Sensor strength"
              value={
                <span className="text-gray-100">
                  {sensorProfileByHullSize(m.hullSize)}
                </span>
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-0.5 text-white">
          <Row
            label="Hull integrity"
            value={<span className="text-amber-300">{fmt(s.hitpoints)}</span>}
          />
          <Row
            label="Armor rating"
            value={
              <span className="text-amber-300">
                {fmt(s["armor rating"])}
                {fluxCapBonus ? "" : ""}
              </span>
            }
          />
          <Row
            label="Defense"
            value={<span className="text-amber-300">{shieldLabel(s)}</span>}
          />
          <Row
            label="Shield arc"
            value={
              <span className="text-amber-300">
                {s["shield arc"] ? `${fmt(s["shield arc"])}` : "—"}
              </span>
            }
          />
          <Row
            label="Shield upkeep/sec"
            value={
              <span className="text-gray-100">{fmt(s["shield upkeep"])}</span>
            }
          />
          <Row
            label="Shield flux/damage"
            value={
              <span className="text-gray-100">
                {fmt(s["shield efficiency"])}
              </span>
            }
          />
          <Row
            label="Flux capacity"
            value={
              <span className="text-amber-300">
                {fluxCapTotal}
                {fluxCapBonus > 0 && (
                  <span className="text-yellow-500"> (+{fluxCapBonus})</span>
                )}
              </span>
            }
          />
          <Row
            label="Flux dissipation"
            value={
              <span className="text-amber-300">
                {fluxDissTotal}
                {fluxDissBonus > 0 && (
                  <span className="text-yellow-500"> (+{fluxDissBonus})</span>
                )}
              </span>
            }
          />
          <Row
            label="Top speed"
            value={<span className="text-gray-100">{fmt(s["max speed"])}</span>}
          />
        </div>
      </div>

      <div className="mt-2 text-white">
        <div className="flex gap-6">
          <span className="text-gray-200/90">System:</span>
          <span className="text-amber-300">{fmt(s["system id"])}</span>
        </div>
        {/*<p className="pl-[76px] text-gray-100/90">
          {m.hullName} ship system — {fmt(s["system id"])}.
        </p>*/}
      </div>
    </div>
  )
}
