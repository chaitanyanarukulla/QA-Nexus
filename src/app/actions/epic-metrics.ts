'use server'

import { prisma } from '@/lib/prisma'
import { getJiraIntegration } from './jira'
import { createJiraClient } from '@/lib/jira'

export async function getEpicMetrics(userId: string, suiteId: string, epicKey: string) {
    // 1. Fetch Epic from Jira
    const integration = await getJiraIntegration(userId)
    let epicDetails = null
    if (integration) {
        const client = createJiraClient(integration)
        epicDetails = await client.getIssue(epicKey)
    }

    // 2. Fetch Test Cases & Results
    const suite = await prisma.testSuite.findUnique({
        where: { id: suiteId },
        include: {
            testCases: {
                include: {
                    testResults: {
                        orderBy: { createdAt: 'desc' },
                        take: 1 // Latest result
                    }
                }
            }
        }
    })

    if (!suite) return { success: false, error: 'Suite not found' }

    // 3. Calculate Metrics
    const totalCases = suite.testCases.length
    let passed = 0
    let failed = 0
    let pending = 0
    let blocked = 0
    let skipped = 0

    suite.testCases.forEach((tc: any) => {
        const lastResult = tc.testResults[0]
        if (!lastResult) {
            pending++
        } else {
            if (lastResult.status === 'PASS') passed++
            else if (lastResult.status === 'FAIL') failed++
            else if (lastResult.status === 'BLOCKED') blocked++
            else if (lastResult.status === 'SKIPPED') skipped++
            else pending++
        }
    })

    return {
        success: true,
        epic: epicDetails,
        metrics: {
            total: totalCases,
            passed,
            failed,
            pending,
            blocked,
            skipped,
            passRate: totalCases > 0 ? Math.round((passed / totalCases) * 100) : 0
        }
    }
}
