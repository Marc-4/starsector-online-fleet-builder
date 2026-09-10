import { type ReactNode, useEffect, useRef, useState } from "react"
import type { weapon, weaponMount } from "#/types"

//WARN: mostly unreviewed.
type BuildSpriteProps = {
  weapon: weapon
  /** Which sprite set to use. Defaults to turret set with hardpoint fallback
   *  (refit-list preview has no slot mount to key off). */
  mount?: weaponMount
  /** Multiplier on the measured px-per-game-unit scale. 1 PNG px = 1 unit. */
  scale?: number
  /** Render all layers at their natural PNG size (1 image px = 1 css px)
   *  instead of fitting the base into the container. The container must be
   *  large enough to hold the biggest sprite (vanilla max is 72x72). */
  naturalSize?: boolean
  className?: string
}

// returns layered weapon sprite as a full react component
// Static (unfired) mount render per weaponSpriteAnalysis.md §§1-2:
// sprites point UP, pivot = image center, offsets = [forward, lateral]
// (forward = image -Y). Layer order: under -> base -> gun (or gun below
// base with RENDER_BARREL_BELOW) -> loaded missiles. Glow sprites are
// intentionally not rendered.
//
// Missile tubes: in fit mode the base is drawn with object-contain, so its
// displayed scale depends on the base PNG size (turret canvases range from
// 20x20 to 72x72). Tube positions and missile sizes are therefore computed
// from the measured base/container sizes instead of a fixed px-per-unit
// constant. In naturalSize mode everything is 1:1, so offsets apply directly.
export function BuildSprite({
  weapon: w,
  mount,
  scale = 1,
  naturalSize = false,
  className
}: BuildSpriteProps): ReactNode {
  const useHardpoint =
    mount === "HARDPOINT"
      ? true
      : mount === "TURRET"
        ? false
        : !w.turretSprite && !!w.hardpointSprite

  const baseSprite = useHardpoint
    ? (w.hardpointSprite ?? w.turretSprite)
    : (w.turretSprite ?? w.hardpointSprite)
  const gunSprite = useHardpoint
    ? (w.hardpointGunSprite ?? w.turretGunSprite)
    : (w.turretGunSprite ?? w.hardpointGunSprite)
  const underSprite = useHardpoint
    ? ((w as unknown as Record<string, string>).hardpointUnderSprite ??
      (w as unknown as Record<string, string>).turretUnderSprite)
    : ((w as unknown as Record<string, string>).turretUnderSprite ??
      (w as unknown as Record<string, string>).hardpointUnderSprite)
  // Gun layer is only used when visualRecoil is non-zero (vanilla comment).
  const hasRecoil = (w.visualRecoil ?? 0) !== 0
  const showGun = !!gunSprite && hasRecoil && w.specClass !== "beam"

  const hints = w.renderHints ?? []
  const renderGunBelow = hints.includes("RENDER_BARREL_BELOW")
  const additiveBase = hints.includes("RENDER_ADDITIVE")
  const isBeam = w.specClass === "beam"
  const isMissileRack =
    hints.includes("RENDER_LOADED_MISSILES") ||
    hints.includes("RENDER_LOADED_MISSILES_UNLESS_HIDDEN")

  // Muzzle slots use the offsets matching the chosen sprite set (§3b).
  const offsets: number[] | undefined = useHardpoint
    ? (w.hardpointOffsets?.length ? w.hardpointOffsets : w.turretOffsets)
    : (w.turretOffsets?.length ? w.turretOffsets : w.hardpointOffsets)
  const angleOffsets: number[] | undefined = useHardpoint
    ? (w.hardpointAngleOffsets?.length
        ? w.hardpointAngleOffsets
        : w.turretAngleOffsets)
    : (w.turretAngleOffsets?.length
        ? w.turretAngleOffsets
        : w.hardpointAngleOffsets)

  function toSlots(arr?: number[]): { fwd: number; lat: number; angle: number }[] {
    if (!arr || arr.length < 2) return []
    const out: { fwd: number; lat: number; angle: number }[] = []
    for (let i = 0; i + 1 < arr.length; i += 2) {
      const idx = i / 2
      out.push({
        fwd: arr[i] ?? 0,
        lat: arr[i + 1] ?? 0,
        angle: angleOffsets?.[idx] ?? 0
      })
    }
    return out
  }
  const missileSlots = isMissileRack && !isBeam ? toSlots(offsets) : []
  const missileSprite =
    missileSlots.length > 0 ? getMissileSprite(w) : null

  // Measured geometry: px per game unit of the displayed base image.
  const containerRef = useRef<HTMLDivElement>(null)
  const [baseNat, setBaseNat] = useState<{ w: number; h: number } | null>(null)
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)
  const [mslNat, setMslNat] = useState<{ w: number; h: number } | null>(null)


  // biome-ignore lint: all 3 required deps to properly reset sizes.
    useEffect(() => {
    setBaseNat(null)
    setMslNat(null)
  }, [w.id, baseSprite, missileSprite])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () =>
      setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!missileSprite) return
    const img = new Image()
    img.src = `/missiles/${missileSprite}`
    img.onload = () =>
      setMslNat({ w: img.naturalWidth, h: img.naturalHeight })
  }, [missileSprite])

  // object-contain scale of the base image inside the container (fit mode).
  // In naturalSize mode the base is 1:1, so one game unit is one css px.
  const pxPerUnit =
    naturalSize || !(baseNat && box && baseNat.w > 0 && baseNat.h > 0 && box.w > 0 && box.h > 0)
      ? scale
      : Math.min(box.w / baseNat.w, box.h / baseNat.h) * scale

  const gunImg = showGun ? (
    <img
      draggable={false}
      src={`/weapons/${gunSprite}`}
      alt=""
      className={
        naturalSize
          ? `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none ${
              renderGunBelow ? "z-0" : "z-20"
            }`
          : `absolute inset-0 h-full w-full object-contain pointer-events-none ${
              renderGunBelow ? "z-0" : "z-20"
            }`
      }
    />
  ) : null

  return (
    <div
      ref={containerRef}
      className={
        naturalSize
          ? `relative flex h-full w-full items-center justify-center overflow-hidden ${className ?? ""}`
          : `relative h-full w-full ${className ?? ""}`
      }
    >
      {underSprite && (
        <img
          draggable={false}
          src={`/weapons/${underSprite}`}
          alt=""
          className={
            naturalSize
              ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
              : "absolute inset-0 z-0 h-full w-full object-contain"
          }
        />
      )}
      {renderGunBelow && gunImg}
      {baseSprite ? (
        <img
          draggable={false}
          src={`/weapons/${baseSprite}`}
          alt={isBeam ? "beam weapon" : w.id}
          className={
            naturalSize
              ? "relative z-10 shrink-0"
              : "absolute inset-0 z-10 h-full w-full object-contain"
          }
          style={additiveBase ? { mixBlendMode: "screen" } : undefined}
          onLoad={(e) =>
            setBaseNat({
              w: e.currentTarget.naturalWidth,
              h: e.currentTarget.naturalHeight
            })
          }
        />
      ) : (
        <div className="absolute inset-0 z-10 border border-cyan-800 bg-cyan-900/30" />
      )}
      {!renderGunBelow && gunImg}
      {missileSprite && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          {missileSlots.map((p, i) => (
            <img
              key={i}
              src={`/missiles/${missileSprite}`}
              alt="missile"
              draggable={false}
              className="absolute object-contain"
              style={{
                // Screen mapping for an up-facing mount: forward+ = image
                // -Y (up), and +lateral renders LEFT of center (measured
                // against tube openings in the base art). Per-barrel angles
                // are counterclockwise-positive, so they negate into CSS
                // (clockwise-positive) rotation.
                left: `calc(50% - ${p.lat * pxPerUnit}px)`,
                top: `calc(50% + ${-p.fwd * pxPerUnit}px)`,
                transform: `translate(-50%, -50%) rotate(${-p.angle}deg)`,
                // Natural size: intrinsic PNG size is already 1:1, no
                // sizing needed. Fit mode: match the base's contain scale.
                ...(!naturalSize && mslNat
                  ? {
                      width: mslNat.w * pxPerUnit,
                      height: mslNat.h * pxPerUnit
                    }
                  : undefined),
                ...(!naturalSize && !mslNat
                  ? { maxWidth: "55%", maxHeight: "55%" }
                  : undefined)
              }}
              title={`missile ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getMissileSprite(w: weapon): string {
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
    resonatormrm: "resonator_mrm.webp",
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
    resonatormrm_shot: "resonator_mrm.webp",
    assaying_rift: "rift_torpedo.webp",
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
  if (proj.includes("breach") || proj.includes("srm")) return "breach_srm.webp"
  if (proj.includes("reaper") || proj.includes("hammer") || proj.includes("torp"))
    return "torpedo_guided.webp"
  if (proj.includes("bomb")) return "bomb_HE.webp"
  if (proj.includes("lrm") || proj.includes("pilum")) return "missile_LRM.webp"
  return "missile_SRM.webp"
}
