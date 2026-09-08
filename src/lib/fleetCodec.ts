import * as pako from "pako"
import type { fleetEntry, ship, shipStats } from "#/types"
import { getShipStats } from "./csvParser"
import { newFleetId } from "./id"

type EntryPayload = { h: string; c: number; v: number; cr: number; n?: string }
type PayloadV1 = { v: 1; f: string[] }
type PayloadV2 = { v: 2; f: EntryPayload[] }
type Payload = PayloadV1 | PayloadV2

export type DecodedEntry = { hullId: string; capacitors: number; vents: number; cr: number; customName: string }

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
  const payload: PayloadV2 = {
    v: 2,
    f: fleet.map((e) => ({
      h: e.ship.meta.hullId,
      c: e.capacitors ?? 0,
      v: e.vents ?? 0,
      cr: e.cr ?? 70,
      n: e.customName || undefined,
    })),
  }
  const json = JSON.stringify(payload)
  const compressed = pako.deflate(json)
  return toBase64Url(compressed)
}

export function decodeFleetIds(hash: string): string[] | null {
  const entries = decodeFleetEntries(hash)
  return entries ? entries.map((e) => e.hullId) : null
}

export function decodeFleetEntries(hash: string): DecodedEntry[] | null {
  try {
    let raw = hash.trim()
    if (raw.startsWith("#")) raw = raw.slice(1)
    if (raw.startsWith("fleet=")) raw = raw.slice(6)
    if (!raw) return null
    const bytes = fromBase64Url(raw)
    const inflated = pako.inflate(bytes)
    const json = new TextDecoder().decode(inflated)
    const parsed = JSON.parse(json) as Payload
    if (parsed.v === 2 && Array.isArray(parsed.f)) {
      // v2: array of objects
      const out: DecodedEntry[] = []
      for (const e of parsed.f as EntryPayload[]) {
        if (typeof e?.h !== "string") continue
        out.push({
          hullId: e.h,
          capacitors: typeof e.c === "number" ? e.c : 0,
          vents: typeof e.v === "number" ? e.v : 0,
          cr: typeof e.cr === "number" ? e.cr : 70,
          customName: typeof e.n === "string" ? e.n : "",
        })
      }
      return out
    }
    if (parsed.v === 1 && Array.isArray((parsed as PayloadV1).f)) {
      // v1 backward compat: only hullIds
      return (parsed as PayloadV1).f
        .filter((x) => typeof x === "string")
        .map((hullId) => ({ hullId, capacitors: 0, vents: 0, cr: 70, customName: "" }))
    }
    return null
  } catch {
    return null
  }
}

export function hydrateFleet(
  ids: string[] | DecodedEntry[],
  allShips: ship[],
  allStats: shipStats[]
): fleetEntry[] {
  const entries: DecodedEntry[] =
    ids.length === 0
      ? []
      : typeof ids[0] === "string"
        ? (ids as string[]).map((hullId) => ({ hullId, capacitors: 0, vents: 0, cr: 70, customName: "" }))
        : (ids as DecodedEntry[])
  const shipById = new Map(allShips.map((s) => [s.hullId, s]))
  const out: fleetEntry[] = []
  for (const entry of entries) {
    const { hullId, capacitors, vents, cr, customName } = entry
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
    out.push({ id: newFleetId(), ship: { meta, stats }, cr, capacitors, vents, customName })
  }
  return out
}
