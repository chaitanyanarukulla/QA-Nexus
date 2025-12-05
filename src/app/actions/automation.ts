'use server'

import { prisma } from '@/lib/prisma'
import { generatePlaywrightTestSuite, suggestAutomationPriority } from '@/lib/ai/ai-automation'
import { revalidatePath } from 'next/cache'

/**
 * Generate Playwright tests for a test suite
 */
export async function generateAutomationForSuite(suiteId: string, baseUrl: string = 'http://localhost:3000') {
    try {
        const suite = await prisma.testSuite.findUnique({
            where: { id: suiteId },
            include: {
                testCases: {
                    where: { status: 'ACTIVE' },
                    orderBy: { createdAt: 'asc' }
                }
            }
        })

        if (!suite) {
            return { success: false, error: 'Test suite not found' }
        }

        if (suite.testCases.length === 0) {
            return { success: false, error: 'Test suite has no test cases' }
        }

        // Generate the Playwright test file
        const testFileContent = await generatePlaywrightTestSuite(
            suite.testCases,
            suite.title,
            baseUrl
        )

        // Generate filename
        const fileName = suite.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')

        // Mark test cases as automated
        await prisma.testCase.updateMany({
            where: { suiteId: suite.id },
            data: { isAutomated: true }
        })

        revalidatePath(`/test-suites/${suiteId}`)
        revalidatePath('/test-cases')

        return {
            success: true,
            fileName: `${fileName}.spec.ts`,
            content: testFileContent,
            testCaseCount: suite.testCases.length
        }
    } catch (error) {
        console.error('Failed to generate automation:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate automation'
        }
    }
}

/**
 * Check if suite is ready for automation (all tests passed)
 */
export async function checkAutomationReadiness(suiteId: string) {
    try {
        // Get the most recent test run for this suite
        const testRun = await prisma.testRun.findFirst({
            where: {
                results: {
                    some: {
                        testCase: {
                            suiteId: suiteId
                        }
                    }
                }
            },
            include: {
                results: {
                    include: {
                        testCase: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        if (!testRun) {
            return {
                success: true,
                ready: false,
                reason: 'No test runs found for this suite',
                passRate: 0
            }
        }

        // Filter results for this suite
        const suiteResults = testRun.results.filter((r: any) => r.testCase.suiteId === suiteId)
        const totalTests = suiteResults.length
        const passedTests = suiteResults.filter((r: any) => r.status === 'PASS').length
        const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0

        const ready = passRate === 100 && totalTests > 0

        return {
            success: true,
            ready,
            passRate,
            totalTests,
            passedTests,
            reason: ready
                ? 'All tests passed - ready for automation!'
                : passRate === 0
                    ? 'No tests have passed yet'
                    : `${passedTests}/${totalTests} tests passed (${passRate.toFixed(1)}%)`
        }
    } catch (error) {
        console.error('Failed to check automation readiness:', error)
        return {
            success: false,
            ready: false,
            error: 'Failed to check readiness'
        }
    }
}

/**
 * Get automation suggestions for a suite
 */
export async function getAutomationSuggestions(suiteId: string) {
    try {
        const suite = await prisma.testSuite.findUnique({
            where: { id: suiteId },
            include: {
                testCases: {
                    where: { status: 'ACTIVE' },
                    select: {
                        id: true,
                        title: true,
                        priority: true,
                        steps: true
                    }
                }
            }
        })

        if (!suite) {
            return { success: false, error: 'Suite not found' }
        }

        const suggestions = await suggestAutomationPriority(suite.testCases)

        return { success: true, suggestions }
    } catch (error) {
        console.error('Failed to get automation suggestions:', error)
        return { success: false, error: 'Failed to get suggestions', suggestions: [] }
    }
}

/**
 * Mark test cases as automated
 */
export async function markTestCasesAutomated(testCaseIds: string[], automationId?: string) {
    try {
        await prisma.testCase.updateMany({
            where: { id: { in: testCaseIds } },
            data: {
                isAutomated: true,
                ...(automationId ? { automationId } : {})
            }
        })

        revalidatePath('/test-cases')
        return { success: true }
    } catch (error) {
        console.error('Failed to mark tests as automated:', error)
        return { success: false, error: 'Failed to update test cases' }
    }
}
