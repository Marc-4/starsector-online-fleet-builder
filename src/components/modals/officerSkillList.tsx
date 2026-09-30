import { maxSkillsForOfficer, resolveSkillIconUrl } from "#/lib/officerParser"
import type { officer, officerSkillMeta } from "#/types"

export default function OfficerSkillList({
  skills,
  draft,
  skillError,
  onToggleSkill,
  onToggleElite,
  onHoverSkill
}: {
  skills: officerSkillMeta[]
  draft: officer
  skillError: string | null
  onToggleSkill: (skill: officerSkillMeta) => void
  onToggleElite: (skillId: string) => void
  onHoverSkill: (skill: officerSkillMeta | null) => void
}) {
  return (
    <div>
      <h3 className="text-cyan-200 text-sm mb-1">
        Skills{" "}
        <span className="text-cyan-200/60">
          ({draft.skills.length}/{maxSkillsForOfficer(draft)})
        </span>{" ― "}
        <span className="text-amber-200/80">
          Elite ({draft.eliteSkills.length}/1)
        </span>
      </h3>
      {skillError && (
        <p className="text-xs text-red-300 mb-1">{skillError}</p>
      )}
      <div className="flex flex-col gap-1">
        {skills.map((skill) => {
          const taken = draft.skills.includes(skill.id)
          const elite = draft.eliteSkills.includes(skill.id)
          const capped =
            !taken && draft.skills.length >= maxSkillsForOfficer(draft)
          const eliteCapped =
            taken && !elite && draft.eliteSkills.length >= 1
          const icon = resolveSkillIconUrl(skill.icon)
          return (
            <div
              key={skill.id}
              onMouseEnter={() => onHoverSkill(skill)}
              onMouseLeave={() => onHoverSkill(null)}
              className={`grid grid-cols-[2rem_minmax(0,1fr)_auto_auto] items-center gap-2 px-2 py-1 text-left text-sm border ${taken ? "border-cyan-800 bg-cyan-950/20" : "border-cyan-900/60"}`}
            >
              {icon ? (
                <img
                  src={icon}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <span className="h-8 w-8 border border-cyan-800 bg-cyan-900/30" />
              )}
              <button
                type="button"
                disabled={capped}
                title={
                  capped
                    ? `Max ${maxSkillsForOfficer(draft)} skills`
                    : skill.name
                }
                onClick={() => onToggleSkill(skill)}
                className={`truncate text-left ${capped ? "cursor-not-allowed opacity-40 text-cyan-200/60" : taken ? "text-cyan-200 cursor-pointer" : "text-cyan-100 cursor-pointer"}`}
              >
                {skill.name}
              </button>
              <span className="text-xs text-cyan-200/60">
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
                onClick={() => onToggleElite(skill.id)}
                className={`rounded border px-2 py-0.5 text-xs ${!taken || eliteCapped ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${elite ? "border-cyan-300 text-cyan-200" : taken ? "border-cyan-700 text-cyan-200" : "border-cyan-900 text-cyan-200/40"}`}
              >
                ★
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
