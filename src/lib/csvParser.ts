import Parser from "papaparse"
import type { ship, shipStats } from "#/types"
import shipDataCSV from "../shipData/ship_data.csv?raw"

export async function getAllShipStats() {
  const shipData = Parser.parse(shipDataCSV, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  }).data as shipStats[]

  return shipData
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
