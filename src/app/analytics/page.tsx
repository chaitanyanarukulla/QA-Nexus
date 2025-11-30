import { getAnalyticsData } from '@/app/actions/analytics'
import { AnalyticsDashboardLazy } from '@/components/analytics/analytics-dashboard-lazy'
import { Separator } from '@/components/ui/separator'
import { BarChart3 } from 'lucide-react'

export default async function AnalyticsPage() {
    const { success, data } = await getAnalyticsData()

    if (!success || !data) {
        return (
            <div className="container mx-auto py-10">
                <div className="text-center text-muted-foreground">
                    Failed to load analytics data. Please try again later.
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent flex items-center gap-3">
                    <BarChart3 className="h-10 w-10 text-primary" />
                    Advanced Analytics
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Comprehensive insights, quality metrics, and performance trends for data-driven QA decisions.
                </p>
            </div>
            <Separator />

            <AnalyticsDashboardLazy data={data} />
        </div>
    )
}
