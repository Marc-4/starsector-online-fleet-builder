export default function ShipName({
  hullName,
  customName,
  onCustomNameChange,
}: {
  hullName?: string
  customName?: string
  onCustomNameChange?: (value: string) => void
}) {
  return (
    <div className="flex gap-2 font-serif">
      <input
        type="text"
        value={customName ?? ""}
        onChange={(e) => onCustomNameChange?.(e.target.value)}
        placeholder="Enter name"
        className="flex text-center items-center bg-cyan-950 border border-cyan-200 w-56 max-[470px]:w-40 text-cyan-100 placeholder:text-cyan-100/60"
      />
      <p className="text-cyan-50 text-lg ss-soft-text-shadow">{`${hullName ? `${hullName}-class` : "N/A"}`}</p>
    </div>
  )
}
