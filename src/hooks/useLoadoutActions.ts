import { useCallback, useMemo } from "react"
import { MAX_SMODS } from "#/hullModData"
import type { fleetEntry, wingStats } from "#/types"

export function useLoadoutActions(
  activeTile: fleetEntry,
  opts: {
    onWeaponsChange: (weapons: Record<string, string>) => void
    onFightersChange: (fighters: string[]) => void
    onHullmodsChange: (hullmods: string[]) => void
    onSmodsChange: (smods: string[]) => void
    wouldExceedOp: (slotId: string, weaponId: string) => boolean
    wouldExceedFighterOp: (bayIndex: number, wingId: string) => boolean
    wouldExceedHullmodOp: (hullmodId: string) => boolean
    wouldExceedSmodRemovalOp: (hullmodId: string) => boolean
    wingOpOf: (wingId: string | undefined) => number
    availableOp: number
    weaponsOp: number
    fightersOp: number
    setLastSlottedId: (id: string) => void
    setLastSlottedWingId: (id: string) => void
  }
) {
  const hullmodIds = useMemo(
    () => [
      ...(activeTile.ship.meta.builtInMods ?? []),
      ...(activeTile.hullmods ?? []),
      ...(activeTile.smods ?? []),
    ],
    [activeTile.ship.meta.builtInMods, activeTile.hullmods, activeTile.smods]
  )

  const handleBuildIn = useCallback(
    (id: string, onDone?: () => void) => {
      const current = activeTile.hullmods ?? []
      const smods = activeTile.smods ?? []
      if (!current.includes(id)) return
      if (smods.includes(id)) return
      if (smods.length >= MAX_SMODS) return
      opts.onHullmodsChange(current.filter((x) => x !== id))
      opts.onSmodsChange([...smods, id])
      onDone?.()
    },
    [activeTile.hullmods, activeTile.smods, opts]
  )

  const handleUnbuildSmod = useCallback(
    (id: string) => {
      const smods = activeTile.smods ?? []
      if (!smods.includes(id)) return
      if (opts.wouldExceedSmodRemovalOp(id)) return
      opts.onSmodsChange(smods.filter((x) => x !== id))
      opts.onHullmodsChange([...(activeTile.hullmods ?? []), id])
    },
    [activeTile.smods, activeTile.hullmods, opts]
  )

  const toggleHullmod = useCallback(
    (id: string) => {
      const current = activeTile.hullmods ?? []
      const smods = activeTile.smods ?? []
      if (smods.includes(id)) return
      if (current.includes(id)) {
        opts.onHullmodsChange(current.filter((x) => x !== id))
      } else {
        if (opts.wouldExceedHullmodOp(id)) return
        opts.onHullmodsChange([...current, id])
      }
    },
    [activeTile.hullmods, activeTile.smods, opts]
  )

  const selectFighter = useCallback(
    (bayIndex: number, wing: wingStats) => {
      const next = [...(activeTile.fighters ?? [])]
      if (next[bayIndex] === wing.id) {
        next[bayIndex] = ""
        opts.onFightersChange(next.filter(Boolean).length ? next : [])
        return
      }
      if (opts.wouldExceedFighterOp(bayIndex, wing.id)) return
      next[bayIndex] = wing.id
      opts.setLastSlottedWingId(wing.id)
      opts.onFightersChange(next)
    },
    [activeTile.fighters, opts]
  )

  const removeFighter = useCallback(
    (bayIndex: number) => {
      const next = [...(activeTile.fighters ?? [])]
      next[bayIndex] = ""
      opts.onFightersChange(next.filter(Boolean).length ? next : [])
    },
    [activeTile.fighters, opts]
  )

  const remainingOpForBay = useCallback(
    (bayIndex: number) =>
      opts.availableOp -
      (activeTile.capacitors + activeTile.vents + opts.weaponsOp + opts.fightersOp) +
      opts.wingOpOf(activeTile.fighters?.[bayIndex]),
    [opts, activeTile.capacitors, activeTile.vents, activeTile.fighters]
  )

  const remainingOpForSlot = useCallback(
    (slotId: string, opOf: (wid: string | undefined) => number) =>
      opts.availableOp -
      (activeTile.capacitors + activeTile.vents + opts.weaponsOp + opts.fightersOp) +
      opOf(activeTile.weapons?.[slotId]),
    [opts, activeTile.capacitors, activeTile.vents, activeTile.weapons]
  )

  return {
    hullmodIds,
    handleBuildIn, handleUnbuildSmod, toggleHullmod,
    selectFighter, removeFighter,
    remainingOpForBay, remainingOpForSlot,
  }
}
