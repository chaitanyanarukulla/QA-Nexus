'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { Play, CheckCircle, XCircle, Clock, AlertTriangle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteTestRun } from '@/app/actions/test-runs'
import { useState } from 'react'

interface TestRunListProps {
    testRuns: any[]
}

export function TestRunList({ testRuns }: TestRunListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (confirm('Are you sure you want to delete this test run? This will also delete all test results.')) {
            setDeletingId(id)
            try {
                await deleteTestRun(id)
            } catch (error) {
                console.error('Failed to delete test run', error)
            } finally {
                setDeletingId(null)
            }
        }
    }

    if (testRuns.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <p>No test runs found.</p>
                    <p className="text-sm">Create your first test run to start testing.</p>
                </CardContent>
            </Card>
        )
    }

    const getTestResults = (results: any[]) => {
        const passed = results.filter(r => r.status === 'PASS').length
        const total = results.length
        return { passed, total }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>
            case 'IN_PROGRESS':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"><Play className="w-3 h-3 mr-1" /> In Progress</Badge>
            case 'PENDING':
                return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
            case 'ABORTED':
                return <Badge variant="danger"><XCircle className="w-3 h-3 mr-1" /> Aborted</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Tester</TableHead>
                        <TableHead className="text-right">Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {testRuns.map((testRun) => {
                        const { passed, total } = getTestResults(testRun.results || [])
                        const percentage = total > 0 ? (passed / total) * 100 : 0

                        return (
                            <TableRow key={testRun.id} className="hover:bg-muted/50">
                                <TableCell className="font-medium truncate max-w-[100px] text-muted-foreground">
                                    {testRun.id.slice(-6)}
                                </TableCell>
                                <TableCell>
                                    <Link href={`/test-runs/${testRun.id}`} className="hover:underline text-primary font-medium flex items-center gap-2">
                                        {testRun.title}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(testRun.status)}
                                </TableCell>
                                <TableCell>
                                    <div className="w-[120px]">
                                        <Progress value={percentage} className="h-2" />
                                        <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                                            <span>{Math.round(percentage)}%</span>
                                            <span>{passed}/{total}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                            {(testRun.user?.name || 'U')[0]}
                                        </div>
                                        <span className="text-sm">{testRun.user?.name || 'Unknown'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {new Date(testRun.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => handleDelete(e, testRun.id)}
                                        disabled={deletingId === testRun.id}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
