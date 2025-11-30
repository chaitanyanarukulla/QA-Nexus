import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
   text-sm font-medium transition-all duration-200 ease-in-out
   disabled:pointer-events-none disabled:opacity-50 disabled:scale-100
   [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4
   shrink-0 [&_svg]:shrink-0
   outline-none focus-visible:outline-none focus-visible:ring-2
   focus-visible:ring-offset-2 focus-visible:ring-offset-background
   focus-visible:scale-[1.02]
   aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40
   aria-invalid:border-danger
   active:scale-[0.98]
   hover:scale-105`,
  {
    variants: {
      variant: {
        /* Primary solid button */
        primary: `bg-primary-500 text-white hover:bg-primary-600
                 active:bg-primary-700 focus-visible:ring-primary-400
                 shadow-sm hover:shadow-lg hover:shadow-primary-500/20
                 active:shadow-sm active:shadow-primary-700/20
                 dark:bg-primary-600 dark:hover:bg-primary-700
                 dark:hover:shadow-primary-600/30`,

        /* Secondary outlined button */
        secondary: `border border-neutral-300 text-neutral-900 bg-white
                   hover:bg-neutral-50 active:bg-neutral-100
                   focus-visible:ring-primary-400
                   dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100
                   dark:hover:bg-neutral-800`,

        /* Tertiary ghost button (subtle) */
        tertiary: `text-neutral-700 hover:bg-neutral-100
                  active:bg-neutral-200 focus-visible:ring-neutral-400
                  dark:text-neutral-300 dark:hover:bg-neutral-800
                  dark:active:bg-neutral-700`,

        /* Destructive for dangerous actions (red) */
        destructive: `bg-danger-500 text-white hover:bg-danger-600
                     active:bg-danger-700 focus-visible:ring-danger-400
                     shadow-sm hover:shadow-lg hover:shadow-danger-500/20
                     active:shadow-sm active:shadow-danger-700/20
                     dark:bg-danger-600 dark:hover:bg-danger-700
                     dark:hover:shadow-danger-600/30`,

        /* Success for positive actions (green) */
        success: `bg-success-500 text-white hover:bg-success-600
                 active:bg-success-700 focus-visible:ring-success-400
                 shadow-sm hover:shadow-lg hover:shadow-success-500/20
                 active:shadow-sm active:shadow-success-700/20
                 dark:bg-success-600 dark:hover:bg-success-700
                 dark:hover:shadow-success-600/30`,

        /* Warning for attention-needed actions (amber) */
        warning: `bg-warning-500 text-white hover:bg-warning-600
                 active:bg-warning-700 focus-visible:ring-warning-400
                 shadow-sm hover:shadow-lg hover:shadow-warning-500/20
                 active:shadow-sm active:shadow-warning-700/20
                 dark:bg-warning-600 dark:hover:bg-warning-700
                 dark:hover:shadow-warning-600/30`,

        /* Info for informational actions (cyan) */
        info: `bg-info-500 text-white hover:bg-info-600
              active:bg-info-700 focus-visible:ring-info-400
              shadow-sm hover:shadow-lg hover:shadow-info-500/20
              active:shadow-sm active:shadow-info-700/20
              dark:bg-info-600 dark:hover:bg-info-700
              dark:hover:shadow-info-600/30`,

        /* Link variant */
        link: `text-primary-500 underline-offset-4 hover:underline
              dark:text-primary-400`,

        /* Outline variant for all colors */
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",

        /* Ghost variant (removed in favor of tertiary) */
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
      },
      size: {
        xs: "h-8 px-2 py-1 text-xs rounded-md",
        sm: "h-9 px-3 py-1.5 text-xs rounded-md gap-1.5 has-[>svg]:px-2.5",
        md: "h-10 px-4 py-2 text-sm rounded-md has-[>svg]:px-3",
        lg: "h-11 px-6 py-2.5 text-base rounded-lg has-[>svg]:px-4",
        xl: "h-12 px-8 py-3 text-base rounded-lg has-[>svg]:px-6",
        icon: "size-10 rounded-md",
        "icon-sm": "size-9 rounded-md",
        "icon-lg": "size-11 rounded-lg",
        "icon-xl": "size-12 rounded-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
)

interface ButtonProps extends React.ComponentProps<"button">,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    asChild = false,
    loading = false,
    disabled,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        data-slot="button"
        disabled={disabled || loading}
        className={cn(
          buttonVariants({ variant, size, fullWidth, className })
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="size-4 animate-spin opacity-75" />
        )}
        <span className={loading ? "opacity-0" : "opacity-100"}>
          {children}
        </span>
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants, type ButtonProps }
