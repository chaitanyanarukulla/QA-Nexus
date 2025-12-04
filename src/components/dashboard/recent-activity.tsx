import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, Play, ArrowRight, Bug } from 'lucide-react'

interface RecentActivityProps {
    recentRuns: Array<{
        id: string
        title: string
        status: string
        createdAt: string | Date
        user: {
            name?: string | null
        }
    }>
    recentDefects: Array<{
        id: string
        title: string
        status: string
        priority: string
        createdAt: string | Date
    }>
}

export function RecentActivity({ recentRuns, recentDefects }: RecentActivityProps) {
    return (
        <Card className="col-span-2 border-2 border-emerald-100 dark:border-emerald-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/20">
            <CardHeader className="border-b border-emerald-100 dark:border-emerald-900/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 px-6 py-4 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                    <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Recent Activity
                </CardTitle>
                <CardDescription className="text-emerald-700 dark:text-emerald-300">Latest test runs and reported defects</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <Tabs defaultValue="runs" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="runs">Recent Test Runs</TabsTrigger>
                        <TabsTrigger value="defects">Recent Defects</TabsTrigger>
                    </TabsList>

                    <TabsContent value="runs" className="space-y-3 [&>a]:animate-slideInLeft">
                        {recentRuns.length > 0 ? (
                            recentRuns.slice(0, 5).map((run) => (
                                <Link
                                    key={run.id}
                                    href={`/test-runs/${run.id}`}
                                    className="block"
                                >
                                    <div className="flex items-center justify-between p-4 border-2 border-blue-100 dark:border-blue-900/50 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/50 dark:hover:to-indigo-950/50 transition-all hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 hover:scale-[1.01] group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`p-2.5 rounded-full ${run.status === 'COMPLETED' ? 'bg-success-100 text-success-600 dark:bg-success-900 dark:text-success-300' :
                                                run.status === 'IN_PROGRESS' ? 'bg-info-100 text-info-600 dark:bg-info-900 dark:text-info-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                                                }`}>
                                                <Play className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate group-hover:text-primary-500 transition-colors text-neutral-900 dark:text-neutral-100">{run.title}</div>
                                                <div className="text-sm text-neutral-600 dark:text-neutral-400">by {run.user.name || 'Unknown'}</div>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-2">
                                            <div>
                                                <Badge variant={run.status === 'COMPLETED' ? 'success' : run.status === 'IN_PROGRESS' ? 'info' : 'secondary'} size="sm">
                                                    {run.status}
                                                </Badge>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                    {new Date(run.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">No recent test runs</div>
                        )}
                        <Link href="/test-runs" className="block">
                            <Button variant="secondary" className="w-full">
                                View All Runs
                            </Button>
                        </Link>
                    </TabsContent>

                    <TabsContent value="defects" className="space-y-3 [&>div]:animate-slideInLeft">
                        {recentDefects.length > 0 ? (
                            recentDefects.map((defect) => (
                                <div key={defect.id} className="flex items-center justify-between p-4 border-2 border-red-100 dark:border-red-900/50 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-950/50 dark:hover:to-orange-950/50 transition-all hover:shadow-lg hover:border-red-300 dark:hover:border-red-700 hover:scale-[1.01] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-full ${defect.priority === 'CRITICAL' ? 'bg-danger-100 text-danger-600 dark:bg-danger-900 dark:text-danger-300' :
                                            defect.priority === 'HIGH' ? 'bg-warning-100 text-warning-600 dark:bg-warning-900 dark:text-warning-300' : 'bg-info-100 text-info-600 dark:bg-info-900 dark:text-info-300'
                                            }`}>
                                            <Bug className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-neutral-900 dark:text-neutral-100">{defect.title}</div>
                                            <div className="text-sm text-neutral-600 dark:text-neutral-400">{defect.status}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={
                                            defect.priority === 'CRITICAL' ? 'danger-solid' :
                                                defect.priority === 'HIGH' ? 'warning-solid' :
                                                    'info'
                                        } size="sm">
                                            {defect.priority}
                                        </Badge>
                                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                            {new Date(defect.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">No recent defects</div>
                        )}
                        <Link href="/defects" className="block">
                            <Button variant="secondary" className="w-full">
                                View All Defects
                            </Button>
                        </Link>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
