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
    <main className="flex min-h-screen flex-col animate-fadeIn">
      <div className="w-full space-y-8">

        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-10 w-10 text-yellow-300 drop-shadow-lg" />
                <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md">
                  QA Dashboard
                </h1>
              </div>
              <p className="text-blue-100 mt-2 text-lg">
                Real-time insights into your quality assurance metrics and test execution trends
              </p>
            </div>
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
        <Card className="border-2 border-blue-100 dark:border-blue-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20">
          <CardHeader className="border-b border-blue-100 dark:border-blue-900/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 px-6 py-4 rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Test Execution Trend (Last 7 Days)
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">Daily breakdown of test results</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {metrics.trends.dailyTrend.map((day, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm px-1">
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
          <Card className="border-2 border-purple-100 dark:border-purple-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-900 dark:to-purple-950/20">
            <CardHeader className="border-b border-purple-100 dark:border-purple-900/50 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 px-6 py-4 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                <Folder className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Suite Coverage
              </CardTitle>
              <CardDescription className="text-purple-700 dark:text-purple-300">Test execution by suite</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {metrics.coverage.length > 0 ? (
                metrics.coverage.map((suite, index) => (
                  <div key={index} className="space-y-2 px-1">
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
          <Card className="col-span-2 border-2 border-emerald-100 dark:border-emerald-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/20">
            <CardHeader className="border-b border-emerald-100 dark:border-emerald-900/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 px-6 py-4 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-emerald-700 dark:text-emerald-300">Latest test runs and reported defects</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
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
                        <div className="flex items-center justify-between p-4 border-2 border-blue-100 dark:border-blue-900/50 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/50 dark:hover:to-indigo-950/50 transition-all hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 hover:scale-[1.01] group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
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
                      <div key={defect.id} className="flex items-center justify-between p-4 border-2 border-red-100 dark:border-red-900/50 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-950/50 dark:hover:to-orange-950/50 transition-all hover:shadow-lg hover:border-red-300 dark:hover:border-red-700 hover:scale-[1.01] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
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

