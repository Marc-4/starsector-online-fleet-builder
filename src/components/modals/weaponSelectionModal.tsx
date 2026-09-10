import { useEffect, useMemo, useState } from "react"
import {
  getAllWeaponStats,
  getWeaponSpecialTags,
  getWeaponStats,
  isWeaponSelectable,
  SPECIAL_WEAPON_TAGS
} from "#/lib/csvParser"
import {
  canFitWeaponMount,
  isWeaponSizeCompatible
} from "#/lib/weaponCompat"
import { getAllWeapons } from "#/lib/weaponParser"
import type { weapon, weaponSlot, weaponStats } from "#/types"
import CommonButton from "../commonBtn"
import WeaponFilters from "../weaponFilters"
import WeaponTile from "../weaponTile"

export default function WeaponSelectionModal({ slot, onClose, onSelect, onRemoveWeapon, mountedWeaponIds }: {slot: weaponSlot, onClose: () => void, onSelect?: (weapon: weapon) => void, onRemoveWeapon?: (weapon: weapon) => void, mountedWeaponIds?: Record<string, string>}) {
  const [allWeapons, setAllWeapons] = useState<weapon[]>([])
  const [allWeaponStats, setAllWeaponStats] = useState<weaponStats[]>([])
  const [searchString, setSearchString] = useState("")
  const [activeWeaponTypeFilters, setActiveWeaponTypeFilters] = useState<
    string[]
  >([])
  const [activeDamageTypeFilters, setActiveDamageTypeFilters] = useState<
    string[]
  >([])
  const [activeSpecialTags, setActiveSpecialTags] = useState<string[]>([])
  const sizeOrder: Record<weaponSlot["size"], number> = {
    SMALL: 0,
    MEDIUM: 1,
    LARGE: 2
  }

  const toggle = (list: string[], set: (v: string[]) => void, val: string) => {
    set(list.includes(val) ? list.filter((x) => x !== val) : [...list, val])
  }

  const slotCompatibleWeapons = useMemo(() => {
    return allWeapons.filter((w) => {
      if (!isWeaponSizeCompatible(slot.size, w.size, slot.type, w.type)) return false
      if (!canFitWeaponMount(slot.type, w.type)) return false
      const stats = getWeaponStats({ weapon: w, weaponStats: allWeaponStats })
      if (!isWeaponSelectable(stats)) return false
      return true
    })
  }, [allWeapons, allWeaponStats, slot.size, slot.type])

  const damageTypeOptions = useMemo(() => {
    const s = new Set<string>()
    for (const w of slotCompatibleWeapons) {
      const stats = getWeaponStats({ weapon: w, weaponStats: allWeaponStats })
      const t = (stats?.type || "").toString().trim().toUpperCase()
      if (t) s.add(t)
    }
    return Array.from(s).sort()
  }, [slotCompatibleWeapons, allWeaponStats])

  const availableSpecialTags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const tag of SPECIAL_WEAPON_TAGS) counts.set(tag, 0)
    for (const w of slotCompatibleWeapons) {
      const stats = getWeaponStats({ weapon: w, weaponStats: allWeaponStats })
      for (const t of getWeaponSpecialTags(stats)) {
        counts.set(t, (counts.get(t) ?? 0) + 1)
      }
    }
    return SPECIAL_WEAPON_TAGS.filter((t) => (counts.get(t) ?? 0) > 0)
  }, [slotCompatibleWeapons, allWeaponStats])

  const relevantMountTypes = useMemo<weapon["type"][]>(() => {
    switch (slot.type) {
      case "BALLISTIC":
        return ["BALLISTIC"]
      case "ENERGY":
        return ["ENERGY"]
      case "MISSILE":
        return ["MISSILE"]
      case "HYBRID":
        return ["BALLISTIC", "ENERGY", "HYBRID"]
      case "COMPOSITE":
        return ["BALLISTIC", "MISSILE", "COMPOSITE"]
      case "SYNERGY":
        return ["ENERGY", "MISSILE", "SYNERGY"]
      case "UNIVERSAL":
        return [
          "BALLISTIC",
          "ENERGY",
          "MISSILE",
          "HYBRID",
          "COMPOSITE",
          "SYNERGY",
          "UNIVERSAL"
        ]
      default:
        return []
    }
  }, [slot.type])

  const availableMountTypes = useMemo(() => {
    const counts = new Map<string, number>()
    for (const w of slotCompatibleWeapons) {
      counts.set(w.type, (counts.get(w.type) ?? 0) + 1)
    }
    return relevantMountTypes.filter((t) => (counts.get(t) ?? 0) > 0)
  }, [slotCompatibleWeapons, relevantMountTypes])

  const mountedIds = useMemo(
    () => new Set(Object.values(mountedWeaponIds ?? {})),
    [mountedWeaponIds]
  )

  // biome-ignore lint: isSizeCompatible changes every render
  const filteredWeapons = useMemo(() => {
    return allWeapons
      .filter((w) => {
        if (!isWeaponSizeCompatible(slot.size, w.size, slot.type, w.type))
          return false
        if (!canFitWeaponMount(slot.type, w.type)) return false
        const stats = getWeaponStats({ weapon: w, weaponStats: allWeaponStats })
        if (!isWeaponSelectable(stats)) return false
        const specialTags = getWeaponSpecialTags(stats)
        if (
          specialTags.length > 0 &&
          !specialTags.some((t) => activeSpecialTags.includes(t))
        )
          return false
        if (
          activeWeaponTypeFilters.length > 0 &&
          !activeWeaponTypeFilters.includes(w.type)
        )
          return false
        if (activeDamageTypeFilters.length > 0) {
          const dmg = (stats?.type || "").toString().trim().toUpperCase()
          if (!activeDamageTypeFilters.includes(dmg)) return false
        }
        if (searchString.length > 0) {
          const haystack =
            `${w.id} ${stats?.name ?? ""} ${w.type} ${stats?.type ?? ""}`.toLowerCase()
          if (!haystack.includes(searchString)) return false
        }
        return true
      })
      .sort((a, b) => {
        const d = sizeOrder[b.size] - sizeOrder[a.size]
        if (d !== 0) return d
        return a.id.localeCompare(b.id)
      })
  }, [
    allWeapons,
    allWeaponStats,
    slot.size,
    slot.type,
    searchString,
    activeWeaponTypeFilters,
    activeDamageTypeFilters,
    activeSpecialTags
  ])

  useEffect(() => {
    void (async () => {
      const [weapons, stats] = await Promise.all([
        getAllWeapons(),
        getAllWeaponStats()
      ])
      setAllWeapons(weapons.sort((a, b) => a.id.localeCompare(b.id)))
      setAllWeaponStats(stats)
    })()
  }, [])

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Weapon selection for ${slot.id}`}
      className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
    >
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-transparent pointer-events-auto"
      />
      <div className="relative z-10 flex flex-col gap-2 w-[40%] h-[50%] min-w-[340px] min-h-[280px] bg-black/85 p-1 border border-cyan-200 pointer-events-auto shadow-xl">
        <div className="flex m-1 mb-0 p-1 pb-0 gap-1 justify-between items-start">
          <div className="gap-2 flex flex-col flex-1">
            <div className="flex gap-2 items-center flex-wrap">
              <h2 className="text-cyan-200 text-sm">
                {slot.id} • {slot.type} {slot.size}
              </h2>
              <span className="text-cyan-400 text-xs">({slot.mount})</span>
            </div>
            <div className="flex gap-2 items-center">
              <h2 className="text-cyan-200 text-sm">Search: </h2>
              <input
                className="border border-cyan-200 flex-1 max-w-[180px] text-cyan-200 text-sm px-1 bg-transparent"
                type="search"
                value={searchString}
                onChange={(e) =>
                  setSearchString(e.currentTarget.value.toLowerCase())
                }
              />
            </div>
            <WeaponFilters
              availableMountTypes={availableMountTypes}
              damageTypeOptions={damageTypeOptions}
              availableSpecialTags={availableSpecialTags}
              activeWeaponTypeFilters={activeWeaponTypeFilters}
              activeDamageTypeFilters={activeDamageTypeFilters}
              activeSpecialTags={activeSpecialTags}
              onToggle={toggle}
              setActiveWeaponTypeFilters={setActiveWeaponTypeFilters}
              setActiveDamageTypeFilters={setActiveDamageTypeFilters}
              setActiveSpecialTags={setActiveSpecialTags}
            />
          </div>
          <CommonButton
            text="x"
            onClick={() => onClose()}
            clipPath={false}
            className="cursor-pointer rounded-xs w-7 h-7 px-2 font-bold hover:brightness-110 text-xl text-cyan-200 flex items-center justify-center shrink-0"
          />
        </div>

        <div className="w-full flex-1 flex flex-col gap-1 p-2 overflow-auto">
          {filteredWeapons.map((w) => (
            <WeaponTile
              key={w.id}
              weapon={w}
              allWeaponStats={allWeaponStats}
              onSelect={onSelect}
              onRemove={onRemoveWeapon}
              onClose={onClose}
              mounted={mountedIds.has(w.id)}
            />
          ))}
          {filteredWeapons.length === 0 && (
            <p className="text-cyan-200/60 text-sm text-center py-8">
              No weapons fit {slot.type} {slot.size}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
