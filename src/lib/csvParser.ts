import Parser from "papaparse"
import type { shipStats } from "#/types"
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
  hullId,
  shipStats
}: {
  hullId: string
  shipStats: shipStats[]
  }): shipStats | null {
  console.log(hullId)
  const stats = shipStats.find((s) => s.id === hullId) ?? null
  console.log(stats)
  return stats
}
