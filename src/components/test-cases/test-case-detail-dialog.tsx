'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, FileText, CheckSquare, Target, Trash2, AlertCircle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react'
import { createQuickRun } from '@/app/actions/test-runs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateTestCase, deleteTestCase } from '@/app/actions/test-cases'
import { Status } from '@/types'
import { useEffect } from 'react'
import { Separator } from '@/components/ui/separator'

interface TestCaseDetailDialogProps {
    testCase: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TestCaseDetailDialog({ testCase, open, onOpenChange }: TestCaseDetailDialogProps) {
    const router = useRouter()
    const [running, setRunning] = useState(false)
    const [status, setStatus] = useState<string>('')

    useEffect(() => {
        if (testCase) {
            setStatus(testCase.status)
        }
    }, [testCase])

    if (!testCase) return null

    const handleStatusChange = async (newStatus: string) => {
        setStatus(newStatus)
        try {
            const result = await updateTestCase(testCase.id, { status: newStatus as Status })
            if (result.success) {
                toast.success('Status updated successfully')
            } else {
                toast.error(result.error || 'Failed to update status')
                setStatus(testCase.status) // Revert on failure
            }
        } catch (error) {
            toast.error('Failed to update status')
            console.error('Failed to update status', error)
            setStatus(testCase.status) // Revert on failure
        }
    }

    const handleQuickRun = async () => {
        setRunning(true)
        try {
            const run = await createQuickRun('demo-user', testCase.id)
            toast.success('Test run created successfully')
            onOpenChange(false)
            router.push(`/test-runs/${run.id}`)
        } catch (error) {
            toast.error('Failed to create test run')
            console.error('Failed to start run', error)
        } finally {
            setRunning(false)
        }
    }

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this test case? This will also delete all associated results.')) {
            try {
                const result = await deleteTestCase(testCase.id)
                if (result.success) {
                    toast.success('Test case deleted successfully')
                    onOpenChange(false)
                } else {
                    toast.error(result.error || 'Failed to delete test case')
                }
            } catch (error) {
                toast.error('Failed to delete test case')
                console.error('Failed to delete test case', error)
            }
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'CRITICAL':
                return (
                    <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Critical
                    </Badge>
                )
            case 'HIGH':
                return (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 gap-1">
                        <ArrowUp className="w-3 h-3" />
                        High
                    </Badge>
                )
            case 'MEDIUM':
                return (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1">
                        <ArrowRight className="w-3 h-3" />
                        Medium
                    </Badge>
                )
            case 'LOW':
                return (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200 gap-1">
                        <ArrowDown className="w-3 h-3" />
                        Low
                    </Badge>
                )
            default:
                return <Badge variant="outline">{priority}</Badge>
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <DialogTitle className="text-2xl font-bold pr-8">{testCase.title}</DialogTitle>
                            <DialogDescription className="mt-2 font-mono text-xs">
                                ID: {testCase.id}
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {getPriorityBadge(testCase.priority)}
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-[140px] h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">✓ Active</SelectItem>
                                    <SelectItem value="DRAFT">📝 Draft</SelectItem>
                                    <SelectItem value="DEPRECATED">🗑️ Deprecated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </DialogHeader>

                <Separator className="my-4" />

                <div className="space-y-6">
                    {testCase.description && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <FileText className="h-4 w-4 text-primary" />
                                Description
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">
                                {testCase.description}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <CheckSquare className="h-4 w-4 text-primary" />
                            Test Steps
                        </div>
                        <div className="bg-muted/30 border border-muted rounded-lg p-4 text-sm max-h-[250px] overflow-y-auto ml-6">
                            {typeof testCase.steps === 'string' ? (
                                <pre className="whitespace-pre-wrap font-sans leading-relaxed">{testCase.steps}</pre>
                            ) : (
                                <ol className="list-decimal list-inside space-y-2">
                                    {Array.isArray(testCase.steps) &&
                                        testCase.steps.map((step: string, idx: number) => (
                                            <li key={idx} className="leading-relaxed">
                                                {step}
                                            </li>
                                        ))}
                                    {!Array.isArray(testCase.steps) && (
                                        <pre className="whitespace-pre-wrap font-sans">
                                            {JSON.stringify(testCase.steps, null, 2)}
                                        </pre>
                                    )}
                                </ol>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Target className="h-4 w-4 text-primary" />
                            Expected Result
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-green-50 border border-green-200 rounded-lg p-4 ml-6">
                            {testCase.expectedResult || 'No expected result specified.'}
                        </p>
                    </div>
                </div>

                <Separator className="my-4" />

                <DialogFooter className="flex justify-between sm:justify-between items-center w-full gap-2">
                    <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                        <div className="flex flex-row items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                        </div>
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                        <Button onClick={handleQuickRun} disabled={running}>
                            <div className="flex flex-row items-center gap-2">
                                <Play className="h-4 w-4" />
                                <span>{running ? 'Starting...' : 'Run Test'}</span>
                            </div>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
