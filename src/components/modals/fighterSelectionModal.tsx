import { useEffect, useMemo, useState } from "react"
import { getAllShipStats, getAllWingStats, isWingSelectable } from "#/lib/csvParser"
import { getAllShips } from "#/lib/shipParser"
import type { ship, shipStats, wingStats } from "#/types"
import CommonButton from "../commonBtn"
import { getWingHullId } from "#/lib/csvParser"
import FighterFilters from "../fighterFilters"
import FighterTile from "../fighterTile"
import FighterTooltip from "../fighterTooltip"

export default function FighterSelectionModal({
  onClose,
  onSelect,
  mountedWingId,
  remainingOpForSlot
}: {
  onClose: () => void
  onSelect?: (wing: wingStats) => void
  mountedWingId?: string
  remainingOpForSlot?: number
}) {
  const [allWings, setAllWings] = useState<wingStats[]>([])
  const [allShips, setAllShips] = useState<ship[]>([])
  const [allShipStats, setAllShipStats] = useState<shipStats[]>([])
  const [searchString, setSearchString] = useState("")
  const [hoveredWing, setHoveredWing] = useState<wingStats | null>(null)
  const [activeRoleFilters, setActiveRoleFilters] = useState<string[]>([])
  const [activeDesignTypeFilters, setActiveDesignTypeFilters] = useState<
    string[]
  >([])

  const toggle = (list: string[], set: (v: string[]) => void, val: string) => {
    set(list.includes(val) ? list.filter((x) => x !== val) : [...list, val])
  }
  const [isLoading, setIsLoading] = useState(true)

  const roleOptions = useMemo(() => {
    const s = new Set<string>()
    for (const w of allWings) {
      if (!isWingSelectable(w)) continue
      const r = (w.role || "").toString().trim().toUpperCase()
      if (r) s.add(r)
    }
    return Array.from(s).sort()
  }, [allWings])

  const styleByHullId = useMemo(() => {
    const m = new Map<string, string>()
    for (const ship of allShips) {
      const st = (ship.style || "").toString().trim().toUpperCase()
      if (ship.hullId && st) m.set(ship.hullId, st)
    }
    return m
  }, [allShips])

  const designTypeOptions = useMemo(() => {
    const s = new Set<string>()
    for (const w of allWings) {
      if (!isWingSelectable(w)) continue
      const hullId = getWingHullId(w)
      const st = (hullId && styleByHullId.get(hullId)) || ""
      if (st) s.add(st)
    }
    return Array.from(s).sort()
  }, [allWings, styleByHullId])

  const builtInWingIds = useMemo(() => {
    const s = new Set<string>()
    for (const ship of allShips) {
      for (const w of ship.builtInWings ?? []) s.add(w)
    }
    return s
  }, [allShips])

  const filteredWings = useMemo(() => {
    return allWings
      .filter((w) => {
        if (!w.id?.trim()) return false
        if (!isWingSelectable(w)) return false
        if (builtInWingIds.has(w.id)) return false
        if (activeRoleFilters.length > 0) {
          const r = (w.role || "").toString().trim().toUpperCase()
          if (!activeRoleFilters.includes(r)) return false
        }
        if (activeDesignTypeFilters.length > 0) {
          const hullId = getWingHullId(w)
          const st = (hullId && styleByHullId.get(hullId)) || ""
          if (!activeDesignTypeFilters.includes(st)) return false
        }
        if (searchString.length > 0) {
          const haystack =
            `${w.id} ${w.variant} ${w["role desc"] ?? ""} ${w.role ?? ""}`.toLowerCase()
          if (!haystack.includes(searchString)) return false
        }
        return true
      })
      .sort((a, b) => {
        const opA = Number(a["op cost"])
        const opB = Number(b["op cost"])
        const aFinite = Number.isFinite(opA)
        const bFinite = Number.isFinite(opB)
        if (aFinite && bFinite && opA !== opB) return opB - opA
        if (aFinite !== bFinite) return aFinite ? -1 : 1
        return a.id.localeCompare(b.id)
      })
  }, [
    allWings,
    searchString,
    activeRoleFilters,
    activeDesignTypeFilters,
    styleByHullId,
    builtInWingIds
  ])

  useEffect(() => {
    void (async () => {
      setIsLoading(true)
      try {
        const [wings, ships, stats] = await Promise.all([
          getAllWingStats(),
          getAllShips(),
          getAllShipStats()
        ])
        setAllWings(wings.sort((a, b) => a.id.localeCompare(b.id)))
        setAllShips(ships)
        setAllShipStats(stats)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-transparent cursor-default"
      />
      <div className="fixed inset-0 z-40 flex gap-1 w-[50%] max-lg:flex-col mx-auto h-full justify-center items-center pointer-events-none">
        {hoveredWing ? (
          <div className="flex w-[50%] h-fit max-h-full overflow-auto">
            <FighterTooltip wing={hoveredWing} allShipStats={allShipStats} />
          </div>
        ) : (
          <div
            className="flex w-[50%]  min-w-80 opacity-0 h-64 pointer-events-none"
            aria-hidden="true"
          />
        )}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fighter selection"
          className="relative flex items-center w-[50%] min-w-80 justify-center pointer-events-none bg-black"
        >
          <div className="flex w-full z-40 flex-col gap-2 p-1 border border-cyan-200 pointer-events-auto shadow-xl">
            <div className="flex m-1 mb-0 p-1 pb-0 gap-1 justify-between items-start">
              <div className="gap-2 flex flex-col flex-1">
                <div className="flex gap-2 items-center flex-wrap">
                  <h2 className="text-cyan-200 text-sm">Fighter wing</h2>
                </div>
                <FighterFilters
                  roleOptions={roleOptions}
                  designTypeOptions={designTypeOptions}
                  activeRoleFilters={activeRoleFilters}
                  activeDesignTypeFilters={activeDesignTypeFilters}
                  onToggle={toggle}
                  setActiveRoleFilters={setActiveRoleFilters}
                  setActiveDesignTypeFilters={setActiveDesignTypeFilters}
                />
                <div className="flex gap-2 items-center">
                  <h2 className="text-cyan-200 text-sm">Search: </h2>
                  <input
                    className="border border-cyan-200 flex-1 max-w-[180px] text-cyan-200 text-sm px-1 bg-transparent"
                    type="search"
                    value={searchString}
                    onChange={(e) =>
                      setSearchString(e.currentTarget.value.toLowerCase())
                    }
                  />
                </div>
              </div>
              <CommonButton
                text="x"
                onClick={() => onClose()}
                clipPath={false}
                className="cursor-pointer rounded-xs w-7 h-7 px-2 font-bold hover:brightness-110 text-xl text-cyan-200 flex items-center justify-center shrink-0"
              />
            </div>

            <div className="w-full flex-1 flex flex-col gap-1 p-2 max-h-72 min-h-72 overflow-auto">
              {isLoading ? (
                <p className="text-cyan-200/60 text-sm text-center py-8 animate-pulse">
                  Loading fighters…
                </p>
              ) : (
                filteredWings.map((w) => {
                  const op = Number(w["op cost"])
                  const unaffordable =
                    remainingOpForSlot != null &&
                    Number.isFinite(op) &&
                    mountedWingId !== w.id &&
                    op > remainingOpForSlot
                  return (
                    <FighterTile
                      key={w.id}
                      wing={w}
                      allShips={allShips}
                      allShipStats={allShipStats}
                      onSelect={onSelect}
                      onClose={onClose}
                      onHover={setHoveredWing}
                      mounted={mountedWingId === w.id}
                      disabled={unaffordable}
                    />
                  )
                })
              )}
              {!isLoading && filteredWings.length === 0 && (
                <p className="text-cyan-200/60 text-sm text-center py-8">
                  No fighter wings found
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
