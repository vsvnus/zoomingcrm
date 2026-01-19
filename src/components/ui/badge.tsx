import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "badge-base inline-flex items-center gap-1 h-6 px-3 rounded-full text-xs font-semibold leading-none",
  {
    variants: {
      variant: {
        default: [
          "bg-bg-tertiary",
          "text-text-secondary",
          "border border-[rgb(var(--glass-border))]",
        ].join(" "),
        success: [
          "bg-success-bg",
          "text-success",
          "border border-success-border",
        ].join(" "),
        warning: [
          "bg-warning-bg",
          "text-warning",
          "border border-warning-border",
        ].join(" "),
        error: [
          "bg-error-bg",
          "text-error",
          "border border-error-border",
        ].join(" "),
        info: [
          "bg-info-bg",
          "text-info",
          "border border-info-border",
        ].join(" "),
        accent: [
          "bg-[rgb(var(--accent-500)/0.12)]",
          "text-accent-500",
          "border border-[rgb(var(--accent-500)/0.3)]",
        ].join(" "),
        outline: [
          "bg-transparent",
          "text-text-secondary",
          "border border-[rgb(var(--glass-border))]",
        ].join(" "),
      },
      withDot: {
        true: "before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-current",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      withDot: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, withDot, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, withDot }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
