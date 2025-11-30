'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, Zap, CheckCircle2, XCircle, Clock, RefreshCw, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { getInsights, resolveInsight, runInsightsAnalysis, getInsightsSummary } from '@/app/actions/ai-insights'
import Link from 'next/link'

interface Insight {
  id: string
  type: string
  severity: string
  title: string
  description: string
  recommendation: string | null
  confidence: number
  isResolved: boolean
  createdAt: Date
  testCase?: {
    id: string
    title: string
  } | null
  testSuite?: {
    id: string
    title: string
  } | null
  metadata?: any
}

interface InsightsDashboardProps {
  testCaseId?: string
  testSuiteId?: string
}

export function InsightsDashboard({ testCaseId, testSuiteId }: InsightsDashboardProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadInsights()
    loadSummary()
  }, [testCaseId, testSuiteId, filter])

  const loadInsights = async () => {
    setLoading(true)
    const type = filter !== 'all' ? filter : undefined
    const result = await getInsights({ testCaseId, testSuiteId, type: type as any })
    if (result.success && result.insights) {
      setInsights(result.insights)
    }
    setLoading(false)
  }

  const loadSummary = async () => {
    const result = await getInsightsSummary()
    if (result.success && result.summary) {
      setSummary(result.summary)
    }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    toast.info('Analyzing tests... This may take a moment.')

    const result = await runInsightsAnalysis(testSuiteId)

    if (result.success) {
      toast.success('Analysis complete!')
      await loadInsights()
      await loadSummary()
    } else {
      toast.error('Analysis failed')
    }

    setAnalyzing(false)
  }

  const handleResolve = async (insightId: string) => {
    const result = await resolveInsight(insightId)
    if (result.success) {
      toast.success('Insight resolved')
      await loadInsights()
      await loadSummary()
    } else {
      toast.error('Failed to resolve insight')
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="danger" className="gap-1"><AlertTriangle className="h-3 w-3" />Critical</Badge>
      case 'HIGH':
        return <Badge className="bg-orange-500 gap-1"><AlertTriangle className="h-3 w-3" />High</Badge>
      case 'MEDIUM':
        return <Badge className="bg-yellow-500 gap-1"><TrendingUp className="h-3 w-3" />Medium</Badge>
      case 'LOW':
        return <Badge variant="secondary" className="gap-1"><Zap className="h-3 w-3" />Low</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FLAKY_TEST':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'HIGH_FAILURE_RISK':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'SLOW_EXECUTION':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'OPTIMIZATION_OPPORTUNITY':
        return <Sparkles className="h-5 w-5 text-blue-500" />
      default:
        return <Zap className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && !testCaseId && !testSuiteId && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.critical}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{summary.high}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Flaky Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.flaky}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.highRisk}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Insights
              </CardTitle>
              <CardDescription>
                AI-powered test quality analysis and recommendations
              </CardDescription>
            </div>
            <Button onClick={handleAnalyze} disabled={analyzing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
              {analyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="FLAKY_TEST">Flaky</TabsTrigger>
              <TabsTrigger value="HIGH_FAILURE_RISK">High Risk</TabsTrigger>
              <TabsTrigger value="SLOW_EXECUTION">Slow</TabsTrigger>
              <TabsTrigger value="OPTIMIZATION_OPPORTUNITY">Optimize</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-4 mt-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading insights...</div>
              ) : insights.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium">No issues found!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filter === 'all' ? 'Your tests are looking healthy.' : `No ${getTypeLabel(filter).toLowerCase()} issues detected.`}
                  </p>
                  <Button onClick={handleAnalyze} variant="outline" className="mt-4">
                    Run Analysis
                  </Button>
                </div>
              ) : (
                insights.map((insight) => (
                  <Card key={insight.id} className="border-l-4" style={{
                    borderLeftColor:
                      insight.severity === 'CRITICAL' ? '#ef4444' :
                      insight.severity === 'HIGH' ? '#f97316' :
                      insight.severity === 'MEDIUM' ? '#eab308' : '#6b7280'
                  }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getTypeIcon(insight.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-base">{insight.title}</CardTitle>
                              {getSeverityBadge(insight.severity)}
                              <Badge variant="outline" className="text-xs">
                                {insight.confidence.toFixed(0)}% confident
                              </Badge>
                            </div>
                            {(insight.testCase || insight.testSuite) && (
                              <div className="text-sm text-muted-foreground">
                                {insight.testCase && (
                                  <Link href={`/test-cases/${insight.testCase.id}`} className="hover:underline">
                                    Test Case: {insight.testCase.title}
                                  </Link>
                                )}
                                {insight.testSuite && (
                                  <Link href={`/test-suites/${insight.testSuite.id}`} className="hover:underline">
                                    Test Suite: {insight.testSuite.title}
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(insight.id)}
                          disabled={insight.isResolved}
                        >
                          {insight.isResolved ? 'Resolved' : 'Mark Resolved'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{insight.description}</p>

                      {insight.recommendation && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            💡 Recommendation
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{insight.recommendation}</p>
                        </div>
                      )}

                      {insight.metadata && Object.keys(insight.metadata).length > 0 && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(insight.metadata, null, 2)}
                          </pre>
                        </details>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Detected {new Date(insight.createdAt).toLocaleDateString()} at{' '}
                        {new Date(insight.createdAt).toLocaleTimeString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
