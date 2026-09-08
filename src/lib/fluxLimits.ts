export const MAX_FLUX_CAPS_VENTS_PER_HULL_SIZE = {
  FIGHTER: 0,
  FRIGATE: 10,
  DESTROYER: 20,
  CRUISER: 30,
  CAPITAL_SHIP: 40,
} as const

export const DEFAULT_MAX_CAPS_VENTS = 10

export function getMaxCapsVents(hullSize: string): number {
  return (
    MAX_FLUX_CAPS_VENTS_PER_HULL_SIZE[
      hullSize as keyof typeof MAX_FLUX_CAPS_VENTS_PER_HULL_SIZE
    ] ?? DEFAULT_MAX_CAPS_VENTS
  )
}
