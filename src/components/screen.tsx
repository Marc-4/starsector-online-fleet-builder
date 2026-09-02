import { type ReactNode, useEffect, useRef, useState } from "react"

const GRID_SIZE = 25

export default function Screen({ children }: { children?: ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [grid, setGrid] = useState<{ rows: number; cols: number } | null>(null)
  const [bgImage, setBgImage] = useState("")
  useEffect(() => {
    setBgImage(`background${Math.floor(Math.random() * 8)}.jpg`)
  }, [])

  const updateGrid = () => {
    if (!gridRef.current) return
    const { height, width } = gridRef.current.getBoundingClientRect()
    const rows = Math.floor(height / GRID_SIZE)
    const cols = Math.floor(width / GRID_SIZE)
    setGrid({ rows, cols })
  }

  //biome-ignore lint: we are NOT putting updateGrid in the dependency array.
  useEffect(() => {
    updateGrid()
    window.addEventListener("resize", updateGrid)
    return () => window.removeEventListener("resize", updateGrid)
  }, [])

  const renderGrid = () => {
    const gridItems = []
    if (grid !== null) {
      for (let i = 0; i <= grid.cols; i++) {
        gridItems.push(
          <div
            key={`v-${i}`}
            className="absolute top-0 h-full w-0.5 opacity-10 bg-blue-300"
            style={{ left: `${i * GRID_SIZE}px` }}
          ></div>
        )
      }
      for (let i = 0; i <= grid.rows; i++) {
        gridItems.push(
          <div
            key={`h-${i}`}
            className="absolute left-0 h-0.5 w-full opacity-10 bg-blue-300"
            style={{ top: `${i * GRID_SIZE}px` }}
          ></div>
        )
      }
    }

    return gridItems
  }

  const ready = bgImage && grid

  return (
    <div className="relative flex gap-0 flex-row">
      {!ready && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-transparent" />
        </div>
      )}
      <div className="flex flex-col w-[15%] bg-black h-screen overflow-y-scroll">
        <button
          type="button"
          className="w-full h-63 shrink-0 text-2xl font-bold cursor-pointer text-blue-100 hover:text-blue-200"
        >
          + Add ship
        </button>
      </div>
      <div
        ref={gridRef}
        id="grid"
        className="relative text-blue-200 font-semibold text-lg flex-1 h-screen overflow-hidden"
        style={ready ? { backgroundImage: `url(src/assets/bgs/${bgImage})` } : undefined}
      >
        <div
          id="screen"
          className="absolute inset-0 z-0 opacity-20 bg-[#49dbff]"
        ></div>
        {renderGrid()}
        <div className="relative z-10 w-full h-full">{children}</div>
      </div>
    </div>
  )
}
