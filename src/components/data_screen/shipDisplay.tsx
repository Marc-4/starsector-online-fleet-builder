import { useEffect, useMemo, useState } from "react"
import BallisticIcon from "#/assets/slotIcons/ballistic.svg?react"
import CompositeIcon from "#/assets/slotIcons/composite.svg?react"
import EnergyIcon from "#/assets/slotIcons/energy.svg?react"
import HybridIcon from "#/assets/slotIcons/hybrid.svg?react"
import MissileIcon from "#/assets/slotIcons/missile.svg?react"
import SynergyIcon from "#/assets/slotIcons/synergy.svg?react"
import UniversalIcon from "#/assets/slotIcons/universal.svg?react"
import { BuildSprite } from "#/lib/weaponSpriteHelper"
import { getWeapon } from "#/lib/weaponParser"
import type { ship, weapon, weaponSlot } from "#/types"

export default function ShipDisplay({
  ship,
  zoom,
  onSlotClick,
  onSlotRightClick,
  onSlotShiftClick,
  mountedWeaponIds
}: {
  ship: ship
  zoom: number
  onSlotClick?: (slot: weaponSlot) => void
  /** Right-click on a mounted slot (unmount). Empty slots always open. */
  onSlotRightClick?: (slot: weaponSlot) => void
  /** Shift-click on a slot (quick-mount last weapon). */
  onSlotShiftClick?: (slot: weaponSlot) => void
  /** Mounted loadout decoded from the URL hash: weaponSlot id -> weapon id. */
  mountedWeaponIds?: Record<string, string>
}) {
  const slotStyle: Record<weaponSlot["type"], string> = {
    MISSILE: "text-lime-400",
    BALLISTIC: "text-yellow-400",
    UNIVERSAL: "text-zinc-300",
    ENERGY: "text-cyan-300",
    COMPOSITE: "text-lime-300",
    SYNERGY: "text-teal-300",
    HYBRID: "text-orange-400",
    SYSTEM: "hidden",
    DECORATIVE: "hidden"
  } as Record<weaponSlot["type"], string>

  const slotSize: Record<weaponSlot["size"], string> = {
    LARGE: "w-[45px] h-[45px]",
    MEDIUM: "w-[34px] h-[34px]",
    SMALL: "w-[20px] h-[20px]"
  }

  const weaponSlots = useMemo(() => ship.weaponSlots, [ship])

  // Decode mounted weapon ids (from the URL hash) into full weapon data for
  // rendering. Re-runs whenever the loadout changes, including hash changes.
  const [resolvedWeapons, setResolvedWeapons] = useState<
    Record<string, weapon>
  >({})
  const loadoutKey = JSON.stringify(mountedWeaponIds ?? {})

  // biome-ignore lint: keyed on serialized loadout
  useEffect(() => {
    let cancelled = false
    const ids = [...new Set(Object.values(mountedWeaponIds ?? {}))]
    if (ids.length === 0) {
      setResolvedWeapons({})
      return
    }
    void (async () => {
      const results = await Promise.allSettled(
        ids.map((id) => getWeapon({ id }))
      )
      if (cancelled) return
      const next: Record<string, weapon> = {}
      ids.forEach((id, idx) => {
        const r = results[idx]
        if (r.status === "fulfilled") next[id] = r.value
        else console.warn(`ShipDisplay: unknown weapon id ${id}`)
      })
      setResolvedWeapons(next)
    })()
    return () => {
      cancelled = true
    }
  }, [loadoutKey])

  const [altHeld, setAltHeld] = useState(false)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt" || e.altKey) {
        if (e.key === "Alt") e.preventDefault()
        setAltHeld(true)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt" || !e.altKey) setAltHeld(false)
    }
    const onBlur = () => setAltHeld(false)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("blur", onBlur)
    window.addEventListener("visibilitychange", onBlur)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("blur", onBlur)
      window.removeEventListener("visibilitychange", onBlur)
    }
  }, [])

  const buildSlotStyle = (slot: weaponSlot) => {
    const typeStyle = slotStyle[slot.type] ?? ""
    const sizeStyle = slotSize[slot.size] ?? ""
    return `${typeStyle} ${sizeStyle}`.trim()
  }

  const slotIconMap: Record<
    weaponSlot["type"],
    React.FC<React.SVGProps<SVGSVGElement>>
  > = {
    BALLISTIC: BallisticIcon,
    ENERGY: EnergyIcon,
    MISSILE: MissileIcon,
    HYBRID: HybridIcon,
    COMPOSITE: CompositeIcon,
    SYNERGY: SynergyIcon,
    UNIVERSAL: UniversalIcon
  } as Record<weaponSlot["type"], React.FC<React.SVGProps<SVGSVGElement>>>

  function SlotIcon({ type }: { type: weaponSlot["type"] }) {
    const Icon = slotIconMap[type]
    if (!Icon) return null
    return <Icon className="w-full h-full" />
  }

  function SlotAngle({
    slot,
    forceShow
  }: {
    slot: weaponSlot
    forceShow?: boolean
  }) {
    const angle = -(slot.angle ?? 0)
    const arc = slot.arc ?? 0
    const isFullCircle = arc >= 360
    const showArc = arc > 0 && arc < 360

    const r = 200
    const cx = 50
    const cy = 50
    let pathD: string | null = null
    if (showArc) {
      const startDeg = angle - arc / 2 - 90
      const endDeg = angle + arc / 2 - 90
      const toRad = (d: number) => (d * Math.PI) / 180
      const s = toRad(startDeg)
      const e = toRad(endDeg)
      const x1 = cx + r * Math.cos(s)
      const y1 = cy + r * Math.sin(s)
      const x2 = cx + r * Math.cos(e)
      const y2 = cy + r * Math.sin(e)
      const large = arc > 180 ? 1 : 0
      pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
    }

    if (!showArc && !isFullCircle) return null

    return (
      <div className="absolute inset-0 pointer-events-none">
        <svg
          role="img"
          aria-label="svg"
          viewBox="0 0 100 100"
          className={`absolute inset-0 w-full h-full overflow-visible transition-opacity duration-150 ${forceShow ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          {isFullCircle ? (
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="currentColor"
              fillOpacity={0}
              stroke="currentColor"
              strokeOpacity={1}
              strokeWidth={0.8}
              vectorEffect="non-scaling-stroke"
            />
          ) : (
            pathD && (
              <path
                d={pathD}
                fill="currentColor"
                fillOpacity={0}
                stroke="currentColor"
                strokeOpacity={1}
                strokeWidth={0.8}
                vectorEffect="non-scaling-stroke"
              />
            )
          )}
        </svg>
      </div>
    )
  }

  return (
    <div
      className="relative shrink-0 select-none"
      style={{
        width: ship.width,
        height: ship.height,
        transform: `scale(${zoom})`,
        transformOrigin: "center center",
        transition: "transform 200ms ease-in"
      }}
    >
      <img
        src={`ships/${ship.spriteName}`}
        alt="ship sprite"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ imageRendering: "smooth" }}
        draggable={false}
      />
      {weaponSlots?.map((slot, i) => {
        const mountedId = mountedWeaponIds?.[slot.id]
        const mounted = mountedId ? resolvedWeapons[mountedId] : undefined
        return (
          slot.mount !== "HIDDEN" && (
            <button
              type="button"
              key={`${slot.id}-${i}`}
              role={onSlotClick ? "button" : undefined}
              tabIndex={onSlotClick ? 0 : undefined}
              onClick={(e) => {
                if (e.shiftKey) onSlotShiftClick?.(slot)
                else onSlotClick?.(slot)
              }}
              onContextMenu={(e) => {
                if (mountedId) {
                  e.preventDefault()
                  onSlotRightClick?.(slot)
                }
              }}
              onKeyDown={(e) => {
                if (onSlotClick && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault()
                  onSlotClick(slot)
                }
              }}
              style={{
                left: ship.center[0] - (slot.locations?.[1] ?? 0),
                top: ship.height - ship.center[1] - (slot.locations?.[0] ?? 0),
                transform: "translate(-50%, -50%)"
              }}
              className={`${buildSlotStyle(slot)} group absolute z-10 shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] ${mounted ? "opacity-100" : "opacity-70 hover:opacity-100"} ${onSlotClick ? "cursor-pointer pointer-events-auto" : "pointer-events-auto"}`}
              title={`${slot.id} • ${slot.type} ${slot.size} ${slot.mount}${mountedId ? " • Right-click to unmount" : ""}`}
            >
              {mounted ? (
                <div
                  className="absolute pointer-events-none w-fit h-fit"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: 80,
                    height: 80,
                    // Slot angles are counterclockwise-positive from
                    // up-forward; CSS rotation is clockwise-positive.
                    transform: `translate(-50%, -50%) rotate(${-(slot.angle ?? 0)}deg)`
                  }}
                >
                  <BuildSprite
                    weapon={mounted}
                    mount={slot.mount}
                    naturalSize
                  />
                </div>
              ) : (
                <SlotIcon type={slot.type} />
              )}
              <SlotAngle slot={slot} forceShow={altHeld} />
            </button>
          )
        )
      })}
    </div>
  )
}
