import { useEffect, useMemo, useState } from "react"
import {
  getAllHullMods,
  getHullModCategories,
  getHullModCost,
  getHullModDesignType,
  getHullModInapplicability,
  getHullModShipContext,
  isHullModSelectable
} from "#/lib/csvParser"
import type { completeShip, hullMod } from "#/types"
import CommonButton from "../commonBtn"
import HullmodTile from "../hullmodTile"
import HullmodTooltip from "../hullmodTooltip"

export default function HullmodSelectionModal({
  ship,
  hullSize,
  mountedHullmodIds,
  remainingOp,
  onClose,
  onSelect
}: {
  ship: completeShip
  hullSize?: string
  mountedHullmodIds?: string[]
  remainingOp?: number
  onClose: () => void
  onSelect?: (hullmod: hullMod) => void
}) {
  const [allHullmods, setAllHullmods] = useState<hullMod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchString, setSearchString] = useState("")
  const [hovered, setHovered] = useState<hullMod | null>(null)
  const [activeDesignFilters, setActiveDesignFilters] = useState<string[]>([])
  const [activeTypeFilters, setActiveTypeFilters] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<
    "name" | "design" | "cost" | "installed"
  >("name")
  const [sortDir, setSortDir] = useState<1 | -1>(1)

  const toggle = (list: string[], set: (v: string[]) => void, val: string) => {
    set(list.includes(val) ? list.filter((x) => x !== val) : [...list, val])
  }

  const cycleSort = (key: typeof sortKey) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir(1)
    } else {
      setSortDir((d) => (d === 1 ? -1 : 1))
    }
  }

  const designOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const h of allHullmods) {
      if (!isHullModSelectable(h)) continue
      const d = getHullModDesignType(h)
      counts.set(d, (counts.get(d) ?? 0) + 1)
    }
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [allHullmods])

  const typeOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const h of allHullmods) {
      if (!isHullModSelectable(h)) continue
      for (const c of getHullModCategories(h)) {
        counts.set(c, (counts.get(c) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [allHullmods])

  const mounted = useMemo(
    () => new Set(mountedHullmodIds ?? []),
    [mountedHullmodIds]
  )

  const ctx = useMemo(
    () => getHullModShipContext(ship, mountedHullmodIds),
    [ship, mountedHullmodIds]
  )
  const builtIn = useMemo(
    () => new Set((ship.meta.builtInMods ?? []).map((m) => m.toLowerCase())),
    [ship]
  )

  // Hull-exclusive mods stay visible but unselectable, with the reason as tooltip.
  // Built-ins render locked at the top and can't be toggled.
  const { builtInRows, filtered } = useMemo(() => {
    const applicable: hullMod[] = []
    const builtInRows: hullMod[] = []
    for (const h of allHullmods) {
      if (!isHullModSelectable(h)) continue
      if (builtIn.has(h.id.toLowerCase())) {
        builtInRows.push(h)
        continue
      }
      // Inapplicable mods stay visible but unselectable (reason shown as tooltip).
      if (activeDesignFilters.length > 0) {
        if (!activeDesignFilters.includes(getHullModDesignType(h))) continue
      }
      if (activeTypeFilters.length > 0) {
        const cats = getHullModCategories(h)
        if (!cats.some((c) => activeTypeFilters.includes(c))) continue
      }
      if (searchString.length > 0) {
        const haystack =
          `${h.name} ${h.id} ${h["tech/manufacturer"] ?? ""} ${h.uiTags ?? ""}`.toLowerCase()
        if (!haystack.includes(searchString)) continue
      }
      applicable.push(h)
    }
    const dir = sortDir
    const byCost = (h: hullMod) => getHullModCost(h, hullSize)
    const byInstalled = (h: hullMod) =>
      builtIn.has(h.id.toLowerCase()) || mounted.has(h.id) ? 1 : 0
    applicable.sort((a, b) => {
      let d = 0
      switch (sortKey) {
        case "design":
          d = getHullModDesignType(a).localeCompare(getHullModDesignType(b))
          break
        case "cost":
          d = byCost(a) - byCost(b)
          break
        case "installed":
          d = byInstalled(a) - byInstalled(b)
          break
        default:
          d = a.name.localeCompare(b.name)
      }
      return d !== 0 ? d * dir : a.name.localeCompare(b.name)
    })
    builtInRows.sort((a, b) => a.name.localeCompare(b.name))
    return { builtInRows, filtered: applicable }
  }, [
    allHullmods,
    builtIn,
    ctx,
    mounted,
    activeDesignFilters,
    activeTypeFilters,
    searchString,
    sortKey,
    sortDir,
    hullSize
  ])

  useEffect(() => {
    setIsLoading(true)
    try {
      setAllHullmods(
        getAllHullMods().sort((a, b) => a.name.localeCompare(b.name))
      )
    } finally {
      setIsLoading(false)
    }
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
      <div className="fixed inset-0 z-40 flex gap-1 w-[70%] max-lg:flex-col mx-auto h-full justify-center items-center pointer-events-none">
        {hovered ? (
          <div className="flex w-[50%] min-w-80 h-fit max-h-full overflow-auto">
            <HullmodTooltip hullmod={hovered} />
          </div>
        ) : (
          <div
            className="flex w-[50%] min-w-80 opacity-0 h-64 pointer-events-none"
            aria-hidden="true"
          />
        )}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Hullmod selection"
          className="relative flex items-center w-full min-w-80 justify-center pointer-events-none bg-gray-950"
        >
          <div className="flex w-full z-40 flex-col gap-2 p-1 border border-cyan-200 pointer-events-auto shadow-xl">
            <div className="flex m-1 mb-0 p-1 pb-0 gap-1 justify-between items-start">
              <div className="gap-2 flex flex-col flex-1">
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

            <table
              aria-label="Hullmods"
              className="w-full flex-1 flex flex-col gap-0 p-2 pt-0 max-h-72 min-h-72 overflow-auto"
            >
              <tr
                tabIndex={-1}
                className="sticky top-0 z-10 grid grid-cols-[2rem_minmax(0,1fr)_10rem_5rem_6rem] gap-2 bg-gray-950 px-2 pb-1 text-xs text-cyan-200/70"
              >
                <span />
                {(
                  [
                    ["name", "Hullmod", "justify-start"],
                    ["design", "Design type", "justify-center"],
                    ["cost", "OP", "justify-center"],
                    ["installed", "Installed", "justify-center"]
                  ] as const
                ).map(([key, label, align]) => (
                  <th
                    key={key}
                    onClick={() => cycleSort(key)}
                    title={`Sort by ${label}`}
                    className={`flex cursor-pointer items-center gap-1 hover:text-cyan-200 ${align}`}
                  >
                    <span>{label}</span>
                    <span aria-hidden="true">
                      {sortKey === key ? (sortDir === 1 ? "▼" : "▲") : "▼"}
                    </span>
                  </th>
                ))}
              </tr>
              {isLoading ? (
                <div className="text-cyan-200/60 text-sm text-center py-8 animate-pulse">
                  Loading hullmods…
                </div>
              ) : (
                <>
                  {builtInRows.map((h) => {
                    const cost = getHullModCost(h, hullSize)
                    const requiresDock = (h.tags || "")
                      .toLowerCase()
                      .includes("req_spaceport")
                    return (
                      <HullmodTile
                        key={`built-in-${h.id}`}
                        hullmod={h}
                        cost={cost}
                        installed
                        requiresDock={requiresDock}
                        locked
                        disabledReason="Built into this hull"
                        onSelect={onSelect}
                        onHover={setHovered}
                      />
                    )
                  })}
                  {filtered.map((h) => {
                    const cost = getHullModCost(h, hullSize)
                    const installed = mounted.has(h.id)
                    const requiresDock = (h.tags || "")
                      .toLowerCase()
                      .includes("req_spaceport")
                    const inapplicableReason = installed
                      ? null
                      : getHullModInapplicability(h, ctx)
                    const unaffordable =
                      remainingOp != null &&
                      !installed &&
                      !inapplicableReason &&
                      cost > remainingOp
                    return (
                      <HullmodTile
                        key={h.id}
                        hullmod={h}
                        cost={cost}
                        installed={installed}
                        requiresDock={requiresDock}
                        disabled={unaffordable || !!inapplicableReason}
                        disabledReason={
                          inapplicableReason ??
                          (unaffordable ? "Not enough OP" : undefined)
                        }
                        onSelect={onSelect}
                        onHover={setHovered}
                      />
                    )
                  })}
                </>
              )}
              {!isLoading &&
                filtered.length === 0 &&
                builtInRows.length === 0 && (
                  <div className="text-cyan-200/60 text-sm text-center py-8">
                    No hullmods found
                  </div>
                )}
            </table>

            <div className="flex flex-wrap gap-1 p-1">
              {designOptions.map(([d, n]) => (
                <button
                  type="button"
                  key={d}
                  onClick={() =>
                    toggle(activeDesignFilters, setActiveDesignFilters, d)
                  }
                  className={`text-xs px-2 text-cyan-200 border border-cyan-800 py-0.5 hover:brightness-110 ${activeDesignFilters.includes(d) && "bg-cyan-900"}`}
                >
                  {`${d} (${n})`}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 p-1 pt-0">
              {typeOptions.map(([t, n]) => (
                <button
                  type="button"
                  key={t}
                  onClick={() =>
                    toggle(activeTypeFilters, setActiveTypeFilters, t)
                  }
                  className={`text-xs px-2 text-cyan-200 border border-cyan-800 py-0.5 hover:brightness-110 ${activeTypeFilters.includes(t) && "bg-cyan-900"}`}
                >{`${t} (${n})`}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
