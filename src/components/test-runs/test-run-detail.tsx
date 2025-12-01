'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { PlayCircle, CheckCircle, XCircle, AlertCircle, MinusCircle, PauseCircle, Loader2 } from 'lucide-react'
import { TestExecutionDialog } from './test-execution-dialog'
import { pauseTestRun, resumeTestRun } from '@/app/actions/test-runs'
import { toast } from 'sonner'

interface TestRunDetailProps {
    testRun: any // Typed properly in real app
}

export function TestRunDetail({ testRun }: TestRunDetailProps) {
    const router = useRouter()
    const [selectedResult, setSelectedResult] = useState<any>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isPausing, setIsPausing] = useState(false)
    const [isResuming, setIsResuming] = useState(false)

    const passedCount = testRun.results.filter((r: any) => r.status === 'PASS').length
    const failedCount = testRun.results.filter((r: any) => r.status === 'FAIL').length
    const blockedCount = testRun.results.filter((r: any) => r.status === 'BLOCKED').length
    const skippedCount = testRun.results.filter((r: any) => r.status === 'SKIPPED').length
    const pendingCount = testRun.results.filter((r: any) => r.status === 'PENDING').length
    const completedCount = testRun.results.length - pendingCount
    const totalCount = testRun.results.length
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    const handleExecute = (result: any) => {
        setSelectedResult(result)
        setDialogOpen(true)
    }

    const handleDialogClose = (open: boolean) => {
        setDialogOpen(open)
        if (!open) {
            // Refresh the page data when dialog closes
            router.refresh()
        }
    }

    const handlePause = async () => {
        setIsPausing(true)
        try {
            await pauseTestRun(testRun.id)
            toast.success('Test run paused')
            router.refresh()
        } catch (error) {
            toast.error('Failed to pause test run')
        } finally {
            setIsPausing(false)
        }
    }

    const handleResume = async () => {
        setIsResuming(true)
        try {
            await resumeTestRun(testRun.id)
            toast.success('Test run resumed')
            router.refresh()
        } catch (error) {
            toast.error('Failed to resume test run')
        } finally {
            setIsResuming(false)
        }
    }

    const getResultStatusBadge = (status: string) => {
        switch (status) {
            case 'PASS':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Pass</Badge>
            case 'FAIL':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Fail</Badge>
            case 'BLOCKED':
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" /> Blocked</Badge>
            case 'SKIPPED':
                return <Badge variant="secondary"><MinusCircle className="w-3 h-3 mr-1" /> Skipped</Badge>
            default:
                return <Badge variant="outline"><PlayCircle className="w-3 h-3 mr-1" /> Pending</Badge>
        }
    }

    const getRunStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-green-100 text-green-700 border-green-200 text-lg px-4 py-1"><CheckCircle className="w-4 h-4 mr-1" /> Completed</Badge>
            case 'FAILED':
                return <Badge className="bg-red-100 text-red-700 border-red-200 text-lg px-4 py-1"><XCircle className="w-4 h-4 mr-1" /> Failed</Badge>
            case 'PAUSED':
                return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-lg px-4 py-1"><PauseCircle className="w-4 h-4 mr-1" /> Paused</Badge>
            case 'IN_PROGRESS':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-lg px-4 py-1"><PlayCircle className="w-4 h-4 mr-1" /> In Progress</Badge>
            case 'ABORTED':
                return <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-lg px-4 py-1"><MinusCircle className="w-4 h-4 mr-1" /> Aborted</Badge>
            default:
                return <Badge variant="outline" className="text-lg px-4 py-1"><PlayCircle className="w-4 h-4 mr-1" /> Pending</Badge>
        }
    }

    const isPaused = testRun.status === 'PAUSED'
    const isCompleted = testRun.status === 'COMPLETED' || testRun.status === 'FAILED'
    const canPause = testRun.status === 'IN_PROGRESS' && pendingCount > 0
    const canResume = isPaused && pendingCount > 0

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{testRun.title}</h1>
                    <p className="text-muted-foreground mt-1">
                        Run ID: {testRun.id} • Created by {testRun.user?.name || 'Unknown'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {canPause && (
                        <Button variant="outline" onClick={handlePause} disabled={isPausing}>
                            {isPausing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <PauseCircle className="w-4 h-4 mr-2" />
                            )}
                            Pause
                        </Button>
                    )}
                    {canResume && (
                        <Button onClick={handleResume} disabled={isResuming}>
                            {isResuming ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <PlayCircle className="w-4 h-4 mr-2" />
                            )}
                            Resume
                        </Button>
                    )}
                    {getRunStatusBadge(testRun.status)}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Progress value={progress} className="h-3" />
                            <span className="text-sm font-medium whitespace-nowrap">
                                {completedCount} / {totalCount} Completed
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span>{passedCount} Passed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span>{failedCount} Failed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span>{blockedCount} Blocked</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-400" />
                                <span>{skippedCount} Skipped</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-400" />
                                <span>{pendingCount} Pending</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead>Test Case</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {testRun.results.map((result: any) => (
                            <TableRow key={result.id} className={
                                result.status === 'FAIL' ? 'bg-red-50/50 hover:bg-red-50' :
                                    result.status === 'PASS' ? 'bg-green-50/50 hover:bg-green-50' :
                                        result.status === 'BLOCKED' ? 'bg-yellow-50/50 hover:bg-yellow-50' :
                                            ''
                            }>
                                <TableCell>
                                    {getResultStatusBadge(result.status)}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{result.testCase.title}</div>
                                    <div className="text-sm text-muted-foreground truncate max-w-[500px]">
                                        {result.testCase.description}
                                    </div>
                                    {result.notes && (
                                        <div className="text-xs text-muted-foreground mt-1 italic">
                                            Notes: {result.notes}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{result.testCase.priority}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant={result.status === 'PENDING' ? 'primary' : 'outline'}
                                        size="sm"
                                        onClick={() => handleExecute(result)}
                                        disabled={isPaused && result.status === 'PENDING'}
                                    >
                                        {result.status === 'PENDING' ? 'Execute' : 'Update'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <TestExecutionDialog
                open={dialogOpen}
                onOpenChange={handleDialogClose}
                result={selectedResult}
            />
        </div>
    )
}
