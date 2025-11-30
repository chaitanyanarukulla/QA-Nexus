'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getTestSuites(options?: {
    cursor?: string
    limit?: number
}) {
    const { cursor, limit = 30 } = options || {}

    return await prisma.testSuite.findMany({
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
            testCases: {
                include: {
                    testResults: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                        select: { status: true }
                    }
                }
            },
        },
        orderBy: { createdAt: 'desc' },
    })
}

export async function getTestSuitesCount() {
    return await prisma.testSuite.count()
}

export async function createTestSuite(data: {
    title: string
    description?: string
}) {
    const testSuite = await prisma.testSuite.create({
        data: {
            title: data.title,
            description: data.description,
        },
    })

    revalidatePath('/test-suites')
    return testSuite
}

export async function addTestCaseToSuite(testCaseId: string, suiteId: string) {
    const testCase = await prisma.testCase.update({
        where: { id: testCaseId },
        data: { suiteId },
    })

    revalidatePath('/test-cases')
    return testCase
}

export async function deleteTestSuite(id: string) {
    // Unlink test cases
    await prisma.testCase.updateMany({
        where: { suiteId: id },
        data: { suiteId: null }
    })

    const testSuite = await prisma.testSuite.delete({
        where: { id },
    })

    revalidatePath('/test-suites')
    return testSuite
}
