'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, XCircle, AlertCircle, MinusCircle, PlayCircle, Loader2 } from 'lucide-react'
import { ResultStatus } from '@/types'
import { createTestRunFromSuite } from '@/app/actions/test-runs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface TestCase {
    id: string
    title: string
    description: string | null
    priority: string
    steps: any
    expectedResult: string | null
}

interface SuiteExecutionProps {
    testCases: TestCase[]
    suiteId: string
    suiteTitle: string
}

interface ExecutionState {
    testCaseId: string
    status: ResultStatus
    notes?: string
    completedAt?: string
}

export function SuiteExecution({ testCases, suiteId, suiteTitle }: SuiteExecutionProps) {
    const [executionStates, setExecutionStates] = useState<Map<string, ExecutionState>>(new Map())
    const [currentExecutingId, setCurrentExecutingId] = useState<string | null>(null)
    const [isCreatingRun, setIsCreatingRun] = useState(false)
    const router = useRouter()

    // Load execution state from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(`suite-execution-${suiteId}`)
        if (stored) {
            try {
                const data = JSON.parse(stored)
                setExecutionStates(new Map(Object.entries(data)))
            } catch (e) {
                console.error('Failed to load execution state', e)
            }
        }
    }, [suiteId])

    // Save execution state to localStorage
    useEffect(() => {
        const data = Object.fromEntries(executionStates)
        localStorage.setItem(`suite-execution-${suiteId}`, JSON.stringify(data))
    }, [executionStates, suiteId])

    const handleStartExecution = async () => {
        setIsCreatingRun(true)
        try {
            const testRun = await createTestRunFromSuite('demo-user', suiteId)
            toast.success('Test run created successfully!')
            router.push(`/test-runs/${testRun.id}`)
        } catch (error) {
            toast.error('Failed to create test run')
            console.error(error)
        } finally {
            setIsCreatingRun(false)
        }
    }

    const handleQuickExecute = async (testCaseId: string, status: ResultStatus) => {
        const newState: ExecutionState = {
            testCaseId,
            status,
            completedAt: new Date().toISOString()
        }

        setExecutionStates(prev => new Map(prev).set(testCaseId, newState))

        // Auto-advance to next test case
        const currentIndex = testCases.findIndex(tc => tc.id === testCaseId)
        if (currentIndex < testCases.length - 1) {
            const nextTestCase = testCases[currentIndex + 1]
            setTimeout(() => {
                const nextCard = document.getElementById(`test-case-${nextTestCase.id}`)
                nextCard?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 500)
        }
    }

    const getStatusBadge = (testCaseId: string) => {
        const state = executionStates.get(testCaseId)
        if (!state) {
            return (
                <Badge variant="outline" className="gap-1">
                    <PlayCircle className="w-3 h-3" />
                    Pending
                </Badge>
            )
        }

        switch (state.status) {
            case 'PASS':
                return (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Pass
                    </Badge>
                )
            case 'FAIL':
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 gap-1">
                        <XCircle className="w-3 h-3" />
                        Fail
                    </Badge>
                )
            case 'BLOCKED':
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Blocked
                    </Badge>
                )
            case 'SKIPPED':
                return (
                    <Badge variant="secondary" className="gap-1">
                        <MinusCircle className="w-3 h-3" />
                        Skipped
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="gap-1">
                        <PlayCircle className="w-3 h-3" />
                        Pending
                    </Badge>
                )
        }
    }

    const getPriorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            CRITICAL: 'bg-red-100 text-red-700 border-red-200',
            HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
            MEDIUM: 'bg-blue-100 text-blue-700 border-blue-200',
            LOW: 'bg-gray-100 text-gray-700 border-gray-200'
        }
        return (
            <Badge className={colors[priority] || 'bg-gray-100 text-gray-700'}>
                {priority}
            </Badge>
        )
    }

    const getRowBackground = (testCaseId: string) => {
        const state = executionStates.get(testCaseId)
        if (!state) return ''

        switch (state.status) {
            case 'PASS':
                return 'bg-green-50/50 border-green-200'
            case 'FAIL':
                return 'bg-red-50/50 border-red-200'
            default:
                return ''
        }
    }

    const completedCount = Array.from(executionStates.values()).filter(s => s.status !== 'PENDING').length
    const passedCount = Array.from(executionStates.values()).filter(s => s.status === 'PASS').length

    const handleClearProgress = () => {
        if (confirm('Are you sure you want to clear all execution progress?')) {
            setExecutionStates(new Map())
            localStorage.removeItem(`suite-execution-${suiteId}`)
        }
    }

    return (
        <div className="space-y-4">
            {/* Progress Summary */}
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">Execution Progress</h3>
                        <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold text-primary">{completedCount}/{testCases.length}</div>
                            <div className="text-sm space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span>{passedCount} passed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span>{completedCount - passedCount} other</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {completedCount > 0 && (
                            <Button variant="outline" size="sm" onClick={handleClearProgress}>
                                Clear Progress
                            </Button>
                        )}
                        <Button onClick={handleStartExecution} disabled={isCreatingRun || testCases.length === 0} size="lg">
                            {isCreatingRun ? (
                                <div className="flex flex-row items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Creating Test Run...</span>
                                </div>
                            ) : (
                                <div className="flex flex-row items-center gap-2">
                                    <PlayCircle className="w-5 h-5" />
                                    <span>{completedCount === 0 ? 'Start Execution' : 'Create New Test Run'}</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Test Cases List */}
            <div className="space-y-2">
                {testCases.map((testCase, index) => {
                    const state = executionStates.get(testCase.id)
                    const isExecuting = currentExecutingId === testCase.id

                    return (
                        <Card
                            key={testCase.id}
                            id={`test-case-${testCase.id}`}
                            className={`p-5 transition-all ${getRowBackground(testCase.id)} hover:shadow-md`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-sm font-bold text-white shadow-md">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-lg mb-1">{testCase.title}</div>
                                        {testCase.description && (
                                            <div className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                {testCase.description}
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {getPriorityBadge(testCase.priority)}
                                            {getStatusBadge(testCase.id)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {state?.notes && (
                                <div className="mt-3 pt-3 border-t text-sm">
                                    <span className="font-medium text-muted-foreground">Notes:</span>
                                    <p className="mt-1">{state.notes}</p>
                                </div>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

