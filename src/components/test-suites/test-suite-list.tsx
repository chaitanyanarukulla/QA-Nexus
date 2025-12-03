'use client'


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Play, Trash2, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { createTestRunFromSuite } from '@/app/actions/test-runs'
import { deleteTestSuite } from '@/app/actions/test-suites'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface TestSuiteWithCases {
    [key: string]: any
    testCases: any[]
}

interface TestSuiteListProps {
    testSuites: TestSuiteWithCases[]
}

export function TestSuiteList({ testSuites }: TestSuiteListProps) {
    const router = useRouter()
    const [runningSuiteId, setRunningSuiteId] = useState<string | null>(null)

    const calculateSuiteProgress = (testCases: any[]) => {
        if (!testCases || testCases.length === 0) return { passed: 0, total: 0, percentage: 0 }

        let passed = 0
        testCases.forEach(tc => {
            if (tc.testResults && tc.testResults.length > 0 && tc.testResults[0].status === 'PASS') {
                passed++
            }
        })

        return {
            passed,
            total: testCases.length,
            percentage: (passed / testCases.length) * 100
        }
    }

    const getProgressColor = (percentage: number) => {
        if (percentage >= 80) return 'from-green-500 to-emerald-500'
        if (percentage >= 50) return 'from-yellow-500 to-orange-500'
        if (percentage > 0) return 'from-red-500 to-rose-500'
        return 'from-gray-400 to-gray-500'
    }

    const getBorderColor = (percentage: number) => {
        if (percentage >= 80) return 'border-t-green-500'
        if (percentage >= 50) return 'border-t-yellow-500'
        if (percentage > 0) return 'border-t-red-500'
        return 'border-t-gray-400'
    }

    const getProgressIcon = (percentage: number) => {
        if (percentage >= 80) return <CheckCircle2 className="w-4 h-4 text-green-600" />
        if (percentage >= 50) return <TrendingUp className="w-4 h-4 text-yellow-600" />
        return <AlertCircle className="w-4 h-4 text-red-600" />
    }

    const handleRunSuite = async (e: React.MouseEvent, suiteId: string) => {
        e.preventDefault()
        e.stopPropagation()

        setRunningSuiteId(suiteId)
        try {
            const run = await createTestRunFromSuite('demo-user', suiteId)
            router.push(`/test-runs/${run.id}`)
        } catch (error) {
            console.error('Failed to run suite', error)
            setRunningSuiteId(null)
        }
    }

    const handleDeleteSuite = async (e: React.MouseEvent, suiteId: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (confirm('Are you sure you want to delete this test suite? Test cases will be unlinked, not deleted.')) {
            try {
                await deleteTestSuite(suiteId)
            } catch (error) {
                console.error('Failed to delete suite', error)
            }
        }
    }

    if (testSuites.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <p>No test suites found.</p>
                    <p className="text-sm">Create your first test suite to organize your test cases.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testSuites.map((suite) => {
                const { passed, total, percentage } = calculateSuiteProgress(suite.testCases)
                const isRunning = runningSuiteId === suite.id

                return (
                    <Link href={`/test-suites/${suite.id}`} key={suite.id}>
                        <Card className={`hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-t-4 ${getBorderColor(percentage)} group relative overflow-hidden hover:scale-[1.02]`}>
                            {/* Background gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <CardHeader className="relative z-10">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`p-2.5 bg-gradient-to-br ${getProgressColor(percentage)} rounded-xl group-hover:scale-110 transition-transform flex-shrink-0`}>
                                            <FileText className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
                                                {suite.title}
                                            </CardTitle>
                                            {suite.jiraEpicKey && (
                                                <Badge variant="outline" className="mt-2 text-xs font-normal border-primary/30">
                                                    📊 {suite.jiraEpicKey}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 font-semibold">
                                            {total} {total === 1 ? 'Case' : 'Cases'}
                                        </Badge>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                                                onClick={(e) => handleDeleteSuite(e, suite.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 px-3 text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                                                onClick={(e) => handleRunSuite(e, suite.id)}
                                                disabled={isRunning || total === 0}
                                            >
                                                <div className="flex flex-row items-center gap-2">
                                                    <Play className="w-3 h-3" />
                                                    <span>{isRunning ? 'Starting...' : 'Run'}</span>
                                                </div>
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {suite.description && (
                                    <CardDescription className="line-clamp-2 mt-3 text-sm leading-relaxed">
                                        {suite.description}
                                    </CardDescription>
                                )}

                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                                            {getProgressIcon(percentage)}
                                            <span>Test Coverage</span>
                                        </div>
                                        <span className="font-bold text-sm">
                                            {Math.round(percentage)}%
                                            <span className="text-muted-foreground font-normal ml-1">
                                                ({passed}/{total})
                                            </span>
                                        </span>
                                    </div>
                                    <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${getProgressColor(percentage)} transition-all duration-500 rounded-full`}
                                            style={{ width: `${percentage}%` }}
                                        >
                                            <div className="h-full w-full bg-white/20 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                )
            })}
        </div>
    )
}
