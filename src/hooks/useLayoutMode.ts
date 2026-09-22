import { useEffect, useState } from "react"

/** Shared responsive breakpoints for the refit screen.
 *  - compact: stacked flow layout (<1024px, tablets + phones)
 *  - coarse: touch-first input (no hover / no right-click reliance)
 */
export function useLayoutMode() {
  const [compact, setCompact] = useState(false)
  const [coarse, setCoarse] = useState(false)

  useEffect(() => {
    const compactMq = window.matchMedia("(max-width: 1023.5px)")
    const coarseMq = window.matchMedia("(pointer: coarse)")
    const onChange = () => {
      setCompact(compactMq.matches)
      setCoarse(coarseMq.matches)
    }
    onChange()
    compactMq.addEventListener("change", onChange)
    coarseMq.addEventListener("change", onChange)
    return () => {
      compactMq.removeEventListener("change", onChange)
      coarseMq.removeEventListener("change", onChange)
    }
  }, [])

  return { compact, coarse }
}
