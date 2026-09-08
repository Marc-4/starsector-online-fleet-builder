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
  onVentsDecrement,
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
        onPointerCancel: clearHold,
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
    <div className="flex flex-col w-fit m-1 ml-2">
      <div
        className="relative flex self-end items-center justify-center w-96 h-8 bg-gray-950 border border-gray-950 rounded-xs overflow-hidden"
        role="group"
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
      </div>
      <div className="flex gap-12 self-end">
        <div className="ss-label-col">
          <p className="ss-label-text">TOP SPEED</p>
          <p className="text-lg">{topSpeed ?? "N/A"}</p>
        </div>
        <div className="ss-label-col">
          <p className="ss-label-text">ARMOR</p>
          <p className="text-lg">{armor ?? "N/A"}</p>
        </div>
        <div className="ss-label-col">
          <p className="ss-label-text">HULL</p>
          <p className="text-lg">{hull ?? "N/A"}</p>
        </div>
      </div>
      <div className="flex mt-2 gap-1">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-center self-end">
            <p>Capacitors</p>
            <CommonButton
              className="px-3 py-0.5 disabled:opacity-50 disabled:brightness-50 disabled:cursor-not-allowed select-none touch-manipulation"
              text="-"
              cutAllCorners
              onClick={onCapacitorsDecrement}
              disabled={capacitors <= 0}
              {...capsDecHold}
            />
            <p className="ss-amber min-w-6 text-center">{capacitors}</p>
            <CommonButton
              className="px-3 py-0.5 disabled:opacity-50 disabled:brightness-50 disabled:cursor-not-allowed select-none touch-manipulation"
              text="+"
              cutAllCorners
              onClick={onCapacitorsIncrement}
              disabled={capacitors >= maxCapacitors || (availableOp !== undefined && spentOp >= availableOp)}
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
          <div className="flex gap-3 items-center self-end">
            <p>Vents</p>
            <CommonButton
              className="px-3 py-0.5 disabled:opacity-50 disabled:brightness-50 disabled:cursor-not-allowed select-none touch-manipulation"
              text="-"
              cutAllCorners
              onClick={onVentsDecrement}
              disabled={vents <= 0}
              {...ventsDecHold}
            />
            <p className="ss-amber min-w-6 text-center">{vents}</p>
            <CommonButton
              className="px-3 py-0.5 disabled:opacity-50 disabled:brightness-50 disabled:cursor-not-allowed select-none touch-manipulation"
              text="+"
              cutAllCorners
              onClick={onVentsIncrement}
              disabled={vents >= maxVents || (availableOp !== undefined && spentOp >= availableOp)}
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
        <div className="flex flex-col gap-0 items-end ml-auto">
          <div className="flex flex-col">
            <p className="ss-label-text">FLUX CAPACITY</p>
            <p className="self-end">{fluxCapacity ?? "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <p className="ss-label-text">FLUX DISSPATION</p>
            <p className="self-end">{fluxDissipation ?? "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <p className="ss-label-text">SHIELD FLUX/DAM</p>
            <p className="self-end">{shieldEfficiency ?? "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <p className="ss-label-text">WEAPON FLUX/SEC</p>
            <p className="self-end">{weaponFluxPerSecond ?? "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
