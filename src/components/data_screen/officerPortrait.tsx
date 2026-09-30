import { resolvePortraitUrl } from "#/lib/officerParser"
import type { officer } from "#/types"

export default function OfficerPortrait({
  officer,
  onClick,
}: {
  officer?: officer | null
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={officer ? `${officer.firstName} ${officer.lastName} — click to edit` : "Assign officer"}
      className="w-30 h-30 border-cyan-800 border bg-gray-950 cursor-pointer touch-manipulation hover:border-cyan-600 overflow-hidden block p-0"
    >
      {officer ? (
        <img
          src={resolvePortraitUrl(officer.portrait)}
          alt={`${officer.firstName} ${officer.lastName}`}
          draggable={false}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[10px] text-cyan-200/50">
          No officer
        </span>
      )}
    </button>
  )
}
