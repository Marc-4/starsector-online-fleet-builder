export type ship = {
  bounds?: number[]
  builtInMods?: string[]
  builtInWeapons?: Record<string, string>
  builtInWings?: string[]
  center: number[]
  collisionRadius: number
  coversColor?: string
  engineSlots?: {
    angle: number
    contrailSize: number
    length: number
    location: number[]
    style: string
    width: number
  }[]
  height: number
  hullId: string
  hullName: string
  hullSize: FRIGATE | DESTROYER | CRUISER | CAPITAL_SHIP | FIGHTER
  shieldCenter: number[]
  shieldRadius: number
  spriteName: string
  style: HIGH_TECH | MIDLINE | LOW_TECH | THREAT | DWELLER | OMEGA | string
  viewOffset: number
  weaponSlots?: {
    angle: number
    arc: number
    id: string
    locations: number[]
    mount: TURRET | HARDPOINT | HIDDEN | string
    size: SMALL | MEDIUM | LARGE | string
    type: string
    position?: number[]
  }[]
  width: number
}

export type shipSkin = {
  baseHullId: string
  skinHullId: string
  hullName?: string
  descriptionId?: string
  descriptionPrefix?: string
  tags?: string[]
  tech?: string
  style?: string
  coversColor?: string
  fleetPoints?: number
  ordnancePoints?: number
  baseValueMult?: number
  suppliesToRecover?: number
  suppliesPerMonth?: number
  spriteName?: string
  weaponSlotChanges?: Record<string, Partial<NonNullable<ship["weaponSlots"]>[number]>>
  removeWeaponSlots?: string[]
  removeEngineSlots?: number[]
  removeBuiltInMods?: string[]
  removeBuiltInWeapons?: string[]
  builtInWeapons?: Record<string, string>
  builtInMods?: string[]
  builtInWings?: string[]
}
