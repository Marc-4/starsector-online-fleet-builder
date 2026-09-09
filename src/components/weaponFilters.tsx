type Props = {
  availableMountTypes: string[]
  damageTypeOptions: string[]
  availableSpecialTags: string[]
  activeWeaponTypeFilters: string[]
  activeDamageTypeFilters: string[]
  activeSpecialTags: string[]
  onToggle: (list: string[], set: (v: string[]) => void, val: string) => void
  setActiveWeaponTypeFilters: (v: string[]) => void
  setActiveDamageTypeFilters: (v: string[]) => void
  setActiveSpecialTags: (v: string[]) => void
}

export default function WeaponFilters({
  availableMountTypes,
  damageTypeOptions,
  availableSpecialTags,
  activeWeaponTypeFilters,
  activeDamageTypeFilters,
  activeSpecialTags: activeTags,
  onToggle,
  setActiveWeaponTypeFilters,
  setActiveDamageTypeFilters,
  setActiveSpecialTags,
}: Props) {
  return (
    <div className="flex flex-col gap-1 mt-1">
      {availableMountTypes.length > 1 && (
        <div className="flex gap-1 flex-wrap items-center">
          <span className="text-cyan-200 text-xs mr-1">Type:</span>
          {availableMountTypes.map((t) => {
            const active = activeWeaponTypeFilters.includes(t)
            return (
              <button
                key={t}
                type="button"
                onClick={() =>
                  onToggle(
                    activeWeaponTypeFilters,
                    setActiveWeaponTypeFilters,
                    t
                  )
                }
                className={`text-xs px-2 py-0.5 border text-cyan-200 border-cyan-800 ${active ? "bg-cyan-900" : "bg-transparent border-cyan-800  hover:brightness-110"}`}
              >
                {t.toLowerCase()}
              </button>
            )
          })}
          {activeWeaponTypeFilters.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveWeaponTypeFilters([])}
              className="text-xs text-cyan-400 underline ml-1"
            >
              clear
            </button>
          )}
        </div>
      )}
      <div className="flex gap-1 flex-wrap items-center">
        <span className="text-cyan-200 text-xs mr-1">Damage:</span>
        {damageTypeOptions.map((t) => {
          const active = activeDamageTypeFilters.includes(t)
          return (
            <button
              key={t}
              type="button"
              onClick={() =>
                onToggle(
                  activeDamageTypeFilters,
                  setActiveDamageTypeFilters,
                  t
                )
              }
              className={`text-xs px-2 py-0.5 border text-cyan-200 border-cyan-800 ${active ? "bg-cyan-900" : "bg-transparent border-cyan-800  hover:brightness-110"}`}
            >
              {t.toLowerCase().replace("_", " ")}
            </button>
          )
        })}
        {activeDamageTypeFilters.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveDamageTypeFilters([])}
            className="text-xs text-cyan-400 underline ml-1"
          >
            clear
          </button>
        )}
      </div>
      {availableSpecialTags.length > 0 && (
        <div className="flex gap-1 flex-wrap items-center">
          <span className="text-cyan-200 text-xs mr-1">Tags:</span>
          {availableSpecialTags.map((tag) => {
            const active = activeTags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggle(activeTags, setActiveSpecialTags, tag)}
                className={`text-xs px-2 py-0.5 border text-cyan-200 border-cyan-800 ${active ? "bg-cyan-900" : "bg-transparent border-cyan-800  hover:brightness-110"}`}
                title={`${active ? "hide" : "show"} ${tag} weapons`}
              >
                {tag}
              </button>
            )
          })}
          <span className="text-cyan-600 text-[10px] ml-1"></span>
        </div>
      )}
    </div>
  )
}
