import { useEffect, useState } from "react"
import { getWeaponMountType } from "#/lib/weaponCompat"
import { getAllWeapons } from "#/lib/weaponParser"

export type WeaponMountInfo = {
  /** Mount size from the .wpn spec (SMALL/MEDIUM/LARGE). */
  size: string
  /** Effective mount type (mountTypeOverride wins). */
  mountType: string
}

/** Module-level cache: .wpn parsing happens once per session. */
let cache: Promise<Map<string, WeaponMountInfo>> | null = null

export function getWeaponMountInfoMap(): Promise<Map<string, WeaponMountInfo>> {
  if (!cache) {
    cache = getAllWeapons().then(
      (weapons) =>
        new Map(
          weapons.map((w) => [
            w.id,
            { size: w.size, mountType: getWeaponMountType(w) }
          ])
        )
    )
  }
  return cache
}

/** Weapon id -> { size, mountType } for OP-discount lookups. Empty until loaded. */
export function useWeaponMountInfo(): Map<string, WeaponMountInfo> {
  const [map, setMap] = useState<Map<string, WeaponMountInfo>>(new Map())
  useEffect(() => {
    let live = true
    void getWeaponMountInfoMap().then((m) => {
      if (live) setMap(m)
    })
    return () => {
      live = false
    }
  }, [])
  return map
}
