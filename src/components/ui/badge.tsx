import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  `inline-flex items-center gap-1.5 rounded-full font-medium text-xs
   px-2.5 py-1 transition-colors duration-200 w-fit whitespace-nowrap shrink-0
   [&>svg]:size-3 [&>svg]:pointer-events-none
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   focus-visible:ring-offset-background`,
  {
    variants: {
      variant: {
        /* Outlined light variants */
        default: `bg-primary-100 text-primary-700 border border-primary-200
                 dark:bg-primary-900 dark:text-primary-200 dark:border-primary-800
                 hover:bg-primary-200 dark:hover:bg-primary-800`,

        secondary: `bg-neutral-100 text-neutral-700 border border-neutral-200
                   dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700
                   hover:bg-neutral-200 dark:hover:bg-neutral-700`,

        success: `bg-success-100 text-success-700 border border-success-200
                 dark:bg-success-900 dark:text-success-200 dark:border-success-800
                 hover:bg-success-200 dark:hover:bg-success-800`,

        warning: `bg-warning-100 text-warning-700 border border-warning-200
                 dark:bg-warning-900 dark:text-warning-200 dark:border-warning-800
                 hover:bg-warning-200 dark:hover:bg-warning-800`,

        danger: `bg-danger-100 text-danger-700 border border-danger-200
                dark:bg-danger-900 dark:text-danger-200 dark:border-danger-800
                hover:bg-danger-200 dark:hover:bg-danger-800`,

        info: `bg-info-100 text-info-700 border border-info-200
              dark:bg-info-900 dark:text-info-200 dark:border-info-800
              hover:bg-info-200 dark:hover:bg-info-800`,

        /* Solid dark variants for emphasis */
        "primary-solid": `bg-primary-500 text-white border border-primary-600
                         hover:bg-primary-600 focus-visible:ring-primary-400`,

        "success-solid": `bg-success-500 text-white border border-success-600
                         hover:bg-success-600 focus-visible:ring-success-400`,

        "warning-solid": `bg-warning-500 text-white border border-warning-600
                         hover:bg-warning-600 focus-visible:ring-warning-400`,

        "danger-solid": `bg-danger-500 text-white border border-danger-600
                        hover:bg-danger-600 focus-visible:ring-danger-400`,

        "info-solid": `bg-info-500 text-white border border-info-600
                      hover:bg-info-600 focus-visible:ring-info-400`,

        /* Outline variant */
        outline: `border border-neutral-300 text-neutral-700 bg-transparent
                 dark:border-neutral-600 dark:text-neutral-300
                 hover:bg-neutral-100 dark:hover:bg-neutral-800`,

        /* Subtle ghost variant */
        ghost: `bg-transparent text-neutral-700 border-transparent
               dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800`,
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

interface BadgeProps extends React.ComponentProps<"span">,
  VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
)

Badge.displayName = "Badge"

export { Badge, badgeVariants, type BadgeProps }
