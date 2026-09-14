import type { completeShip } from "#/types"
import { getModifiedStat } from "#/lib/statModifier"
import { StatValue } from "#/lib/textColoring"

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
  // Defense slot wins: phasecloak / damper / canister_flak live here, while
  // the shield type column reuses "PHASE" for all of them.
  const defense = String(stats["defense id"] ?? "").toLowerCase()
  if (defense === "phasecloak") return "Phase Cloak"
  if (defense === "damper") return "Damper Field"
  if (defense) {
    return defense
      .split("_")
      .map((w) => w.replace(/\b\w/g, (c) => c.toUpperCase()))
      .join(" ")
  }
  const type = String(stats["shield type"] ?? "").toUpperCase()
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

  const fluxCap = getModifiedStat(s, "max flux", { capacitors })
  const fluxDiss = getModifiedStat(s, "flux dissipation", { vents })
  const fluxCapBonus = fluxCap.bonus
  const fluxDissBonus = fluxDiss.bonus
  const fluxCapTotal = fluxCap.total
  const fluxDissTotal = fluxDiss.total

  return (
    <div
      role="dialog"
      aria-label={`${m.hullName} info`}
      className="w-[980px] max-w-[94vw] font-serif text-lg bg-gray-950 border border-gray-700 px-5 py-2 shadow-2xl"
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
                <span className="text-cyan-50">{fmt(s["CR to deploy"])}%</span>
              }
            />
            <Row
              label="Recovery rate (per day)"
              value={
                <span className="text-cyan-50">{fmt(s["cr %/day"])}%</span>
              }
            />
            <Row
              label="Recovery cost (supplies)"
              value={
                <span className="text-cyan-50">{fmt(s["supplies/rec"])}</span>
              }
            />
            <Row
              label="Deployment points"
              value={
                <span className="text-cyan-50">{fmt(s["fleet pts"])}</span>
              }
            />
            <Row
              label="Peak performance (sec)"
              value={
                <span className="text-cyan-50">{fmt(s["peak CR sec"])}</span>
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
                <span className="text-cyan-50">{fmt(s["supplies/mo"])}</span>
              }
            />
            <Row
              label="Cargo capacity"
              value={<span className="text-cyan-50">{fmt(s.cargo)}</span>}
            />
            <Row
              label="Maximum crew"
              value={<span className="text-cyan-50">{fmt(s["max crew"])}</span>}
            />
            <Row
              label="Skeleton crew required"
              value={<span className="text-cyan-50">{fmt(s["min crew"])}</span>}
            />
            <Row
              label="Fuel capacity"
              value={<span className="text-cyan-50">{fmt(s.fuel)}</span>}
            />
            <Row
              label="Maximum burn"
              value={<span className="text-cyan-50">{fmt(s["max burn"])}</span>}
            />
            <Row
              label="Fuel / light year, jump cost"
              value={<span className="text-cyan-50">{fmt(s["fuel/ly"])}</span>}
            />
            <Row
              label="Sensor profile"
              value={
                <span className="text-cyan-50">
                  {sensorProfileByHullSize(m.hullSize)}
                </span>
              }
            />
            <Row
              label="Sensor strength"
              value={
                <span className="text-cyan-50">
                  {sensorProfileByHullSize(m.hullSize)}
                </span>
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-0.5 text-white">
          <Row
            label="Hull integrity"
            value={
              <StatValue
                current={Number(s.hitpoints)}
                base={Number(s.hitpoints)}
                format={(n) => fmt(n)}
              />
            }
          />
          <Row
            label="Armor rating"
            value={
              <StatValue
                current={Number(s["armor rating"])}
                base={Number(s["armor rating"])}
                format={(n) => fmt(n)}
              />
            }
          />
          <Row
            label="Defense"
            value={<span className="text-amber-300">{shieldLabel(s)}</span>}
          />
          <Row
            label="Shield arc"
            value={
              s["shield arc"] ? (
                <StatValue
                  current={Number(s["shield arc"])}
                  base={Number(s["shield arc"])}
                  format={(n) => fmt(n)}
                />
              ) : (
                "—"
              )
            }
          />
          <Row
            label="Shield upkeep/sec"
            value={
              <StatValue
                current={Number(s["shield upkeep"])}
                base={Number(s["shield upkeep"])}
                invert
                format={(n) => fmt(n)}
              />
            }
          />
          <Row
            label="Shield flux/damage"
            value={
              <StatValue
                current={Number(s["shield efficiency"])}
                base={Number(s["shield efficiency"])}
                invert
                format={(n) => fmt(n)}
              />
            }
          />
          <Row
            label="Flux capacity"
            value={
              <span>
                <StatValue
                  current={fluxCapTotal}
                  base={fluxCap.base}
                  format={(n) => <>{n}</>}
                />
                {fluxCapBonus > 0 && (
                  <span className="text-yellow-500"> (+{fluxCapBonus})</span>
                )}
              </span>
            }
          />
          <Row
            label="Flux dissipation"
            value={
              <span>
                <StatValue
                  current={fluxDissTotal}
                  base={fluxDiss.base}
                  format={(n) => <>{n}</>}
                />
                {fluxDissBonus > 0 && (
                  <span className="text-yellow-500"> (+{fluxDissBonus})</span>
                )}
              </span>
            }
          />
          <Row
            label="Top speed"
            value={
              <StatValue
                current={Number(s["max speed"])}
                base={Number(s["max speed"])}
                format={(n) => fmt(n)}
              />
            }
          />
        </div>
      </div>

      <div className="mt-2 text-white">
        <div className="flex gap-6">
          <span className="text-gray-200/90">System:</span>
          <span className="text-amber-300">{fmt(s["system id"])}</span>
        </div>
        {/*<p className="pl-[76px] text-cyan-100/90">
          {m.hullName} ship system — {fmt(s["system id"])}.
        </p>*/}
      </div>
    </div>
  )
}
