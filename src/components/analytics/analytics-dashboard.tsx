'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts'
import { TrendingUp, Target, Zap, AlertCircle, CheckCircle2, Activity } from 'lucide-react'

interface HistoryData {
    date: string
    passed: number
    failed: number
    blocked: number
    skipped: number
    total: number
    passRate: number
}

interface DefectCount {
    [key: string]: number
}

interface AutomationData {
    total: number
    automated: number
    manual: number
    automationRate: number
}

interface VelocityData {
    avgPerDay: number
    recentAvgPerDay: number
    last7Days: number
    last30Days: number
}

interface QualityData {
    score: number
    passRate: number
    automationRate: number
    defectResolutionRate: number
}

interface TopFailingTest {
    id: string
    title: string
    failCount: number
    priority: string
}

interface AnalyticsDashboardProps {
    data: {
        history: HistoryData[]
        defectsByPriority: DefectCount
        defectsByStatus: DefectCount
        resultsDistribution: DefectCount
        automation: AutomationData
        velocity: VelocityData
        quality: QualityData
        priorityDistribution: DefectCount
        topFailingTests: TopFailingTest[]
    }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
const PRIORITY_COLORS = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#f97316',
    CRITICAL: '#ef4444'
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
    const defectPriorityData = Object.entries(data.defectsByPriority).map(([name, value]) => ({ name, value }))
    const defectStatusData = Object.entries(data.defectsByStatus).map(([name, value]) => ({ name, value }))
    const resultsData = Object.entries(data.resultsDistribution).map(([name, value]) => ({ name, value }))
    const automationData = [
        { name: 'Automated', value: data.automation.automated, color: '#10b981' },
        { name: 'Manual', value: data.automation.manual, color: '#f59e0b' }
    ]

    const getQualityColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getQualityGradient = (score: number) => {
        if (score >= 80) return 'from-green-500 to-emerald-600'
        if (score >= 60) return 'from-yellow-500 to-orange-600'
        return 'from-red-500 to-rose-600'
    }

    return (
        <div className="space-y-6">
            {/* Quality Score Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Quality Score</CardTitle>
                            <CardDescription>Composite metric based on pass rate, automation, and defect resolution</CardDescription>
                        </div>
                        <div className={`text-6xl font-bold ${getQualityColor(data.quality.score)}`}>
                            {data.quality.score}
                            <span className="text-2xl text-muted-foreground">/100</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Pass Rate</span>
                                <span className="font-semibold">{data.quality.passRate}%</span>
                            </div>
                            <Progress value={data.quality.passRate} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Automation</span>
                                <span className="font-semibold">{data.quality.automationRate}%</span>
                            </div>
                            <Progress value={data.quality.automationRate} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Defect Resolution</span>
                                <span className="font-semibold">{data.quality.defectResolutionRate}%</span>
                            </div>
                            <Progress value={data.quality.defectResolutionRate} className="h-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Velocity Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Tests/Day</CardTitle>
                        <Zap className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.velocity.avgPerDay}</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Velocity</CardTitle>
                        <Activity className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.velocity.recentAvgPerDay}</div>
                        <p className="text-xs text-muted-foreground">Last 7 days</p>
                        {data.velocity.recentAvgPerDay > data.velocity.avgPerDay && (
                            <Badge variant="default" className="mt-2 bg-green-100 text-green-700">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Increasing
                            </Badge>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tests This Week</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.velocity.last7Days}</div>
                        <p className="text-xs text-muted-foreground">Executed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tests This Month</CardTitle>
                        <Target className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.velocity.last30Days}</div>
                        <p className="text-xs text-muted-foreground">Executed</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Test Execution History */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Test Execution Trend (30 Days)</CardTitle>
                        <CardDescription>Pass/Fail trend over time with pass rate</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={data.history}>
                                <defs>
                                    <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="passed" stackId="1" stroke="#22c55e" fill="url(#colorPassed)" name="Passed" />
                                <Area type="monotone" dataKey="failed" stackId="1" stroke="#ef4444" fill="url(#colorFailed)" name="Failed" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Test Results Distribution */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Results Distribution</CardTitle>
                        <CardDescription>Last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={resultsData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${entry.value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {resultsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            {resultsData.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span>{item.name}</span>
                                    </div>
                                    <span className="font-semibold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Automation Coverage */}
                <Card>
                    <CardHeader>
                        <CardTitle>Automation Coverage</CardTitle>
                        <CardDescription>{data.automation.automationRate}% automated</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={automationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={(entry) => `${entry.value}`}
                                >
                                    {automationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Defects by Priority */}
                <Card>
                    <CardHeader>
                        <CardTitle>Defects by Priority</CardTitle>
                        <CardDescription>Current defect distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={defectPriorityData} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" name="Count" radius={[0, 8, 8, 0]}>
                                    {defectPriorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || '#8884d8'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Top Failing Tests */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            Top Failing Tests
                        </CardTitle>
                        <CardDescription>Tests with most failures in last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.topFailingTests.length > 0 ? (
                                data.topFailingTests.map((test, index) => (
                                    <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-semibold text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{test.title}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    <Badge variant="outline" className="text-xs">
                                                        {test.priority}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="danger">{test.failCount} fails</Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No failing tests in the last 30 days</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Defects by Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Defects by Status</CardTitle>
                        <CardDescription>Defect lifecycle tracking</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            {defectStatusData.map((item) => {
                                const getStatusColor = (status: string) => {
                                    switch (status) {
                                        case 'OPEN': return 'from-red-500 to-red-600'
                                        case 'IN_PROGRESS': return 'from-orange-500 to-orange-600'
                                        case 'RESOLVED': return 'from-green-500 to-green-600'
                                        case 'CLOSED': return 'from-blue-500 to-blue-600'
                                        default: return 'from-gray-500 to-gray-600'
                                    }
                                }

                                return (
                                    <div key={item.name} className={`p-4 rounded-lg bg-gradient-to-br ${getStatusColor(item.name)} text-white shadow-lg`}>
                                        <div className="text-sm font-medium opacity-90">{item.name.replace('_', ' ')}</div>
                                        <div className="text-3xl font-bold mt-1">{item.value as number}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
