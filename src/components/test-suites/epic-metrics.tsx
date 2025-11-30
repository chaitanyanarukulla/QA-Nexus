'use client'

import { useEffect, useState } from 'react'
import { getEpicMetrics } from '@/app/actions/epic-metrics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Loader2 } from 'lucide-react'

interface EpicMetricsProps {
    suiteId: string
    epicKey: string
}

const COLORS = ['#22c55e', '#ef4444', '#eab308', '#f97316', '#94a3b8']

export function EpicMetrics({ suiteId, epicKey }: EpicMetricsProps) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetch() {
            const res = await getEpicMetrics('demo-user', suiteId, epicKey)
            if (res.success) {
                setData(res)
            }
            setLoading(false)
        }
        fetch()
    }, [suiteId, epicKey])

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    if (!data) return null

    const chartData = [
        { name: 'Passed', value: data.metrics.passed },
        { name: 'Failed', value: data.metrics.failed },
        { name: 'Pending', value: data.metrics.pending },
        { name: 'Blocked', value: data.metrics.blocked },
        { name: 'Skipped', value: data.metrics.skipped },
    ].filter(d => d.value > 0)

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Epic: {data.epic?.fields?.summary || epicKey}</span>
                        <span className="text-sm font-normal text-muted-foreground">{epicKey}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="h-[200px] w-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 flex-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Test Cases</span>
                                <span className="font-bold">{data.metrics.total}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-green-500">Passed</span>
                                <span className="font-bold">{data.metrics.passed}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-red-500">Failed</span>
                                <span className="font-bold">{data.metrics.failed}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pass Rate</span>
                                <span className="font-bold">{data.metrics.passRate}%</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Epic Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Status</div>
                        <div>{data.epic?.fields?.status?.name || 'Unknown'}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Priority</div>
                        <div>{data.epic?.fields?.priority?.name || 'Unknown'}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Assignee</div>
                        <div>{data.epic?.fields?.assignee?.displayName || 'Unassigned'}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
