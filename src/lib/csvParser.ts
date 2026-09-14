import Parser from "papaparse"
import type { hullMod, ship, shipStats, weapon, weaponStats, wingStats } from "#/types"
import hullModDataCSV from "../hullData/hull_mods.csv?raw"
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
  const burstRaw = stats["burst size"]
  const hasBurst =
    burstRaw != null && String(burstRaw).trim() !== "" && num(burstRaw) != null
  if (direct != null) {
    // Burst beams (e.g. Tachyon Lance): energy/second is the in-burst rate,
    // not the cycle average. Average over the full refire cycle using the
    // effective burst duration (beam length + quadratic charge ramp).
    if (hasBurst) {
      const burstSizeN = num(stats["burst size"]) ?? 1
      const burstDelay = num(stats["burst delay"]) ?? 0
      const chargeup = num(stats.chargeup) ?? 0
      const chargedown = num(stats.chargedown) ?? 0
      const cycle = chargeup + chargedown + burstDelay + burstSizeN
      if (cycle > 0) {
        const effDur = burstSizeN + (chargeup + chargedown) / 3
        return (direct * effDur) / cycle
      }
    }
    return direct
  }
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

export function getAllHullMods(): hullMod[] {
  const data = Parser.parse(hullModDataCSV, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  }).data as hullMod[]
  return data.filter((h) => h.id && String(h.id).trim() !== "")
}

export function isHullModDMod(h: hullMod | null): boolean {
  if (!h) return false
  return `,${(h.tags || "").toLowerCase().replace(/\s+/g, "")},`.includes(",dmod,")
}

export function isHullModSelectable(h: hullMod | null): boolean {
  if (!h) return false
  const id = String(h.id ?? "").trim()
  if (!id || id.startsWith("#")) return false
  if (String(h.name ?? "").trim().startsWith("#")) return false
  // D-mods are installable defects: visible despite the hidden flag.
  if (!isHullModDMod(h) && String(h.hidden ?? "").toUpperCase() === "TRUE")
    return false
  if (String(h.hiddenEverywhere ?? "").toUpperCase() === "TRUE") return false
  // Redacted / built-in-only packages never appear in the refit list.
  const tags = (h.tags || "").toLowerCase()
  if (tags.includes("hide_in_codex")) return false
  return true
}

export function getHullModCost(
  h: hullMod,
  hullSize: string | undefined
): number {
  const size = (hullSize ?? "").toUpperCase()
  const pick =
    size === "FRIGATE"
      ? h.cost_frigate
      : size === "DESTROYER"
        ? h.cost_dest
        : size === "CRUISER"
          ? h.cost_cruiser
          : size === "CAPITAL_SHIP"
            ? h.cost_capital
            : null
  const n = Number(pick)
  return Number.isFinite(n) ? n : 0
}

export function getHullModDesignType(h: hullMod): string {
  return (h["tech/manufacturer"] || "").toString().trim() || "Common"
}

/** Public URL for a hullmod icon. CSV stores e.g.
 *  `graphics/hullmods/accelerated_shields.png`, served as webp. */
export function resolveHullModSpriteUrl(sprite: string | null | undefined): string | null {
  const s = (sprite ?? "").trim()
  if (!s) return null
  const base = s.split("/").pop() ?? s
  const webp = base.replace(/\.png$/i, ".webp")
  return `hullmods/${webp}`
}

export function getHullModCategories(h: hullMod): string[] {
  const cats = (h.uiTags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
  if (cats.length === 0 && isHullModDMod(h)) return ["D-Mod"]
  return cats
}

export type hullModShipContext = {
  hullSize: string
  isPhase: boolean
  hasShields: boolean
  isCivilian: boolean
  isAutomated: boolean
  fighterBays: number
  hasBuiltInWings: boolean
  hasMissileSlot: boolean
  isThreat: boolean
  isDweller: boolean
  hasDesignCompromises: boolean
}

/** Derive the installability context for a hull from its meta + stats.
 *  `installedIds` covers mods from shared links (e.g. Design Compromises). */
export function getHullModShipContext(
  ship: {
    meta: ship
    stats: shipStats
  },
  installedIds?: string[]
): hullModShipContext {
  const hints = Array.from(
    new Set(
      `${ship.stats.hints ?? ""},${ship.meta.hints ?? ""}`
        .split(",")
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean)
    )
  )
  const shipTags = `${(ship.stats.tags as unknown as string) ?? ""}`
    .toLowerCase()
  // NOTE: "PHASE" in the shield type column does NOT mean phase cloak —
  // vanilla also uses it for alternative defenses (damper, canister flak).
  // Only defense id "phasecloak" marks a true phase ship.
  const defenseId = (ship.stats["defense id"] || "").toString().toLowerCase()
  const shieldType = (ship.stats["shield type"] || "").toString().toUpperCase()
  const isPhase = defenseId === "phasecloak"
  const builtInMods = (ship.meta.builtInMods ?? []).map((m) =>
    m.toLowerCase()
  )
  const installed = (installedIds ?? []).map((m) => m.toLowerCase())
  const slots = ship.meta.weaponSlots ?? []
  return {
    hullSize: (ship.meta.hullSize || "").toUpperCase(),
    isPhase,
    hasShields: shieldType === "OMNI" || shieldType === "FRONT",
    isCivilian:
      hints.includes("CIVILIAN") || builtInMods.includes("civgrade"),
    isAutomated: builtInMods.includes("automated"),
    fighterBays: ship.stats["fighter bays"] ?? 0,
    hasBuiltInWings: (ship.meta.builtInWings ?? []).length > 0,
    hasMissileSlot: slots.some((s) =>
      ["MISSILE", "COMPOSITE", "SYNERGY", "UNIVERSAL"].includes(
        (s.type || "").toUpperCase()
      )
    ),
    isThreat:
      shipTags.includes("threat") ||
      ship.meta.hullId.toLowerCase().includes("threat"),
    isDweller:
      shipTags.includes("dweller") ||
      ship.meta.hullId.toLowerCase().includes("dweller") ||
      ship.meta.hullId.toLowerCase().includes("shrouded"),
    hasDesignCompromises:
      builtInMods.includes("design_compromises") ||
      installed.includes("design_compromises")
  }
}

/** Vanilla-style isApplicableToShip approximation. Returns a reason when not installable. */
export function getHullModInapplicability(
  h: hullMod,
  ctx: hullModShipContext
): string | null {
  const tags = `,${(h.tags || "").toLowerCase().replace(/\s+/g, "")},`
  const has = (...ts: string[]) => ts.some((t) => tags.includes(`,${t},`))

  // Hull-exclusive faction tech
  if (has("fragment") && !ctx.isThreat)
    return "Requires a Threat hull"
  if (has("shrouded") && !ctx.isDweller)
    return "Requires a Dweller hull"
  // Phase-only mods (coils, anchor)
  if (has("phase") && !has("non_phase") && !ctx.isPhase)
    return "Can only be installed on phase ships"
  if (has("non_phase") && ctx.isPhase)
    return "Can not be installed on phase ships"
  // Shielded-ship mods vs shieldless ships
  if (h.id === "frontshield") {
    if (ctx.isPhase) return "Can not be installed on phase ships"
    if (ctx.hasShields) return "Can only be installed on ships without shields"
    return null
  }
  if (has("shields") && !ctx.hasShields)
    return "Requires shields"
  // Carrier mods
  if (
    h.id === "converted_hangar" &&
    (ctx.fighterBays > 0 || ctx.hasBuiltInWings) &&
    !ctx.hasDesignCompromises
  )
    return "Can only be installed on ships with no fighter bays"
  if (
    ["expanded_deck_crew", "recovery_shuttles", "defensive_targeting_array"].includes(
      h.id
    ) &&
    ctx.fighterBays <= 0 &&
    !ctx.hasBuiltInWings
  )
    return "Requires fighter bays"
  if (h.id === "converted_fighterbay" && !ctx.hasBuiltInWings)
    return "Requires built-in fighter wings"
  // Crew / automation exclusives
  if (h.id === "neural_integrator" && !ctx.isAutomated)
    return "Can only be installed on automated ships"
  if (h.id === "neural_interface" && ctx.isAutomated)
    return "Can not be installed on automated ships"
  if (h.id === "militarized_subsystems" && !ctx.isCivilian)
    return "Can only be installed on civilian-grade hulls"
  if (h.id === "safetyoverrides" && (ctx.isCivilian || ctx.hullSize === "CAPITAL_SHIP"))
    return "Can not be installed on civilian or capital ships"
  if (
    h.id === "escort_package" &&
    ctx.hullSize !== "FRIGATE" &&
    ctx.hullSize !== "DESTROYER"
  )
    return "Can only be installed on frigates and destroyers"
  if (h.id === "missile_autoloader" && !ctx.hasMissileSlot)
    return "Requires missile slots"
  // D-mod gating from dmod sub-tags
  if (has("reqshields") && !ctx.hasShields)
    return "Requires shields"
  if (has("notphase") && ctx.isPhase)
    return "Can not be installed on phase ships"
  if (has("phasedamage") && !ctx.isPhase)
    return "Can only be installed on phase ships"
  if ((has("civonly") || has("civ")) && !ctx.isCivilian)
    return "Can only be installed on civilian-grade hulls"
  if (has("notauto") && ctx.isAutomated)
    return "Can not be installed on automated ships"
  if (
    has("fighterbaydamage") &&
    ctx.fighterBays <= 0 &&
    !ctx.hasBuiltInWings
  )
    return "Requires fighter bays"
  return null
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

/** Candidate hull ids for a wing, most specific first.
 *  Most variants are "<hull>_<role>" (prefix wins), but some drone wings
 *  use the bare hull id as variant (e.g. "drone_terminator"), so the full
 *  variant is tried first. */
export function getWingHullIds(wing: wingStats | null | undefined): string[] {
  if (!wing?.variant) return []
  const full = String(wing.variant).trim().toLowerCase()
  const prefix = full.split("_")[0]?.trim()
  const out: string[] = []
  if (full && !out.includes(full)) out.push(full)
  if (prefix && !out.includes(prefix)) out.push(prefix)
  return out
}

/** First candidate hull id present in `ids` (ships, stats, or style map). */
export function resolveWingHullId(
  wing: wingStats | null | undefined,
  ids: Iterable<string>
): string | null {
  const set = ids instanceof Set ? ids : new Set(ids)
  for (const id of getWingHullIds(wing)) {
    if (set.has(id)) return id
  }
  return null
}
