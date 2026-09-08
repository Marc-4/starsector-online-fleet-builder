import type { ButtonHTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

type Props = {
  text: string
  clipPath?: boolean
  cutAllCorners?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">

export default function CommonButton({
  text,
  className,
  clipPath = true,
  cutAllCorners = false,
  onClick,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type="button"
      className={twMerge(
        "text-cyan-200 cursor-pointer bg-cyan-700 hover:brightness-110 p-1 px-6",
        className
      )}
      style={{
        backgroundSize: "1px",
        backgroundImage:
          "repeating-linear-gradient(0deg, #104e64, #104e64 1px, transparent 1px 2px)",
        clipPath: clipPath
          ? cutAllCorners
            ? "polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)"
            : "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))"
          : undefined
      }}
    >
      {text}
    </button>
  )
}
