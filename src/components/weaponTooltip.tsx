import { getWeaponStats } from "#/lib/csvParser"
import { BuildSprite } from "#/lib/weaponSpriteHelper"
import type { weapon, weaponStats } from "#/types"
import { TYPE_COLOR_MAP } from "./weaponTile"

const SIZE_LABEL: Record<weapon["size"], string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large"
}

const DAMAGE_TYPE_LABEL: Record<string, string> = {
  KINETIC: "Kinetic",
  HIGH_EXPLOSIVE: "High Explosive",
  ENERGY: "Energy",
  FRAGMENTATION: "Fragmentation"
}

const DAMAGE_TYPE_MODS: Record<string, { armor: number; shields: number }> = {
  KINETIC: { armor: 100, shields: 200 },
  HIGH_EXPLOSIVE: { armor: 200, shields: 50 },
  ENERGY: { armor: 100, shields: 100 },
  FRAGMENTATION: { armor: 25, shields: 25 }
}

const HOVER_DELAY_MS = 250

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function text(v: unknown): string | null {
  if (v == null) return null
  const s = String(v).trim()
  return s === "" ? null : s
}

function num(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm text-gray-100">{label}</span>
      <span className="ss-amber text-right text-sm">{value}</span>
    </div>
  )
}

function SectionBar({ children }: { children: string }) {
  return (
    <div className="bg-[#1f7a8c] px-2 py-0.5 text-center text-sm text-white">
      {children}
    </div>
  )
}

export default function WeaponTooltip({
  weapon: w,
  allWeaponStats
}: {
  weapon: weapon
  allWeaponStats: weaponStats[]
}) {
  const stats = getWeaponStats({ weapon: w, weaponStats: allWeaponStats })
  const manufacturer = text(stats?.["tech/manufacturer"]) ?? "Common"
  const mountType = `${SIZE_LABEL[w.size] ?? w.size}, ${cap(w.type)}`

  const burst = num(stats?.["burst size"])
  const dmgPerShot = text(stats?.["damage/shot"])
  const damage =
    dmgPerShot && burst != null && burst > 1
      ? `${dmgPerShot}x${burst}`
      : dmgPerShot
  const hideDps =
    stats?.noDPSInTooltip === true ||
    String(stats?.noDPSInTooltip ?? "")
      .trim()
      .toLowerCase() === "true"
  const dps = hideDps ? null : text(stats?.["damage/second"])

  const fluxPerShot = num(stats?.["energy/shot"]) ?? 0
  const fluxPerSec = num(stats?.["energy/second"]) ?? 0
  const ammo = text(stats?.ammo)
  const fluxParts: string[] = []
  if (fluxPerShot === 0 && fluxPerSec === 0) fluxParts.push("No flux cost to fire")
  if (ammo) fluxParts.push(`limited ammo (${ammo})`)
  const fluxLine = fluxParts.length > 0 ? fluxParts.join(", ") : null

  // customPrimary/Ancillary contain %s placeholders for some weapons whose
  // values live in spec data we don't have — only show fillable lines.
  const customPrimary = text(stats?.customPrimary)
  const showCustomPrimary =
    customPrimary && !customPrimary.includes("%s") ? customPrimary : null
  const customAncillary = text(stats?.customAncillary)
  const showCustomAncillary =
    customAncillary && !customAncillary.includes("%s") ? customAncillary : null

  const damageType = text(stats?.type)?.toUpperCase() ?? null
  const mods = damageType ? DAMAGE_TYPE_MODS[damageType] : null
  const speed = text(stats?.speedStr)
  const tracking = text(stats?.trackingStr)
  const burstSize = text(stats?.["burst size"])
  const refire = text(stats?.chargedown)

  const range = text(stats?.range)
  const ordnancePoints = text(stats?.OPs)
  const primaryRole = text(stats?.primaryRoleStr)

  return (
    <div className="flex z-50 h-full w-full flex-col gap-1 overflow-auto border border-cyan-200/70 bg-black/90 p-3 shadow-xl">
      <div className="flex items-center gap-2">
        <div
          className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border"
          style={{ borderColor: TYPE_COLOR_MAP[w.type] ?? "gray" }}
        >
          <BuildSprite weapon={w} naturalSize />
        </div>
        <div className="min-w-0">
          <p className="text-base leading-tight text-white">
            {stats?.name ?? w.id}
          </p>
          <p className="text-xs text-gray-300">
            Design type&nbsp;&nbsp;{manufacturer}
          </p>
        </div>
      </div>

      <SectionBar>Primary data</SectionBar>
      {primaryRole && <Row label="Primary role" value={primaryRole} />}
      <Row label="Mount type" value={mountType} />
      {ordnancePoints && <Row label="Ordnance points" value={ordnancePoints} />}
      {range && <Row label="Range" value={range} />}
      {damage && <Row label="Damage" value={damage} />}
      {dps && <Row label="Damage / second" value={dps} />}
      {fluxLine && (
        <p className="text-center text-sm text-white">{fluxLine}</p>
      )}
      {showCustomPrimary && (
        <p className="whitespace-pre-line text-xs text-gray-100">
          {showCustomPrimary}
        </p>
      )}

      <SectionBar>Ancillary data</SectionBar>
      {damageType && (
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-gray-100">Damage type</span>
          <span className="text-right">
            <span className="ss-amber block text-sm">
              {DAMAGE_TYPE_LABEL[damageType] ?? cap(damageType)}
            </span>
            {mods && (
              <span className="ss-amber block text-xs">
                {mods.armor}% vs armor, {mods.shields}% vs shields
              </span>
            )}
          </span>
        </div>
      )}
      {speed && <Row label="Speed" value={speed} />}
      {tracking && <Row label="Tracking" value={tracking} />}
      {burstSize && <Row label="Burst size" value={burstSize} />}
      {refire && <Row label="Refire delay (seconds)" value={refire} />}
      {showCustomAncillary && (
        <p className="whitespace-pre-line text-xs text-gray-100">
          {showCustomAncillary}
        </p>
      )}
    </div>
  )
}
