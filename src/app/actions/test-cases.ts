'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createTestCaseSchema, updateTestCaseSchema, paginationSchema } from '@/lib/utils/validation'
import { z } from 'zod'

export async function getTestCases(options?: {
    cursor?: string
    limit?: number
}) {
    // Validate pagination options
    const validatedOptions = paginationSchema.parse(options || {})
    const { cursor, limit = 50 } = validatedOptions

    return await prisma.testCase.findMany({
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            testResults: {
                take: 1,
                orderBy: { createdAt: 'desc' },
                select: {
                    status: true,
                    createdAt: true
                }
            }
        }
    })
}

export async function getTestCasesCount() {
    return await prisma.testCase.count()
}

export async function createTestCase(rawData: unknown) {
    try {
        // Validate input data
        const data = createTestCaseSchema.parse(rawData)

        const testCase = await prisma.testCase.create({
            data: {
                title: data.title,
                description: data.description,
                steps: data.steps,
                expectedResult: data.expectedResult,
                priority: data.priority,
                status: data.status,
            },
        })

        revalidatePath('/test-cases')
        return { success: true, data: testCase }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0]?.message || 'Validation error' }
        }
        return { success: false, error: 'Failed to create test case' }
    }
}

export async function updateTestCase(id: string, rawData: unknown) {
    try {
        // Validate ID
        z.string().cuid().parse(id)

        // Validate update data
        const data = updateTestCaseSchema.parse(rawData)

        const testCase = await prisma.testCase.update({
            where: { id },
            data,
        })
        revalidatePath('/test-cases')
        return { success: true, data: testCase }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0]?.message || 'Validation error' }
        }
        return { success: false, error: 'Failed to update test case' }
    }
}

export async function deleteTestCase(id: string) {
    try {
        // Validate ID
        z.string().cuid().parse(id)

        await prisma.testResult.deleteMany({
            where: { testCaseId: id }
        })
        const testCase = await prisma.testCase.delete({
            where: { id },
        })
        revalidatePath('/test-cases')
        return { success: true, data: testCase }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0]?.message || 'Validation error' }
        }
        return { success: false, error: 'Failed to delete test case' }
    }
}
