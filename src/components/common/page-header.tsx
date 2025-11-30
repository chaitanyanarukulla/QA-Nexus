'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  children,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {title}
          </h1>
          {description && (
            <p className="text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex gap-2 flex-wrap md:justify-end">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
