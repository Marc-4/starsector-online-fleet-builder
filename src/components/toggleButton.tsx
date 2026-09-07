import type { ButtonHTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

type Props = {
  text: string
  active: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">

export default function ToggleButton({
  text,
  className,
  onClick,
  disabled,
  active = false,
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type="button"
      className={twMerge(
        `text-cyan-200 text-sm cursor-pointer ${active ? "bg-cyan-900" : "bg-transparent"} border border-cyan-800 hover:brightness-110 p-1 px-4`,
        className
      )}
    >
      {text}
    </button>
  )
}
