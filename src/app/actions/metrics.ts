'use server'

import { prisma } from '@/lib/prisma'

export async function getMetrics() {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
        totalTestCases,
        totalTestSuites,
        totalTestRuns,
        totalDefects,
        activeTestCases,
        openDefects,
        recentTestRuns,
        testCasesLast30Days,
        testRunsLast30Days,
        testRunsLast7Days,
        defectsLast7Days,
        allTestResults,
    ] = await Promise.all([
        prisma.testCase.count(),
        prisma.testSuite.count(),
        prisma.testRun.count(),
        prisma.defect.count(),
        prisma.testCase.count({ where: { status: 'ACTIVE' } }),
        prisma.defect.count({ where: { status: 'OPEN' } }),
        prisma.testRun.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                results: true,
            },
        }),
        prisma.testCase.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.testRun.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.testRun.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.defect.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.testResult.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo }
            },
            select: {
                status: true,
                createdAt: true
            }
        }),
    ])

    // Calculate overall pass rate
    let totalTests = 0
    let passedTests = 0
    let failedTests = 0
    let blockedTests = 0

    recentTestRuns.forEach((run: any) => {
        run.results.forEach((result: any) => {
            totalTests++
            if (result.status === 'PASS') passedTests++
            if (result.status === 'FAIL') failedTests++
            if (result.status === 'BLOCKED') blockedTests++
        })
    })

    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0

    // Calculate test execution trend (daily for last 7 days)
    const dailyTrend: { date: string; passed: number; failed: number; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        const dayResults = allTestResults.filter((r: any) => {
            const resultDate = new Date(r.createdAt)
            return resultDate >= date && resultDate < nextDate
        })

        dailyTrend.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            passed: dayResults.filter((r: any) => r.status === 'PASS').length,
            failed: dayResults.filter((r: any) => r.status === 'FAIL').length,
            total: dayResults.length
        })
    }

    // Calculate test coverage by suite
    const suiteMetrics = await prisma.testSuite.findMany({
        select: {
            title: true,
            testCases: {
                select: {
                    id: true,
                    testResults: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                        select: {
                            status: true
                        }
                    }
                }
            }
        }
    })

    const coverage = suiteMetrics.map((suite: any) => {
        const total = suite.testCases.length
        const tested = suite.testCases.filter((tc: any) =>
            tc.testResults.length > 0 && tc.testResults[0].status !== 'PENDING'
        ).length
        const passed = suite.testCases.filter((tc: any) =>
            tc.testResults.length > 0 && tc.testResults[0].status === 'PASS'
        ).length

        return {
            suiteName: suite.title,
            total,
            tested,
            passed,
            coverage: total > 0 ? Math.round((tested / total) * 100) : 0,
            passRate: tested > 0 ? Math.round((passed / tested) * 100) : 0
        }
    })

    return {
        totalTestCases,
        totalTestSuites,
        totalTestRuns,
        totalDefects,
        activeTestCases,
        openDefects,
        passRate,
        failedTests,
        blockedTests,
        recentTestRuns,
        trends: {
            testCasesLast30Days,
            testRunsLast30Days,
            testRunsLast7Days,
            defectsLast7Days,
            dailyTrend
        },
        coverage: coverage.slice(0, 5) // Top 5 suites
    }
}
