import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "btn-base inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-foreground border-none",
          "hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-2",
          "active:translate-y-0 active:shadow-1",
        ].join(" "),
        secondary: [
          "bg-transparent text-text-secondary border border-[rgb(var(--glass-border))]",
          "hover:bg-bg-hover hover:border-text-tertiary hover:text-text-primary",
          "active:bg-bg-secondary",
        ].join(" "),
        destructive: [
          "bg-error text-white border-none",
          "hover:bg-[rgb(239_68_68/0.9)] hover:-translate-y-0.5 hover:shadow-2",
          "active:translate-y-0 active:shadow-1",
        ].join(" "),
        ghost: [
          "bg-transparent text-text-secondary border-none",
          "hover:bg-bg-hover hover:text-text-primary",
        ].join(" "),
        link: [
          "text-accent-500 underline-offset-4",
          "hover:underline hover:text-accent-600",
        ].join(" "),
        success: [
          "bg-success text-white border-none",
          "hover:bg-[rgb(16_185_129/0.9)] hover:-translate-y-0.5 hover:shadow-2",
          "active:translate-y-0 active:shadow-1",
        ].join(" "),
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        md: "h-10 px-4 text-sm rounded-md",
        lg: "h-12 px-6 text-base rounded-lg",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
