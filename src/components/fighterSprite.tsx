import { useEffect, useRef, useState } from "react"
import Spinner from "#/components/spinner"
import { getFighterSlotProj, getFighterSlotWeapon } from "#/lib/fighterLoadout"
import {
  getProjectile,
  resolveProjectileSpriteUrl
} from "#/lib/projectileParser"
import { getWeapon } from "#/lib/weaponParser"
import type { projectile, ship } from "#/types"

type Tube = {
  slotId: string
  /** Slot point in game units from the top-left of the hull box. */
  gx: number
  gy: number
  proj: projectile
  url: string
}

function validProj(p: projectile | null): p is projectile {
  return (
    !!p &&
    Array.isArray(p.size) &&
    p.size.length >= 2 &&
    p.size[0] > 0 &&
    p.size[1] > 0 &&
    Array.isArray(p.center) &&
    p.center.length >= 2 &&
    Number.isFinite(p.center[0]) &&
    Number.isFinite(p.center[1])
  )
}

/** Ship sprite with bomber missile overlays.
 * The base uses object-contain so it never stretches. Missiles are sized
 * and positioned in measured px from the actually-rendered image rect
 * (same approach as BuildSprite), so letterboxing or PNGs whose pixels
 * don't match the hull box can't misalign them. Each tube pins the .proj
 * `center` on the slot point, always nose-up. */
export default function FighterSprite({
  ship: s,
  variant,
  className
}: {
  ship: ship
  variant?: string | null
  className?: string
}) {
  const [tubes, setTubes] = useState<Tube[] | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)
  const [baseNat, setBaseNat] = useState<{ w: number; h: number } | null>(null)
  const [baseLoaded, setBaseLoaded] = useState(false)

  const missileSlots = (s.weaponSlots ?? []).filter(
    (slot) => slot.type === "MISSILE" && slot.locations
  )

  useEffect(() => {
    if (!variant || missileSlots.length === 0) {
      setTubes([])
      return
    }
    let cancelled = false
    setTubes(null)
    void (async () => {
      const out: Tube[] = []
      for (const slot of missileSlots) {
        const loc = slot.locations
        if (!loc) continue
        // Resolve .proj id: explicit fallback map first, else via .wpn.
        let projId = getFighterSlotProj(variant, slot.id)
        if (!projId) {
          const weaponId = getFighterSlotWeapon(variant, slot.id)
          if (!weaponId) continue
          try {
            const w = await getWeapon({ id: weaponId })
            projId = w.projectileSpecId?.toString() ?? null
          } catch {
            continue
          }
          if (!projId) continue
        }
        let proj: projectile | null = null
        try {
          proj = await getProjectile({ id: projId })
        } catch {
          continue
        }
        if (!validProj(proj)) continue
        const url = resolveProjectileSpriteUrl(proj.sprite)
        if (!url) continue
        out.push({
          slotId: slot.id,
          // Same mapping as shipDisplay slot markers:
          // x = centerX - locY, y = height - centerY - locX
          gx: s.center[0] - loc[1],
          gy: s.height - s.center[1] - loc[0],
          proj,
          url
        })
      }
      if (!cancelled) setTubes(out)
    })()
    return () => {
      cancelled = true
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on hull+variant
  }, [s.hullId, variant])

  // biome-ignore lint: reset measured base art when the hull changes.
  useEffect(() => {
    setBaseNat(null)
    setBaseLoaded(false)
  }, [s.hullId])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Rendered rect of the contained base image inside the container.
  let imgX = 0
  let imgY = 0
  let pxX = 0
  let pxY = 0
  if (box && baseNat && box.w > 0 && box.h > 0) {
    const scale = Math.min(box.w / baseNat.w, box.h / baseNat.h)
    const imgW = baseNat.w * scale
    const imgH = baseNat.h * scale
    imgX = (box.w - imgW) / 2
    imgY = (box.h - imgH) / 2
    // Game units map onto the displayed image, not the container.
    pxX = imgW / s.width
    pxY = imgH / s.height
  }
  const ready = pxX > 0 && pxY > 0

  const wide = s.width >= s.height
  return (
    <div
      ref={containerRef}
      className={`relative shrink-0 ${className ?? ""}`}
      style={{
        aspectRatio: `${s.width} / ${s.height}`,
        // Fit inside the parent box preserving the hull ratio: constrain
        // the long axis, derive the other via aspect-ratio.
        width: wide ? "100%" : "auto",
        height: wide ? "auto" : "100%",
        // Never upscale past the art's original dimensions.
        maxWidth: baseNat ? Math.min(box?.w ?? baseNat.w, baseNat.w) : "100%",
        maxHeight: baseNat ? Math.min(box?.h ?? baseNat.h, baseNat.h) : "100%"
      }}
    >
      <img
        draggable={false}
        src={`ships${s.spriteName}`}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        style={{ imageRendering: "smooth" }}
        onLoad={(e) => {
          setBaseNat({
            w: e.currentTarget.naturalWidth,
            h: e.currentTarget.naturalHeight
          })
          setBaseLoaded(true)
        }}
        onError={() => setBaseLoaded(true)}
      />
      {!baseLoaded && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <Spinner />
        </div>
      )}
      {ready &&
        tubes?.map((t) => {
          const [sw, sh] = t.proj.size as [number, number]
          const [cx, cy] = t.proj.center as [number, number]
          // Pin .proj center (origin bottom-left, nose +Y) on the tube.
          const left = imgX + t.gx * pxX - cx * pxX
          const top = imgY + t.gy * pxY - (sh - cy) * pxY
          return (
            <img
              key={t.slotId}
              draggable={false}
              src={t.url}
              alt=""
              className="absolute max-w-none"
              style={{
                left,
                top,
                width: sw * pxX,
                height: sh * pxY,
                objectFit: "fill",
                imageRendering: "pixelated"
              }}
            />
          )
        })}
    </div>
  )
}
