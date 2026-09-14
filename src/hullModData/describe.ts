import type { hullMod } from "#/types"

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
