import Parser from "papaparse"
import type { ship, shipStats, weapon, weaponStats } from "#/types"
import shipDataCSV from "../shipData/ship_data.csv?raw"
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

export function getWeaponStats({
  weapon,
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
  const groupTag = (stats.groupTag || "").trim()
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
  // Hull-restricted weapons (H_A_only, TPC_only, pusherplate, Lion's Guard etc.)
  if (groupTag !== "") return false
  // Must have OP cost to be mountable
  if (stats.OPs == null || String(stats.OPs).trim() === "") return false
  return true
}

// Tags like threat/omega/dweller are selectable but hidden by default via UI toggle, not hard-filtered
export const SPECIAL_WEAPON_TAGS = ["threat", "omega", "dweller", "fragment"] as const

export function getWeaponSpecialTags(stats: weaponStats | null): string[] {
  if (!stats) return []
  const tags = (stats.tags || "").toLowerCase()
  return SPECIAL_WEAPON_TAGS.filter((t) => tags.includes(t))
}
