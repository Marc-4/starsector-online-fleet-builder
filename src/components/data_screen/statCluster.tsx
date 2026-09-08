import CommonButton from "../commonBtn"

export default function StatCluster({
  OP,
  topSpeed,
  armor,
  hull,
  capacitors,
  vents,
  fluxCapacity,
  fluxDissipation,
  shieldEfficiency,
  weaponFluxPerSecond
}: {
  OP?: number
  topSpeed?: number
  armor?: number
  hull?: number
  capacitors?: number
  vents?: number
  fluxCapacity?: number
  fluxDissipation?: number
    shieldEfficiency?: number
  weaponFluxPerSecond?:number
}) {
  return (
    <div className="flex flex-col w-fit m-1 ml-2">
      <div className="flex self-end w-96 h-8 ss-stat-blue-bar">
        <p className="mx-auto ss-amber-lg">
          {OP ? `${OP} / ${OP}` : "N/A"}
        </p>
      </div>
      <div className="flex gap-12 self-end">
        <div className="ss-label-col">
          <p>TOP SPEED</p>
          <p className="text-lg">{topSpeed ?? "N/A"}</p>
        </div>
        <div className="ss-label-col">
          <p>ARMOR</p>
          <p className="text-lg">{armor ?? "N/A"}</p>
        </div>
        <div className="ss-label-col">
          <p>HULL</p>
          <p className="text-lg">{hull ?? "N/A"}</p>
        </div>
      </div>
      <div className="flex mt-2 gap-1">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-center self-end">
            <p>Capacitors</p>
            <CommonButton className="px-3 py-0.5" text="-" cutAllCorners />
            <p className="ss-amber">{capacitors ?? "N/A"}</p>
            <CommonButton className="px-3 py-0.5" text="+" cutAllCorners />
          </div>
          <div className="flex gap-3 items-center self-end">
            <p>Vents</p>
            <CommonButton className="px-3 py-0.5" text="-" cutAllCorners />
            <p className="ss-amber">{vents ?? "N/A"}</p>
            <CommonButton className="px-3 py-0.5" text="+" cutAllCorners />
          </div>
        </div>
        <div className="flex  flex-col gap-1 items-end">
          <div className="flex flex-col">
            <p className="text-xs">FLUX CAPACITY</p>
            <p className="self-end">{fluxCapacity ?? "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-xs">FLUX DISSPATION</p>
            <p className="self-end">{fluxDissipation ?? "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-xs">SHIELD FLUX/DAM</p>
            <p className="self-end">{shieldEfficiency ?? "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-xs">WEAPON FLUX/SEC</p>
            <p className="self-end">{weaponFluxPerSecond ?? "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
