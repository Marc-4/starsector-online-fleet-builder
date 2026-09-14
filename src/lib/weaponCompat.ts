import type { weapon, weaponSlot } from "#/types"

const SIZE_ORDER: Record<weaponSlot["size"], number> = {
  SMALL: 0,
  MEDIUM: 1,
  LARGE: 2
}

/** Effective mount type: vanilla `mountTypeOverride` (e.g. Mining Blaster
 *  ENERGY with HYBRID override) wins over the base `type`. */
export function getWeaponMountType(
  w: Pick<weapon, "type"> & { mountTypeOverride?: unknown }
): weapon["type"] {
  const override = String(w.mountTypeOverride ?? "").toUpperCase().trim()
  if (
    override === "BALLISTIC" ||
    override === "ENERGY" ||
    override === "MISSILE" ||
    override === "HYBRID" ||
    override === "COMPOSITE" ||
    override === "SYNERGY" ||
    override === "UNIVERSAL"
  )
    return override
  return w.type
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
  // Combo weapons also fit basic mounts of either underlying type
  // (e.g. Mining Blaster HYBRID in a BALLISTIC mount).
  if (
    weaponType === "HYBRID" &&
    (slotType === "BALLISTIC" || slotType === "ENERGY")
  )
    return true
  if (
    weaponType === "COMPOSITE" &&
    (slotType === "BALLISTIC" || slotType === "MISSILE")
  )
    return true
  if (
    weaponType === "SYNERGY" &&
    (slotType === "ENERGY" || slotType === "MISSILE")
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
  w: Pick<weapon, "size" | "type"> & { mountTypeOverride?: unknown }
): boolean {
  const mountType = getWeaponMountType(w)
  return (
    isWeaponSizeCompatible(slot.size, w.size, slot.type, mountType) &&
    canFitWeaponMount(slot.type, mountType)
  )
}
