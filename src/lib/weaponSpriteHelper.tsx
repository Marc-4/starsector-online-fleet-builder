import { type ReactNode, useEffect, useRef, useState } from "react"
import Spinner from "#/components/spinner"
import type { projectile, weapon, weaponMount } from "#/types"
import { getProjectile, resolveProjectileSpriteUrl } from "./projectileParser"

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
// Missile tubes: per missileRackAlignment.md, each tube draws the .proj
// missile sprite once, above the rack art, nose along the weapon facing plus
// that tube's angle offset, with the .proj `center` pinned exactly on the
// tube fire offset. Size is the .proj `size` box (non-uniform stretch if
// needed). In fit mode the base is drawn with object-contain, so tube
// positions and missile sizes scale with the measured base/container ratio.
// In naturalSize mode everything is 1:1, so offsets apply directly.
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
    ? w.hardpointOffsets?.length
      ? w.hardpointOffsets
      : w.turretOffsets
    : w.turretOffsets?.length
      ? w.turretOffsets
      : w.hardpointOffsets
  const angleOffsets: number[] | undefined = useHardpoint
    ? w.hardpointAngleOffsets?.length
      ? w.hardpointAngleOffsets
      : w.turretAngleOffsets
    : w.turretAngleOffsets?.length
      ? w.turretAngleOffsets
      : w.hardpointAngleOffsets

  function toSlots(
    arr?: number[]
  ): { fwd: number; lat: number; angle: number }[] {
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

  // Hardpoint racks seat their missiles further back along the mount facing
  // than the raw fire offsets place them — shift the tube point rearward
  // (image +Y) so tails bite into the rails instead of floating ahead of
  // the rack. Turret mounts need no shift. Game units (scaled by pxPerUnit
  // at render time); tune here.
  const HARDPOINT_TUBE_SHIFT = 12
  const tubeShift = useHardpoint ? HARDPOINT_TUBE_SHIFT : 0

  // Loaded-missile art comes from the .proj target of projectileSpecId —
  // no hardcoded sprite map. undefined = loading, null = no rack / no art.
  const [proj, setProj] = useState<projectile | null | undefined>(undefined)
  const projId = w.projectileSpecId?.toString() ?? ""
  const wantMissiles =
    isMissileRack && !isBeam && missileSlots.length > 0 && projId !== ""

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on weapon + proj id
  useEffect(() => {
    if (!wantMissiles) {
      setProj(null)
      return
    }
    let cancelled = false
    setProj(undefined)
    void (async () => {
      try {
        const p = await getProjectile({ id: projId })
        if (!cancelled) setProj(p)
      } catch (e) {
        console.warn(`BuildSprite: unknown projectile id ${projId}`, e)
        if (!cancelled) setProj(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [w.id, projId, wantMissiles, missileSlots.length])

  const missileUrl = proj ? resolveProjectileSpriteUrl(proj.sprite) : null
  const mslSize = proj?.size
  const mslCenter = proj?.center
  const validMissile =
    wantMissiles &&
    proj !== undefined &&
    proj !== null &&
    !!missileUrl &&
    Array.isArray(mslSize) &&
    mslSize.length >= 2 &&
    Number.isFinite(mslSize[0]) &&
    Number.isFinite(mslSize[1]) &&
    mslSize[0] > 0 &&
    mslSize[1] > 0 &&
    Array.isArray(mslCenter) &&
    mslCenter.length >= 2 &&
    Number.isFinite(mslCenter[0]) &&
    Number.isFinite(mslCenter[1])

  // Measured geometry: px per game unit of the displayed base image.
  const containerRef = useRef<HTMLDivElement>(null)
  const [baseNat, setBaseNat] = useState<{ w: number; h: number } | null>(null)
  const [baseLoaded, setBaseLoaded] = useState(!baseSprite)
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)

  // biome-ignore lint: reset measured base art when the weapon/sprite changes.
  useEffect(() => {
    setBaseNat(null)
    setBaseLoaded(!baseSprite)
  }, [w.id, baseSprite])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // object-contain scale of the base image inside the container (fit mode).
  // In naturalSize mode the base is 1:1, so one game unit is one css px.
  const pxPerUnit =
    naturalSize ||
    !(
      baseNat &&
      box &&
      baseNat.w > 0 &&
      baseNat.h > 0 &&
      box.w > 0 &&
      box.h > 0
    )
      ? scale
      : Math.min(box.w / baseNat.w, box.h / baseNat.h) * scale

  const gunImg = showGun ? (
    <img
      style={{ imageRendering: "pixelated" }}
      draggable={false}
      src={`weapons/${gunSprite}`}
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
      {!baseLoaded && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <Spinner />
        </div>
      )}
      <div className={baseLoaded ? "contents" : "contents invisible"}>
      {underSprite && (
        <img
          style={{ imageRendering: "pixelated" }}
          draggable={false}
          src={`weapons/${underSprite}`}
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
          src={`weapons/${baseSprite}`}
          alt={isBeam ? "beam weapon" : w.id}
          className={
            naturalSize
              ? "relative z-10 shrink-0"
              : "absolute inset-0 z-10 h-full w-full object-contain"
          }
          style={{
            mixBlendMode: additiveBase ? "screen" : undefined,
            imageRendering: "pixelated"
          }}
          onLoad={(e) => {
            setBaseNat({
              w: e.currentTarget.naturalWidth,
              h: e.currentTarget.naturalHeight
            })
            setBaseLoaded(true)
          }}
          onError={() => setBaseLoaded(true)}
        />
      ) : (
        <div className="absolute inset-0 z-10 border border-cyan-800 bg-cyan-900/30" />
      )}
      {!renderGunBelow && gunImg}
      {validMissile && missileUrl && mslSize && mslCenter && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          {missileSlots.map((p, i) => {
            const sw = mslSize[0]
            const sh = mslSize[1]
            const cx = mslCenter[0]
            const cy = mslCenter[1]
            return (
              <div
                key={i}
                className="absolute w-0 h-0"
                style={{
                  // Screen mapping for an up-facing mount: forward+ = image
                  // -Y (up), and +lateral renders LEFT of center (measured
                  // against tube openings in the base art). Per-barrel angles
                  // are counterclockwise-positive, so they negate into CSS
                  // (clockwise-positive) rotation.
                  left: `calc(50% - ${p.lat * pxPerUnit}px)`,
                  top: `calc(50% + ${(-p.fwd + tubeShift) * pxPerUnit}px)`,
                  transform: `rotate(${-p.angle}deg)`,
                  transformOrigin: "0 0"
                }}
                title={`missile ${i + 1}`}
              >
                <img
                  src={missileUrl}
                  alt="missile"
                  draggable={false}
                  className="absolute max-w-none"
                  style={{
                    // Pin the .proj `center` (Cartesian, origin bottom-left,
                    // nose = +Y) exactly on the tube point: the image's
                    // top-left sits (-cx, -(sh-cy)) from the tube, so the
                    // anchor lands at the rotation origin. Nose protrusion
                    // past the tube is (sh-cy); tail bury behind it is cy.
                    left: -cx * pxPerUnit,
                    top: -(sh - cy) * pxPerUnit,
                    width: sw * pxPerUnit,
                    height: sh * pxPerUnit,
                    objectFit: "fill",
                    imageRendering: "pixelated"
                  }}
                />
              </div>
            )
          })}
        </div>
      )}
      </div>
    </div>
  )
}
