import { useEffect } from "react"
import { twMerge } from "tailwind-merge"

type Props = {
  label: string
  onClose: () => void
  children: React.ReactNode
  /** Centered dialog on desktop, bottom sheet on phones. */
  variant?: "center" | "sheet"
  className?: string
}

/** Shared backdrop + focus/Escape handling for all pickers.
 *  Phones get a bottom-sheet (`sheet`), desktop keeps a centered dialog.
 */
export default function ModalShell({
  label,
  onClose,
  children,
  variant = "center",
  className
}: Props) {
  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  // Lock background scroll while a picker is open (restored on close).
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const isSheet = variant === "sheet"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-gray-950/60 cursor-default"
      />
      <div
        className={twMerge(
          "relative z-10 flex flex-col overflow-hidden bg-gray-950 border border-cyan-200 shadow-xl",
          isSheet
            ? "w-full max-h-[92dvh] rounded-t-2xl sm:w-[92%] sm:max-h-[86dvh] sm:rounded-none lg:w-auto"
            : "w-[95%] max-h-[92dvh] sm:w-[92%] sm:max-h-[86dvh]",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
