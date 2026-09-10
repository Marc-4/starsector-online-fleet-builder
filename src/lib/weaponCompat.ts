import type { weapon, weaponSlot } from "#/types"

const SIZE_ORDER: Record<weaponSlot["size"], number> = {
  SMALL: 0,
  MEDIUM: 1,
  LARGE: 2
}

export function canFitWeaponMount(
  slotType: weaponSlot["type"],
  weaponType: weapon["type"]
): boolean {
  if (slotType === "UNIVERSAL") return true
  if (slotType === weaponType) return true
  if (
    slotType === "HYBRID" &&
    (weaponType === "BALLISTIC" || weaponType === "ENERGY")
  )
    return true
  if (
    slotType === "COMPOSITE" &&
    (weaponType === "BALLISTIC" || weaponType === "MISSILE")
  )
    return true
  if (
    slotType === "SYNERGY" &&
    (weaponType === "ENERGY" || weaponType === "MISSILE")
  )
    return true

  if (weaponType === "UNIVERSAL") return true
  return false
}

export function isWeaponSizeCompatible(
  slotSize: weaponSlot["size"],
  weaponSize: weapon["size"],
  slotType: weaponSlot["type"],
  weaponType: weapon["type"]
): boolean {
  if (weaponSize === slotSize) return true
  if (
    SIZE_ORDER[weaponSize] === SIZE_ORDER[slotSize] - 1 &&
    weaponType === slotType
  )
    return true
  return false
}

/** Full fit check drippy bingus style*/
export function canMountWeapon(
  slot: Pick<weaponSlot, "size" | "type">,
  w: Pick<weapon, "size" | "type">
): boolean {
  return (
    isWeaponSizeCompatible(slot.size, w.size, slot.type, w.type) &&
    canFitWeaponMount(slot.type, w.type)
  )
}
