import { useEffect, useMemo, useState } from "react"
import {
  applyHullmods,
  getConvertedBayFightersOp,
  getDeploymentCostDelta,
  getHighResSensorBonus,
  getSensorMults,
  getSensorProfile
} from "#/hullModData"
import { getAllWingStats } from "#/lib/csvParser"
import type { fleetEntry, wingStats } from "#/types"

// Vanilla per-hull-size contributions (from hull_mods.csv descs):
// nav_relay grants 2/3/4/5 nav rating, ecm grants 1/2/3/4 ECM rating.
const NAV_BY_HULL_SIZE: Record<string, number> = {
  FRIGATE: 2,
  DESTROYER: 3,
  CRUISER: 4,
  CAPITAL_SHIP: 5
}
const ECM_BY_HULL_SIZE: Record<string, number> = {
  FRIGATE: 1,
  DESTROYER: 2,
  CRUISER: 3,
  CAPITAL_SHIP: 4
}
// Base sensor profile by hull size (mirrors ShipInfoCard).
const SENSOR_BASE_BY_HULL_SIZE: Record<string, number> = {
  FRIGATE: 30,
  DESTROYER: 60,
  CRUISER: 90,
  CAPITAL_SHIP: 150
}

export type FleetAggregates = {
  shipCount: number
  totalDp: number
  /** Slowest ship's burn + drive stabilizer bonuses. Null when no ships. */
  maxBurn: number | null
  cargo: number
  fuelCapacity: number
  crewCapacity: number
  credits: number
  suppliesPerMonth: number
  fuelPerLy: number
  sensorStrength: number
  /** Sum of the 5 largest ship sensor profiles (vanilla rule). */
  sensorProfile: number
  ecmRating: number
  navRating: number
}

function num(n: unknown): number {
  const v = Number(n)
  return Number.isFinite(v) ? v : 0
}

export function useFleetAggregates(fleet: fleetEntry[]): FleetAggregates {
  const [allWingStats, setAllWingStats] = useState<wingStats[]>([])
  useEffect(() => {
    let cancelled = false
    void getAllWingStats().then((wings) => {
      if (!cancelled) setAllWingStats(wings)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(() => {
    const empty: FleetAggregates = {
      shipCount: 0,
      totalDp: 0,
      maxBurn: null,
      cargo: 0,
      fuelCapacity: 0,
      crewCapacity: 0,
      credits: 0,
      suppliesPerMonth: 0,
      fuelPerLy: 0,
      sensorStrength: 0,
      sensorProfile: 0,
      ecmRating: 0,
      navRating: 0
    }
    if (fleet.length === 0) return empty

    const wingOpById = new Map(
      allWingStats.map((s) => [s.id, Number(s["op cost"])])
    )
    const profiles: number[] = []
    const hiresBonuses: number[] = []
    let slowestBurn = Infinity
    let stabilizers = 0

    const out: FleetAggregates = { ...empty, shipCount: fleet.length }

    for (const entry of fleet) {
      const modIds = [
        ...(entry.ship.meta.builtInMods ?? []),
        ...(entry.hullmods ?? []),
        ...(entry.smods ?? [])
      ]
      const smods = entry.smods ?? []
      const modded = applyHullmods(entry.ship, modIds, smods)
      const s = modded.stats
      const hullSize = entry.ship.meta.hullSize

      const fightersOp = (entry.fighters ?? []).reduce(
        (sum, wingId) => sum + (wingId ? num(wingOpById.get(wingId)) : 0),
        0
      )
      // DP tracks base maintenance: upkeep modifiers (e.g. Efficiency
      // Overhaul) change supplies/mo but not deployment cost.
      const convertedBayFightersOp = getConvertedBayFightersOp(
        Number(entry.ship.stats["fighter bays"] ?? 0),
        entry.fighters ?? [],
        (wingId) => (wingId ? num(wingOpById.get(wingId)) : 0)
      )
      out.totalDp +=
        num(entry.ship.stats["supplies/mo"]) +
        getDeploymentCostDelta(modIds, {
          fightersOp,
          hullSize,
          modIds,
          convertedBayFightersOp
        })

      const burn = num(s["max burn"])
      if (burn > 0) slowestBurn = Math.min(slowestBurn, burn)

      out.cargo += num(s.cargo)
      out.fuelCapacity += num(s.fuel)
      out.crewCapacity += num(s["max crew"])
      out.credits += num(s["base value"])
      out.suppliesPerMonth += num(s["supplies/mo"])
      out.fuelPerLy += num(s["fuel/ly"])

      const sensorBase = SENSOR_BASE_BY_HULL_SIZE[hullSize]
      if (sensorBase !== undefined) {
        const mults = getSensorMults(modIds, smods)
        const hasStabilizer = modIds.includes("drive_field_stabilizer")
        if (hasStabilizer) stabilizers += 1
        profiles.push(getSensorProfile(sensorBase, modIds, smods))
        out.sensorStrength += sensorBase * mults.strength
      }
      if (modIds.includes("nav_relay"))
        out.navRating += NAV_BY_HULL_SIZE[hullSize] ?? 0
      if (modIds.includes("ecm")) out.ecmRating += ECM_BY_HULL_SIZE[hullSize] ?? 0
      if (modIds.includes("hiressensors"))
        hiresBonuses.push(getHighResSensorBonus(modIds, hullSize))
    }

    // Diminishing returns: largest bonus first, each extra ship halves.
    out.sensorStrength += hiresBonuses
      .sort((a, b) => b - a)
      .reduce((sum, v, i) => sum + v * Math.pow(0.5, i), 0)

    out.maxBurn =
      slowestBurn === Infinity ? null : slowestBurn + stabilizers
    out.sensorProfile = profiles
      .sort((a, b) => b - a)
      .slice(0, 5)
      .reduce((sum, v) => sum + v, 0)

    out.totalDp = Math.round(out.totalDp)
    out.cargo = Math.round(out.cargo)
    out.fuelCapacity = Math.round(out.fuelCapacity)
    out.crewCapacity = Math.round(out.crewCapacity)
    out.credits = Math.round(out.credits)
    out.suppliesPerMonth = Math.round(out.suppliesPerMonth)
    out.fuelPerLy = Math.round(out.fuelPerLy * 10) / 10
    out.sensorStrength = Math.round(out.sensorStrength)
    out.sensorProfile = Math.round(out.sensorProfile)

    return out
  }, [fleet, allWingStats])
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 leading-tight">
      <span className="text-xs text-cyan-200">{label}</span>
      <span className="ss-amber whitespace-nowrap text-sm">{value}</span>
    </div>
  )
}

/**
 * Fleet-wide aggregates. Full table on desktop (fleet rail), collapsible
 * summary on smaller screens (rendered below the fleet strip).
 */
export default function FleetStats({
  fleet,
  compact = false
}: {
  fleet: fleetEntry[]
  compact?: boolean
}) {
  const stats = useFleetAggregates(fleet)
  const shipLabel = `${stats.shipCount === 1 ? "1 ship" : `${stats.shipCount} ships`}`

  const rows: [string, string][] = [
    ["Ships", shipLabel],
    ["Total DP", `${stats.totalDp}`],
    ["Max burn", stats.maxBurn === null ? "—" : `${stats.maxBurn}`],
    ["Cargo", `${stats.cargo}`],
    ["Fuel", `${stats.fuelCapacity}`],
    ["Crew", `${stats.crewCapacity}`],
    ["Credits", stats.credits.toLocaleString("en-US")],
    ["Supplies/mo", `${stats.suppliesPerMonth}`],
    ["Fuel/ly", `${stats.fuelPerLy}`],
    ["Sensor strength", `${stats.sensorStrength}`],
    ["Sensor profile", `${stats.sensorProfile}`],
    ["ECM rating", `+${stats.ecmRating}%`],
    ["Nav rating", `+${stats.navRating}%`]
  ]

  if (!compact) {
    return (
      <section aria-label="Fleet statistics" className="w-full px-2 py-3">
        <h2 className="island-kicker mb-1 text-center text-cyan-200">Fleet Stats</h2>
        <div className="flex flex-col gap-1">
          {rows.map(([label, value]) => (
            <Row key={label} label={label} value={value} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <details className="w-full bg-gray-950/70 px-3 py-1.5">
      <summary className="flex cursor-pointer touch-manipulation list-none items-center justify-center gap-3 text-sm text-amber-300 select-none [&::-webkit-details-marker]:hidden">
        <span>{shipLabel}</span>
        <span aria-hidden="true" className="h-4 w-px bg-amber-300" />
        <span>{`${stats.totalDp} DP`}</span>
        <span aria-hidden="true" className="text-xs text-cyan-200/60">
          stats
        </span>
      </summary>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 pb-1">
        {rows.slice(3).map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}
      </div>
    </details>
  )
}
