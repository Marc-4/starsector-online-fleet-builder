import * as pako from "pako"
import type { fleetEntry, ship, shipStats } from "#/types"
import { getShipStats } from "./csvParser"
import { HULL_IDS, WEAPON_IDS } from "./fleetDicts"
import { newFleetId } from "./id"

type EntryPayload = { h: string; c?: number; v?: number; cr?: number; n?: string; w?: Record<string, string> }
type PayloadV1 = { v: 1; f: string[] }
type PayloadV2 = { v: 2; f: EntryPayload[] }
type Payload = PayloadV1 | PayloadV2

export type DecodedEntry = { hullId: string; capacitors: number; vents: number; cr: number; customName: string; weapons: Record<string, string> }

const DEFAULT_CR = 70

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

function deflateHash(bytes: Uint8Array): string {
  return toBase64Url(pako.deflate(bytes, { level: 9 }))
}

// ---------------------------------------------------------------------------
// v2 (legacy encoder, kept for measurement; decoders still read v1/v2 links)
// ---------------------------------------------------------------------------

export function encodeFleetToHashV2(fleet: fleetEntry[]): string {
  const payload: PayloadV2 = {
    v: 2,
    f: fleet.map((e) => ({
      h: e.ship.meta.hullId,
      ...(e.capacitors ? { c: e.capacitors } : {}),
      ...(e.vents ? { v: e.vents } : {}),
      ...(e.cr !== undefined && e.cr !== DEFAULT_CR ? { cr: e.cr } : {}),
      n: e.customName || undefined,
      w:
        e.weapons && Object.keys(e.weapons).length > 0 ? e.weapons : undefined,
    })),
  }
  return deflateHash(new TextEncoder().encode(JSON.stringify(payload)))
}

// ---------------------------------------------------------------------------
// v3: binary payload, dictionary indexes + slot numbers, then deflate.
// Layout: [0x03][shipCount varint][entries...]
// entry: [flags][hullRef][caps?][vents?][cr?][name?][weapons?]
// flags: 0x01 name, 0x02 cr!=70, 0x04 caps/vents, 0x08 weapons
// hullRef/weaponRef: varint table index; index == table length -> raw string
//   (varint utf8-length + bytes). weapons: varint count + [slot][weaponRef].
// slot: 1 byte "WS NNN" number, or 0xFF followed by a raw slot id string.
// weapons: varint count, then either sparse [slot][weaponRef] pairs,
// or — when slots are contiguous (FLAG_DENSE) — [startSlot][weaponRef...].
// ---------------------------------------------------------------------------

const V3_TAG = 0x03
const SLOT_RAW_SENTINEL = 0xff
const FLAG_NAME = 0x01
const FLAG_CR = 0x02
const FLAG_FLUX = 0x04
const FLAG_WEAPONS = 0x08
const FLAG_DENSE_WEAPONS = 0x10

// Upper bounds against corrupt input
const MAX_SHIPS = 512
const MAX_WEAPONS_PER_SHIP = 256
const MAX_STR_BYTES = 1 << 20

const hullIndex = new Map(HULL_IDS.map((id, i) => [id, i]))
const weaponIndex = new Map(WEAPON_IDS.map((id, i) => [id, i]))
const textEncoder = new TextEncoder()

function writeVarint(out: number[], v: number): void {
  v >>>= 0
  while (v >= 0x80) {
    out.push((v & 0x7f) | 0x80)
    v >>>= 7
  }
  out.push(v)
}

function writeString(out: number[], s: string): void {
  const bytes = textEncoder.encode(s)
  writeVarint(out, bytes.length)
  for (const b of bytes) out.push(b)
}

// Table index, or table length + inline string when unknown (modded ids).
function writeRef(out: number[], index: Map<string, number>, tableLength: number, value: string): void {
  const idx = index.get(value)
  if (idx === undefined) {
    writeVarint(out, tableLength)
    writeString(out, value)
  } else {
    writeVarint(out, idx)
  }
}

function slotIdToNum(slotId: string): number {
  const m = /^WS (\d{1,3})$/.exec(slotId)
  if (!m) return -1
  const n = Number(m[1])
  return n >= SLOT_RAW_SENTINEL ? -1 : n
}

function slotNumToId(n: number): string {
  return `WS ${String(n).padStart(3, "0")}`
}

function clampInt(v: unknown, fallback: number): number {
  const n = typeof v === "number" && Number.isFinite(v) ? Math.round(v) : fallback
  return Math.max(0, Math.min(255, n))
}

class V3Reader {
  pos = 0
  constructor(private bytes: Uint8Array) {}

  u8(): number {
    if (this.pos >= this.bytes.length) throw new Error("v3: truncated")
    return this.bytes[this.pos++]
  }

  varint(): number {
    let shift = 0
    let result = 0
    for (let i = 0; i < 5; i++) {
      const b = this.u8()
      result |= (b & 0x7f) << shift
      if ((b & 0x80) === 0) return result >>> 0
      shift += 7
    }
    throw new Error("v3: bad varint")
  }

  raw(length: number): Uint8Array {
    if (length < 0 || length > MAX_STR_BYTES || this.pos + length > this.bytes.length) {
      throw new Error("v3: bad length")
    }
    const start = this.pos
    this.pos += length
    return this.bytes.slice(start, this.pos)
  }

  str(): string {
    return new TextDecoder().decode(this.raw(this.varint()))
  }

  ref(table: string[]): string {
    const idx = this.varint()
    if (idx < table.length) return table[idx]
    if (idx === table.length) {
      const s = this.str()
      if (!s) throw new Error("v3: empty ref")
      return s
    }
    throw new Error("v3: ref out of range")
  }

  get done(): boolean {
    return this.pos === this.bytes.length
  }
}

function encodeV3(fleet: fleetEntry[]): Uint8Array {
  const out: number[] = [V3_TAG]
  writeVarint(out, fleet.length)
  for (const e of fleet) {
    const capacitors = clampInt(e.capacitors, 0)
    const vents = clampInt(e.vents, 0)
    const cr = clampInt(e.cr, DEFAULT_CR)
    const name = e.customName ?? ""
    const pairs: { num: number; rawSlot: string; weapon: string }[] = []
    for (const [slotId, weaponId] of Object.entries(e.weapons ?? {})) {
      if (typeof weaponId !== "string" || !weaponId) continue
      if (typeof slotId !== "string" || !slotId) continue
      pairs.push({ num: slotIdToNum(slotId), rawSlot: slotId, weapon: weaponId })
    }
    pairs.sort((a, b) => (a.num === b.num ? (a.rawSlot < b.rawSlot ? -1 : 1) : a.num - b.num))
    const dense =
      pairs.length >= 2 &&
      pairs.every((p) => p.num >= 0) &&
      pairs.every((p, i) => i === 0 || p.num === pairs[i - 1].num + 1)

    let flags = 0
    if (name) flags |= FLAG_NAME
    if (cr !== DEFAULT_CR) flags |= FLAG_CR
    if (capacitors !== 0 || vents !== 0) flags |= FLAG_FLUX
    if (pairs.length > 0) flags |= FLAG_WEAPONS
    if (dense) flags |= FLAG_DENSE_WEAPONS
    out.push(flags)

    writeRef(out, hullIndex, HULL_IDS.length, e.ship.meta.hullId)
    if (flags & FLAG_FLUX) out.push(capacitors, vents)
    if (flags & FLAG_CR) out.push(cr)
    if (flags & FLAG_NAME) writeString(out, name)
    if (flags & FLAG_WEAPONS) {
      if (dense) {
        out.push(pairs[0].num)
        writeVarint(out, pairs.length)
        for (const p of pairs) writeRef(out, weaponIndex, WEAPON_IDS.length, p.weapon)
      } else {
        writeVarint(out, pairs.length)
        for (const p of pairs) {
          if (p.num < 0) {
            out.push(SLOT_RAW_SENTINEL)
            writeString(out, p.rawSlot)
          } else {
            out.push(p.num)
          }
          writeRef(out, weaponIndex, WEAPON_IDS.length, p.weapon)
        }
      }
    }
  }
  return Uint8Array.from(out)
}

function decodeV3(bytes: Uint8Array): DecodedEntry[] {
  const r = new V3Reader(bytes)
  if (r.u8() !== V3_TAG) throw new Error("v3: bad tag")
  const count = r.varint()
  if (count > MAX_SHIPS) throw new Error("v3: too many ships")
  const out: DecodedEntry[] = []
  for (let i = 0; i < count; i++) {
    const flags = r.u8()
    if (flags & ~0x1f) throw new Error("v3: bad flags")
    if (flags & FLAG_DENSE_WEAPONS && !(flags & FLAG_WEAPONS)) throw new Error("v3: bad flags")
    const hullId = r.ref(HULL_IDS)
    let capacitors = 0
    let vents = 0
    if (flags & FLAG_FLUX) {
      capacitors = r.u8()
      vents = r.u8()
    }
    const cr = flags & FLAG_CR ? Math.min(r.u8(), 100) : DEFAULT_CR
    const customName = flags & FLAG_NAME ? r.str() : ""
    const weapons: Record<string, string> = {}
    if (flags & FLAG_WEAPONS) {
      const dense = (flags & FLAG_DENSE_WEAPONS) !== 0
      let slot = -1
      if (dense) {
        slot = r.u8()
        if (slot === SLOT_RAW_SENTINEL) throw new Error("v3: bad dense slot")
      }
      const n = r.varint()
      if (n === 0 || n > MAX_WEAPONS_PER_SHIP) throw new Error("v3: bad weapon count")
      if (dense && slot + n > SLOT_RAW_SENTINEL) throw new Error("v3: bad dense range")
      for (let k = 0; k < n; k++) {
        let slotId: string
        if (dense) {
          slotId = slotNumToId(slot + k)
        } else {
          const slotByte = r.u8()
          slotId = slotByte === SLOT_RAW_SENTINEL ? r.str() : slotNumToId(slotByte)
        }
        const weaponId = r.ref(WEAPON_IDS)
        if (slotId && weaponId) weapons[slotId] = weaponId
      }
    }
    out.push({ hullId, capacitors, vents, cr, customName, weapons })
  }
  if (!r.done) throw new Error("v3: trailing bytes")
  return out
}

export function encodeFleetToHash(fleet: fleetEntry[]): string {
  return deflateHash(encodeV3(fleet))
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
    if (inflated.length >= 2 && inflated[0] === V3_TAG) return decodeV3(inflated)
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
          weapons: sanitizeWeapons(e.w),
        })
      }
      return out
    }
    if (parsed.v === 1 && Array.isArray((parsed as PayloadV1).f)) {
      // v1 backward compat: only hullIds
      return (parsed as PayloadV1).f
        .filter((x) => typeof x === "string")
        .map((hullId) => ({ hullId, capacitors: 0, vents: 0, cr: 70, customName: "", weapons: {} }))
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
        ? (ids as string[]).map((hullId) => ({ hullId, capacitors: 0, vents: 0, cr: 70, customName: "", weapons: {} }))
        : (ids as DecodedEntry[])
  const shipById = new Map(allShips.map((s) => [s.hullId, s]))
  const out: fleetEntry[] = []
  for (const entry of entries) {
    const { hullId, capacitors, vents, cr, customName, weapons } = entry
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
    out.push({ id: newFleetId(), ship: { meta, stats }, cr, capacitors, vents, customName, weapons })
  }
  return out
}

function sanitizeWeapons(w: unknown): Record<string, string> {
  if (typeof w !== "object" || w === null) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(w as Record<string, unknown>)) {
    if (typeof k === "string" && typeof v === "string") out[k] = v
  }
  return out
}
