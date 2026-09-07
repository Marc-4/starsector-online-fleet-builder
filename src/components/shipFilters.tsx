import CommonButton from "./commonBtn"
import ToggleButton from "./toggleButton"

// NOTE: LOW TECH GANG STAYS ON TOP
const SHIP_STYLE_FILTERS = [
  "LOW_TECH",
  "MIDLINE",
  "HIGH_TECH",
  "THREAT",
  "DWELLER",
  "OMEGA"
]

const HULL_SIZE_FILTERS = [
  "FIGHTER",
  "FRIGATE",
  "DESTROYER",
  "CRUISER",
  "CAPITAL_SHIP"
]

export default function ShipFilters({
  setActiveStyleFilters,
  activeStyleFilters,
  setActiveHullSizeFilters,
  activeHullSizeFilters,
  setShowModules,
  showModules
}: {
  setActiveStyleFilters: React.Dispatch<React.SetStateAction<string[]>>
  activeStyleFilters: string[]
  setActiveHullSizeFilters: React.Dispatch<React.SetStateAction<string[]>>
  activeHullSizeFilters: string[]
  setShowModules: React.Dispatch<React.SetStateAction<boolean>>
  showModules: boolean
}) {
  const onStyleFilterToggle = (
    filter: string,
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e?.altKey) {
      setActiveStyleFilters([filter])
      return
    }
    if (activeStyleFilters.includes(filter))
      setActiveStyleFilters((prev) => prev.filter((f) => f !== filter))
    else {
      setActiveStyleFilters((prev) => [...prev, filter])
    }
  }

  const onHullSizeFilterToggle = (
    filter: string,
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e?.altKey) {
      setActiveHullSizeFilters([filter])
      return
    }
    if (activeHullSizeFilters.includes(filter))
      setActiveHullSizeFilters((prev) => prev.filter((f) => f !== filter))
    else {
      setActiveHullSizeFilters((prev) => [...prev, filter])
    }
  }

  const onShowModuleToggle = () => {
    setShowModules((prev) => !prev)
  }

  return (
    <div className="flex gap-4 items-center">
      <h2
        title="alt+click on filters for inverse behavior."
        className="text-cyan-200"
      >
        Filters:{" "}
      </h2>
      <div className="flex gap-1 flex-wrap w-full">
        {SHIP_STYLE_FILTERS.map((style) => (
          <ToggleButton
            title="alt+click on filters for inverse behavior."
            key={style}
            active={activeStyleFilters.includes(style)}
            onClick={(e) => onStyleFilterToggle(style, e)}
            text={style.toLowerCase().replace("_", " ")}
          />
        ))}
        <div className="w-px h-8 bg-cyan-200" />
        {HULL_SIZE_FILTERS.map((size) => (
          <ToggleButton
            title="alt+click on filters for inverse behavior."
            key={size}
            active={activeHullSizeFilters.includes(size)}
            onClick={(e) => onHullSizeFilterToggle(size, e)}
            text={size.toLowerCase().replace("_", " ")}
          />
        ))}
        <div className="w-px h-8 bg-cyan-200" />
        <ToggleButton
          title="alt+click on filters for inverse behavior."
          active={showModules}
          onClick={() => onShowModuleToggle()}
          text={"Modules"}
        />
        <CommonButton
          text="reset"
          onClick={() => {
            setActiveStyleFilters(["LOW_TECH", "MIDLINE", "HIGH_TECH"])
            setActiveHullSizeFilters([])
          }}
        />
      </div>
    </div>
  )
}
