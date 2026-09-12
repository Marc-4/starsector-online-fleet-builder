import { getWingHullId } from "#/lib/csvParser"
import type { shipStats, wingStats } from "#/types"

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

function humanize(id: string): string {
  return id
    .replace(/_fighter$/i, "")
    .split(/[_-]+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ")
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

export default function FighterTooltip({
  wing,
  allShipStats,
  description,
  systemName,
  systemDesc,
  armaments
}: {
  wing: wingStats
  allShipStats: shipStats[]
  description?: string | null
  systemName?: string | null
  systemDesc?: string | null
  armaments?: string | null
}) {
  const hullId = getWingHullId(wing)
  const stats = allShipStats.find((s) => s.id === hullId) ?? null

  const name = text(stats?.name) ?? humanize(wing.variant ?? wing.id)
  const roleDesc = text(wing["role desc"]) ?? text(wing.role)
  const manufacturer = text(stats?.["tech/manufacturer"]) ?? "Common"

  const opCost = num(wing["op cost"])
  const crew = num(stats?.["min crew"]) ?? num(stats?.["max crew"])
  const range = num(wing.range)
  const fightersInWing = num(wing.num)
  const refit = num(wing.refit)
  const hull = num(stats?.hitpoints)
  const armor = num(stats?.["armor rating"])
  const topSpeed = num(stats?.["max speed"])

  const sysId = text(stats?.["system id"])
  const sysName = systemName ?? (sysId ? humanize(sysId) : null)

  return (
    <div className="flex z-50 h-full w-full flex-col gap-1 overflow-auto border border-cyan-200/70 bg-black/90 p-3 shadow-xl">
      <p className="text-base leading-tight text-white">
        {name}
        {roleDesc ? ` ${roleDesc}` : ""}
      </p>
      <p className="text-xs text-gray-300">
        Design type&nbsp;&nbsp;{manufacturer}
      </p>
      {description && <p className="text-xs text-gray-100">{description}</p>}

      <SectionBar>Technical data</SectionBar>
      {roleDesc && <Row label="Primary role" value={roleDesc} />}
      {opCost != null && <Row label="Ordnance points" value={String(opCost)} />}
      {crew != null && <Row label="Crew per fighter" value={String(crew)} />}
      {range != null && (
        <Row label="Maximum engagement range" value={String(range)} />
      )}

      <div className="h-3" />
      {fightersInWing != null && (
        <Row label="Fighters in wing" value={String(fightersInWing)} />
      )}
      {refit != null && (
        <Row label="Base replacement time (seconds)" value={String(refit)} />
      )}

      <div className="h-3" />
      {hull != null && <Row label="Hull integrity" value={String(hull)} />}
      {armor != null && <Row label="Armor rating" value={String(armor)} />}
      {topSpeed != null && <Row label="Top speed" value={String(topSpeed)} />}

      {(sysName || armaments) && <div className="h-3" />}
      {sysName && (
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-gray-100">System:</span>
          <span className="text-right">
            <span className="ss-amber block text-sm">{sysName}</span>
            {systemDesc && (
              <span className="block text-xs text-gray-100">{systemDesc}</span>
            )}
          </span>
        </div>
      )}
      {armaments && (
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-gray-100">Armaments:</span>
          <span className="ss-amber text-right text-sm">{armaments}</span>
        </div>
      )}
    </div>
  )
}
