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
  showModules,
  setShowSelectedFirst,
  showSelectedFirst
}: {
  setActiveStyleFilters: React.Dispatch<React.SetStateAction<string[]>>
  activeStyleFilters: string[]
  setActiveHullSizeFilters: React.Dispatch<React.SetStateAction<string[]>>
  activeHullSizeFilters: string[]
  setShowModules: React.Dispatch<React.SetStateAction<boolean>>
  showModules: boolean
  setShowSelectedFirst: React.Dispatch<React.SetStateAction<boolean>>
  showSelectedFirst: boolean
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

  const onShowSelectedFirstToggle = () => {
    setShowSelectedFirst((prev) => !prev)
  }

  return (
    <div className="flex gap-4 items-center">
      <h2
        title="alt+click on filters for inverse behavior."
        className="text-cyan-200 max-md:hidden"
      >
        Filters:{" "}
      </h2>
      <div className="flex gap-3 flex-row flex-wrap w-full">
        <div className="flex gap-1 flex-wrap">
          {SHIP_STYLE_FILTERS.map((style) => (
            <ToggleButton
              title="alt+click on filters for inverse behavior."
              key={style}
              active={activeStyleFilters.includes(style)}
              onClick={(e) => onStyleFilterToggle(style, e)}
              text={style.toLowerCase().replace("_", " ")}
            />
          ))}
        </div>
        <div className="w-px h-8 bg-cyan-200 max-md:hidden" />
        <div className="flex gap-1 flex-wrap">
          {HULL_SIZE_FILTERS.map((size) => (
            <ToggleButton
              title="alt+click on filters for inverse behavior."
              key={size}
              active={activeHullSizeFilters.includes(size)}
              onClick={(e) => onHullSizeFilterToggle(size, e)}
              text={size.toLowerCase().replace("_", " ")}
            />
          ))}
        </div>
        <div className="w-px h-8 bg-cyan-200 max-md:hidden" />
        <ToggleButton
          title="alt+click on filters for inverse behavior."
          active={showModules}
          onClick={() => onShowModuleToggle()}
          text={"Modules"}
        />
        <ToggleButton
          active={showSelectedFirst}
          onClick={() => onShowSelectedFirstToggle()}
          text={"Selected first"}
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
