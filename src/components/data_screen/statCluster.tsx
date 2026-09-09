import { useCallback, useEffect, useRef } from "react"
import CommonButton from "../commonBtn"

export default function StatCluster({
  spentOp = 0,
  availableOp,
  topSpeed,
  armor,
  hull,
  capacitors = 0,
  maxCapacitors = 0,
  vents = 0,
  maxVents = 0,
  fluxCapacity,
  fluxDissipation,
  shieldEfficiency,
  weaponFluxPerSecond,
  onCapacitorsIncrement,
  onCapacitorsDecrement,
  onVentsIncrement,
  onVentsDecrement
}: {
  spentOp?: number
  availableOp?: number
  topSpeed?: number
  armor?: number
  hull?: number
  capacitors?: number
  maxCapacitors?: number
  vents?: number
  maxVents?: number
  fluxCapacity?: number
  fluxDissipation?: number
  shieldEfficiency?: number
  weaponFluxPerSecond?: number
  onCapacitorsIncrement?: (e?: React.MouseEvent) => void
  onCapacitorsDecrement?: (e?: React.MouseEvent) => void
  onVentsIncrement?: (e?: React.MouseEvent) => void
  onVentsDecrement?: (e?: React.MouseEvent) => void
}) {
  const ratio =
    availableOp && availableOp > 0
      ? Math.min(1, Math.max(0, spentOp / availableOp))
      : 0
  const pct = `${ratio * 100}%`

  const holdTimeoutRef = useRef<number | null>(null)
  const holdIntervalRef = useRef<number | null>(null)
  const holdCbRef = useRef<(() => void) | null>(null)

  const clearHold = useCallback(() => {
    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current)
      holdTimeoutRef.current = null
    }
    if (holdIntervalRef.current !== null) {
      window.clearInterval(holdIntervalRef.current)
      holdIntervalRef.current = null
    }
    holdCbRef.current = null
  }, [])

  const makeHoldHandlers = useCallback(
    (cb?: (e: React.MouseEvent) => void) => {
      if (!cb) return {}
      return {
        onPointerDown: (e: React.PointerEvent) => {
          if (e.button !== 0) return
          // capture shift at start for repeat
          const synthetic = { shiftKey: e.shiftKey } as React.MouseEvent
          holdCbRef.current = () => cb(synthetic)
          holdTimeoutRef.current = window.setTimeout(() => {
            holdCbRef.current?.()
            holdIntervalRef.current = window.setInterval(() => {
              holdCbRef.current?.()
            }, 100)
          }, 200)
          // keep pointer capture so we get up even if outside
          ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
        },
        onPointerUp: (e: React.PointerEvent) => {
          ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
          clearHold()
        },
        onPointerLeave: clearHold,
        onPointerCancel: clearHold
      } as const
    },
    [clearHold]
  )

  const capsIncHold = makeHoldHandlers(onCapacitorsIncrement)
  const capsDecHold = makeHoldHandlers(onCapacitorsDecrement)
  const ventsIncHold = makeHoldHandlers(onVentsIncrement)
  const ventsDecHold = makeHoldHandlers(onVentsDecrement)

  useEffect(() => () => clearHold(), [clearHold])

  return (
    <div className="flex flex-col w-fit m-1 ml-2 max-sm:m-0.5">
      <fieldset
        className="relative flex self-end items-center justify-center w-[300px] sm:w-96 h-7 sm:h-8 bg-gray-950 border border-gray-950 rounded-xs overflow-hidden"
        aria-label={`Ordnance Points ${spentOp} of ${availableOp ?? "N/A"}`}
      >
        <div
          className="absolute inset-y-0 left-0 ss-stat-blue-bar border-0 rounded-none transition-[width] duration-200 ease-out"
          style={{ width: pct }}
          aria-hidden="true"
        />
        <input
          type="range"
          min={0}
          max={availableOp ?? 100}
          value={availableOp ? spentOp : 0}
          disabled
          readOnly
          aria-label={`Ordnance Points ${spentOp} of ${availableOp ?? "N/A"}`}
          aria-valuenow={availableOp ? spentOp : 0}
          aria-valuemin={0}
          aria-valuemax={availableOp ?? 100}
          className="absolute inset-0 w-full h-full opacity-0 cursor-default"
          tabIndex={-1}
        />
        <p className="relative z-10 mx-auto ss-amber-lg pointer-events-none">
          {availableOp ? `${spentOp} / ${availableOp}` : "N/A"}
        </p>
      </fieldset>
      <div className="flex gap-4 sm:gap-12 self-end max-sm:gap-3">
        <div className="ss-label-col">
          <p className="ss-label-text max-sm:text-xs">TOP SPEED</p>
          <p className="text-base sm:text-lg">{topSpeed ?? "N/A"}</p>
        </div>
        <div className="ss-label-col">
          <p className="ss-label-text max-sm:text-xs">ARMOR</p>
          <p className="text-base sm:text-lg">{armor ?? "N/A"}</p>
        </div>
        <div className="ss-label-col">
          <p className="ss-label-text max-sm:text-xs">HULL</p>
          <p className="text-base sm:text-lg">{hull ?? "N/A"}</p>
        </div>
      </div>
      <div className="flex mt-2 gap-1 max-sm:gap-0.5">
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="flex gap-2 sm:gap-3 items-center self-end">
            <p className="text-sm sm:text-base">Capacitors</p>
            <CommonButton
              className="px-2 sm:px-3 py-0.5 disabled:opacity-50 disabled:brightness-50 disabled:cursor-not-allowed select-none touch-manipulation text-sm sm:text-base"
              text="-"
              cutAllCorners
              onClick={onCapacitorsDecrement}
              disabled={capacitors <= 0}
              {...capsDecHold}
            />
            <p className="ss-amber min-w-5 sm:min-w-6 text-center text-sm sm:text-base">
              {capacitors}
            </p>
            <CommonButton
              className="px-2 sm:px-3 py-0.5 disabled:opacity-50 disabled:brightness-50 disabled:cursor-not-allowed select-none touch-manipulation text-sm sm:text-base"
              text="+"
              cutAllCorners
              onClick={onCapacitorsIncrement}
              disabled={
                capacitors >= maxCapacitors ||
                (availableOp !== undefined && spentOp >= availableOp)
              }
              title={
                capacitors >= maxCapacitors
                  ? `Max ${maxCapacitors}`
                  : availableOp !== undefined && spentOp >= availableOp
                    ? `Max OP ${availableOp}`
                    : undefined
              }
              {...capsIncHold}
            />
          </div>
          <div className="flex gap-2 sm:gap-3 items-center self-end">
            <p className="text-sm sm:text-base">Vents</p>
            <CommonButton
              className="px-2 sm:px-3 py-0.5 disabled:opacity-50 disabled:brightness-50 disabled:cursor-not-allowed select-none touch-manipulation text-sm sm:text-base"
              text="-"
              cutAllCorners
              onClick={onVentsDecrement}
              disabled={vents <= 0}
              {...ventsDecHold}
            />
            <p className="ss-amber min-w-5 sm:min-w-6 text-center text-sm sm:text-base">
              {vents}
            </p>
            <CommonButton
              className="px-2 sm:px-3 py-0.5 disabled:opacity-50 disabled:brightness-50 disabled:cursor-not-allowed select-none touch-manipulation text-sm sm:text-base"
              text="+"
              cutAllCorners
              onClick={onVentsIncrement}
              disabled={
                vents >= maxVents ||
                (availableOp !== undefined && spentOp >= availableOp)
              }
              title={
                vents >= maxVents
                  ? `Max ${maxVents}`
                  : availableOp !== undefined && spentOp >= availableOp
                    ? `Max OP ${availableOp}`
                    : undefined
              }
              {...ventsIncHold}
            />
          </div>
        </div>
        <div className="flex flex-col gap-0 items-end ml-auto max-sm:text-xs">
          <div className="flex flex-col">
            <p className="ss-label-text max-sm:text-[11px]">FLUX CAPACITY</p>
            <p className="self-end text-sm sm:text-base">
              {fluxCapacity ?? "N/A"}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="ss-label-text max-sm:text-[11px]">FLUX DISSPATION</p>
            <p className="self-end text-sm sm:text-base">
              {fluxDissipation ?? "N/A"}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="ss-label-text max-sm:text-[11px]">SHIELD FLUX/DAM</p>
            <p className="self-end text-sm sm:text-base">
              {shieldEfficiency ?? "N/A"}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="ss-label-text max-sm:text-[11px]">WEAPON FLUX/SEC</p>
            <p className="self-end text-sm sm:text-base">
              {weaponFluxPerSecond ?? "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
