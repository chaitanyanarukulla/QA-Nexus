import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, Play, ArrowRight, Bug, Clock } from 'lucide-react'

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
        <Card className="col-span-2 border border-emerald-200 dark:border-emerald-500/20 shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-900 dark:text-emerald-100">
                    <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    Recent Activity
                </CardTitle>
                <CardDescription className="text-base text-slate-500 dark:text-slate-400">Latest test runs and reported defects</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <Tabs defaultValue="runs" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-800/50">
                        <TabsTrigger value="runs" className="data-[state=active]:bg-white dark:data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 text-base">Recent Test Runs</TabsTrigger>
                        <TabsTrigger value="defects" className="data-[state=active]:bg-white dark:data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-600 dark:data-[state=active]:text-rose-400 text-base">Recent Defects</TabsTrigger>
                    </TabsList>

                    <TabsContent value="runs" className="space-y-0 relative pl-4 border-l border-slate-200 dark:border-slate-800 ml-2">
                        {recentRuns.length > 0 ? (
                            recentRuns.slice(0, 5).map((run, index) => (
                                <div key={run.id} className="relative mb-6 last:mb-0 group">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 shadow-[0_0_8px_currentColor] transition-all duration-300 group-hover:scale-125 ${run.status === 'COMPLETED' ? 'bg-emerald-500 text-emerald-500' :
                                        run.status === 'IN_PROGRESS' ? 'bg-sky-500 text-sky-500' : 'bg-slate-500 text-slate-500'
                                        }`} />

                                    <Link
                                        href={`/test-runs/${run.id}`}
                                        className="block -mt-1"
                                    >
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/5">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-base text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors truncate">{run.title}</span>
                                                    <Badge variant={run.status === 'COMPLETED' ? 'success' : run.status === 'IN_PROGRESS' ? 'info' : 'secondary'} size="sm" className="text-xs h-6 px-2">
                                                        {run.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <UserIcon className="h-4 w-4" />
                                                        {run.user.name || 'Unknown'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {new Date(run.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                        </div>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">No recent test runs</div>
                        )}
                        <div className="pt-4">
                            <Link href="/test-runs" className="block">
                                <Button variant="secondary" className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-0">
                                    View All Runs
                                </Button>
                            </Link>
                        </div>
                    </TabsContent>

                    <TabsContent value="defects" className="space-y-0 relative pl-4 border-l border-slate-200 dark:border-slate-800 ml-2">
                        {recentDefects.length > 0 ? (
                            recentDefects.map((defect) => (
                                <div key={defect.id} className="relative mb-6 last:mb-0 group">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 shadow-[0_0_8px_currentColor] transition-all duration-300 group-hover:scale-125 ${defect.priority === 'CRITICAL' ? 'bg-rose-500 text-rose-500' :
                                        defect.priority === 'HIGH' ? 'bg-amber-500 text-amber-500' : 'bg-sky-500 text-sky-500'
                                        }`} />

                                    <div className="block -mt-1">
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/5">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-base text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors truncate">{defect.title}</span>
                                                    <Badge variant={
                                                        defect.priority === 'CRITICAL' ? 'danger-solid' :
                                                            defect.priority === 'HIGH' ? 'warning-solid' :
                                                                'info'
                                                    } size="sm" className="text-xs h-6 px-2">
                                                        {defect.priority}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                                    <span>{defect.status}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {new Date(defect.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">No recent defects</div>
                        )}
                        <div className="pt-4">
                            <Link href="/defects" className="block">
                                <Button variant="secondary" className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-0">
                                    View All Defects
                                </Button>
                            </Link>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

function UserIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
