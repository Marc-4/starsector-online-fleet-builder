export default function ShipName({
  hullName,
  customName,
  onCustomNameChange
}: {
  hullName?: string
  customName?: string
  onCustomNameChange?: (value: string) => void
}) {
  return (
    <div className="flex gap-2 items-center font-serif">
      <input
        type="text"
        value={customName ?? ""}
        maxLength={20}
        onChange={(e) => onCustomNameChange?.(e.target.value)}
        placeholder="name"
        aria-label="Custom ship name"
        className="flex text-center items-center bg-cyan-950 border border-cyan-800 w-56 max-w-[52vw] max-[470px]:w-40 h-8 text-base text-cyan-100 placeholder:text-cyan-100/60 px-2"
      />
      <p className="text-cyan-50 text-lg ss-soft-text-shadow">{`${hullName ? `${hullName}-class` : "N/A"}`}</p>
    </div>
  )
}
