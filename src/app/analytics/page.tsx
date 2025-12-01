import { getAnalyticsData, getRecentActivity, getAIInsightsSummary } from '@/app/actions/analytics'
import { AnalyticsDashboardLazy } from '@/components/analytics/analytics-dashboard-lazy'
import { RecentActivityFeed } from '@/components/analytics/recent-activity-feed'
import { AIInsightsWidget } from '@/components/analytics/ai-insights-widget'
import { Separator } from '@/components/ui/separator'
import { BarChart3 } from 'lucide-react'

export default async function AnalyticsPage() {
    const [analyticsResult, activityResult, insightsResult] = await Promise.all([
        getAnalyticsData(),
        getRecentActivity(15),
        getAIInsightsSummary()
    ])

    if (!analyticsResult.success || !analyticsResult.data) {
        return (
            <div className="container mx-auto py-10">
                <div className="text-center text-muted-foreground">
                    Failed to load analytics data. Please try again later.
                </div>
            </div>
        )
    }

    const activities = (activityResult.success && activityResult.activities) ? activityResult.activities : []
    const insights = (insightsResult.success && insightsResult.summary && insightsResult.topInsights)
        ? { summary: insightsResult.summary, topInsights: insightsResult.topInsights }
        : { summary: { total: 0, critical: 0, high: 0, flakyTests: 0, highRisk: 0 }, topInsights: [] }

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

            <AnalyticsDashboardLazy data={analyticsResult.data} />

            {/* New Phase 5 Components */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <RecentActivityFeed activities={activities} />
                <AIInsightsWidget summary={insights.summary} topInsights={insights.topInsights} />
            </div>
        </div>
    )
}
