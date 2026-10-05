import { useEffect, useState } from "react"
import {
  canPickSkill,
  captainTierBlockReason,
  createOfficer,
  getAllOfficerSkillMeta,
  getAllPersonalities,
  getOfficerSkillDef,
  getPickableCaptainSkills,
  getPickableOfficerSkills,
  maxLevelForType,
  maxSkillsForOfficer,
  randomOfficerName,
  randomPortrait,
  resolvePortraitUrl,
  resolveSkillIconUrl
} from "#/lib/officerParser"
import type {
  officer,
  officerPersonality,
  officerSkillMeta,
  officerType
} from "#/types"
import CommonButton from "../commonBtn"
import CaptainSkillTree from "./captainSkillTree"
import OfficerPortraitSelectionModal from "./officerPortraitSelectionModal"
import OfficerSkillList from "./officerSkillList"

export default function OfficerSelectionModal({
  officer,
  onClose,
  onSave,
  onRemove,
  captainMode
}: {
  officer?: officer | null
  onClose: () => void
  onSave: (officer: officer) => void
  onRemove?: () => void
  /** Fleet captain editor: type locked to captain, full skill pool + tiering. */
  captainMode?: boolean
}) {
  const [draft, setDraft] = useState<officer | null>(
    officer
      ? {
          ...officer,
          type: captainMode ? "captain" : (officer.type ?? "officer")
        }
      : null
  )
  const [personalities, setPersonalities] = useState<officerPersonality[]>([])
  const [skills, setSkills] = useState<officerSkillMeta[]>([])
  const [captainSkills, setCaptainSkills] = useState<officerSkillMeta[]>([])
  const [metaById, setMetaById] = useState<Map<string, officerSkillMeta>>(
    new Map()
  )
  const [aptitudeById, setAptitudeById] = useState<Map<string, string>>(
    new Map()
  )
  // Skills whose .skill def has an elite effect (PILOTED_SHIP personal
  // skills). Only these can be promoted to elite.
  const [eliteCapableIds, setEliteCapableIds] = useState<Set<string>>(
    new Set()
  )
  const [isLoading, setIsLoading] = useState(true)
  const [showPortraitPicker, setShowPortraitPicker] = useState(false)
  const [skillError, setSkillError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setIsLoading(true)
      try {
        const [pers, pickable, captainPickable, metas] = await Promise.all([
          getAllPersonalities(),
          getPickableOfficerSkills(),
          getPickableCaptainSkills(),
          getAllOfficerSkillMeta()
        ])
        if (cancelled) return
        setPersonalities(pers)
        const byTier = (a: officerSkillMeta, b: officerSkillMeta) =>
          (a.tier ?? 0) - (b.tier ?? 0) || a.name.localeCompare(b.name)
        setSkills(pickable.sort(byTier))
        setCaptainSkills(captainPickable.sort(byTier))
        setMetaById(new Map(metas.map((m) => [m.id, m])))
        const defs = await Promise.all(
          captainPickable.map((s) => getOfficerSkillDef(s.id))
        )
        if (cancelled) return
        const aptitudes = new Map<string, string>()
        const eliteCapable = new Set<string>()
        captainPickable.forEach((s, i) => {
          const gov = defs[i]?.governingAptitude
          if (gov) aptitudes.set(s.id, gov)
          if (defs[i]?.elite) eliteCapable.add(s.id)
        })
        setAptitudeById(aptitudes)
        setEliteCapableIds(eliteCapable)
        if (!officer)
          setDraft(await createOfficer({ type: captainMode ? "captain" : "officer" }))
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
    // Captain tree click-cycle: select -> elite -> deselect.
    // Only elite-capable skills (ones with an elite effect) promote;
    // a second click on other skills removes them. Captains may elite
    // as many skills as they want.
    if (draft.type === "captain" && draft.skills.includes(skill.id)) {
      if (draft.eliteSkills.includes(skill.id)) {
        setDraft({
          ...draft,
          skills: draft.skills.filter((s) => s !== skill.id),
          eliteSkills: draft.eliteSkills.filter((s) => s !== skill.id)
        })
        return
      }
      if (!eliteCapableIds.has(skill.id)) {
        setDraft({
          ...draft,
          skills: draft.skills.filter((s) => s !== skill.id)
        })
        return
      }
      toggleElite(skill.id)
      return
    }
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
    // Captains can elite as many skills as they want; officers cap at 1.
    if (draft.type !== "captain" && draft.eliteSkills.length >= 1) {
      setSkillError("Officers can only have 1 elite skill")
      return
    }
    setDraft({ ...draft, eliteSkills: [...draft.eliteSkills, skillId] })
  }

  const isCaptain = draft?.type === "captain"
  const visibleSkills = isCaptain ? captainSkills : skills
  const tierBlockReason = (skill: officerSkillMeta): string | null => {
    if (!isCaptain || !draft) return null
    return captainTierBlockReason({
      takenIds: draft.skills,
      skill,
      metaById,
      aptitudeOf: (id) => aptitudeById.get(id),
    })
  }
  const aptitudeIcon = (aptitude: string): string | null => {
    const apt = aptitude.toLowerCase()
    if (!["combat", "leadership", "technology", "industry"].includes(apt))
      return null
    const meta = metaById.get(`aptitude_${apt}`)
    const fromMeta = resolveSkillIconUrl(meta?.icon)
    if (fromMeta) return fromMeta
    // Aptitude rows live in aptitude_data.csv, not skill_data.csv, so fall
    // back to the category icons shipped under public/skills/.
    return `skills/category_${apt}.webp`
  }
  // Captains live at fleet level; ships take officers / AI cores.
  // (A legacy captain draft keeps its option so it can switch away.)
  const typeOptions: officerType[] = captainMode
    ? ["captain"]
    : draft?.type === "captain"
      ? ["captain", "officer", "ai-core"]
      : ["officer", "ai-core"]

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-gray-950/60 cursor-default"
      />
      <div className="fixed inset-0 z-40 flex w-[95%] sm:w-[90%] lg:w-[55%] mx-auto max-h-[92dvh] my-auto justify-center overflow-y-auto py-2 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Officer selection"
          className="relative z-40 flex items-center w-fit h-fit justify-center pointer-events-none bg-gray-950"
        >
          <div className="flex w-full z-40 flex-col gap-2 p-1 border border-cyan-200 pointer-events-auto shadow-xl max-h-[88dvh]">
            <div className="flex m-1 mb-0 p-1 pb-0 gap-1 justify-between items-start">
              <h2 className="text-cyan-200 text-sm">
                {captainMode
                  ? "Fleet captain"
                  : officer
                    ? "Edit officer"
                    : "New officer"}
              </h2>
              <CommonButton
                text="x"
                onClick={() => onClose()}
                clipPath={false}
                className="cursor-pointer rounded-xs w-7 h-7 px-2 font-bold hover:brightness-110 text-xl text-cyan-200 flex items-center justify-center shrink-0"
              />
            </div>

            <div className="w-full flex-1 flex flex-col gap-3 p-2 max-h-[62dvh] lg:max-h-[70dvh] overflow-y-auto overscroll-contain">
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
                      {/*<div className="flex flex-col gap-2">
                        <label className="flex-1 min-w-0">
                          <span className="text-xs text-cyan-200/70 mr-2">
                            First name
                          </span>
                          <input
                            className="border border-cyan-800 text-cyan-100 w-52 text-sm px-2 py-1 bg-transparent"
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
                          <span className="text-xs text-cyan-200/70 mr-2">
                            Last name
                          </span>
                          <input
                            className="border border-cyan-800 w-52 text-cyan-100 text-sm px-2 py-1 bg-transparent"
                            value={draft.lastName}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                lastName: e.currentTarget.value
                              })
                            }
                          />
                        </label>
                      </div>*/}
                      {typeOptions.length > 1 && (
                        <div className="flex gap-2 items-center">
                          <span className="text-xs text-cyan-200/70">Type</span>
                          {typeOptions.map((t) => (
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
                      )}
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

                  {!captainMode && (
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
                  )}

                  {isCaptain ? (
                    <CaptainSkillTree
                      skills={visibleSkills}
                      draft={draft}
                      skillError={skillError}
                      tierBlockReason={tierBlockReason}
                      aptitudeOf={(id) => aptitudeById.get(id)}
                      aptitudeIcon={aptitudeIcon}
                      canElite={(id) => eliteCapableIds.has(id)}
                      eliteMax={null}
                      onToggleSkill={(skill) => void toggleSkill(skill)}
                    />
                  ) : (
                    <OfficerSkillList
                      skills={visibleSkills}
                      draft={draft}
                      skillError={skillError}
                      onToggleSkill={(skill) => void toggleSkill(skill)}
                      onToggleElite={toggleElite}
                    />
                  )}
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
