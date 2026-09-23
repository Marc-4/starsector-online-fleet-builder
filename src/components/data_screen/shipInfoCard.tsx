import {
  getDeploymentCostDelta,
  getFluxMult,
  getMaxCr,
  getSensorMults,
  getVentMult
} from "#/hullModData"
import { getModifiedStat } from "#/lib/statModifier"
import type { completeShip } from "#/types"

type Stats = completeShip["stats"]

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

function shieldLabel(stats: Stats) {
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

function ModMark({
  base,
  current,
  invert = false
}: {
  base: unknown
  current: unknown
  invert?: boolean
}) {
  if (typeof base !== "number" || typeof current !== "number") return null
  if (!Number.isFinite(base) || !Number.isFinite(current)) return null
  const diff = Math.round((current - base) * 10000) / 10000
  if (diff === 0) return null
  const good = invert ? diff < 0 : diff > 0
  const positive = diff > 0
  return (
    <span className={good ? "text-lime-400" : "text-orange-400"}>
      {" "}
      ({positive ? `+` : ``}
      {diff})
    </span>
  )
}

/** Data-driven numeric row: value + hullmod delta against base stats. */
type NumSpec = {
  label: string
  color: string
  get: (s: Stats) => unknown
  invert?: boolean
  suffix?: string
}

function NumRow({ spec, s, b }: { spec: NumSpec; s: Stats; b?: Stats }) {
  const current = spec.get(s)
  return (
    <Row
      label={spec.label}
      value={
        <span className={spec.color}>
          {fmt(current)}
          {spec.suffix}
          {b && (
            <ModMark
              base={spec.get(b)}
              current={current}
              invert={spec.invert}
            />
          )}
        </span>
      }
    />
  )
}

const LOGISTICS_A: NumSpec[] = [
  {
    label: "CR per deployment",
    color: "text-cyan-50",
    get: (s) => s["CR to deploy"],
    invert: true,
    suffix: "%"
  },
  {
    label: "Recovery rate (per day)",
    color: "text-cyan-50",
    get: (s) => s["cr %/day"],
    suffix: "%"
  },
  // NOTE: "Recovery cost (supplies)" is rendered as a custom row below so the
  // hullmod deployment-cost delta (e.g. Converted Hangar) is included.
  {
    label: "Peak performance (sec)",
    color: "text-cyan-50",
    get: (s) => s["peak CR sec"]
  },
  {
    label: "Crew complement",
    color: "text-teal-400",
    get: (s) => s["min crew"],
    invert: true
  },
  {
    label: "Ordnance points",
    color: "text-amber-300",
    get: (s) => s["ordnance points"]
  }
]

const LOGISTICS_B: NumSpec[] = [
  // NOTE: "Maintenance (supplies/mo)" is rendered as a custom row below so
  // the hullmod deployment-cost delta (e.g. Converted Hangar) is included.
  { label: "Cargo capacity", color: "text-amber-200", get: (s) => s.cargo },
  { label: "Maximum crew", color: "text-teal-400", get: (s) => s["max crew"] },
  {
    label: "Skeleton crew required",
    color: "text-teal-400",
    get: (s) => s["min crew"],
    invert: true
  },
  { label: "Fuel capacity", color: "text-orange-400", get: (s) => s.fuel },
  { label: "Maximum burn", color: "text-amber-300", get: (s) => s["max burn"] },
  {
    label: "Fuel / light year, jump cost",
    color: "text-amber-300",
    get: (s) => s["fuel/ly"],
    invert: true
  }
]

const COMBAT_TOP: NumSpec[] = [
  { label: "Hull Integrity", color: "text-amber-300", get: (s) => s.hitpoints },
  {
    label: "Armor rating",
    color: "text-amber-300",
    get: (s) => s["armor rating"]
  }
]

const PHASE_ROWS: NumSpec[] = [
  {
    label: "Phase cloak upkeep/sec",
    color: "text-amber-300",
    get: (s) => s["phase upkeep"],
    invert: true
  },
  {
    label: "Phase cloak activation cost",
    color: "text-amber-300",
    get: (s) => s["phase cost"],
    invert: true
  }
]

export default function ShipInfoCard({
  ship,
  baseShip,
  hullmodIds = [],
  smodIds = [],
  capacitors = 0,
  vents = 0,
  fightersOp = 0
}: {
  ship: completeShip
  baseShip?: completeShip
  hullmodIds?: string[]
  /** Player-built S-mods (subset of hullmodIds): only these get S-mod bonuses. */
  smodIds?: string[]
  capacitors?: number
  vents?: number
  fightersOp?: number
}) {
  const s = ship.stats
  const m = ship.meta
  const b = baseShip?.stats

  const sensorMults = getSensorMults(hullmodIds, smodIds)
  const sensorBase = sensorProfileByHullSize(m.hullSize)
  const sensorProfile = sensorBase * sensorMults.profile
  const sensorStrength = sensorBase * sensorMults.strength

  const fluxCap = getModifiedStat(s, "max flux", { capacitors })
  const fluxDiss = getModifiedStat(s, "flux dissipation", {
    vents: vents * getVentMult(hullmodIds)
  })
  const fluxCapBonus = fluxCap.bonus
  const fluxDissBonus = fluxDiss.bonus
  // Design Compromises scales the finished totals (base + caps/vents + hullmods).
  const fluxMult = getFluxMult(hullmodIds)
  const fluxCapTotal = Math.round((s["max flux"] + fluxCapBonus) * fluxMult)
  const fluxDissTotal = Math.round(
    (s["flux dissipation"] + fluxDissBonus) * fluxMult
  )

  const baseDp = Number((b ?? s)["supplies/mo"] ?? 0)
  const deploymentDelta = getDeploymentCostDelta(hullmodIds, {
    fightersOp,
    hullSize: m.hullSize
  })

  const shieldUpkeepCur = b
    ? (s["shield upkeep"] as number) * (b["flux dissipation"] as number)
    : null
  const shieldUpkeepBase = b
    ? (b["shield upkeep"] as number) * (b["flux dissipation"] as number)
    : null

  return (
    <div
      role="dialog"
      aria-label={`${m.hullName} info`}
      className="w-max min-w-full font-serif text-lg bg-gray-950 border border-gray-700 px-5 py-2 shadow-2xl"
    >
      <div className="grid grid-cols-[1.8fr_1fr] text-center text-cyan-100 bg-cyan-800 border-b border-gray-700 pb-0.5 mb-1 max-lg:grid-cols-1 max-lg:gap-0.5">
        <p className="max-lg:hidden">Logistical data</p>
        <p className="max-lg:hidden">Combat performance</p>
        <p className="hidden max-lg:block">Logistical and Combat Data</p>
      </div>

      <div className="grid grid-cols-[1.7fr_1fr] gap-8 max-lg:gap-4 max-lg:grid-cols-1">
        <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1 max-lg:gap-2">
          <div className="flex flex-col gap-0.5 text-white">
            {LOGISTICS_A.slice(0, 2).map((spec) => (
              <NumRow key={spec.label} spec={spec} s={s} b={b} />
            ))}
            <Row
              label="Recovery cost (supplies)"
              value={
                <span className="text-cyan-50">
                  {fmt(Math.round(Number(s["supplies/rec"] ?? 0) + deploymentDelta))}
                  {b && (
                    <ModMark
                      base={b["supplies/rec"]}
                      current={
                        Number(s["supplies/rec"] ?? 0) + deploymentDelta
                      }
                      invert
                    />
                  )}
                </span>
              }
            />
            <Row
              label="Maximum CR"
              value={
                <span className="text-cyan-50">
                  {getMaxCr(hullmodIds)}%
                  <ModMark base={100} current={getMaxCr(hullmodIds)} />
                </span>
              }
            />
            <Row
              label="Deployment points"
              value={
                <span className="text-cyan-300">
                  {fmt(baseDp + deploymentDelta)}
                  <ModMark invert base={baseDp} current={baseDp + deploymentDelta} />
                </span>
              }
            />
            {LOGISTICS_A.slice(2, 4).map((spec) => (
              <NumRow key={spec.label} spec={spec} s={s} b={b} />
            ))}
            <Row
              label="Hull size"
              value={
                <span className="text-amber-300">
                  {hullSizeLabel(m.hullSize)}
                </span>
              }
            />
            {LOGISTICS_A.slice(4).map((spec) => (
              <NumRow key={spec.label} spec={spec} s={s} b={b} />
            ))}
          </div>
          <div className="flex flex-col gap-0.5 text-white">
            <Row
              label="Maintenance (supplies/mo)"
              value={
                <span className="text-cyan-50">
                  {fmt(Number(s["supplies/mo"] ?? 0) + deploymentDelta)}
                  {b && (
                    <ModMark
                      base={b["supplies/mo"]}
                      current={Number(s["supplies/mo"] ?? 0) + deploymentDelta}
                      invert
                    />
                  )}
                </span>
              }
            />
            {LOGISTICS_B.slice(1).map((spec) => (
              <NumRow key={spec.label} spec={spec} s={s} b={b} />
            ))}
            <Row
              label="Sensor profile"
              value={
                <span className="text-amber-300">
                  {sensorProfile}
                  <ModMark base={sensorBase} current={sensorProfile} invert />
                </span>
              }
            />
            <Row
              label="Sensor strength"
              value={
                <span className="text-amber-300">
                  {sensorStrength}
                  <ModMark base={sensorBase} current={sensorStrength} />
                </span>
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-0.5 text-white">
          {COMBAT_TOP.map((spec) => (
            <NumRow key={spec.label} spec={spec} s={s} b={b} />
          ))}
          <Row
            label="Defense"
            value={<span className="text-amber-300">{shieldLabel(s)}</span>}
          />
          <Row
            label="Shield arc"
            value={
              s["shield arc"] ? (
                <span className="text-amber-300">
                  {s["shield arc"]}
                  {b && (
                    <ModMark base={b["shield arc"]} current={s["shield arc"]} />
                  )}
                </span>
              ) : (
                "—"
              )
            }
          />
          {s["phase upkeep"] &&
            PHASE_ROWS.map((spec) => (
              <NumRow key={spec.label} spec={spec} s={s} b={b} />
            ))}
          {s["shield upkeep"] && (
            <>
              <Row
                label="Shield upkeep/sec"
                value={
                  <span className="text-amber-300">
                    {shieldUpkeepCur}
                    {shieldUpkeepBase !== null && (
                      <ModMark
                        base={shieldUpkeepBase}
                        current={shieldUpkeepCur}
                        invert
                      />
                    )}
                  </span>
                }
              />
              <Row
                label="Shield flux/damage"
                value={
                  <span className="text-amber-300">
                    {s["shield efficiency"]}
                    {b && (
                      <ModMark
                        base={b["shield efficiency"]}
                        current={s["shield efficiency"]}
                        invert
                      />
                    )}
                  </span>
                }
              />
            </>
          )}
          <Row
            label="Flux capacity"
            value={
              <span className="text-amber-300">
                {fluxCapTotal}
                <ModMark base={b?.["max flux"]} current={fluxCapTotal} />
              </span>
            }
          />
          <Row
            label="Flux dissipation"
            value={
              <span className="text-amber-300">
                {fluxDissTotal}
                <ModMark
                  base={b?.["flux dissipation"]}
                  current={fluxDissTotal}
                />
              </span>
            }
          />
          <Row
            label="Top speed"
            value={
              <span className="text-amber-300">
                {s["max speed"]}
                {b && (
                  <ModMark base={b["max speed"]} current={s["max speed"]} />
                )}
              </span>
            }
          />
        </div>
      </div>

      <div className="mt-2 text-white">
        <div className="flex gap-6">
          <span className="text-gray-200/90">System:</span>
          <span className="text-amber-300">{fmt(s["system id"])}</span>
        </div>
      </div>
    </div>
  )
}
