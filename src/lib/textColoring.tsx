import type { CSSProperties, ReactNode } from "react"

const RED = [255, 100, 0] as const
const CYAN = [219, 250, 252] as const
const GREEN = [157, 255, 0] as const

function toCss(rgb: readonly [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

export type Rgb = readonly [number, number, number]

export type StatDeltaColorOpts = {
  /** True for lower-is-better stats (shield efficiency, weapon flux/sec). */
  invert?: boolean
  /** Fractional delta that saturates full red/green. Default 0.25. */
  maxDeltaPct?: number
  /** RGB used when current equals base. Default cyan. */
  baseColor?: Rgb
}

/**
 * Flat steps: above base -> green, below base -> red, equal -> cyan.
 * (Flipped when `invert` is true for lower-is-better stats.)
 */
export function getStatDeltaColor(
  current: number,
  base: number,
  opts: StatDeltaColorOpts = {}
): string {
  const { invert = false, baseColor = CYAN } = opts
  if (!Number.isFinite(current) || !Number.isFinite(base)) return toCss(baseColor)
  const delta = invert ? base - current : current - base
  if (delta > 0) return toCss(GREEN)
  if (delta < 0) return toCss(RED)
  return toCss(baseColor)
}

export function StatValue({
  current,
  base,
  invert = false,
  maxDeltaPct = 0.25,
  baseColor = CYAN,
  format,
  className,
  style,
  fallback = "N/A"
}: {
  current?: number | null
  base?: number | null
  invert?: boolean
  maxDeltaPct?: number
  baseColor?: Rgb
  format?: (n: number) => ReactNode
  className?: string
  style?: CSSProperties
  fallback?: ReactNode
}): ReactNode {
  if (current == null || !Number.isFinite(current)) return <>{fallback}</>
  const b = base ?? current
  return (
    <span
      className={className}
      style={{ color: getStatDeltaColor(current, b, { invert, maxDeltaPct, baseColor }), ...style }}
    >
      {format ? format(current) : current}
    </span>
  )
}

/**
 * Matches a number with optional sign/decimal and optional %/x/° suffix,
 * e.g. "+100", "-40%", "0.22", "1.5x", "60°".
 */
const NUMBER_TOKEN =
  /[+-]?\d+(?:\.\d+)?(?:\s?(?:%|x|°))?|\(\+\d+(?:\.\d+)?\)/g

/**
 * Splits prose into text/number segments, coloring every number amber-300.
 * With `negativeOrange`, negatively-signed numbers render orange-400 instead.
 * Used for hullmod descriptions so values stand out from the body text.
 */
export function highlightNumbers(
  text: string,
  opts: { negativeOrange?: boolean } = {}
): ReactNode {
  const out: ReactNode[] = []
  let last = 0
  let key = 0
  for (const m of text.matchAll(NUMBER_TOKEN)) {
    const idx = m.index ?? 0
    if (idx > last) out.push(text.slice(last, idx))
    const isNegative = m[0].startsWith("-")
    out.push(
      <span
        key={key++}
        className={
          opts.negativeOrange && isNegative
            ? "text-orange-400"
            : "text-amber-300"
        }
      >
        {m[0]}
      </span>
    )
    last = idx + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return <>{out}</>
}
