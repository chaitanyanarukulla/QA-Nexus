'use client'

import React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  change?: { value: number; trend: 'up' | 'down' }
  icon?: React.ReactNode
  background?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  onClick?: () => void
  subtext?: string
  className?: string
}

const bgColors = {
  primary: 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400 dark:from-blue-100 dark:to-indigo-100 dark:border-blue-300 shadow-lg',
  success: 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 dark:from-green-100 dark:to-emerald-100 dark:border-green-300 shadow-lg',
  warning: 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400 dark:from-amber-100 dark:to-orange-100 dark:border-amber-300 shadow-lg',
  danger: 'bg-gradient-to-br from-red-500 to-rose-600 border-red-400 dark:from-red-100 dark:to-rose-100 dark:border-red-300 shadow-lg',
  info: 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400 dark:from-cyan-100 dark:to-blue-100 dark:border-cyan-300 shadow-lg',
}

const iconColors = {
  primary: 'bg-blue-600 text-white dark:bg-blue-700 dark:text-blue-100 shadow-md',
  success: 'bg-green-600 text-white dark:bg-green-700 dark:text-green-100 shadow-md',
  warning: 'bg-amber-600 text-white dark:bg-amber-700 dark:text-amber-100 shadow-md',
  danger: 'bg-red-600 text-white dark:bg-red-700 dark:text-red-100 shadow-md',
  info: 'bg-cyan-600 text-white dark:bg-cyan-700 dark:text-cyan-100 shadow-md',
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  background = 'primary',
  onClick,
  subtext,
  className,
}: MetricCardProps) {
  const cardVariant = background === 'primary' ? 'default' : (background as any)

  return (
    <Card
      variant={cardVariant}
      interactive={!!onClick}
      onClick={onClick}
      className={cn(
        'p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl',
        onClick && 'cursor-pointer',
        bgColors[background],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/90 dark:text-neutral-700">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white dark:text-neutral-900">{value}</p>
            {change && (
              <Badge
                variant={change.trend === 'up' ? 'success' : 'danger'}
                size="sm"
              >
                {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
              </Badge>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-white/80 dark:text-neutral-600 mt-1">{subtext}</p>
          )}
        </div>
        {icon && (
          <div className={cn('rounded-lg p-3', iconColors[background])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
