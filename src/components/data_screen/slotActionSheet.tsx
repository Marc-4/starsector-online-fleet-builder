import type { weapon, weaponSlot, weaponStats } from "#/types"
import CommonButton from "../commonBtn"
import WeaponTooltip from "../weaponTooltip"

export default function SlotActionSheet({
  slot,
  mountedId,
  infoWeapon,
  infoLoading,
  allWeaponStats,
  onFit,
  onInfo,
  onRemove,
  onBack,
  onClose,
}: {
  slot: weaponSlot
  mountedId?: string
  infoWeapon: weapon | null
  infoLoading: boolean
  allWeaponStats: weaponStats[]
  onFit: () => void
  onInfo: () => void
  onRemove: () => void
  onBack: () => void
  onClose: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Slot ${slot.id}`}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <button
        type="button"
        aria-label="Close slot actions"
        onClick={onClose}
        className="absolute inset-0 bg-gray-950/60"
      />
      <div className="relative z-10 w-full max-h-[92dvh] overflow-auto rounded-t-2xl border border-cyan-200 bg-gray-950 p-3 sm:w-96 sm:rounded-none">
        <h2 className="text-sm text-cyan-200">
          {slot.id} • {slot.type} {slot.size}
        </h2>
        <p className="mb-2 text-xs text-cyan-200/70">Mounted: {mountedId ?? "Empty"}</p>
        {infoWeapon || infoLoading ? (
          <div className="flex flex-col gap-2">
            {infoLoading && !infoWeapon ? (
              <p className="text-cyan-200/60 text-sm text-center py-8 animate-pulse">
                Loading weapon info…
              </p>
            ) : (
              infoWeapon && (
                <div className="max-h-[60dvh] overflow-auto">
                  <WeaponTooltip weapon={infoWeapon} allWeaponStats={allWeaponStats} />
                </div>
              )
            )}
            <CommonButton text="Back" clipPath={false} onClick={onBack} className="py-2" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <CommonButton text="Fit / Replace weapon" onClick={onFit} className="py-2" />
            {mountedId && (
              <>
                <CommonButton text="Info" onClick={onInfo} className="py-2" />
                <CommonButton text="Remove weapon" onClick={onRemove} className="py-2" />
              </>
            )}
            <CommonButton text="Close" clipPath={false} onClick={onClose} className="py-2" />
          </div>
        )}
      </div>
    </div>
  )
}
