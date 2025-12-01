'use server'

import { prisma } from '@/lib/prisma'

export async function getAnalyticsData() {
    try {
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        // Test Run History (Last 30 days)
        const testRuns = await prisma.testRun.findMany({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo
                }
            },
            include: {
                results: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        const runHistory = testRuns.map(run => {
            const passed = run.results.filter(r => r.status === 'PASS').length
            const failed = run.results.filter(r => r.status === 'FAIL').length
            const blocked = run.results.filter(r => r.status === 'BLOCKED').length
            const skipped = run.results.filter(r => r.status === 'SKIPPED').length

            return {
                date: run.createdAt.toISOString().split('T')[0],
                passed,
                failed,
                blocked,
                skipped,
                total: run.results.length,
                passRate: run.results.length > 0 ? Math.round((passed / run.results.length) * 100) : 0
            }
        })

        // Aggregate by date
        const historyByDate = runHistory.reduce((acc, curr) => {
            const existing = acc.find(item => item.date === curr.date)
            if (existing) {
                existing.passed += curr.passed
                existing.failed += curr.failed
                existing.blocked += curr.blocked
                existing.skipped += curr.skipped
                existing.total += curr.total
            } else {
                acc.push(curr)
            }
            return acc
        }, [] as any[])

        // Calculate pass rate for each day
        historyByDate.forEach(day => {
            day.passRate = day.total > 0 ? Math.round((day.passed / day.total) * 100) : 0
        })

        // Defect Stats
        const defects = await prisma.defect.findMany({
            include: {
                testResult: true
            }
        })

        const defectsByPriority = {
            LOW: defects.filter(d => d.priority === 'LOW').length,
            MEDIUM: defects.filter(d => d.priority === 'MEDIUM').length,
            HIGH: defects.filter(d => d.priority === 'HIGH').length,
            CRITICAL: defects.filter(d => d.priority === 'CRITICAL').length,
        }

        const defectsByStatus = {
            OPEN: defects.filter(d => d.status === 'OPEN').length,
            IN_PROGRESS: defects.filter(d => d.status === 'IN_PROGRESS').length,
            RESOLVED: defects.filter(d => d.status === 'RESOLVED').length,
            CLOSED: defects.filter(d => d.status === 'CLOSED').length,
        }

        // Test Case Stats
        const totalTestCases = await prisma.testCase.count()
        const automatedTestCases = await prisma.testCase.count({
            where: { isAutomated: true }
        })

        // Test Results Distribution
        const allResults = await prisma.testResult.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo }
            }
        })

        const resultsDistribution = {
            PASS: allResults.filter(r => r.status === 'PASS').length,
            FAIL: allResults.filter(r => r.status === 'FAIL').length,
            BLOCKED: allResults.filter(r => r.status === 'BLOCKED').length,
            SKIPPED: allResults.filter(r => r.status === 'SKIPPED').length,
            PENDING: allResults.filter(r => r.status === 'PENDING').length,
        }

        // Test Velocity (tests executed per day)
        const testsLast7Days = allResults.filter(r => new Date(r.createdAt) >= sevenDaysAgo).length
        const testsLast30Days = allResults.length
        const avgTestsPerDay = Math.round(testsLast30Days / 30)
        const recentAvgTestsPerDay = Math.round(testsLast7Days / 7)

        // Quality Score (based on pass rate, automation, and defect resolution)
        const overallPassRate = allResults.length > 0
            ? Math.round((resultsDistribution.PASS / allResults.length) * 100)
            : 0
        const automationRate = totalTestCases > 0
            ? Math.round((automatedTestCases / totalTestCases) * 100)
            : 0
        const defectResolutionRate = defects.length > 0
            ? Math.round(((defectsByStatus.RESOLVED + defectsByStatus.CLOSED) / defects.length) * 100)
            : 0

        const qualityScore = Math.round((overallPassRate * 0.5) + (automationRate * 0.3) + (defectResolutionRate * 0.2))

        // Test Coverage by Priority
        const testCasesByPriority = await prisma.testCase.groupBy({
            by: ['priority'],
            _count: true
        })

        const priorityDistribution = testCasesByPriority.reduce((acc, curr) => {
            acc[curr.priority] = curr._count
            return acc
        }, {} as Record<string, number>)

        // Top Failing Test Cases
        const failingTests = await prisma.testResult.groupBy({
            by: ['testCaseId'],
            where: {
                status: 'FAIL',
                createdAt: { gte: thirtyDaysAgo }
            },
            _count: true,
            orderBy: {
                _count: { testCaseId: 'desc' }
            },
            take: 5
        })

        const topFailingTestCases = await Promise.all(
            failingTests.map(async (ft) => {
                const testCase = await prisma.testCase.findUnique({
                    where: { id: ft.testCaseId }
                })
                return {
                    id: ft.testCaseId,
                    title: testCase?.title || 'Unknown',
                    failCount: ft._count,
                    priority: testCase?.priority || 'MEDIUM'
                }
            })
        )

        return {
            success: true,
            data: {
                history: historyByDate,
                defectsByPriority,
                defectsByStatus,
                resultsDistribution,
                automation: {
                    total: totalTestCases,
                    automated: automatedTestCases,
                    manual: totalTestCases - automatedTestCases,
                    automationRate
                },
                velocity: {
                    avgPerDay: avgTestsPerDay,
                    recentAvgPerDay: recentAvgTestsPerDay,
                    last7Days: testsLast7Days,
                    last30Days: testsLast30Days
                },
                quality: {
                    score: qualityScore,
                    passRate: overallPassRate,
                    automationRate,
                    defectResolutionRate
                },
                priorityDistribution,
                topFailingTests: topFailingTestCases
            }
        }
    } catch (error) {
        console.error('Failed to fetch analytics:', error)
        return { success: false, error: 'Failed to fetch analytics data' }
    }
}

export async function getRecentActivity(limit: number = 20) {
    try {
        // Fetch recent activity logs
        const activities = await prisma.activityLog.findMany({
            take: limit,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        return {
            success: true,
            activities: activities.map(activity => ({
                id: activity.id,
                action: activity.action,
                entityType: activity.entityType,
                entityId: activity.entityId,
                entityTitle: activity.entityTitle,
                userName: activity.user.name || activity.user.email,
                createdAt: activity.createdAt,
                changes: activity.changes ? JSON.parse(activity.changes) : null
            }))
        }
    } catch (error) {
        console.error('Failed to fetch recent activity:', error)
        return { success: false, error: 'Failed to fetch recent activity' }
    }
}

export async function getAIInsightsSummary() {
    try {
        // Fetch top AI insights (flaky tests, high failure risk)
        const insights = await prisma.aIInsight.findMany({
            where: {
                isResolved: false
            },
            orderBy: [
                { severity: 'desc' },
                { confidence: 'desc' }
            ],
            take: 10,
            include: {
                testCase: {
                    select: {
                        id: true,
                        title: true,
                        priority: true
                    }
                }
            }
        })

        const criticalCount = insights.filter(i => i.severity === 'CRITICAL').length
        const highCount = insights.filter(i => i.severity === 'HIGH').length
        const flakyTestsCount = insights.filter(i => i.type === 'FLAKY_TEST').length
        const highRiskCount = insights.filter(i => i.type === 'HIGH_FAILURE_RISK').length

        return {
            success: true,
            summary: {
                total: insights.length,
                critical: criticalCount,
                high: highCount,
                flakyTests: flakyTestsCount,
                highRisk: highRiskCount
            },
            topInsights: insights.map(insight => ({
                id: insight.id,
                type: insight.type,
                severity: insight.severity,
                title: insight.title,
                description: insight.description,
                testCase: insight.testCase ? {
                    id: insight.testCase.id,
                    title: insight.testCase.title,
                    priority: insight.testCase.priority
                } : null,
                confidence: insight.confidence,
                createdAt: insight.createdAt
            }))
        }
    } catch (error) {
        console.error('Failed to fetch AI insights:', error)
        return { success: false, error: 'Failed to fetch AI insights' }
    }
}
