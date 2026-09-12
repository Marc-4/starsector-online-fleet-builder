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
    <div className="bg-cyan-800 px-2 py-0.5 text-center text-sm text-cyan-100">
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
  const dmgPerShotNum = num(stats?.["damage/shot"])
  const damage =
    dmgPerShot && burst != null && burst > 1
      ? `${dmgPerShot}x${burst}`
      : dmgPerShot
  const hideDps =
    stats?.noDPSInTooltip === true ||
    String(stats?.noDPSInTooltip ?? "")
      .trim()
      .toLowerCase() === "true"
  const dpsRaw = hideDps ? null : num(stats?.["damage/second"])

  // Burst DPS: prefer CSV damage/second, else derive from per-shot / cycle.
  // Refire delay is the full cycle: chargeup + chargedown + burst delay,
  // plus beam fire duration (burst size doubles as beam length for beams).
  // e.g. Gauss: 1 + 1 = 2; Tachyon Lance: 0.5 + 1 + 4 + 1 = 6.5.
  const isBeam = w.specClass === "beam"
  const burstRaw = stats?.["burst size"]
  const hasBurst =
    burstRaw != null && String(burstRaw).trim() !== "" && num(burstRaw) != null
  // Prolonged (continuous) beams have no burst size and no refire cycle —
  // only burst beams (Tachyon Lance, Phase Beam) do.
  const isProlongedBeam = isBeam && !hasBurst
  const burstSizeN = num(stats?.["burst size"]) ?? 1
  const burstDelay = num(stats?.["burst delay"]) ?? 0
  const chargeup = num(stats?.chargeup) ?? 0
  const chargedown = num(stats?.chargedown) ?? 0
  const beamDuration = isBeam && hasBurst ? burstSizeN : 0
  const cycle = chargeup + chargedown + burstDelay + beamDuration
  const refireDelay = !isProlongedBeam && cycle > 0 ? cycle : null
  const derivedBurstDps =
    dmgPerShotNum != null && cycle > 0
      ? (dmgPerShotNum * burstSizeN) / cycle
      : null
  const burstDps = dpsRaw ?? derivedBurstDps

  // Sustained DPS for ammo-regen weapons (e.g. Storm Needler):
  // limited by ammo/sec * damage per shot volley.
  const ammoPerSec = num(stats?.["ammo/sec"])
  const sustainedDps =
    ammoPerSec != null &&
    ammoPerSec > 0 &&
    dmgPerShotNum != null &&
    burstDps != null &&
    ammoPerSec * dmgPerShotNum * burstSizeN < burstDps
      ? ammoPerSec * dmgPerShotNum * burstSizeN
      : null

  const fluxPerShotNum = num(stats?.["energy/shot"])
  const fluxPerSecDirect = num(stats?.["energy/second"])
  const derivedFluxPerSec =
    fluxPerShotNum != null && cycle > 0
      ? (fluxPerShotNum * burstSizeN) / cycle
      : fluxPerShotNum != null && burstDps != null && dmgPerShotNum
        ? (fluxPerShotNum * burstDps) / (dmgPerShotNum * burstSizeN)
        : null
  const burstFluxPerSec = fluxPerSecDirect ?? derivedFluxPerSec
  const sustainedFluxPerSec =
    ammoPerSec != null &&
    ammoPerSec > 0 &&
    fluxPerShotNum != null &&
    burstFluxPerSec != null &&
    ammoPerSec * fluxPerShotNum * burstSizeN < burstFluxPerSec
      ? ammoPerSec * fluxPerShotNum * burstSizeN
      : null

  const fluxPerDamage =
    fluxPerShotNum != null &&
    dmgPerShotNum != null &&
    dmgPerShotNum !== 0
      ? fluxPerShotNum / dmgPerShotNum
      : null

  const fmt = (n: number) =>
    Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100)

  const dpsLine =
    burstDps != null
      ? sustainedDps != null
        ? `${fmt(burstDps)} (${fmt(sustainedDps)})`
        : fmt(burstDps)
      : null
  const fluxSecLine =
    burstFluxPerSec != null && burstFluxPerSec !== 0
      ? sustainedFluxPerSec != null
        ? `${fmt(burstFluxPerSec)} (${fmt(sustainedFluxPerSec)})`
        : fmt(burstFluxPerSec)
      : null

  const ammo = text(stats?.ammo)
  const fluxParts: string[] = []
  if (
    (burstFluxPerSec == null || burstFluxPerSec === 0) &&
    (fluxPerShotNum == null || fluxPerShotNum === 0)
  )
    fluxParts.push("No flux cost to fire")
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
  const showBurstSize = burstSizeN > 1

  // Accuracy / turn rate labels are derived the way the game does: accuracy
  // from max spread (plus autofire bonus bumping one step), turn rate from
  // the turn-rate value. Thresholds are approximations tuned so the Storm
  // Needler (spread 0-5, turn 15) yields Good / Slow as in-game.
  const maxSpread = num(stats?.["max spread"])
  const autofireBonus = num(stats?.autofireAccBonus) ?? 0
  const ACCURACY_STEPS = [
    "Very Poor",
    "Poor",
    "Average",
    "Good",
    "Excellent"
  ] as const
  const accuracy: string | null = (() => {
    if (maxSpread == null) return stats?.accuracyStr?.trim() || null
    let idx =
      maxSpread <= 3
        ? 4
        : maxSpread <= 6
          ? 3
          : maxSpread <= 12
            ? 2
            : maxSpread <= 20
              ? 1
              : 0
    if (autofireBonus > 0 && idx < ACCURACY_STEPS.length - 1) idx += 1
    return ACCURACY_STEPS[idx] ?? null
  })()
  const turnRateVal = num(stats?.["turn rate"])
  const turnRate: string | null =
    stats?.turnRateStr?.trim() ||
    (turnRateVal == null
      ? null
      : turnRateVal <= 8
        ? "Very Slow"
        : turnRateVal <= 18
          ? "Slow"
          : turnRateVal <= 28
            ? "Average"
            : turnRateVal <= 35
              ? "Fast"
              : "Very Fast")

  const range = text(stats?.range)
  const ordnancePoints = text(stats?.OPs)
  const primaryRole = text(stats?.primaryRoleStr)

  // Reloading-ammo stats (Storm Needler: ammo 60, reload size 30,
  // ammo/sec 10 → seconds/reload = 30/10 = 3).
  const maxAmmo = num(stats?.ammo)
  const reloadSize = num(stats?.["reload size"])
  const secondsPerReload =
    reloadSize != null && ammoPerSec != null && ammoPerSec > 0
      ? reloadSize / ammoPerSec
      : null

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

      <div className="h-3" />
      {range && <Row label="Range" value={range} />}
      {damage && <Row label="Damage" value={damage} />}
      {dpsLine && (
        <Row
          label={
            sustainedDps != null
              ? "Damage / second (sustained)"
              : "Damage / second"
          }
          value={dpsLine}
        />
      )}

      <div className="h-3" />
      {fluxSecLine && (
        <Row
          label={
            sustainedFluxPerSec != null
              ? "Flux / second (sustained)"
              : "Flux / second"
          }
          value={fluxSecLine}
        />
      )}
      {fluxPerShotNum != null && fluxPerShotNum !== 0 && (
        <Row label="Flux / shot" value={fmt(fluxPerShotNum)} />
      )}
      {fluxPerDamage != null && fluxPerShotNum !== 0 && (
        <Row label="Flux / damage" value={fmt(fluxPerDamage)} />
      )}
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

      {(accuracy || turnRate) && <div className="h-3" />}
      {accuracy && <Row label="Accuracy" value={accuracy} />}
      {turnRate && <Row label="Turn rate" value={turnRate} />}
      {showBurstSize && <Row label="Burst size" value={fmt(burstSizeN)} />}

      {(maxAmmo != null || secondsPerReload != null || reloadSize != null) && (
        <div className="h-3" />
      )}
      {maxAmmo != null && <Row label="Max ammo" value={fmt(maxAmmo)} />}
      {secondsPerReload != null && (
        <Row label="Seconds / reload" value={fmt(secondsPerReload)} />
      )}
      {reloadSize != null && (
        <Row label="Reload size" value={fmt(reloadSize)} />
      )}

      {refireDelay != null && (
        <>
          <div className="h-3" />
          <Row label="Refire delay (seconds)" value={fmt(refireDelay)} />
        </>
      )}
      {showCustomAncillary && (
        <p className="whitespace-pre-line text-xs text-gray-100">
          {showCustomAncillary}
        </p>
      )}
    </div>
  )
}
