import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Folder } from 'lucide-react'

interface SuiteCoverageProps {
    coverage: Array<{
        suiteName: string
        passRate: number
        coverage: number
        tested: number
        total: number
        passed: number
    }>
}

export function SuiteCoverage({ coverage }: SuiteCoverageProps) {
    return (
        <Card className="border-2 border-purple-100 dark:border-purple-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-900 dark:to-purple-950/20">
            <CardHeader className="border-b border-purple-100 dark:border-purple-900/50 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 px-6 py-4 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                    <Folder className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    Suite Coverage
                </CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">Test execution by suite</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {coverage.length > 0 ? (
                    coverage.map((suite, index) => (
                        <div key={index} className="space-y-2 px-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium truncate flex-1 text-neutral-900 dark:text-neutral-100">{suite.suiteName}</span>
                                <Badge variant={suite.passRate >= 80 ? "success" : suite.passRate >= 60 ? "warning" : "danger"} className="ml-2 text-xs">
                                    {suite.passRate}%
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <Progress value={suite.coverage} className="h-2" />
                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                    {suite.tested}/{suite.total} executed • {suite.passed} passed
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">No test suites found</p>
                )}
                <Link href="/test-suites" className="block">
                    <Button variant="secondary" className="w-full mt-2">
                        View All Suites
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
