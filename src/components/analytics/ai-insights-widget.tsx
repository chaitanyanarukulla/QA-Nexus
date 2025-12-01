'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Brain, AlertTriangle, TrendingDown, Clock, AlertCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface AIInsight {
  id: string
  type: string
  severity: string
  title: string
  description: string
  testCase: {
    id: string
    title: string
    priority: string
  } | null
  confidence: number
  createdAt: Date
}

interface AIInsightsSummary {
  total: number
  critical: number
  high: number
  flakyTests: number
  highRisk: number
}

interface AIInsightsWidgetProps {
  summary: AIInsightsSummary
  topInsights: AIInsight[]
}

export function AIInsightsWidget({ summary, topInsights }: AIInsightsWidgetProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'danger'
      case 'HIGH':
        return 'warning'
      case 'MEDIUM':
        return 'info'
      case 'LOW':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'FLAKY_TEST':
        return <TrendingDown className="h-4 w-4" />
      case 'HIGH_FAILURE_RISK':
        return <AlertTriangle className="h-4 w-4" />
      case 'SLOW_EXECUTION':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getInsightTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  if (summary.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Insights
          </CardTitle>
          <CardDescription>AI-powered quality predictions and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No insights available yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Run test executions to generate AI insights
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Insights
            </CardTitle>
            <CardDescription>
              AI-powered quality predictions and recommendations
            </CardDescription>
          </div>
          <Link href="/ai-insights">
            <Button variant="outline" size="sm">
              <div className="flex items-center gap-2">
                <span>View All</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-xs text-muted-foreground">Critical</p>
            <p className="text-2xl font-bold text-red-600">{summary.critical}</p>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <p className="text-xs text-muted-foreground">High</p>
            <p className="text-2xl font-bold text-orange-600">{summary.high}</p>
          </div>
          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <p className="text-xs text-muted-foreground">Flaky Tests</p>
            <p className="text-2xl font-bold text-yellow-600">{summary.flakyTests}</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <p className="text-xs text-muted-foreground">High Risk</p>
            <p className="text-2xl font-bold text-purple-600">{summary.highRisk}</p>
          </div>
        </div>

        {/* Top Insights List */}
        <div>
          <h4 className="text-sm font-medium mb-3">Top Priority Insights</h4>
          <ScrollArea className="h-64">
            <div className="space-y-3 pr-4">
              {topInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-${getSeverityColor(insight.severity)}/10`}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{insight.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getSeverityColor(insight.severity) as any} className="text-xs">
                            {insight.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getInsightTypeLabel(insight.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {Math.round(insight.confidence)}% confidence
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {insight.description}
                  </p>
                  {insight.testCase && (
                    <Link
                      href={`/test-cases/${insight.testCase.id}`}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      {insight.testCase.title}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(insight.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
