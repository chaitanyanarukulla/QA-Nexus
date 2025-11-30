'use client'

import dynamic from 'next/dynamic'
import { CardSkeleton } from '@/components/ui/skeleton'

// Lazy load the analytics dashboard to reduce initial bundle size
export const AnalyticsDashboardLazy = dynamic(
    () => import('@/components/analytics/analytics-dashboard').then(mod => ({ default: mod.AnalyticsDashboard })),
    {
        loading: () => (
            <div className="space-y-6">
                <CardSkeleton />
                <div className="grid gap-4 md:grid-cols-4">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        ),
        ssr: false // Charts don't need SSR
    }
)
