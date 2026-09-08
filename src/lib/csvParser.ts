import Parser from "papaparse"
import type { ship, shipStats } from "#/types"
import shipDataCSV from "../shipData/ship_data.csv?raw"
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
