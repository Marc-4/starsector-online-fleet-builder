import { useCallback, useEffect, useState } from "react"

export const MIN_ZOOM = 0.5
export const MAX_ZOOM_DESKTOP = 1.5
export const ZOOM_STEP = 0.1

export function useShipZoom(maxZoom = MAX_ZOOM_DESKTOP) {
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    setZoom((z) => Math.min(z, maxZoom))
  }, [maxZoom])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
      setZoom((z) => {
        const next = Math.round((z + delta) * 100) / 100
        return Math.min(maxZoom, Math.max(MIN_ZOOM, next))
      })
    },
    [maxZoom]
  )

  const handlePinchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length !== 2) return
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const cur = Math.hypot(dx, dy)
      const prev = Number(
        (e.currentTarget as HTMLDivElement).dataset.pinchDist || cur
      )
      const delta = (cur - prev) / 200
      if (Math.abs(delta) > 0.02) {
        setZoom((z) =>
          Math.min(
            maxZoom,
            Math.max(MIN_ZOOM, Math.round((z + delta) * 100) / 100)
          )
        )
        ;(e.currentTarget as HTMLDivElement).dataset.pinchDist = String(cur)
      }
    },
    [maxZoom]
  )

  const handlePinchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      ;(e.currentTarget as HTMLDivElement).dataset.pinchDist = String(
        Math.hypot(dx, dy)
      )
    }
  }, [])

  return { zoom, setZoom, handleWheel, handlePinchMove, handlePinchStart }
}
