type Props = {
  roleOptions: string[]
  designTypeOptions: string[]
  activeRoleFilters: string[]
  activeDesignTypeFilters: string[]
  onToggle: (list: string[], set: (v: string[]) => void, val: string) => void
  setActiveRoleFilters: (v: string[]) => void
  setActiveDesignTypeFilters: (v: string[]) => void
}

export default function FighterFilters({
  roleOptions,
  designTypeOptions,
  activeRoleFilters,
  activeDesignTypeFilters,
  onToggle,
  setActiveRoleFilters,
  setActiveDesignTypeFilters
}: Props) {
  return (
    <div className="flex flex-col gap-1 mt-1">
      {roleOptions.length > 1 && (
        <div className="flex gap-1 flex-wrap items-center">
          <span className="text-cyan-200 text-xs mr-1">Role:</span>
          {roleOptions.map((t) => {
            const active = activeRoleFilters.includes(t)
            return (
              <button
                key={t}
                type="button"
                onClick={() =>
                  onToggle(activeRoleFilters, setActiveRoleFilters, t)
                }
                className={`text-xs px-2 py-0.5 border text-cyan-200 border-cyan-800 ${active ? "bg-cyan-900" : "bg-transparent border-cyan-800  hover:brightness-110"}`}
              >
                {t.toLowerCase().replace("_", " ")}
              </button>
            )
          })}
          {activeRoleFilters.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveRoleFilters([])}
              className="text-xs text-cyan-400 underline ml-1"
            >
              clear
            </button>
          )}
        </div>
      )}
      {designTypeOptions.length > 1 && (
        <div className="flex gap-1 flex-wrap items-center">
          <span className="text-cyan-200 text-xs mr-1">Design:</span>
          {designTypeOptions.map((t) => {
            const active = activeDesignTypeFilters.includes(t)
            return (
              <button
                key={t}
                type="button"
                onClick={() =>
                  onToggle(activeDesignTypeFilters, setActiveDesignTypeFilters, t)
                }
                className={`text-xs px-2 py-0.5 border text-cyan-200 border-cyan-800 ${active ? "bg-cyan-900" : "bg-transparent border-cyan-800  hover:brightness-110"}`}
              >
                {t}
              </button>
            )
          })}
          {activeDesignTypeFilters.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveDesignTypeFilters([])}
              className="text-xs text-cyan-400 underline ml-1"
            >
              clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}
