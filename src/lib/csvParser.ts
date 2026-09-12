import Parser from "papaparse"
import type { ship, shipStats, weapon, weaponStats, wingStats } from "#/types"
import shipDataCSV from "../shipData/ship_data.csv?raw"
import wingDataCSV from "../shipData/wing_data.csv?raw"
import weaponDataCSV from "../weaponData/weapon_data.csv?raw"
import { getAllShipSkins } from "./shipParser"

export async function getAllShipStats(): Promise<shipStats[]> {
  const base = Parser.parse(shipDataCSV, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  }).data as shipStats[]
  const byId = new Map(base.map((s) => [s.id, s]))
  const skins = await getAllShipSkins()
  for (const skin of skins) {
    const baseStat = byId.get(skin.baseHullId)
    if (!baseStat) continue // NOTE: missing base CSV row
    const hasOverride =
      skin.fleetPoints != null ||
      skin.ordnancePoints != null ||
      skin.baseValueMult != null ||
      skin.suppliesToRecover != null ||
      skin.suppliesPerMonth != null
    if (!hasOverride) continue

    if (byId.has(skin.skinHullId)) continue
    const clone: shipStats = {
      ...baseStat,
      id: skin.skinHullId,
      name: skin.hullName ?? baseStat.name
    }
    if (skin.fleetPoints != null) clone["fleet pts"] = skin.fleetPoints
    if (skin.ordnancePoints != null)
      clone["ordnance points"] = skin.ordnancePoints
    if (skin.suppliesToRecover != null)
      clone["supplies/rec"] = skin.suppliesToRecover
    if (skin.suppliesPerMonth != null)
      clone["supplies/mo"] = skin.suppliesPerMonth
    if (skin.baseValueMult != null)
      clone["base value"] = Math.round(clone["base value"] * skin.baseValueMult)
    base.push(clone)
  }
  return base
}

export function getShipStats({
  ship,
  shipStats
}: {
  ship: ship
  shipStats: shipStats[]
}): shipStats | null {
  const id =
    shipStats.find((s) => s.id === ship?.hullId)?.id ??
    ship.baseHullId ??
    ship.hullId
  const stats = shipStats.find((s) => s.id === id) ?? null
  return stats
}

export function getAllWeaponStats(): weaponStats[] {
  const data = Parser.parse(weaponDataCSV, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  }).data as weaponStats[]
  // filter empty rows (name/id empty)
  return data.filter((w) => w.id && String(w.id).trim() !== "")
}

export function getWeaponStats({  weapon,
  weaponStats
}: {
  weapon: weapon
  weaponStats: weaponStats[]
}): weaponStats | null {
  const stats = weaponStats.find((s) => s.id === weapon.id) ?? null
  return stats
}

export function isWeaponSelectable(stats: weaponStats | null): boolean {
  if (!stats) return false
  const hints = (stats.hints || "").toUpperCase()
  const tags = (stats.tags || "").toLowerCase()
  // System / fighter / bomb bay weapons
  if (hints.includes("SYSTEM")) return false
  // Explicitly not sold / not droppable (built-in hull weapons like bomb, heavy_adjudicator variants)
  if (
    tags.includes("no_sell") ||
    // tags.includes("no_drop") ||
    tags.includes("no_drop_salvage")
    // tags.includes("no_dealer") ||
    // tags.includes("no_standard_data")
  )
    return false
  // NOTE: groupTag no longer filtered. Only 3 weapons use it
  // (amblaster, tpc, heavy_adjudicator), nothing hull-side
  // references those values, and filtering it hides the AM Blaster from every slot.
  // The SYSTEM / no-sell rules above still catch the tpc and heavy_adjudicator.
  if (stats.OPs == null || String(stats.OPs).trim() === "") return false
  return true
}

// Tags like threat/omega/dweller are selectable but hidden by default via UI toggle, not hard-filtered
export const SPECIAL_WEAPON_TAGS = ["threat", "omega", "dweller"] as const

export function getWeaponSpecialTags(stats: weaponStats | null): string[] {
  if (!stats) return []
  const tags = (stats.tags || "").toLowerCase()
  return SPECIAL_WEAPON_TAGS.filter((t) => tags.includes(t))
}

function num(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Flux/sec for a weapon. Prefers energy/second; otherwise derives
 * energy/shot * shots/sec, with shots/sec from damage numbers when
 * available, else burst size / cycle time (chargeup + chargedown + burst delay). */
export function getWeaponFluxPerSecond(
  stats: weaponStats | null | undefined
): number {
  if (!stats) return 0
  const direct = num(stats["energy/second"])
  if (direct != null) return direct
  const perShot = num(stats["energy/shot"])
  if (perShot == null || perShot === 0) return 0
  let shotsPerSec: number | null = null
  const dps = num(stats["damage/second"])
  const dmgPerShot = num(stats["damage/shot"])
  if (dps != null && dps > 0 && dmgPerShot != null && dmgPerShot > 0) {
    shotsPerSec = dps / dmgPerShot
  } else {
    const burstSize = num(stats["burst size"])
    const burstDelay = num(stats["burst delay"]) ?? 0
    const chargeup = num(stats.chargeup) ?? 0
    const chargedown = num(stats.chargedown) ?? 0
    if (burstSize != null && burstSize > 0) {
      const cycle = chargeup + chargedown + burstDelay
      if (cycle > 0) shotsPerSec = burstSize / cycle
    } else {
      // Single-shot weapons with no burst data: one shot per cycle.
      const cycle = chargeup + chargedown + burstDelay
      if (cycle > 0) shotsPerSec = 1 / cycle
    }
  }
  if (shotsPerSec == null || shotsPerSec <= 0) return 0
  const ammoPerSec = num(stats["ammo/sec"])
  if (ammoPerSec != null && ammoPerSec > 0) {
    shotsPerSec = Math.min(shotsPerSec, ammoPerSec)
  }
  return perShot * shotsPerSec
}

export function getAllWingStats(): wingStats[] {
  const data = Parser.parse(wingDataCSV, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  }).data as wingStats[]
  return data.filter((w) => w.id && String(w.id).trim() !== "")
}

export function getWingStats({
  wingId,
  wingStats
}: {
  wingId: string
  wingStats: wingStats[]
}): wingStats | null {
  return wingStats.find((w) => w.id === wingId) ?? null
}

export function isWingSelectable(stats: wingStats | null): boolean {
  if (!stats) return false
  const tags = (stats.tags || "").toLowerCase()
  if (
    tags.includes("no_sell") ||
    tags.includes("no_drop") ||
    tags.includes("no_dealer") ||
    tags.includes("restricted") ||
    tags.includes("hide_in_codex") ||
    tags.includes("auto_fighter") ||
    tags.includes("swarm_fighter")
  )
    return false
  if (stats["op cost"] == null || String(stats["op cost"]).trim() === "")
    return false
  return true
}

/** Resolve the fighter hull id for a wing via its variant prefix
 *  (e.g. "broadsword_Fighter" -> "broadsword"). */
export function getWingHullId(wing: wingStats | null | undefined): string | null {
  if (!wing?.variant) return null
  const prefix = String(wing.variant).split("_")[0]?.trim()
  return prefix ? prefix.toLowerCase() : null
}
