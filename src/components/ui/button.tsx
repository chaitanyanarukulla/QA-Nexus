import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl
   text-sm font-semibold transition-all duration-300 ease-in-out
   disabled:pointer-events-none disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed
   [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4
   shrink-0 [&_svg]:shrink-0
   outline-none focus-visible:outline-none focus-visible:ring-2
   focus-visible:ring-offset-2 focus-visible:ring-offset-background
   focus-visible:scale-[1.03]
   aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40
   aria-invalid:border-danger
   active:scale-[0.97]
   hover:scale-[1.03]`,
  {
    variants: {
      variant: {
        /* Primary gradient button */
        primary: `bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                 hover:from-blue-600 hover:to-indigo-700
                 active:from-blue-700 active:to-indigo-800
                 focus-visible:ring-blue-400
                 shadow-lg hover:shadow-xl hover:shadow-blue-500/30
                 active:shadow-md
                 dark:from-blue-600 dark:to-indigo-700
                 dark:hover:from-blue-700 dark:hover:to-indigo-800
                 dark:hover:shadow-blue-600/40`,

        /* Secondary gradient button */
        secondary: `bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900
                   border-2 border-slate-300
                   hover:from-slate-200 hover:to-slate-300 hover:border-slate-400
                   active:from-slate-300 active:to-slate-400
                   focus-visible:ring-slate-400
                   shadow-md hover:shadow-lg
                   dark:from-slate-700 dark:to-slate-800 dark:text-slate-100
                   dark:border-slate-600
                   dark:hover:from-slate-600 dark:hover:to-slate-700 dark:hover:border-slate-500`,

        /* Tertiary ghost button (subtle) */
        tertiary: `text-neutral-700 hover:bg-gradient-to-r hover:from-neutral-100 hover:to-neutral-200
                  active:from-neutral-200 active:to-neutral-300
                  focus-visible:ring-neutral-400
                  dark:text-neutral-300 dark:hover:from-neutral-800 dark:hover:to-neutral-700
                  dark:active:from-neutral-700 dark:active:to-neutral-600`,

        /* Destructive gradient button (red) */
        destructive: `bg-gradient-to-r from-red-500 to-rose-600 text-white
                     hover:from-red-600 hover:to-rose-700
                     active:from-red-700 active:to-rose-800
                     focus-visible:ring-red-400
                     shadow-lg hover:shadow-xl hover:shadow-red-500/30
                     active:shadow-md
                     dark:from-red-600 dark:to-rose-700
                     dark:hover:from-red-700 dark:hover:to-rose-800
                     dark:hover:shadow-red-600/40`,

        /* Success gradient button (green) */
        success: `bg-gradient-to-r from-green-500 to-emerald-600 text-white
                 hover:from-green-600 hover:to-emerald-700
                 active:from-green-700 active:to-emerald-800
                 focus-visible:ring-green-400
                 shadow-lg hover:shadow-xl hover:shadow-green-500/30
                 active:shadow-md
                 dark:from-green-600 dark:to-emerald-700
                 dark:hover:from-green-700 dark:hover:to-emerald-800
                 dark:hover:shadow-green-600/40`,

        /* Warning gradient button (amber) */
        warning: `bg-gradient-to-r from-amber-500 to-orange-600 text-white
                 hover:from-amber-600 hover:to-orange-700
                 active:from-amber-700 active:to-orange-800
                 focus-visible:ring-amber-400
                 shadow-lg hover:shadow-xl hover:shadow-amber-500/30
                 active:shadow-md
                 dark:from-amber-600 dark:to-orange-700
                 dark:hover:from-amber-700 dark:hover:to-orange-800
                 dark:hover:shadow-amber-600/40`,

        /* Info gradient button (cyan) */
        info: `bg-gradient-to-r from-cyan-500 to-blue-600 text-white
              hover:from-cyan-600 hover:to-blue-700
              active:from-cyan-700 active:to-blue-800
              focus-visible:ring-cyan-400
              shadow-lg hover:shadow-xl hover:shadow-cyan-500/30
              active:shadow-md
              dark:from-cyan-600 dark:to-blue-700
              dark:hover:from-cyan-700 dark:hover:to-blue-800
              dark:hover:shadow-cyan-600/40`,

        /* Link variant */
        link: `text-blue-600 underline-offset-4 hover:underline hover:text-blue-700
              dark:text-blue-400 dark:hover:text-blue-300`,

        /* Outline variant */
        outline: `border-2 bg-white shadow-md hover:bg-slate-50 hover:shadow-lg
                 text-slate-900 border-slate-300 hover:border-slate-400
                 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100
                 dark:hover:bg-slate-800 dark:hover:border-slate-600`,

        /* Ghost variant */
        ghost: `hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200
               text-slate-700 hover:text-slate-900
               dark:text-slate-300 dark:hover:from-slate-800 dark:hover:to-slate-700`,
      },
      size: {
        xs: "h-8 px-3 py-1.5 text-xs rounded-lg",
        sm: "h-9 px-4 py-2 text-xs rounded-lg gap-2 has-[>svg]:px-3.5",
        md: "h-10 px-5 py-2.5 text-sm rounded-xl has-[>svg]:px-4",
        lg: "h-12 px-7 py-3 text-base rounded-xl has-[>svg]:px-5",
        xl: "h-14 px-9 py-3.5 text-lg rounded-xl has-[>svg]:px-7",
        icon: "size-10 rounded-xl p-2.5",
        "icon-sm": "size-9 rounded-lg p-2",
        "icon-lg": "size-12 rounded-xl p-3",
        "icon-xl": "size-14 rounded-xl p-3.5",
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
