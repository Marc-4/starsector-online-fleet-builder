import { useEffect, useState } from "react"
import {
  canPickSkill,
  createOfficer,
  getAllPersonalities,
  getPickableOfficerSkills,
  maxLevelForType,
  maxSkillsForOfficer,
  randomOfficerName,
  randomPortrait,
  resolvePortraitUrl
} from "#/lib/officerParser"
import type {
  officer,
  officerPersonality,
  officerSkillMeta,
  officerType
} from "#/types"
import CommonButton from "../commonBtn"
import OfficerPortraitSelectionModal from "./officerPortraitSelectionModal"
import OfficerSkillList from "./officerSkillList"

export default function OfficerSelectionModal({
  officer,
  onClose,
  onSave,
  onRemove
}: {
  officer?: officer | null
  onClose: () => void
  onSave: (officer: officer) => void
  onRemove?: () => void
}) {
  const [draft, setDraft] = useState<officer | null>(
    officer ? { ...officer, type: officer.type ?? "officer" } : null
  )
  const [personalities, setPersonalities] = useState<officerPersonality[]>([])
  const [skills, setSkills] = useState<officerSkillMeta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPortraitPicker, setShowPortraitPicker] = useState(false)
  const [hoveredSkill, setHoveredSkill] = useState<officerSkillMeta | null>(
    null
  )
  const [skillError, setSkillError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setIsLoading(true)
      try {
        const [pers, pickable] = await Promise.all([
          getAllPersonalities(),
          getPickableOfficerSkills()
        ])
        if (cancelled) return
        setPersonalities(pers)
        setSkills(
          pickable.sort(
            (a, b) =>
              (a.tier ?? 0) - (b.tier ?? 0) || a.name.localeCompare(b.name)
          )
        )
        if (!officer) setDraft(await createOfficer())
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [officer])

  useEffect(() => {
    if (showPortraitPicker) return
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose, showPortraitPicker])

  const rerollNameAndPortrait = async () => {
    if (!draft) return
    const { first, last } = await randomOfficerName({ gender: draft.gender })
    setDraft({
      ...draft,
      firstName: first,
      lastName: last,
      portrait: randomPortrait()
    })
  }

  const toggleSkill = async (skill: officerSkillMeta) => {
    if (!draft) return
    setSkillError(null)
    if (draft.skills.includes(skill.id)) {
      setDraft({
        ...draft,
        skills: draft.skills.filter((s) => s !== skill.id),
        eliteSkills: draft.eliteSkills.filter((s) => s !== skill.id)
      })
      return
    }
    const reason = await canPickSkill(draft, skill)
    if (reason) {
      setSkillError(reason)
      return
    }
    setDraft({ ...draft, skills: [...draft.skills, skill.id] })
  }

  const toggleElite = (skillId: string) => {
    if (!draft || !draft.skills.includes(skillId)) return
    if (draft.eliteSkills.includes(skillId)) {
      setSkillError(null)
      setDraft({
        ...draft,
        eliteSkills: draft.eliteSkills.filter((s) => s !== skillId)
      })
      return
    }
    if (draft.eliteSkills.length >= 1) {
      setSkillError("Officers can only have 1 elite skill")
      return
    }
    setDraft({ ...draft, eliteSkills: [skillId] })
  }

  const hoveredPersonality =
    personalities.find((per) => per.id === draft?.personality) ?? null

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-gray-950/60 cursor-default"
      />
      <div className="fixed inset-0 z-40 flex flex-col lg:flex-row gap-2 w-[95%] sm:w-[90%] lg:w-[80%] mx-auto max-h-[92dvh] my-auto justify-center lg:items-center overflow-y-auto lg:overflow-visible py-2 pointer-events-none">
        <div className="hidden lg:flex w-[40%] min-w-80 h-fit max-h-[86dvh] overflow-auto flex-col gap-2">
          {hoveredSkill ? (
            <div className="border border-cyan-900 bg-gray-950 p-3">
              <h3 className="text-sm text-cyan-300">{hoveredSkill.name}</h3>
              <p className="text-xs text-cyan-200/70">
                Tier {hoveredSkill.tier ?? 1}
              </p>
              <p className="mt-1 text-xs text-cyan-100 whitespace-pre-line">
                {hoveredSkill.description}
              </p>
            </div>
          ) : hoveredPersonality ? (
            <div className="border border-cyan-900 bg-gray-950 p-3">
              <h3 className="text-sm text-cyan-300">
                {hoveredPersonality.name}
              </h3>
              <p className="mt-1 text-xs text-cyan-100 whitespace-pre-line">
                {hoveredPersonality.desc}
              </p>
            </div>
          ) : (
            <div
              className="w-full opacity-0 h-64 pointer-events-none"
              aria-hidden="true"
            />
          )}
        </div>
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Officer selection"
          className="relative z-40 flex items-center w-full lg:w-[40%] lg:min-w-80 justify-center pointer-events-none bg-gray-950"
        >
          <div className="flex w-full z-40 flex-col gap-2 p-1 border border-cyan-200 pointer-events-auto shadow-xl max-h-[88dvh]">
            <div className="flex m-1 mb-0 p-1 pb-0 gap-1 justify-between items-start">
              <h2 className="text-cyan-200 text-sm">
                {officer ? "Edit officer" : "New officer"}
              </h2>
              <CommonButton
                text="x"
                onClick={() => onClose()}
                clipPath={false}
                className="cursor-pointer rounded-xs w-7 h-7 px-2 font-bold hover:brightness-110 text-xl text-cyan-200 flex items-center justify-center shrink-0"
              />
            </div>

            <div className="w-full flex-1 flex flex-col gap-3 p-2 max-h-[52dvh] lg:max-h-96 overflow-y-auto overscroll-contain">
              {isLoading || !draft ? (
                <p className="text-cyan-200/60 text-sm text-center py-8 animate-pulse">
                  Loading officer data…
                </p>
              ) : (
                <>
                  <div className="flex gap-3 items-start">
                    <button
                      type="button"
                      title="Change portrait"
                      onClick={() => setShowPortraitPicker(true)}
                      className="shrink-0 border border-cyan-800 bg-cyan-900/30 hover:border-cyan-500 p-0 cursor-pointer"
                    >
                      <img
                        src={resolvePortraitUrl(draft.portrait)}
                        alt={`${draft.firstName} ${draft.lastName}`}
                        draggable={false}
                        className="h-24 w-24 object-cover pointer-events-none"
                      />
                    </button>
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex flex-col gap-2">
                        <label className="flex-1 min-w-0">
                          <span className="text-xs text-cyan-200/70">
                            First name
                          </span>
                          <input
                            className="border border-cyan-800 w-full text-cyan-100 text-sm px-2 py-1 bg-transparent"
                            value={draft.firstName}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                firstName: e.currentTarget.value
                              })
                            }
                          />
                        </label>
                        <label className="flex-1 min-w-0">
                          <span className="text-xs text-cyan-200/70">
                            Last name
                          </span>
                          <input
                            className="border border-cyan-800 w-full text-cyan-100 text-sm px-2 py-1 bg-transparent"
                            value={draft.lastName}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                lastName: e.currentTarget.value
                              })
                            }
                          />
                        </label>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-cyan-200/70">Type</span>
                        {(
                          ["captain", "officer", "ai-core"] as officerType[]
                        ).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                type: t,
                                level: Math.min(draft.level, maxLevelForType(t))
                              })
                            }
                            className={`rounded cursor-pointer border px-2 py-0.5 text-xs ${draft.type === t ? "border-cyan-800 bg-cyan-900/40 text-cyan-100" : "border-cyan-900 bg-gray-950 text-cyan-200"}`}
                          >
                            {t === "ai-core"
                              ? "AI core"
                              : t[0].toUpperCase() + t.slice(1)}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-cyan-200/70">Level</span>
                        <CommonButton
                          text="-"
                          clipPath={false}
                          onClick={() =>
                            setDraft({
                              ...draft,
                              level: Math.max(1, draft.level - 1)
                            })
                          }
                          className="px-2 py-0"
                        />
                        <span className="text-sm text-cyan-100 w-6 text-center">
                          {draft.level}
                        </span>
                        <CommonButton
                          text="+"
                          clipPath={false}
                          onClick={() =>
                            setDraft({
                              ...draft,
                              level: Math.min(
                                maxLevelForType(draft.type ?? "officer"),
                                draft.level + 1
                              )
                            })
                          }
                          className="px-2 py-0"
                        />
                        <span className="text-xs text-cyan-200/70 ml-2">
                          Skills {draft.skills.length}/
                          {maxSkillsForOfficer(draft)}
                        </span>
                      </div>
                      <div>
                        <CommonButton
                          text="Reroll"
                          clipPath={false}
                          onClick={() => void rerollNameAndPortrait()}
                          className="py-0.5 text-xs self-start"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-cyan-200 text-sm mb-1">Personality</h3>
                    <div className="flex flex-wrap gap-1">
                      {personalities.map((per) => (
                        <button
                          key={per.id}
                          type="button"
                          title={per.desc}
                          onClick={() =>
                            setDraft({ ...draft, personality: per.id })
                          }
                          className={`rounded cursor-pointer border px-2 py-1 text-xs touch-manipulation ${draft.personality === per.id ? "border-cyan-800 bg-cyan-800/50 text-cyan-100" : "border-cyan-900 bg-gray-950 text-cyan-200"}`}
                        >
                          {per.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <OfficerSkillList
                    skills={skills}
                    draft={draft}
                    skillError={skillError}
                    onToggleSkill={(skill) => void toggleSkill(skill)}
                    onToggleElite={toggleElite}
                    onHoverSkill={setHoveredSkill}
                  />
                </>
              )}
            </div>

            <div className="flex gap-2 p-2 pt-0">
              <CommonButton
                text="Save officer"
                onClick={() => {
                  if (draft) onSave(draft)
                }}
                className="py-1 flex-1"
              />
              {officer && (
                <CommonButton
                  text="Remove"
                  clipPath={false}
                  onClick={() => onRemove?.()}
                  className="py-1"
                />
              )}
              <CommonButton
                text="Cancel"
                clipPath={false}
                onClick={onClose}
                className="py-1"
              />
            </div>
            {showPortraitPicker && draft && (
              <OfficerPortraitSelectionModal
                current={draft.portrait}
                onClose={() => setShowPortraitPicker(false)}
                onSelect={(file) => setDraft({ ...draft, portrait: file })}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
