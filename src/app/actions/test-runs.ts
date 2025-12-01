'use server'

import { prisma } from '@/lib/prisma'
import { RunStatus, ResultStatus } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getTestRuns() {
    return await prisma.testRun.findMany({
        include: {
            user: true,
            results: {
                include: {
                    testCase: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })
}

export async function getTestRun(id: string) {
    return await prisma.testRun.findUnique({
        where: { id },
        include: {
            user: true,
            results: {
                include: {
                    testCase: true,
                },
                orderBy: { createdAt: 'asc' } // Or by some other order
            },
        },
    })
}

export async function createTestRun(data: {
    title: string
    userId: string
    testCaseIds: string[]
}) {
    try {
        const testRun = await prisma.testRun.create({
            data: {
                title: data.title,
                status: RunStatus.PENDING,
                userId: data.userId,
                results: {
                    create: data.testCaseIds.map((id) => ({
                        testCaseId: id,
                        status: ResultStatus.PENDING,
                    })),
                },
            },
        })
        revalidatePath('/test-runs')
        return testRun
    } catch (e) {
        console.error('Error creating test run:', e)
        throw e
    }
}

export async function updateTestResult(data: {
    resultId: string
    status: ResultStatus
    notes?: string
    evidence?: string
}) {
    const result = await prisma.testResult.update({
        where: { id: data.resultId },
        data: {
            status: data.status,
            notes: data.notes,
            evidence: data.evidence,
        },
    })

    // Auto-update test run status based on all results
    await updateTestRunStatusBasedOnResults(result.testRunId)

    revalidatePath('/test-runs')
    revalidatePath(`/test-runs/${result.testRunId}`)
    return result
}

/**
 * Automatically update test run status based on all test results
 */
async function updateTestRunStatusBasedOnResults(testRunId: string) {
    const testRun = await prisma.testRun.findUnique({
        where: { id: testRunId },
        include: { results: true }
    })

    if (!testRun) return

    // Don't auto-update if paused
    if (testRun.status === RunStatus.PAUSED) return

    const allResults = testRun.results
    const pendingCount = allResults.filter(r => r.status === ResultStatus.PENDING).length
    const failedCount = allResults.filter(r => r.status === ResultStatus.FAIL).length
    const blockedCount = allResults.filter(r => r.status === ResultStatus.BLOCKED).length

    let newStatus: RunStatus

    if (pendingCount === allResults.length) {
        newStatus = RunStatus.PENDING
    } else if (pendingCount > 0) {
        newStatus = RunStatus.IN_PROGRESS
    } else if (failedCount > 0 || blockedCount > 0) {
        newStatus = RunStatus.FAILED
    } else {
        newStatus = RunStatus.COMPLETED
    }

    if (testRun.status !== newStatus) {
        await prisma.testRun.update({
            where: { id: testRunId },
            data: { status: newStatus }
        })
    }
}

/**
 * Pause a test run execution
 */
export async function pauseTestRun(testRunId: string) {
    const testRun = await prisma.testRun.update({
        where: { id: testRunId },
        data: { status: RunStatus.PAUSED }
    })
    revalidatePath('/test-runs')
    revalidatePath(`/test-runs/${testRunId}`)
    return testRun
}

/**
 * Resume a paused test run
 */
export async function resumeTestRun(testRunId: string) {
    const testRun = await prisma.testRun.findUnique({
        where: { id: testRunId },
        include: { results: true }
    })

    if (!testRun) throw new Error('Test run not found')

    const pendingCount = testRun.results.filter(r => r.status === ResultStatus.PENDING).length
    const newStatus = pendingCount > 0 ? RunStatus.IN_PROGRESS : RunStatus.COMPLETED

    const updated = await prisma.testRun.update({
        where: { id: testRunId },
        data: { status: newStatus }
    })

    revalidatePath('/test-runs')
    revalidatePath(`/test-runs/${testRunId}`)
    return updated
}

export async function updateTestRunStatus(testRunId: string, status: RunStatus) {
    const testRun = await prisma.testRun.update({
        where: { id: testRunId },
        data: { status },
    })

    revalidatePath('/test-runs')
    return testRun
}

export async function createQuickRun(userId: string, testCaseId: string) {
    const testCase = await prisma.testCase.findUnique({ where: { id: testCaseId } })
    if (!testCase) throw new Error('Test Case not found')

    const testRun = await prisma.testRun.create({
        data: {
            title: `Quick Run: ${testCase.title}`,
            status: RunStatus.IN_PROGRESS,
            userId: userId,
            results: {
                create: [{
                    testCaseId: testCaseId,
                    status: ResultStatus.PENDING,
                }],
            },
        },
    })
    revalidatePath('/test-runs')
    return testRun
}

export async function createTestRunFromSuite(userId: string, suiteId: string) {
    const suite = await prisma.testSuite.findUnique({
        where: { id: suiteId },
        include: { testCases: true }
    })

    if (!suite) throw new Error('Test Suite not found')
    if (suite.testCases.length === 0) throw new Error('Test Suite has no test cases')

    const testRun = await prisma.testRun.create({
        data: {
            title: `Run: ${suite.title}`,
            status: RunStatus.IN_PROGRESS,
            userId: userId,
            results: {
                create: suite.testCases.map(tc => ({
                    testCaseId: tc.id,
                    status: ResultStatus.PENDING,
                }))
            }
        }
    })

    revalidatePath('/test-runs')
    return testRun
}

export async function deleteTestRun(id: string) {
    // Delete results first
    await prisma.testResult.deleteMany({
        where: { testRunId: id }
    })

    const testRun = await prisma.testRun.delete({
        where: { id },
    })

    revalidatePath('/test-runs')
    return testRun
}
