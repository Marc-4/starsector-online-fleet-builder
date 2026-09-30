import { useCallback, useEffect, useRef, useState } from "react"
import { canMountWeapon } from "#/lib/weaponCompat"
import { getWeapon } from "#/lib/weaponParser"
import type { fleetEntry, hullMod, weapon, weaponSlot, wingStats } from "#/types"

export function useSlotSelection(activeTile: fleetEntry) {
  const [slotAction, setSlotAction] = useState<weaponSlot | null>(null)
  const [slotInfoWeapon, setSlotInfoWeapon] = useState<weapon | null>(null)
  const [slotInfoLoading, setSlotInfoLoading] = useState(false)
  const slotInfoReqRef = useRef(0)
  const [selectedSlot, setSelectedSlot] = useState<weaponSlot | null>(null)
  const [lastSlottedId, setLastSlottedId] = useState<string | null>(null)
  const [lastSlottedWingId, setLastSlottedWingId] = useState<string | null>(null)
  const [hoveredWeapon, setHoveredWeapon] = useState<weapon | undefined>(undefined)
  const [hoveredWing, setHoveredWing] = useState<wingStats | null>(null)
  const [hoveredHullmod, setHoveredHullmod] = useState<hullMod | null>(null)

  const closeSlotAction = useCallback(() => {
    slotInfoReqRef.current += 1
    setSlotInfoLoading(false)
    setSlotInfoWeapon(null)
    setSlotAction(null)
  }, [])

  // Reset transient selection when switching ships.
  useEffect(() => {
    setSelectedSlot(null)
    setSlotInfoWeapon(null)
    setSlotInfoLoading(false)
    setSlotAction(null)
    setHoveredWeapon(undefined)
    setHoveredWing(null)
    setHoveredHullmod(null)
  }, [activeTile])

  const openSlotInfo = useCallback(
    (slot: weaponSlot) => {
      const wid = activeTile.weapons?.[slot.id]
      if (!wid) return
      const req = ++slotInfoReqRef.current
      setSlotInfoWeapon(null)
      setSlotInfoLoading(true)
      void getWeapon({ id: wid })
        .then((w) => {
          if (slotInfoReqRef.current === req) setSlotInfoWeapon(w)
        })
        .catch(() => {
          if (slotInfoReqRef.current === req) setSlotInfoWeapon(null)
        })
        .finally(() => {
          if (slotInfoReqRef.current === req) setSlotInfoLoading(false)
        })
    },
    [activeTile.weapons]
  )

  const clearSlotInfo = useCallback(() => {
    slotInfoReqRef.current += 1
    setSlotInfoLoading(false)
    setSlotInfoWeapon(null)
  }, [])

  return {
    slotAction, setSlotAction, closeSlotAction,
    slotInfoWeapon, slotInfoLoading, slotInfoReqRef, openSlotInfo, clearSlotInfo,
    selectedSlot, setSelectedSlot,
    lastSlottedId, setLastSlottedId,
    lastSlottedWingId, setLastSlottedWingId,
    hoveredWeapon, setHoveredWeapon,
    hoveredWing, setHoveredWing,
    hoveredHullmod, setHoveredHullmod,
  }
}

export function useShiftMount(
  activeTile: fleetEntry,
  opts: {
    lastSlottedId: string | null
    lastSlottedWingId: string | null
    allWingStats: wingStats[]
    wouldExceedOp: (slotId: string, weaponId: string) => boolean
    wouldExceedFighterOp: (bayIndex: number, wingId: string) => boolean
    onWeaponsChange: (weapons: Record<string, string>) => void
    onFightersChange: (fighters: string[]) => void
  }
) {
  const handleSlotShiftClick = useCallback(
    async (slot: weaponSlot) => {
      if (!opts.lastSlottedId) return
      let w: weapon
      try {
        w = await getWeapon({ id: opts.lastSlottedId })
      } catch {
        return
      }
      if (!canMountWeapon(slot, w)) return
      if (opts.wouldExceedOp(slot.id, w.id)) return
      opts.onWeaponsChange({ ...activeTile.weapons, [slot.id]: w.id })
    },
    [opts, activeTile.weapons]
  )

  const handleBayShiftClick = useCallback(
    (bayIndex: number) => {
      if (activeTile.fighters?.[bayIndex]) return
      if (!opts.lastSlottedWingId) return
      const wing = opts.allWingStats.find((w) => w.id === opts.lastSlottedWingId)
      if (!wing) return
      if (opts.wouldExceedFighterOp(bayIndex, wing.id)) return
      const next = [...(activeTile.fighters ?? [])]
      next[bayIndex] = wing.id
      opts.onFightersChange(next)
    },
    [opts, activeTile.fighters]
  )

  const handleSlotRightClick = useCallback(
    (slot: weaponSlot) => {
      if (!activeTile.weapons?.[slot.id]) return
      const next = { ...activeTile.weapons }
      delete next[slot.id]
      opts.onWeaponsChange(next)
    },
    [opts, activeTile.weapons]
  )

  return { handleSlotShiftClick, handleBayShiftClick, handleSlotRightClick }
}
