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
  primary: 'bg-primary-50 border-primary-200 dark:bg-primary-900 dark:border-primary-800',
  success: 'bg-success-50 border-success-200 dark:bg-success-900 dark:border-success-800',
  warning: 'bg-warning-50 border-warning-200 dark:bg-warning-900 dark:border-warning-800',
  danger: 'bg-danger-50 border-danger-200 dark:bg-danger-900 dark:border-danger-800',
  info: 'bg-info-50 border-info-200 dark:bg-info-900 dark:border-info-800',
}

const iconColors = {
  primary: 'bg-primary-100 text-primary-600 dark:bg-primary-800 dark:text-primary-400',
  success: 'bg-success-100 text-success-600 dark:bg-success-800 dark:text-success-400',
  warning: 'bg-warning-100 text-warning-600 dark:bg-warning-800 dark:text-warning-400',
  danger: 'bg-danger-100 text-danger-600 dark:bg-danger-800 dark:text-danger-400',
  info: 'bg-info-100 text-info-600 dark:bg-info-800 dark:text-info-400',
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
        'p-6',
        onClick && 'cursor-pointer hover-shadow-lift',
        bgColors[background],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
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
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{subtext}</p>
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
