import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Play, Clock, Activity } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function PerformanceDashboard() {
    const tests = await prisma.performanceTest.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            executions: {
                orderBy: { startedAt: 'desc' },
                take: 1
            }
        }
    })

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Performance Testing</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and execute k6 load tests to ensure system stability.
                    </p>
                </div>
                <Link href="/performance/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Test
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tests.map((test) => {
                    const lastRun = test.executions[0]
                    return (
                        <Card key={test.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-start">
                                    <Link href={`/performance/${test.id}`} className="hover:underline">
                                        {test.name}
                                    </Link>
                                    {lastRun && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${lastRun.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                lastRun.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {lastRun.status}
                                        </span>
                                    )}
                                </CardTitle>
                                <CardDescription className="truncate">
                                    {test.targetUrl}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-muted-foreground">
                                        <Activity className="mr-2 h-4 w-4" />
                                        {test.vus} VUs
                                    </div>
                                    <div className="flex items-center text-muted-foreground">
                                        <Clock className="mr-2 h-4 w-4" />
                                        {test.duration}
                                    </div>
                                    {lastRun && (
                                        <div className="pt-4 text-xs text-muted-foreground border-t mt-4">
                                            Last run {formatDistanceToNow(lastRun.startedAt)} ago
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {tests.length === 0 && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
                        <h3 className="text-lg font-medium">No performance tests yet</h3>
                        <p className="text-muted-foreground mb-4">Create your first load test to get started.</p>
                        <Link href="/performance/create">
                            <Button variant="outline">Create Test</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
