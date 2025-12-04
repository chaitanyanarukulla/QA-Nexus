import { FileText, Play, Bug, BarChart3 } from 'lucide-react'
import { getMetrics } from '@/app/actions/metrics'
import { getRecentActivity } from '@/app/actions/dashboard'
import { MetricCard } from '@/components/common/metric-card'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { SuiteCoverage } from '@/components/dashboard/suite-coverage'
import { RecentActivity } from '@/components/dashboard/recent-activity'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const metrics = await getMetrics()
  const { recentRuns, recentDefects } = await getRecentActivity()

  return (
    <main className="flex min-h-screen flex-col animate-fadeIn">
      <div className="w-full space-y-8">

        {/* Header Section */}
        <DashboardHeader />

        {/* Metrics Overview - Using New Design System */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 [&>*]:animate-slideInUp">
          <MetricCard
            title="Test Cases"
            value={metrics.totalTestCases}
            subtext={`${metrics.activeTestCases} active`}
            change={metrics.trends.testCasesLast30Days ? { value: Math.abs(metrics.trends.testCasesLast30Days), trend: metrics.trends.testCasesLast30Days >= 0 ? 'up' : 'down' } : undefined}
            icon={<FileText className="h-5 w-5" />}
            background="primary"
            className="hover:shadow-lg transition-shadow"
          />
          <MetricCard
            title="Pass Rate"
            value={`${metrics.passRate}%`}
            subtext={`${metrics.failedTests} failed, ${metrics.blockedTests} blocked`}
            icon={<BarChart3 className="h-5 w-5" />}
            background={metrics.passRate >= 80 ? "success" : "warning"}
            className="hover:shadow-lg transition-shadow"
          />
          <MetricCard
            title="Test Runs"
            value={metrics.totalTestRuns}
            subtext={`${metrics.trends.testRunsLast7Days} in last 7 days`}
            change={metrics.trends.testRunsLast30Days ? { value: Math.abs(metrics.trends.testRunsLast30Days), trend: metrics.trends.testRunsLast30Days >= 0 ? 'up' : 'down' } : undefined}
            icon={<Play className="h-5 w-5" />}
            background="info"
            className="hover:shadow-lg transition-shadow"
          />
          <MetricCard
            title="Defects"
            value={metrics.totalDefects}
            subtext={`${metrics.openDefects} open`}
            change={metrics.trends.defectsLast7Days ? { value: Math.abs(metrics.trends.defectsLast7Days), trend: metrics.trends.defectsLast7Days >= 0 ? 'down' : 'up' } : undefined}
            icon={<Bug className="h-5 w-5" />}
            background={metrics.openDefects > 5 ? "danger" : "warning"}
            className="hover:shadow-lg transition-shadow"
          />
        </div>

        {/* Trend Chart */}
        <TrendChart trends={metrics.trends} />

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">

          {/* Test Suite Coverage */}
          <SuiteCoverage coverage={metrics.coverage} />

          {/* Recent Activity */}
          <RecentActivity recentRuns={recentRuns} recentDefects={recentDefects} />

        </div>
      </div>
    </main>
  )
}

