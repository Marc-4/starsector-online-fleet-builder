import { useEffect, useMemo, useState } from "react"
import { getPortraitChoices } from "#/lib/officerParser"
import CommonButton from "../commonBtn"

export default function OfficerPortraitSelectionModal({
  current,
  onClose,
  onSelect,
}: {
  current?: string
  onClose: () => void
  onSelect: (file: string) => void
}) {
  const [portraitGroup, setPortraitGroup] = useState<string>("All")
  const [searchString, setSearchString] = useState("")
  const [loaded, setLoaded] = useState<Set<string>>(new Set())
  const markLoaded = (file: string) =>
    setLoaded((prev) => {
      if (prev.has(file)) return prev
      const next = new Set(prev)
      next.add(file)
      return next
    })

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const portraits = useMemo(() => getPortraitChoices(), [])
  const portraitGroups = useMemo(
    () => ["All", ...Array.from(new Set(portraits.map((port) => port.group)))],
    [portraits]
  )
  const filteredPortraits = useMemo(
    () =>
      portraits.filter(
        (port) =>
          (portraitGroup === "All" || port.group === portraitGroup) &&
          (searchString.length === 0 ||
            port.file.toLowerCase().includes(searchString))
      ),
    [portraits, portraitGroup, searchString]
  )

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-50 bg-gray-950/60 cursor-default"
      />
      <div className="fixed inset-0 z-50 flex flex-col w-[95%] sm:w-[85%] lg:w-[60%] mx-auto max-h-[92dvh] my-auto justify-center overflow-y-auto py-2 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Officer portrait selection"
          className="relative z-50 flex items-center w-full justify-center pointer-events-none bg-gray-950"
        >
          <div className="flex w-full z-50 flex-col gap-2 p-1 border border-cyan-200 pointer-events-auto shadow-xl max-h-[88dvh]">
            <div className="flex m-1 mb-0 p-1 pb-0 gap-1 justify-between items-center">
              <h2 className="text-cyan-200 text-sm">Officer portrait</h2>
              <CommonButton
                text="x"
                onClick={() => onClose()}
                clipPath={false}
                className="cursor-pointer rounded-xs w-7 h-7 px-2 font-bold hover:brightness-110 text-xl text-cyan-200 flex items-center justify-center shrink-0"
              />
            </div>
            <div className="flex gap-2 items-center px-2">
              <div className="flex gap-1 flex-wrap">
                {portraitGroups.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setPortraitGroup(g)}
                    className={`rounded border px-2 py-0.5 text-xs ${portraitGroup === g ? "border-cyan-300 bg-cyan-900 text-cyan-50" : "border-cyan-900 bg-gray-950 text-cyan-200"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <input
                className="border border-cyan-800 flex-1 min-w-0 max-w-[160px] text-cyan-200 text-sm px-2 py-0 bg-transparent ml-auto"
                type="search"
                placeholder="Search"
                value={searchString}
                onChange={(e) =>
                  setSearchString(e.currentTarget.value.toLowerCase())
                }
              />
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-1 p-2 max-h-[52dvh] lg:max-h-96 overflow-y-auto overscroll-contain">
              {filteredPortraits.map((port) => {
                const isLoaded = loaded.has(port.file)
                return (
                  <button
                    key={port.file}
                    type="button"
                    title={port.file}
                    onClick={() => {
                      onSelect(port.file)
                      onClose()
                    }}
                    className={`relative border p-0.5 aspect-square ${current === port.file ? "border-amber-300" : "border-cyan-900 hover:border-cyan-500"}`}
                  >
                    {!isLoaded && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center bg-cyan-950/40"
                      >
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-800 border-t-cyan-200" />
                      </span>
                    )}
                    <img
                      src={port.url}
                      alt={port.file}
                      draggable={false}
                      loading="lazy"
                      onLoad={() => markLoaded(port.file)}
                      onError={() => markLoaded(port.file)}
                      className={`h-full w-full object-cover ${isLoaded ? "" : "invisible"}`}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
