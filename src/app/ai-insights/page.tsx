import { InsightsDashboard } from '@/components/ai/insights-dashboard'
import { Sparkles } from 'lucide-react'

export default function AIInsightsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          AI Insights
        </h1>
        <p className="text-muted-foreground mt-2">
          AI-powered analysis to detect flaky tests, predict failures, and optimize test performance
        </p>
      </div>

      <InsightsDashboard />
    </div>
  )
}
