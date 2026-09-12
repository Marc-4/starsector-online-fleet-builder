/** Fighter wing variant -> slot id -> weapon id.
 * Vanilla fighter loadouts live in .variant files (not vendored here),
 * so bomber missile overlays are mapped explicitly until variants are added.
 * Weapon id resolves via .wpn `projectileSpecId` -> .proj sprite. */
export const FIGHTER_SLOT_WEAPONS: Record<string, Record<string, string>> = {
  // Trident: 2x Atropos torpedoes (WS 004/005 MISSILE slots).
  // atropos_single.wpn -> atropos_torp.proj -> torpedo_guided2.png
  trident_Bomber: {
    "WS 004": "atropos_single",
    "WS 005": "atropos_single"
  },
  // Dagger: single Atropos torpedo, same as the Trident.
  dagger_Bomber: {
    "WS 002": "atropos_single"
  },
  // Piranha: bomb bay.
  piranha_Bomber: {
    "WS 002": "bomb"
  },
  // Perdition: low-tech torpedo (hammer_torp.proj -> low_tech_torpedo.png).
  perdition_Bomber: {
    "WS 000": "hammer_single"
  },
  // Cobra: single slot; vanilla mounts a Reaper here.
  cobra_Bomber: {
    "WS 000": "reaper"
  },
  // Longbow: fighter Sabot pod.
  longbow_Support: {
    "WS 002": "sabot_fighter"
  }
}

/** Fallback when no .wpn maps cleanly: variant -> slot id -> .proj id. */
export const FIGHTER_SLOT_PROJS: Record<string, Record<string, string>> = {
  trident_Bomber: {
    "WS 004": "atropos_torp",
    "WS 005": "atropos_torp"
  },
  dagger_Bomber: {
    "WS 002": "atropos_torp"
  },
  piranha_Bomber: {
    "WS 002": "bomb_proj"
  },
  perdition_Bomber: {
    "WS 000": "hammer_torp"
  },
  cobra_Bomber: {
    "WS 000": "reaper_torp"
  },
  longbow_Support: {
    "WS 002": "sabot_srm"
  }
}

export function getFighterSlotWeapon(
  variant: string | null | undefined,
  slotId: string
): string | null {
  if (!variant) return null
  return FIGHTER_SLOT_WEAPONS[variant]?.[slotId] ?? null
}

export function getFighterSlotProj(
  variant: string | null | undefined,
  slotId: string
): string | null {
  if (!variant) return null
  return FIGHTER_SLOT_PROJS[variant]?.[slotId] ?? null
}
