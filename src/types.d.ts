export type ship = {
  bounds?: number[]
  builtInMods?: string[]
  builtInWeapons?: Record<string, string>
  builtInWings?: string[]
  center: [number, number]
  collisionRadius: number
  coversColor?: string
  engineSlots?: {
    angle: number
    contrailSize: number
    length: number
    location: [number, number]
    style: string
    width: number
  }[]
  height: number
  hullId: string
  baseHullId?: string
  hullName: string
  hullSize: FRIGATE | DESTROYER | CRUISER | CAPITAL_SHIP | FIGHTER
  shieldCenter: [number, number]
  shieldRadius: number
  spriteName: string
  style: HIGH_TECH | MIDLINE | LOW_TECH | THREAT | DWELLER | OMEGA | string
  viewOffset: number
  weaponSlots?: weaponSlot[]
  width: number
  moduleAnchor?: [number, number]
  hints?: string
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
  weaponSlotChanges?: Record<
    string,
    Partial<NonNullable<ship["weaponSlots"]>[number]>
  >
  removeWeaponSlots?: string[]
  removeEngineSlots?: number[]
  removeBuiltInMods?: string[]
  removeBuiltInWeapons?: string[]
  builtInWeapons?: Record<string, string>
  builtInMods?: string[]
  builtInWings?: string[]
}

export type shipStats = {
  name: string
  id: string
  designation: null
  "tech/manufacturer": string
  "system id": string
  "fleet pts": number
  hitpoints: number
  "armor rating": number
  "max flux": number
  "8/6/5/4%": number
  "flux dissipation": number
  "ordnance points": number
  "fighter bays": number
  "max speed": number
  acceleration: number
  deceleration: number
  "max turn rate": number
  "turn acceleration": number
  mass: number
  "shield type": string
  "defense id": string
  "shield arc": number
  "shield upkeep": number
  "shield efficiency": number
  "phase cost": number
  "phase upkeep": number
  "min crew": number
  "max crew": number
  cargo: number
  fuel: number
  "fuel/ly": number
  range: number
  "max burn": number
  "base value": number
  "cr %/day": number
  "CR to deploy": number
  "peak CR sec": number
  "CR loss/sec": number
  "supplies/rec": number
  "supplies/mo": number
  "c/s": number
  "c/f": number
  "f/s": number
  "f/f": number
  "crew/s": number
  "crew/f": number
  hints: string[]
  tags: string[]
  "logistics n/a reason": string
  "codex variant id": string
  rarity: number
  breakProb: number
  minPieces: number
  maxPieces: number
  "travel drive": null
  number: number
  number: number
}

export type completeShip = {
  meta: ship
  stats: shipStats
}

export type fleetEntry = {
  id: string
  ship: completeShip
  cr: number
  capacitors: number
  vents: number
  customName: string
}

export type weaponMount = "TURRET" | "HARDPOINT" | "HIDDEN"
export type weaponSize = "SMALL" | "MEDIUM" | "LARGE"
export type weaponType =
  | "ENERGY"
  | "MISSILE"
  | "BALLISTIC"
  | "HYBRID"
  | "COMPOSITE"
  | "SYNERGY"
  | "UNIVERSAL"
  | "SYSTEM"
  | "DECORATIVE"

export type weaponSlot = {
  angle?: number
  arc?: number
  id: string
  locations?: [number, number]
  mount: weaponMount
  size: weaponSize
  type: weaponType
}
export type engineSlot = {
  angle: number
  contrailSize: number
  length: number
  location: [number, number]
  style: string
  width: number
}
