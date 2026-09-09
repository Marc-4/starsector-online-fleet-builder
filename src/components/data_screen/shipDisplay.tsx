import { useEffect, useMemo, useState } from "react"
import BallisticIcon from "#/assets/slotIcons/ballistic.svg?react"
import CompositeIcon from "#/assets/slotIcons/composite.svg?react"
import EnergyIcon from "#/assets/slotIcons/energy.svg?react"
import HybridIcon from "#/assets/slotIcons/hybrid.svg?react"
import MissileIcon from "#/assets/slotIcons/missile.svg?react"
import SynergyIcon from "#/assets/slotIcons/synergy.svg?react"
import UniversalIcon from "#/assets/slotIcons/universal.svg?react"
import type { ship, weaponSlot } from "#/types"

export default function ShipDisplay({
  ship,
  zoom
}: {
  ship: ship
  zoom: number
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

  const [altHeld, setAltHeld] = useState(false)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt" || e.altKey) {
        // prevent browser menu stealing focus
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
    const showArc = arc > 0 && arc < 360

    const r = 150
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

    return (
      <div className="absolute inset-0 pointer-events-none">
        {pathD && (
          <svg
            role="img"
            aria-label="svg"
            viewBox="0 0 100 100"
            className={`absolute inset-0 w-full h-full overflow-visible transition-opacity duration-150 ${forceShow ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          >
            <path
              d={pathD}
              fill="currentColor"
              fillOpacity={0}
              stroke="currentColor"
              strokeOpacity={1}
              strokeWidth={0.8}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
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
      {weaponSlots?.map(
        (slot, i) =>
          slot.mount !== "HIDDEN" && (
            <div
              key={`${slot.id}-${i}`}
              style={{
                left: ship.center[0] - (slot.locations?.[1] ?? 0),
                top: ship.height - ship.center[1] - (slot.locations?.[0] ?? 0),
                transform: "translate(-50%, -50%)"
              }}
              className={`${buildSlotStyle(slot)} cursor-pointer group absolute z-10 opacity-70 hover:opacity-100 shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]`}
              title={`${slot.id} • ${slot.type} ${slot.size} ${slot.mount}`}
            >
              <SlotIcon type={slot.type} />
              <SlotAngle slot={slot} forceShow={altHeld} />
            </div>
          )
      )}
    </div>
  )
}
