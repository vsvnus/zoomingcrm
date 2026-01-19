import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "input-base",
          "flex h-10 w-full rounded-md px-4",
          "bg-bg-secondary",
          "border border-[rgb(var(--glass-border))]",
          "text-sm text-text-primary",
          "transition-all duration-base",
          "placeholder:text-text-quaternary",
          "hover:border-text-tertiary",
          "focus-visible:outline-none",
          "focus-visible:border-accent-500",
          "focus-visible:ring-3 focus-visible:ring-[rgb(var(--accent-500)/0.12)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
