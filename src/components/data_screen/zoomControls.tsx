import { type SetStateAction, useCallback } from "react"
import CommonButton from "../commonBtn"

export default function ZoomControls({
  zoom,
  maxZoom,
  setZoom,
  ZOOM_STEP,
  MIN_ZOOM,
}: {
  zoom: number
  maxZoom: number
  setZoom: React.Dispatch<SetStateAction<number>>
  ZOOM_STEP: number
  MIN_ZOOM: number
}) {
  const zoomIn = useCallback(
    () =>
      setZoom((z) =>
        Math.min(maxZoom, Math.round((z + ZOOM_STEP) * 100) / 100)
      ),
    [maxZoom, ZOOM_STEP, setZoom]
  )
  const zoomOut = useCallback(
    () =>
      setZoom((z) =>
        Math.max(MIN_ZOOM, Math.round((z - ZOOM_STEP) * 100) / 100)
      ),
    [setZoom, MIN_ZOOM, ZOOM_STEP]
  )
  const resetZoom = useCallback(() => setZoom(1), [setZoom])
  return (
    <div className=" w-fit z-10 flex items-center gap-1 bg-black/40 border border-cyan-900 rounded-xs px-1 py-1 backdrop-blur-sm">
      <CommonButton
        text="−"
        cutAllCorners
        className="px-3 py-0.5 text-sm disabled:opacity-40"
        onClick={zoomOut}
        disabled={zoom <= MIN_ZOOM}
        aria-label="Zoom out"
        title="Zoom out (scroll down)"
      />
      <span className="text-cyan-100 text-xs font-mono w-12 text-center select-none">
        {Math.round(zoom * 100)}%
      </span>
      <CommonButton
        text="+"
        cutAllCorners
        className="px-3 py-0.5 text-sm disabled:opacity-40"
        onClick={zoomIn}
        disabled={zoom >= maxZoom}
        aria-label="Zoom in"
        title="Zoom in (scroll up)"
      />
      <div className="w-px h-6 bg-cyan-900 mx-1" />
      <CommonButton
        text="⟲"
        cutAllCorners
        className="px-2 py-0.5 text-xs"
        onClick={resetZoom}
        disabled={zoom === 1}
        aria-label="Reset zoom"
        title="Reset zoom"
      />
    </div>
  )
}
