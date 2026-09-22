import { useCallback, useMemo } from "react"
import {
  applyHullmods,
  getEffectiveDeploymentCost,
  getEffectiveWeaponOp,
  HIDDEN_BUILTIN_MOD_IDS
} from "#/hullModData"
import {
  getAllHullMods,
  getAllWeaponStats,
  getAllWingStats,
  getHullModCost,
  getWeaponFluxPerSecond
} from "#/lib/csvParser"
import type { fleetEntry, hullMod } from "#/types"
import { useWeaponMountInfo } from "./useWeaponMountInfo"

export type AssignedHullmod = { id: string; mod: hullMod; cost: number }
export type BuiltInHullmod = { id: string; mod: hullMod }
/** Player-built S-mod: moved out of `hullmods`, costs 0 OP. */
export type SmoddedHullmod = { id: string; mod: hullMod }

/** All OP accounting + modded stats for one fleet entry. */
export function useLoadoutOp(activeTile: fleetEntry) {
  const allWeaponStats = useMemo(() => getAllWeaponStats(), [])
  const opById = useMemo(
    () => new Map(allWeaponStats.map((s) => [s.id, Number(s.OPs)])),
    [allWeaponStats]
  )
  const mountInfo = useWeaponMountInfo()
  const allDiscountIds = useMemo(
    () => [
      ...(activeTile.ship.meta.builtInMods ?? []),
      ...(activeTile.hullmods ?? []),
      ...(activeTile.smods ?? [])
    ],
    [activeTile.ship.meta.builtInMods, activeTile.hullmods, activeTile.smods]
  )
  const opOf = useCallback(
    (wid: string | undefined) => {
      if (!wid) return 0
      const op = opById.get(wid)
      const base = Number.isFinite(op) ? (op as number) : 0
      const info = mountInfo.get(wid)
      if (!info) return base
      return getEffectiveWeaponOp(base, allDiscountIds, {
        weaponId: wid,
        size: info.size,
        mountType: info.mountType
      })
    },
    [opById, mountInfo, allDiscountIds]
  )
  const weaponsOp = useMemo(() => {
    return Object.values(activeTile.weapons ?? {}).reduce(
      (sum, wid) => sum + opOf(wid),
      0
    )
  }, [activeTile.weapons, opOf])
  const allWingStats = useMemo(() => getAllWingStats(), [])
  const wingOpById = useMemo(
    () => new Map(allWingStats.map((s) => [s.id, Number(s["op cost"])])),
    [allWingStats]
  )
  const wingOpOf = useCallback(
    (wingId: string | undefined) => {
      if (!wingId) return 0
      const op = wingOpById.get(wingId)
      return Number.isFinite(op) ? (op as number) : 0
    },
    [wingOpById]
  )
  const fightersOp = useMemo(() => {
    return (activeTile.fighters ?? []).reduce(
      (sum, wingId) => sum + wingOpOf(wingId),
      0
    )
  }, [activeTile.fighters, wingOpOf])
  const fluxById = useMemo(
    () =>
      new Map(
        allWeaponStats.map((s) => [s.id, Math.round(getWeaponFluxPerSecond(s))])
      ),
    [allWeaponStats]
  )
  const fluxOf = useCallback(
    (wid: string | undefined) => {
      if (!wid) return 0
      const f = fluxById.get(wid)
      return Number.isFinite(f) ? (f as number) : 0
    },
    [fluxById]
  )
  const weaponFluxPerSecond = useMemo(() => {
    return Object.values(activeTile.weapons ?? {}).reduce(
      (sum, wid) => sum + fluxOf(wid),
      0
    )
  }, [activeTile.weapons, fluxOf])
  const availableOp = activeTile.ship.stats["ordnance points"] ?? 0
  const hullModById = useMemo(
    () => new Map(getAllHullMods().map((h) => [h.id, h])),
    []
  )
  const assignedHullmods: AssignedHullmod[] = useMemo(() => {
    const out: AssignedHullmod[] = []
    for (const id of activeTile.hullmods ?? []) {
      const mod = hullModById.get(id)
      if (!mod) continue
      out.push({
        id,
        mod,
        cost: getHullModCost(mod, activeTile.ship.meta.hullSize)
      })
    }
    return out
  }, [activeTile.hullmods, activeTile.ship.meta.hullSize, hullModById])
  // Built-ins come straight from the hull, no props needed. They cost 0 OP
  // and can't be removed, so they render locked above the assigned mods.
  // Pure marker mods (visuals/mechanics with no player-facing text) stay hidden.
  const builtInHullmods: BuiltInHullmod[] = useMemo(() => {
    const out: { id: string; mod: hullMod | null }[] = []
    for (const id of activeTile.ship.meta.builtInMods ?? []) {
      if (HIDDEN_BUILTIN_MOD_IDS.has(id)) continue
      const mod = hullModById.get(id)
      out.push({ id, mod: mod ?? null })
    }
    return out.filter((r): r is BuiltInHullmod => r.mod !== null)
  }, [activeTile.ship.meta.builtInMods, hullModById])
  // S-mods live in their own array (moved out of `hullmods` when built in).
  // They cost 0 OP but still apply their base effect via `moddedShip` below
  // (S-mod bonus effects are a follow-up: see HullmodImpl.applySMod).
  const smoddedHullmods: SmoddedHullmod[] = useMemo(() => {
    const out: SmoddedHullmod[] = []
    for (const id of activeTile.smods ?? []) {
      if (HIDDEN_BUILTIN_MOD_IDS.has(id)) continue
      const mod = hullModById.get(id)
      if (mod) out.push({ id, mod })
    }
    return out
  }, [activeTile.smods, hullModById])
  const hullmodsOp = useMemo(() => {
    return assignedHullmods.reduce((sum, r) => sum + r.cost, 0)
  }, [assignedHullmods])
  const moddedShip = useMemo(
    () =>
      applyHullmods(
        activeTile.ship,
        [
          ...(activeTile.ship.meta.builtInMods ?? []),
          ...(activeTile.hullmods ?? []),
          ...(activeTile.smods ?? [])
        ],
        activeTile.smods ?? []
      ),
    [
      activeTile.ship,
      activeTile.ship.meta.builtInMods,
      activeTile.hullmods,
      activeTile.smods
    ]
  )
  const { dp: effectiveDP, suppliesRec: effectiveSuppliesRec, delta: deploymentDelta } =
    useMemo(
      () =>
        getEffectiveDeploymentCost(
          activeTile.ship,
          [
            ...(activeTile.ship.meta.builtInMods ?? []),
            ...(activeTile.hullmods ?? []),
            ...(activeTile.smods ?? [])
          ],
          {
            fightersOp,
            hullSize: activeTile.ship.meta.hullSize
          }
        ),
      [
        activeTile.ship,
        activeTile.ship.meta.builtInMods,
        activeTile.hullmods,
        activeTile.smods,
        fightersOp
      ]
    )

  const spentOp =
    activeTile.capacitors +
    activeTile.vents +
    weaponsOp +
    fightersOp +
    hullmodsOp

  const wouldExceedOp = useCallback(
    (slotId: string, weaponId: string) => {
      const currentOp = opOf(activeTile.weapons?.[slotId])
      const nextOp = opOf(weaponId)
      return (
        activeTile.capacitors +
          activeTile.vents +
          weaponsOp +
          fightersOp +
          hullmodsOp -
          currentOp +
          nextOp >
        availableOp
      )
    },
    [
      activeTile.capacitors,
      activeTile.vents,
      activeTile.weapons,
      availableOp,
      opOf,
      weaponsOp,
      fightersOp,
      hullmodsOp
    ]
  )

  const wouldExceedFighterOp = useCallback(
    (bayIndex: number, wingId: string) => {
      const currentOp = wingOpOf(activeTile.fighters?.[bayIndex])
      const nextOp = wingOpOf(wingId)
      return (
        activeTile.capacitors +
          activeTile.vents +
          weaponsOp +
          fightersOp +
          hullmodsOp -
          currentOp +
          nextOp >
        availableOp
      )
    },
    [
      activeTile.capacitors,
      activeTile.vents,
      activeTile.fighters,
      availableOp,
      weaponsOp,
      fightersOp,
      hullmodsOp,
      wingOpOf
    ]
  )

  const wouldExceedHullmodOp = useCallback(
    (hullmodId: string) => {
      if ((activeTile.hullmods ?? []).includes(hullmodId)) return false
      if ((activeTile.smods ?? []).includes(hullmodId)) return false
      const mod = hullModById.get(hullmodId)
      if (!mod) return true
      return (
        activeTile.capacitors +
          activeTile.vents +
          weaponsOp +
          fightersOp +
          hullmodsOp +
          getHullModCost(mod, activeTile.ship.meta.hullSize) >
        availableOp
      )
    },
    [
      activeTile.capacitors,
      activeTile.vents,
      activeTile.hullmods,
      activeTile.smods,
      activeTile.ship.meta.hullSize,
      availableOp,
      weaponsOp,
      fightersOp,
      hullmodsOp,
      hullModById
    ]
  )

  // Un-building restores the OP cost, so it can fail when the loadout is full.
  const wouldExceedSmodRemovalOp = useCallback(
    (hullmodId: string) => {
      if (!(activeTile.smods ?? []).includes(hullmodId)) return false
      const mod = hullModById.get(hullmodId)
      if (!mod) return true
      return (
        activeTile.capacitors +
          activeTile.vents +
          weaponsOp +
          fightersOp +
          hullmodsOp +
          getHullModCost(mod, activeTile.ship.meta.hullSize) >
        availableOp
      )
    },
    [
      activeTile.capacitors,
      activeTile.vents,
      activeTile.smods,
      activeTile.ship.meta.hullSize,
      availableOp,
      weaponsOp,
      fightersOp,
      hullmodsOp,
      hullModById
    ]
  )

  return {
    allWeaponStats,
    allWingStats,
    opOf,
    wingOpOf,
    weaponsOp,
    fightersOp,
    weaponFluxPerSecond,
    availableOp,
    spentOp,
    hullmodsOp,
    assignedHullmods,
    builtInHullmods,
    smoddedHullmods,
    moddedShip,
    deploymentDelta,
    effectiveDP,
    effectiveSuppliesRec,
    wouldExceedOp,
    wouldExceedFighterOp,
    wouldExceedHullmodOp,
    wouldExceedSmodRemovalOp
  }
}
