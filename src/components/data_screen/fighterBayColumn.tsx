import type { wingStats } from "#/types"
import FighterBay from "./fighterBay"

export default function FighterBayColumn({
  entryId,
  builtInWings = [],
  bayCount,
  wingIdAt,
  remainingOpForBay,
  onSelect,
  onRemove,
  onShiftClick,
  onHover,
}: {
  entryId: string
  builtInWings?: string[]
  bayCount: number
  wingIdAt: (bayIndex: number) => string
  remainingOpForBay: (bayIndex: number) => number
  onSelect: (bayIndex: number, wing: wingStats) => void
  onRemove: (bayIndex: number) => void
  onShiftClick: (bayIndex: number) => void
  onHover: (wing: wingStats | null) => void
}) {
  return (
    <>
      {(builtInWings ?? []).map((wingId) => (
        <FighterBay
          key={`${entryId}-builtin-${wingId}`}
          wingId={wingId}
          locked
          onHover={onHover}
        />
      ))}
      {Array.from({ length: bayCount }, (_, bayIndex) => (
        <FighterBay
          key={`${entryId}-bay-${bayIndex}`}
          wingId={wingIdAt(bayIndex)}
          remainingOpForBay={remainingOpForBay(bayIndex)}
          onSelect={(wing) => onSelect(bayIndex, wing)}
          onRemove={() => onRemove(bayIndex)}
          onShiftClick={() => onShiftClick(bayIndex)}
          onHover={onHover}
        />
      ))}
    </>
  )
}
