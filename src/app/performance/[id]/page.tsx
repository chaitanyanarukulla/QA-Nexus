import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { TestRunner } from './test-runner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Activity, Clock, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function PerformanceTestDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const test = await prisma.performanceTest.findUnique({
        where: { id },
        include: {
            executions: {
                orderBy: { startedAt: 'desc' }
            }
        }
    })

    if (!test) notFound()

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex items-center space-x-4">
                <Link href="/performance">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{test.name}</h1>
                    <p className="text-muted-foreground">{test.targetUrl}</p>
                </div>
                <TestRunner testId={test.id} />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Configuration</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{test.vus} VUs</div>
                        <p className="text-xs text-muted-foreground">
                            Duration: {test.duration}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{test.executions.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Last run: {test.executions[0] ? formatDistanceToNow(test.executions[0].startedAt) + ' ago' : 'Never'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Execution History</h2>
                <div className="grid gap-4">
                    {test.executions.map((execution) => (
                        <Card key={execution.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center space-x-2">
                                    <Badge variant={
                                        execution.status === 'COMPLETED' ? 'default' :
                                            execution.status === 'FAILED' ? 'destructive' : 'secondary'
                                    }>
                                        {execution.status}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(execution.startedAt)} ago
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {execution.metrics ? (
                                    <pre className="bg-muted p-4 rounded-md overflow-auto text-xs max-h-60">
                                        {JSON.stringify(execution.metrics, null, 2)}
                                    </pre>
                                ) : (
                                    <div className="text-sm text-muted-foreground italic">
                                        {execution.status === 'RUNNING' ? 'Test is running...' : 'No metrics available'}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {test.executions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No executions yet. Run the test to see results.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
