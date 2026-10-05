import { maxSkillsForOfficer, resolveSkillIconUrl } from "#/lib/officerParser"
import type { officer, officerSkillMeta } from "#/types"

export default function OfficerSkillList({
  skills,
  draft,
  skillError,
  onToggleSkill,
  onToggleElite
}: {
  skills: officerSkillMeta[]
  draft: officer
  skillError: string | null
  onToggleSkill: (skill: officerSkillMeta) => void
  onToggleElite: (skillId: string) => void
}) {
  return (
    <div>
      <h3 className="text-cyan-200 text-sm mb-1">
        Skills{" "}
        <span className="text-cyan-200/60">
          ({draft.skills.length}/{maxSkillsForOfficer(draft)})
        </span>
        {" ― "}
        <span className="text-amber-200/80">
          Elite ({draft.eliteSkills.length}/1)
        </span>
      </h3>
      {skillError && <p className="text-xs text-red-300 mb-1">{skillError}</p>}
      <div className="flex flex-col gap-2">
        {skills.map((skill) => {
          const taken = draft.skills.includes(skill.id)
          const elite = draft.eliteSkills.includes(skill.id)
          const capped =
            !taken && draft.skills.length >= maxSkillsForOfficer(draft)
          const eliteCapped = taken && !elite && draft.eliteSkills.length >= 1
          const disabled = capped
          const icon = resolveSkillIconUrl(skill.icon)
          return (
            <button
              type="button"
              onClick={() => onToggleSkill(skill)}
              key={skill.id}
              disabled={disabled}
              title={
                capped ? `Max ${maxSkillsForOfficer(draft)} skills` : skill.name
              }
              className={`flex ${disabled ? "cursor-not-allowed opacity-40": "cursor-pointer"} flex-col gap-1 px-3 py-2 text-left border ${taken ? "border-cyan-800 bg-cyan-950/20" : "border-cyan-900/60"}`}
            >
              <div className={`flex items-center gap-3 `}>
                {icon ? (
                  <img
                    src={icon}
                    alt=""
                    draggable={false}
                    loading="lazy"
                    className="h-12 w-12 object-contain shrink-0"
                  />
                ) : (
                  <span className="h-12 w-12 border border-cyan-800 bg-cyan-900/30 shrink-0" />
                )}
                <div
                  className={`flex-1 min-w-0 truncate text-left text-base text-cyan-200 `}
                >
                  {skill.name}
                </div>
                <span className="text-xs text-cyan-200/60 w-10 shrink-0">
                  {elite ? "Elite" : ""}
                </span>
                <button
                  type="button"
                  disabled={!taken || eliteCapped}
                  title={
                    !taken
                      ? "Take the skill first"
                      : eliteCapped
                        ? "Only 1 elite skill"
                        : "Toggle elite"
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleElite(skill.id)
                  }}
                  className={`rounded border px-2 py-1 text-sm shrink-0 ${!taken || eliteCapped ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${elite ? "border-cyan-300 text-cyan-200" : taken ? "border-cyan-700 text-cyan-200" : "border-cyan-900 text-cyan-200/40"}`}
                >
                  ★
                </button>
              </div>
              <p className="text-xs text-cyan-100 whitespace-pre-line leading-relaxed">
                {skill.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
