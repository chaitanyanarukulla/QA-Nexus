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
        <Card className="border border-indigo-200 dark:border-indigo-500/20 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-lg text-indigo-900 dark:text-indigo-100">
                    <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    Test Execution Trend (Last 7 Days)
                </CardTitle>
                <CardDescription className="text-base text-slate-500 dark:text-slate-400">Daily breakdown of test results</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {trends.dailyTrend.map((day, index) => (
                        <div key={index} className="space-y-2 group">
                            <div className="flex items-center justify-between text-base px-1">
                                <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{day.date}</span>
                                <div className="flex items-center gap-4 text-sm opacity-70 group-hover:opacity-100 transition-opacity">
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">✓ {day.passed}</span>
                                    <span className="text-rose-600 dark:text-rose-400 font-medium drop-shadow-[0_0_5px_rgba(251,113,133,0.5)]">✗ {day.failed}</span>
                                    <span className="text-slate-500 dark:text-slate-400">Total: {day.total}</span>
                                </div>
                            </div>
                            <div className="h-3 flex rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-white/5">
                                {day.total > 0 && (
                                    <>
                                        <div
                                            className="bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                            style={{ width: `${(day.passed / day.total) * 100}%` }}
                                        />
                                        <div
                                            className="bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
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
