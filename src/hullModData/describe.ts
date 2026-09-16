import type { hullMod } from "#/types"

/** Structured tooltip table: header labels plus body rows. */
export type HullmodTable = {
  /** Optional lead-in line rendered above the table. */
  caption?: string
  head: string[]
  rows: string[][]
}

/** Fill `%s` placeholders left-to-right. Surplus placeholders are kept. */
export function formatHullmodDesc(
  template: string | null | undefined,
  values: (string | number)[]
): string {
  if (!template) return ""
  let i = 0
  return template.replace(/%s/g, () => (i < values.length ? String(values[i++]) : "%s"))
}

/** Full description text for a hullmod row (falls back to the raw CSV text). */
export function rawDesc(mod: hullMod): string {
  return mod.desc ?? ""
}

/** Raw S-mod bonus text (empty when the hullmod has no S-mod bonus). */
export function rawSModDesc(mod: hullMod): string {
  return mod.sModDesc ?? ""
}
