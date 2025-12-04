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
  primary: 'bg-white dark:bg-gradient-to-br dark:from-indigo-950/80 dark:to-slate-950/80 border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-md dark:shadow-[0_0_15px_rgba(99,102,241,0.1)] dark:hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]',
  success: 'bg-white dark:bg-gradient-to-br dark:from-emerald-950/80 dark:to-slate-950/80 border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-md dark:shadow-[0_0_15px_rgba(16,185,129,0.1)] dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]',
  warning: 'bg-white dark:bg-gradient-to-br dark:from-amber-950/80 dark:to-slate-950/80 border-amber-200 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-500/50 shadow-sm hover:shadow-md dark:shadow-[0_0_15px_rgba(245,158,11,0.1)] dark:hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]',
  danger: 'bg-white dark:bg-gradient-to-br dark:from-rose-950/80 dark:to-slate-950/80 border-rose-200 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-500/50 shadow-sm hover:shadow-md dark:shadow-[0_0_15px_rgba(244,63,94,0.1)] dark:hover:shadow-[0_0_25px_rgba(244,63,94,0.2)]',
  info: 'bg-white dark:bg-gradient-to-br dark:from-sky-950/80 dark:to-slate-950/80 border-sky-200 dark:border-sky-500/30 hover:border-sky-400 dark:hover:border-sky-500/50 shadow-sm hover:shadow-md dark:shadow-[0_0_15px_rgba(14,165,233,0.1)] dark:hover:shadow-[0_0_25px_rgba(14,165,233,0.2)]',
}

const iconColors = {
  primary: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300',
  success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300',
  danger: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
  info: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300',
}

// Simple Sparkline SVG component
const Sparkline = ({ color }: { color: string }) => (
  <svg className="w-full h-12 opacity-30" viewBox="0 0 100 30" preserveAspectRatio="none">
    <path
      d="M0,30 L10,25 L20,28 L30,15 L40,20 L50,10 L60,18 L70,5 L80,15 L90,10 L100,20 V30 H0 Z"
      fill={`currentColor`}
      className={color}
    />
    <path
      d="M0,30 L10,25 L20,28 L30,15 L40,20 L50,10 L60,18 L70,5 L80,15 L90,10 L100,20"
      fill="none"
      stroke={`currentColor`}
      strokeWidth="2"
      className={color}
    />
  </svg>
)

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

  const sparklineColor = {
    primary: 'text-indigo-500',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-rose-500',
    info: 'text-sky-500',
  }[background]

  return (
    <Card
      variant={cardVariant}
      interactive={!!onClick}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm',
        onClick && 'cursor-pointer',
        bgColors[background],
        className
      )}
    >
      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-base font-medium text-slate-600 dark:text-slate-200">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight drop-shadow-sm">{value}</p>
              {change && (
                <Badge
                  variant={change.trend === 'up' ? 'success' : 'danger'}
                  size="sm"
                  className="bg-opacity-20 backdrop-blur-sm"
                >
                  {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
                </Badge>
              )}
            </div>
            {subtext && (
              <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{subtext}</p>
            )}
          </div>
          {icon && (
            <div className={cn('rounded-xl p-3 shadow-inner', iconColors[background])}>
              {icon}
            </div>
          )}
        </div>
      </div>

      {/* Sparkline Background */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <Sparkline color={sparklineColor} />
      </div>
    </Card>
  )
}
