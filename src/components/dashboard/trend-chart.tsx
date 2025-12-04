import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface TrendChartProps {
    trends: {
        dailyTrend: Array<{
            date: string
            passed: number
            failed: number
            total: number
        }>
    }
}

export function TrendChart({ trends }: TrendChartProps) {
    return (
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
                    {trends.dailyTrend.map((day, index) => (
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
    )
}
