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
  /** Mounted loadout: weaponSlot id -> weapon id. Synced into the URL hash. */
  weapons?: Record<string, string>
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

export type weapon = {
  id: string
  specClass: string
  type: weaponType
  size: weaponSize
  displayArcRadius?: number
  turretSprite?: string
  turretGlowSprite?: string
  turretGunSprite?: string
  hardpointSprite?: string
  hardpointGlowSprite?: string
  hardpointGunSprite?: string
  visualRecoil?: number
  renderHints?: string[]
  turretOffsets?: number[]
  hardpointOffsets?: number[]
  turretAngleOffsets?: number[]
  hardpointAngleOffsets?: number[]
  barrelMode?: string
  animationType?: string
  projectileSpecId?: string
  fireSoundOne?: string
  fireSoundTwo?: string
  fringeColor?: number[]
  coreColor?: number[]
  glowColor?: number[]
  width?: number
  textureType?: string | string[]
  textureScrollSpeed?: number
  pixelsPerTexel?: number
  pierceSet?: string[]
  impactMass?: number
  darkCore?: boolean
  turretFireSound?: string
  // allow extra fields from .wpn (beam, projectile, etc.)
  [key: string]: any
}

export type weaponStats = {
  name: string
  id: string
  tier: number | string | null
  rarity: number | string | null
  "base value": number | null
  range: number | null
  "damage/second": number | string | null
  "damage/shot": number | string | null
  emp: number | string | null
  impact: number | string | null
  "turn rate": number | string | null
  OPs: number | null
  ammo: number | string | null
  "ammo/sec": number | string | null
  "reload size": number | string | null
  type: string | null
  "energy/shot": number | string | null
  "energy/second": number | string | null
  chargeup: number | string | null
  chargedown: number | string | null
  "burst size": number | string | null
  "burst delay": number | string | null
  "min spread": number | string | null
  "max spread": number | string | null
  "spread/shot": number | string | null
  "spread decay/sec": number | string | null
  "beam speed": number | string | null
  "proj speed": number | string | null
  "launch speed": number | string | null
  "flight time": number | string | null
  "proj hitpoints": number | string | null
  autofireAccBonus: number | string | null
  extraArcForAI: number | string | null
  hints: string | null
  tags: string | null
  groupTag: string | null
  "tech/manufacturer": string | null
  primaryRoleStr?: string | null
  speedStr?: string | null
  trackingStr?: string | null
  turnRateStr?: string | null
  accuracyStr?: string | null
  customPrimary?: string | null
  customPrimaryHL?: string | null
  customAncillary?: string | null
  customAncillaryHL?: string | null
  noDPSInTooltip?: string | boolean | null
  number: number | null
  [key: string]: any
}

export type completeWeapon = {
  meta: weapon
  stats: weaponStats
}

export type projectile = {
  id: string
  specClass?: string
  missileType?: string
  /** Source art path from the .proj file (e.g. graphics/missiles/x.png). */
  sprite?: string
  /** Display box in game px the PNG is fit into (possibly non-uniform). */
  size?: [number, number]
  /** Anchor point in box units, Cartesian origin bottom-left, nose = +Y. */
  center?: [number, number]
  [key: string]: any
}
