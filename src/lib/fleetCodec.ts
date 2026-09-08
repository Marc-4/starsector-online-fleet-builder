import * as pako from "pako"
import type { fleetEntry, ship, shipStats } from "#/types"
import { getShipStats } from "./csvParser"
import { newFleetId } from "./id"

type Payload = { v: 1; f: string[] }

function toBase64Url(bytes: Uint8Array): string {
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(s: string): Uint8Array {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/")
  const pad = b64.length % 4
  if (pad) b64 += "=".repeat(4 - pad)
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export function encodeFleetToHash(fleet: fleetEntry[]): string {
  const payload: Payload = {
    v: 1,
    f: fleet.map((e) => e.ship.meta.hullId),
  }
  const json = JSON.stringify(payload)
  const compressed = pako.deflate(json)
  return toBase64Url(compressed)
}

export function decodeFleetIds(hash: string): string[] | null {
  try {
    let raw = hash.trim()
    if (raw.startsWith("#")) raw = raw.slice(1)
    if (raw.startsWith("fleet=")) raw = raw.slice(6)
    if (!raw) return null
    const bytes = fromBase64Url(raw)
    const inflated = pako.inflate(bytes)
    const json = new TextDecoder().decode(inflated)
    const parsed = JSON.parse(json) as Payload
    if (parsed.v !== 1 || !Array.isArray(parsed.f)) return null
    return parsed.f.filter((x) => typeof x === "string")
  } catch {
    return null
  }
}

export function hydrateFleet(
  ids: string[],
  allShips: ship[],
  allStats: shipStats[]
): fleetEntry[] {
  const shipById = new Map(allShips.map((s) => [s.hullId, s]))
  const out: fleetEntry[] = []
  for (const hullId of ids) {
    const meta = shipById.get(hullId)
    if (!meta) {
      console.warn(`hydrateFleet: unknown hullId ${hullId}`)
      continue
    }
    const stats = getShipStats({ ship: meta, shipStats: allStats })
    if (!stats) {
      console.warn(`hydrateFleet: missing stats for ${hullId}`)
      continue
    }
    out.push({ id: newFleetId(), ship: { meta, stats }, cr: 70 })
  }
  return out
}
