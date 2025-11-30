import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, FileText, Play, Bug, Folder, Activity, TrendingUp, BarChart3, Zap } from 'lucide-react'
import { getMetrics } from '@/app/actions/metrics'
import { getRecentActivity } from '@/app/actions/dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MetricCard } from '@/components/common/metric-card'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const metrics = await getMetrics()
  const { recentRuns, recentDefects } = await getRecentActivity()

  return (
    <main className="flex min-h-screen flex-col p-8 bg-neutral-50 dark:bg-neutral-950 animate-fadeIn">
      <div className="max-w-7xl mx-auto w-full space-y-8">

        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              QA Dashboard
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Real-time insights into your quality assurance metrics and test execution trends.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/test-runs">
              <Button variant="primary" size="lg">
                <Play className="mr-2 h-4 w-4" /> New Test Run
              </Button>
            </Link>
          </div>
        </div>

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
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Test Execution Trend (Last 7 Days)
            </CardTitle>
            <CardDescription>Daily breakdown of test results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.trends.dailyTrend.map((day, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{day.date}</span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-success-600 dark:text-success-400 font-medium">✓ {day.passed}</span>
                      <span className="text-danger-600 dark:text-danger-400 font-medium">✗ {day.failed}</span>
                      <span className="text-neutral-500 dark:text-neutral-400">Total: {day.total}</span>
                    </div>
                  </div>
                  <div className="h-3 flex rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                    {day.total > 0 && (
                      <>
                        <div
                          className="bg-gradient-to-r from-success-500 to-success-600"
                          style={{ width: `${(day.passed / day.total) * 100}%` }}
                        />
                        <div
                          className="bg-gradient-to-r from-danger-500 to-danger-600"
                          style={{ width: `${(day.failed / day.total) * 100}%` }}
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">

          {/* Test Suite Coverage */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Suite Coverage
              </CardTitle>
              <CardDescription>Test execution by suite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {metrics.coverage.length > 0 ? (
                metrics.coverage.map((suite, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate flex-1 text-neutral-900 dark:text-neutral-100">{suite.suiteName}</span>
                      <Badge variant={suite.passRate >= 80 ? "success" : suite.passRate >= 60 ? "warning" : "danger"} className="ml-2 text-xs">
                        {suite.passRate}%
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <Progress value={suite.coverage} className="h-2" />
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {suite.tested}/{suite.total} executed • {suite.passed} passed
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">No test suites found</p>
              )}
              <Link href="/test-suites" className="block">
                <Button variant="secondary" className="w-full mt-2">
                  View All Suites
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="col-span-2" variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest test runs and reported defects</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="runs" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="runs">Recent Test Runs</TabsTrigger>
                  <TabsTrigger value="defects">Recent Defects</TabsTrigger>
                </TabsList>

                <TabsContent value="runs" className="space-y-3 [&>a]:animate-slideInLeft">
                  {recentRuns.length > 0 ? (
                    recentRuns.slice(0, 5).map(run => (
                      <Link
                        key={run.id}
                        href={`/test-runs/${run.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all hover:shadow-md group">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={`p-2.5 rounded-full ${run.status === 'COMPLETED' ? 'bg-success-100 text-success-600 dark:bg-success-900 dark:text-success-300' :
                              run.status === 'IN_PROGRESS' ? 'bg-info-100 text-info-600 dark:bg-info-900 dark:text-info-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                              }`}>
                              <Play className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate group-hover:text-primary-500 transition-colors text-neutral-900 dark:text-neutral-100">{run.title}</div>
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">by {run.user.name || 'Unknown'}</div>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <div>
                              <Badge variant={run.status === 'COMPLETED' ? 'success' : run.status === 'IN_PROGRESS' ? 'info' : 'secondary'} size="sm">
                                {run.status}
                              </Badge>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {new Date(run.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">No recent test runs</div>
                  )}
                  <Link href="/test-runs" className="block">
                    <Button variant="secondary" className="w-full">
                      View All Runs
                    </Button>
                  </Link>
                </TabsContent>

                <TabsContent value="defects" className="space-y-3 [&>div]:animate-slideInLeft">
                  {recentDefects.length > 0 ? (
                    recentDefects.map(defect => (
                      <div key={defect.id} className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-full ${defect.priority === 'CRITICAL' ? 'bg-danger-100 text-danger-600 dark:bg-danger-900 dark:text-danger-300' :
                            defect.priority === 'HIGH' ? 'bg-warning-100 text-warning-600 dark:bg-warning-900 dark:text-warning-300' : 'bg-info-100 text-info-600 dark:bg-info-900 dark:text-info-300'
                            }`}>
                            <Bug className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900 dark:text-neutral-100">{defect.title}</div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">{defect.status}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            defect.priority === 'CRITICAL' ? 'danger-solid' :
                              defect.priority === 'HIGH' ? 'warning-solid' :
                                'info'
                          } size="sm">
                            {defect.priority}
                          </Badge>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {new Date(defect.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">No recent defects</div>
                  )}
                  <Link href="/defects" className="block">
                    <Button variant="secondary" className="w-full">
                      View All Defects
                    </Button>
                  </Link>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  )
}

