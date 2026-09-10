// Bench: v2 vs v3 fleet hash lengths + round-trip / backward-compat checks.
// Executed via scripts/bench-fleet-hash.mjs (vite ssrLoadModule). Run: npm run bench:hash
import * as pako from "pako"
import {
  decodeFleetEntries,
  encodeFleetToHash,
  encodeFleetToHashV2,
  type DecodedEntry
} from "../src/lib/fleetCodec"
import type { fleetEntry } from "../src/types"

function toBase64Url(bytes: Uint8Array): string {
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function mkEntry(
  hullId: string,
  opts: { capacitors?: number; vents?: number; cr?: number; customName?: string; weapons?: Record<string, string> } = {}
): fleetEntry {
  return {
    id: `bench-${hullId}`,
    ship: { meta: { hullId } as fleetEntry["ship"]["meta"], stats: {} as fleetEntry["ship"]["stats"] },
    cr: opts.cr ?? 70,
    capacitors: opts.capacitors ?? 0,
    vents: opts.vents ?? 0,
    customName: opts.customName ?? "",
    weapons: opts.weapons ?? {}
  }
}

const LONG_WEAPONS: Record<string, string> = {
  "WS 001": "tachyonlance",
  "WS 002": "tachyonlance",
  "WS 003": "squallmlrs",
  "WS 004": "squallmlrs",
  "WS 005": "heirloom",
  "WS 006": "heirloom",
  "WS 007": "devastator",
  "WS 008": "devastator",
  "WS 009": "hurricane",
  "WS 010": "hurricane",
  "WS 011": "ionpulser",
  "WS 012": "harpoonpod",
  "WS 013": "gravitonbeam",
  "WS 014": "gorgonpod",
  "WS 015": "cryoblaster",
  "WS 016": "cryoblaster",
  "WS 017": "ionpulser",
  "WS 018": "harpoonpod",
  "WS 019": "gravitonbeam",
  "WS 020": "locust"
}

function norm(e: DecodedEntry) {
  return { ...e, weapons: Object.fromEntries(Object.entries(e.weapons).sort(([a], [b]) => (a < b ? -1 : 1))) }
}

function checkRoundTrip(label: string, fleet: fleetEntry[]): { v2: number; v3: number } {
  const v2 = encodeFleetToHashV2(fleet)
  const v3 = encodeFleetToHash(fleet)
  const back = decodeFleetEntries(`#fleet=${v3}`)
  const expected = fleet.map((e) =>
    norm({ hullId: e.ship.meta.hullId, capacitors: e.capacitors, vents: e.vents, cr: e.cr, customName: e.customName, weapons: e.weapons ?? {} })
  )
  const actual = (back ?? []).map(norm)
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  console.log(`${ok ? "PASS" : "FAIL"} round-trip ${label} (v2 ${v2.length} chars, v3 ${v3.length} chars)`)
  if (!ok) {
    console.log("  expected:", JSON.stringify(expected).slice(0, 300))
    console.log("  actual:  ", JSON.stringify(actual).slice(0, 300))
    process.exitCode = 1
  }
  return { v2: v2.length, v3: v3.length }
}

export async function run(): Promise<void> {
  // worst case: 30 DIFFERENT fitted hulls with distinct names/loadouts
  // (identical ships deflate well; diversity is what blows URLs up)
  const hulls = ["paragon", "onslaught", "conquest", "odyssey", "astral", "legion", "pegasus", "retribution", "invictus", "eagle", "champion", "falcon", "gryphon", "heron", "mora", "apogee", "aurora", "doom", "eradicator", "hammerhead", "sunder", "medusa", "shrike", "wolf", "lasher", "kite", "omen", "tempest", "hyperion", "afflictor"]
  const guns = ["tachyonlance", "squallmlrs", "hurricane", "locust", "devastator", "hellbore", "hephag", "mjolnir", "stormneedler", "mark9", "gravitonbeam", "ionpulser", "cryoblaster", "harpoonpod", "gorgonpod", "atropos", "reaper", "railgun", "arbalest", "lightneedler"]
  const worst: fleetEntry[] = hulls.map((hullId, i) => {
    const weapons: Record<string, string> = {}
    const nslots = 5 + (i % 16)
    for (let s = 1; s <= nslots; s++) weapons[`WS ${String(s).padStart(3, "0")}`] = guns[(i + s) % guns.length]
    return mkEntry(hullId, {
      capacitors: 5 + ((i * 7) % 40),
      vents: 5 + ((i * 11) % 40),
      cr: 60 + ((i * 13) % 41),
      customName: `ISS ${hullId} ${i + 1} “knife-fight”`,
      weapons
    })
  })
  // typical: mixed fleet, partial fits
  const typical: fleetEntry[] = [
    mkEntry("paragon", { capacitors: 20, vents: 15, weapons: { "WS 001": "tachyonlance", "WS 003": "squallmlrs" } }),
    mkEntry("eagle", { capacitors: 10, cr: 85, customName: "ISS Eagle", weapons: { "WS 001": "heavymauler", "WS 005": "arbalest" } }),
    mkEntry("hammerhead", { vents: 10, weapons: { "WS 002": "railgun" } }),
    mkEntry("lasher", {}),
    mkEntry("kite", { customName: "scout" }),
    mkEntry("condor", { cr: 60, weapons: { "WS 001": "longbow" } }),
    mkEntry("apogee", { capacitors: 12, vents: 12, cr: 100, customName: "ISS Surveyor", weapons: LONG_WEAPONS }),
    mkEntry("onslaught", { capacitors: 40, vents: 30, weapons: { "WS 001": "hellbore", "WS 010": "flak" } })
  ]
  // minimal: 30 bare frigates (defaults omitted)
  const minimal: fleetEntry[] = Array.from({ length: 30 }, () => mkEntry("lasher"))
  // edge: unknown modded ids + non-WS slot + empty name
  const edge: fleetEntry[] = [
    mkEntry("my_modded_hull", { capacitors: 5, customName: "Müller’s Pride ☄", weapons: { "WS 001": "my_modded_gun", "CUSTOM_SLOT_A": "lightmg" } }),
    mkEntry("eagle", { cr: 0, weapons: {} })
  ]

  const w = checkRoundTrip("worst-case 30 diverse fitted ships", worst)
  const t = checkRoundTrip("typical 8-ship fleet", typical)
  const m = checkRoundTrip("minimal 30x bare lasher", minimal)
  const e = checkRoundTrip("modded/edge", edge)

  const empty = encodeFleetToHash([])
  const emptyBack = decodeFleetEntries(empty)
  console.log(`${Array.isArray(emptyBack) && emptyBack.length === 0 ? "PASS" : "FAIL"} round-trip empty fleet (${empty.length} chars)`)

  // backward compat: hand-built v1 + old-style v2 payloads (full keys, default level)
  const v1hash = toBase64Url(pako.deflate(JSON.stringify({ v: 1, f: ["paragon", "eagle"] })))
  const v1 = decodeFleetEntries(v1hash)
  console.log(`${v1?.length === 2 && v1[0].hullId === "paragon" ? "PASS" : "FAIL"} decode v1 link`)
  const v2hash = toBase64Url(
    pako.deflate(JSON.stringify({ v: 2, f: [{ h: "eagle", c: 10, v: 5, cr: 85, n: "Old", w: { "WS 001": "railgun" } }] }))
  )
  const v2 = decodeFleetEntries(v2hash)
  const v2ok = v2?.length === 1 && v2[0].hullId === "eagle" && v2[0].capacitors === 10 && v2[0].customName === "Old"
  console.log(`${v2ok ? "PASS" : "FAIL"} decode legacy v2 link`)
  console.log(`${decodeFleetEntries("###") === null ? "PASS" : "FAIL"} decode garbage -> null`)

  console.log("\n--- lengths (URL chars) ---")
  for (const [label, r] of [["worst", w], ["typical", t], ["minimal", m], ["edge", e]] as const) {
    const pct = Math.round((1 - r.v3 / r.v2) * 100)
    console.log(`${label}: v2=${r.v2} v3=${r.v3} (-${pct}%)`)
  }
}
