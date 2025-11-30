'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      className={cn('flex items-center gap-1 text-sm', className)}
      aria-label="breadcrumb"
    >
      <ol className="flex items-center gap-1">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <li className="text-neutral-400 dark:text-neutral-600">
                <ChevronRight className="h-4 w-4" />
              </li>
            )}
            <li>
              {item.current || !item.href ? (
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  )
}
