import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border transition-all duration-200 ease-in-out flex flex-col",
  {
    variants: {
      variant: {
        default: "bg-white border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800",
        elevated: "bg-white border-neutral-200 shadow-md hover:shadow-lg dark:bg-neutral-900 dark:border-neutral-800",
        outlined: "bg-white border-neutral-300 dark:bg-neutral-900 dark:border-neutral-700",
        ghost: "bg-transparent border-transparent",
        muted: "bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700",
        success: "bg-success-50 border-success-200 dark:bg-success-900 dark:border-success-800",
        warning: "bg-warning-50 border-warning-200 dark:bg-warning-900 dark:border-warning-800",
        danger: "bg-danger-50 border-danger-200 dark:bg-danger-900 dark:border-danger-800",
        info: "bg-info-50 border-info-200 dark:bg-info-900 dark:border-info-800",
      },
      interactive: {
        true: "cursor-pointer hover:shadow-lg hover:border-primary-300 hover:scale-[1.01] dark:hover:border-primary-700 active:scale-[0.99]",
        false: "",
      },
      selected: {
        true: "border-primary-400 bg-primary-50 shadow-md dark:border-primary-600 dark:bg-primary-900 scale-[1.005]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
)

interface CardProps extends React.ComponentProps<"div">,
  VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, selected, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        cardVariants({ variant, interactive, selected }),
        "gap-6 px-6 py-6",
        className
      )}
      {...props}
    />
  )
)

Card.displayName = "Card"

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
