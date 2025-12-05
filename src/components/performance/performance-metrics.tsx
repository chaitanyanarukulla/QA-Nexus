'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, Clock, ArrowDown, ArrowUp, AlertTriangle, CheckCircle, XCircle, Globe } from 'lucide-react'

interface MetricValue {
    avg?: number
    min?: number
    max?: number
    med?: number
    'p(90)'?: number
    'p(95)'?: number
    value?: number
    count?: number
    rate?: number
    fails?: number
    passes?: number
}

interface PerformanceMetricsProps {
    metrics: {
        metrics: Record<string, MetricValue>
        root_group: {
            checks?: Record<string, {
                name: string
                passes: number
                fails: number
            }>
        }
    }
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
    const m = metrics.metrics
    const checks = metrics.root_group.checks || {}

    const formatDuration = (ms: number | undefined) => {
        if (ms === undefined) return '-'
        return `${ms.toFixed(2)}ms`
    }

    const formatNumber = (num: number | undefined) => {
        if (num === undefined) return '-'
        return num.toLocaleString(undefined, { maximumFractionDigits: 2 })
    }

    return (
        <div className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(m.http_reqs?.count)}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatNumber(m.http_reqs?.rate)} req/s
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDuration(m.http_req_duration?.avg)}</div>
                        <p className="text-xs text-muted-foreground">
                            p95: {formatDuration(m.http_req_duration?.['p(95)'])}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatNumber(m.http_req_failed?.fails)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {m.http_req_failed?.passes !== undefined && m.http_req_failed?.fails !== undefined ?
                                `${((m.http_req_failed.fails / (m.http_req_failed.passes + m.http_req_failed.fails)) * 100).toFixed(2)}%`
                                : '0%'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Data Transfer</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber((m.data_received?.count || 0) / 1024)} KB
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Received
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="latency" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="latency">Latency Breakdown</TabsTrigger>
                    <TabsTrigger value="checks">Checks & Thresholds</TabsTrigger>
                    <TabsTrigger value="network">Network Details</TabsTrigger>
                </TabsList>

                <TabsContent value="latency" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Duration Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Sending</p>
                                        <p className="text-lg font-bold">{formatDuration(m.http_req_sending?.avg)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Waiting (TTFB)</p>
                                        <p className="text-lg font-bold">{formatDuration(m.http_req_waiting?.avg)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Receiving</p>
                                        <p className="text-lg font-bold">{formatDuration(m.http_req_receiving?.avg)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Blocked</p>
                                        <p className="text-lg font-bold">{formatDuration(m.http_req_blocked?.avg)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="checks" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Checks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.values(checks).length > 0 ? (
                                    Object.values(checks).map((check, i) => (
                                        <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                                            <span className="font-medium">{check.name}</span>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center text-green-600">
                                                    <CheckCircle className="mr-1 h-4 w-4" />
                                                    {check.passes}
                                                </div>
                                                <div className="flex items-center text-red-600">
                                                    <XCircle className="mr-1 h-4 w-4" />
                                                    {check.fails}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">No checks defined.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="network" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Network Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Data Sent</p>
                                    <p className="text-xl font-bold">{formatNumber(m.data_sent?.count)} bytes</p>
                                    <p className="text-xs text-muted-foreground">{formatNumber(m.data_sent?.rate)} bytes/s</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Data Received</p>
                                    <p className="text-xl font-bold">{formatNumber(m.data_received?.count)} bytes</p>
                                    <p className="text-xs text-muted-foreground">{formatNumber(m.data_received?.rate)} bytes/s</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
