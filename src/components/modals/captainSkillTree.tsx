import { Fragment, useState } from "react"
import {
  CAPTAIN_TIER_LADDERS,
  captainSkillRung,
  maxSkillsForOfficer,
  resolveSkillIconUrl
} from "#/lib/officerParser"
import type { officer, officerSkillMeta } from "#/types"

const APTITUDE_ORDER = [
  "combat",
  "leadership",
  "technology",
  "industry"
] as const

const APTITUDE_STYLE: Record<
  string,
  { label: string; text: string; takenRing: string }
> = {
  combat: {
    label: "Combat",
    text: "text-red-300",
    takenRing: "border-red-400"
  },
  leadership: {
    label: "Leadership",
    text: "text-green-300",
    takenRing: "border-green-400"
  },
  technology: {
    label: "Technology",
    text: "text-sky-300",
    takenRing: "border-sky-400"
  },
  industry: {
    label: "Industry",
    text: "text-yellow-300",
    takenRing: "border-yellow-400"
  },
  other: {
    label: "Other",
    text: "text-cyan-300",
    takenRing: "border-cyan-400"
  }
}

export default function CaptainSkillTree({
  skills,
  draft,
  skillError,
  tierBlockReason,
  aptitudeOf,
  aptitudeIcon,
  canElite,
  eliteMax,
  onToggleSkill
}: {
  skills: officerSkillMeta[]
  draft: officer
  skillError: string | null
  tierBlockReason: (skill: officerSkillMeta) => string | null
  aptitudeOf: (id: string) => string | undefined
  aptitudeIcon: (aptitude: string) => string | null
  /** Whether a skill has an elite effect and can be promoted to elite. */
  canElite: (id: string) => boolean
  /** Max elite skills, or null for unlimited (captains). */
  eliteMax: number | null
  onToggleSkill: (skill: officerSkillMeta) => void
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Skills whose .skill def hasn't loaded yet (or has no aptitude) fall
  // into "Other" so they never silently vanish from the tree.
  const ungrouped = skills.filter((s) => {
    const apt = aptitudeOf(s.id)?.toLowerCase()
    return !apt || !(APTITUDE_ORDER as readonly string[]).includes(apt)
  })
  const rows = [
    ...APTITUDE_ORDER.map((apt) => ({
      apt,
      skills: skills
        .filter((s) => aptitudeOf(s.id)?.toLowerCase() === apt)
        .sort(
          (a, b) => (a.tier ?? 0) - (b.tier ?? 0) || a.name.localeCompare(b.name)
        )
    })),
    ...(ungrouped.length > 0 ? [{ apt: "other", skills: ungrouped }] : [])
  ]

  return (
    <div>
      <h3 className="text-cyan-200 text-sm mb-1">
        Skills{" "}
        <span className="text-cyan-200/60">
          ({draft.skills.length}/{maxSkillsForOfficer(draft)})
        </span>
        {" ― "}
        <span className="text-amber-200/80">
          Elite ({draft.eliteSkills.length}
          {eliteMax != null ? `/${eliteMax}` : ""})
        </span>
      </h3>
      {skillError && <p className="text-xs text-red-300 mb-1">{skillError}</p>}
      <div className="flex flex-col gap-3">
        {rows.map(({ apt, skills: row }, rowIndex) => {
          const style = APTITUDE_STYLE[apt]
          const icon = aptitudeIcon(apt)
          // Group the aptitude's skills into visual tier rungs,
          // separated by a gap.
          const ladder = CAPTAIN_TIER_LADDERS[apt]
          const groups: { rung: number; skills: officerSkillMeta[] }[] =
            ladder
              ? ladder.tiers.map((_, rung) => ({
                  rung,
                  skills: row.filter(
                    (s) => captainSkillRung(apt, s.tier) === rung
                  )
                }))
              : [{ rung: 0, skills: row }]
          let flatIndex = -1
          const renderSkill = (skill: officerSkillMeta) => {
            flatIndex += 1
            const skillIndex = flatIndex
            const taken = draft.skills.includes(skill.id)
            const elite = draft.eliteSkills.includes(skill.id)
            const tierBlock = tierBlockReason(skill)
            const locked = tierBlock !== null
            const capped =
              !taken &&
              !locked &&
              draft.skills.length >= maxSkillsForOfficer(draft)
            const eliteCapped =
              eliteMax != null &&
              taken &&
              !elite &&
              draft.eliteSkills.length >= eliteMax
            const disabled = capped || (locked && !taken)
            const skillIcon = resolveSkillIconUrl(skill.icon)
            const hovered = hoveredId === skill.id
                    return (
                      <div key={skill.id} className="relative">
                        <button
                          type="button"
                          disabled={disabled}
                          title={skill.name}
                          onClick={() => onToggleSkill(skill)}
                          onMouseEnter={() => setHoveredId(skill.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onFocus={() => setHoveredId(skill.id)}
                          onBlur={() => setHoveredId(null)}
                          className={`relative block h-14 w-14 border-2 p-0.5 touch-manipulation ${
                            taken
                              ? `${style.takenRing} brightness-110`
                              : "border-transparent opacity-100 hover:opacity-100 hover:border-cyan-700"
                          } ${disabled && !taken ? "cursor-not-allowed opacity-100 saturate-20" : "cursor-pointer"} ${hovered && !disabled ? "brightness-125" : ""}`}
                        >
                          {skillIcon ? (
                            <img
                              src={skillIcon}
                              alt={skill.name}
                              draggable={false}
                              loading="lazy"
                              className="h-full w-full object-contain pointer-events-none"
                            />
                          ) : (
                            <span className="block h-full w-full border border-cyan-800 bg-cyan-900/30" />
                          )}
                          {elite && (
                            <span className="absolute -top-1 -right-1 text-amber-300 text-sm leading-none drop-shadow-[0_0_2px_black]">
                              ★
                            </span>
                          )}
                        </button>
                        {hovered && (
                          <div
                            className={`absolute z-50 w-64 border border-cyan-700 bg-gray-950 p-2 shadow-xl pointer-events-none ${
                              skillIndex < 2
                                ? "left-0"
                                : skillIndex > row.length - 3
                                  ? "right-0"
                                  : "left-1/2 -translate-x-1/2"
                            } ${
                              rowIndex === 0
                                ? "top-full mt-2"
                                : "bottom-full mb-2"
                            }`}
                          >
                            <p className="text-sm text-cyan-100">
                              {skill.name}
                            </p>
                            {tierBlock ? (
                              <p className="text-xs text-red-300">
                                {tierBlock}
                              </p>
                            ) : elite ? (
                              <p className="text-xs text-amber-200/80">
                                Elite — click to remove
                              </p>
                            ) : taken ? (
                              <p className="text-xs text-cyan-200/60">
                                {!canElite(skill.id)
                                  ? "No elite effect — click to remove"
                                  : eliteCapped
                                    ? "Elite full — click to remove"
                                    : "Click to make elite"}
                              </p>
                            ) : (
                              !disabled && (
                                <p className="text-xs text-cyan-200/60">
                                  Click to select
                                </p>
                              )
                            )}
                            <p className="mt-1 text-xs text-cyan-100/80 whitespace-pre-line leading-relaxed">
                              {skill.description}
                            </p>
                          </div>
                        )}
                      </div>
                    )
          }
          return (
            <div key={apt}>
              <div className="flex gap-2 items-start">
                <div className="flex flex-col items-center gap-1 w-16 shrink-0">
                  {icon ? (
                    <img
                      src={icon}
                      alt={style.label}
                      draggable={false}
                      className="h-14 w-14 object-contain"
                    />
                  ) : (
                    <span className="h-14 w-14 border border-cyan-800 bg-cyan-900/30" />
                  )}
                  <span className={`text-xs ${style.text}`}>{style.label}</span>
                </div>
                <div className="flex flex-1 flex-wrap gap-1.5 min-w-0 items-center">
                  {groups.map((g) => (
                    <Fragment key={g.rung}>
                      {g.rung > 0 && <span className="w-4 shrink-0" />}
                      {g.skills.map((s) => renderSkill(s))}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
