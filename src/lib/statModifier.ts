import type { shipStats } from "#/types"

export const FLUX_CAPACITY_PER_CAPACITOR = 200
export const FLUX_DISSIPATION_PER_VENT = 10

type Modifiers = {
  capacitors?: number
  vents?: number
}

/**
 * Generic stat modifier: returns a copy of `stats` with `stat` shifted by `value`.
 * Works for any numeric field on `shipStats` (or meta). Non-numeric base is treated as 0.
 */
export const ModifyStat = <K extends keyof shipStats>({
  stats,
  stat,
  value
}: {
  stats: shipStats
  stat: K
  value: number
}): shipStats => {
  const base = Number(stats[stat] ?? 0)
  const baseNum = Number.isFinite(base) ? base : 0
  return {
    ...stats,
    [stat]: (baseNum + value) as shipStats[K]
  }
}

/** Bonus contributed by capacitors/vents for a given stat key. */
export function getStatBonus(
  stat: keyof shipStats,
  mods: Modifiers
): number {
  if (stat === "max flux") return (mods.capacitors ?? 0) * FLUX_CAPACITY_PER_CAPACITOR
  if (stat === "flux dissipation")
    return (mods.vents ?? 0) * FLUX_DISSIPATION_PER_VENT
  return 0
}

/**
 * Trackable effective stat: keeps base, bonus and total separate so UI can
 * render `710 (+10)` instead of just `710`.
 */
export function getModifiedStat(
  stats: shipStats,
  stat: keyof shipStats,
  mods: Modifiers = {}
): { base: number; bonus: number; total: number } {
  const base = Number(stats[stat] ?? 0)
  const baseNum = Number.isFinite(base) ? base : 0
  const bonus = getStatBonus(stat, mods)
  return { base: baseNum, bonus, total: baseNum + bonus }
}
