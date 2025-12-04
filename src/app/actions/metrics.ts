'use server'

import { prisma } from '@/lib/prisma'

export async function getMetrics() {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Parallelize independent queries
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
                results: {
                    select: { status: true }
                },
                user: {
                    select: { name: true }
                }
            },
        }),
        prisma.testCase.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.testRun.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.testRun.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.defect.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ])

    // Calculate overall pass rate from recent runs (last 10 runs)
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

    // Optimized Daily Trend using raw query for aggregation
    // This avoids fetching thousands of rows to JS
    const trendResults = await prisma.$queryRaw<{ date: Date, status: string, count: bigint }[]>`
        SELECT DATE("createdAt") as date, "status", COUNT(*)::int as count
        FROM "TestResult"
        WHERE "createdAt" >= ${sevenDaysAgo}
        GROUP BY DATE("createdAt"), "status"
        ORDER BY date ASC
    `

    // Process raw results into the expected format
    const dailyTrend: { date: string; passed: number; failed: number; total: number }[] = []

    for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD

        // Find matching rows for this date
        const dayRows = trendResults.filter(r => {
            const rDate = new Date(r.date).toISOString().split('T')[0]
            return rDate === dateStr
        })

        const passed = Number(dayRows.find(r => r.status === 'PASS')?.count || 0)
        const failed = Number(dayRows.find(r => r.status === 'FAIL')?.count || 0)
        const total = dayRows.reduce((acc, r) => acc + Number(r.count), 0)

        dailyTrend.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            passed,
            failed,
            total
        })
    }

    // Calculate test coverage by suite - Optimized query
    const suiteMetrics = await prisma.testSuite.findMany({
        select: {
            title: true,
            testCases: {
                select: {
                    testResults: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                        select: { status: true }
                    }
                }
            }
        },
        take: 10 // Limit to top 10 suites to avoid huge payload
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
