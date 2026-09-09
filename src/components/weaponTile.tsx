import { getWeaponStats } from "#/lib/csvParser"
import type { weapon, weaponStats } from "#/types"

type Props = {
  weapon: weapon
  allWeaponStats: weaponStats[]
  onSelect?: (weapon: weapon) => void
}

//WARN: this whole weapon rendering debacle is way too complex to do in a day. REFACTOR
export default function WeaponTile({
  weapon: w,
  allWeaponStats,
  onSelect
}: Props) {
  const stats = getWeaponStats({ weapon: w, weaponStats: allWeaponStats })
  const manufacturer = (stats?.["tech/manufacturer"] || "Common")
    .toString()
    .trim()

  // Rendering logic per .wpn spec:
  // - beams: base only
  // - rotary: first frame
  // - missiles with RENDER_LOADED_MISSILES: base + mini missile sprites at offsets
  const baseSprite = w.turretSprite ?? w.hardpointSprite
  const gunSprite = w.turretGunSprite ?? w.hardpointGunSprite
  const underSprite =
    (w as unknown as Record<string, string>).turretUnderSprite ??
    (w as unknown as Record<string, string>).hardpointUnderSprite
  const isBeam = w.specClass === "beam"
  const isMissileRack = !!w.renderHints?.includes("RENDER_LOADED_MISSILES")
  const renderGunBelow = !!w.renderHints?.includes("RENDER_BARREL_BELOW")
  // Strictly use turret offsets/angles (fallback to hardpoint only if turret missing)
  const offsets: number[] | undefined = w.turretOffsets?.length
    ? w.turretOffsets
    : w.hardpointOffsets
  const angleOffsets: number[] | undefined = w.turretAngleOffsets?.length
    ? w.turretAngleOffsets
    : w.hardpointAngleOffsets

  const SCALE = 0.85
  function toSlots(arr?: number[]): { x: number; y: number; angle: number }[] {
    if (!arr || arr.length < 2) return []
    const out: { x: number; y: number; angle: number }[] = []
    for (let i = 0; i + 1 < arr.length; i += 2) {
      const idx = i / 2
      out.push({
        x: arr[i] ?? 0,
        y: arr[i + 1] ?? 0,
        angle: angleOffsets?.[idx] ?? 0
      })
    }
    return out
  }
  const missileSlots = isMissileRack ? toSlots(offsets) : []

  function getMissileSprite(): string {
    const id = w.id
    const proj = (w.projectileSpecId || "").toString()
    const map: Record<string, string> = {
      squall: "missile_squall.webp",
      harpoon: "missile_harpoon.webp",
      harpoon_single: "missile_harpoon.webp",
      harpoonpod: "missile_harpoon.webp",
      annihilator: "missile_annihilator.webp",
      annihilatorpod: "missile_annihilator.webp",
      annihilator_fighter: "missile_annihilator.webp",
      breach: "breach_srm.webp",
      breachpod: "breach_srm.webp",
      amsrm: "am_srm.webp",
      sabot: "missile_sabot.webp",
      sabot_single: "missile_sabot.webp",
      sabotpod: "missile_sabot.webp",
      sabot_fighter: "missile_sabot.webp",
      pilum: "missile_LRM.webp",
      pilum_large: "missile_LRM.webp",
      hurricane: "missile_MIRV.webp",
      cyclone: "torpedo_guided.webp",
      reaper: "missile_torpedo_compact.webp",
      typhoon: "torpedo_guided.webp",
      hammer: "low_tech_torpedo.webp",
      hammer_single: "low_tech_torpedo.webp",
      hammerrack: "low_tech_torpedo.webp",
      jackhammer: "low_tech_torpedo.webp",
      atropos: "torpedo_guided2.webp",
      atropos_single: "torpedo_guided2.webp",
      gorgon: "missile_gorgon_dem.webp",
      gorgonpod: "missile_gorgon_dem.webp",
      dragon: "dragonfire.webp",
      dragonpod: "dragonfire.webp",
      gazer: "missile_gazer.webp",
      gazerpod: "missile_gazer.webp",
      hydra: "missile_hydra_mdem.webp",
      heatseeker: "missile_salamander.webp",
      salamanderpod: "missile_salamander.webp",
      locust: "missile_locust.webp",
      swarmer: "missile_SRM.webp",
      swarmer_fighter: "missile_SRM.webp",
      swarm_launcher: "missile_SRM.webp",
      bomb: "bomb_HE.webp",
      clusterbomb: "bomb_HE.webp",
      fragbomb: "bomb_HE.webp",
      terminator_missile: "missile_sabot.webp",
      kinetic_fragments: "flechette_sml.webp",
      devouring_swarm: "threat_missile1.webp",
      neutron_torpedo: "neutron_torpedo.webp",
      rifttorpedo: "rift_torpedo.webp",
      gazer_payload: "missile_gazer.webp",
      gorgon_payload: "missile_gorgon_dem.webp",
      dragon_payload: "dragonfire.webp",
      hydra_payload: "missile_hydra_mdem_warhead.webp"
    }
    if (map[id]) return map[id]
    if (map[proj]) return map[proj]
    if (proj.includes("sabot")) return "missile_sabot.webp"
    if (proj.includes("harpoon")) return "missile_harpoon.webp"
    if (proj.includes("annihilator")) return "missile_annihilator.webp"
    if (proj.includes("squall")) return "missile_squall.webp"
    if (proj.includes("breach") || proj.includes("srm"))
      return "breach_srm.webp"
    if (
      proj.includes("reaper") ||
      proj.includes("hammer") ||
      proj.includes("torp")
    )
      return "torpedo_guided.webp"
    if (proj.includes("bomb")) return "bomb_HE.webp"
    if (proj.includes("lrm") || proj.includes("pilum"))
      return "missile_LRM.webp"
    return "missile_SRM.webp"
  }

  const missileSprite = isMissileRack ? getMissileSprite() : null

  return (
    <button
      type="button"
      onClick={() => onSelect?.(w)}
      className="w-full min-h-14 cursor-pointer flex items-center gap-3 px-3 py-2 border border-cyan-800 bg-gray-950/40 hover:bg-cyan-900/40 hover:border-cyan-600 text-left pointer-events-auto shrink-0"
    >
      <div className="relative w-16 h-10 shrink-0 flex items-center justify-center overflow-visible">
        {underSprite && (
          <img
            draggable={false}
            src={`/weapons/${underSprite}`}
            alt=""
            className="absolute inset-0 w-full h-full object-contain left"
          />
        )}
        {baseSprite ? (
          <img
            draggable={false}
            src={`/weapons/${baseSprite}`}
            alt={isBeam ? "beam weapon" : w.id}
            className={`max-w-full max-h-full object-contain ${underSprite ? "relative z-10" : "relative z-10"} ${gunSprite && renderGunBelow ? "z-10" : "z-10"}`}
          />
        ) : (
          <div className="w-full h-full bg-cyan-900/30 border border-cyan-800" />
        )}
        {gunSprite && (
          <img
            draggable={false}
            src={`/weapons/${gunSprite}`}
            alt=""
            className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${renderGunBelow ? "z-0" : "z-10"} ${w.size === "SMALL" && w.type === "BALLISTIC" ? "translate-y-[3px]" : ""}`}
          />
        )}
        {isMissileRack && missileSlots.length > 0 && missileSprite && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {missileSlots.map((p, i) => (
              <img
                key={i}
                src={`/missiles/${missileSprite}`}
                alt="missile"
                draggable={false}
                className="absolute w-fit h-fit max-w-[55%] max-h-[55%] object-contain"
                style={{
                  left: `calc(50% + ${p.y * SCALE}px)`,
                  top: `calc(50% + ${-p.x * SCALE + (w.size === "LARGE" ? 3 : 0) + (w.id === "gazerpod" ? -5 : 0)}px)`,
                  transform: `translate(-50%, -50%) rotate(${p.angle}deg)`
                }}
                title={`missile ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-cyan-100 text-sm truncate font-semibold">
          {stats?.name ?? w.id}
        </p>
        <p
          className="text-cyan-300 text-xs truncate"
          title={manufacturer || undefined}
        >
          {w.type} • {w.size} • {w.specClass}
          {manufacturer ? ` • ${manufacturer}` : ""}
        </p>
      </div>
      <div className="flex flex-col items-end gap-0 shrink-0">
        <span className="text-amber-300 text-xs">
          {stats ? `${stats.OPs ?? "-"} OP` : ""}
        </span>
        <span className="text-cyan-200 text-[10px]">
          {stats?.range ? `${stats.range} su` : ""}
        </span>
      </div>
    </button>
  )
}
