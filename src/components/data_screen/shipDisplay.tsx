import { useMemo } from "react"
import type { ship, weaponSlot } from "#/types"

// SVGs use stroke="currentColor" so slotStyle text color tints them via React components
import BallisticIcon from "#/assets/slotIcons/ballistic.svg?react"
import EnergyIcon from "#/assets/slotIcons/energy.svg?react"
import MissileIcon from "#/assets/slotIcons/missile.svg?react"
import HybridIcon from "#/assets/slotIcons/hybrid.svg?react"
import CompositeIcon from "#/assets/slotIcons/composite.svg?react"
import SynergyIcon from "#/assets/slotIcons/synergy.svg?react"
import UniversalIcon from "#/assets/slotIcons/universal.svg?react"

export default function ShipDisplay({
  ship,
  zoom
}: {
  ship: ship
  zoom: number
}) {
  // Ballistic 	Yellow Square
  // Energy 	Blue Circle
  // Missile 	Green Diamond
  // Hybrid 	Orange Square-in-Circle
  // Composite 	Lime Diamond-in-Square
  // Synergy 	Turquoise Diamond-in-Circle
  // Universal 	Grey Diamond-in-Square-in-Circle
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

  const buildSlotStyle = (slot: weaponSlot) => {
    const typeStyle = slotStyle[slot.type] ?? ""
    const sizeStyle = slotSize[slot.size] ?? ""
    return `${typeStyle} ${sizeStyle} opacity-60 shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]`.trim()
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
    // SVG uses stroke="currentColor" - inherits text color from parent
    return <Icon className="w-full h-full" />
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
              className={`${buildSlotStyle(slot)} absolute z-10`}
              title={`${slot.id} • ${slot.type} ${slot.size} ${slot.mount}`}
            >
              <SlotIcon type={slot.type} />
            </div>
          )
      )}
    </div>
  )
}
