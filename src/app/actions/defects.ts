'use server'

import { prisma } from '@/lib/prisma'
import { DefectStatus } from '@/types'
import { revalidatePath } from 'next/cache'
import { createDefectSchema, updateDefectStatusSchema, paginationSchema } from '@/lib/validation'
import { z } from 'zod'

export async function getDefects(options?: {
    cursor?: string
    limit?: number
    status?: DefectStatus
}) {
    const validatedOptions = paginationSchema.parse(options || {})
    const { cursor, limit = 50 } = validatedOptions
    const { status } = options || {}

    return await prisma.defect.findMany({
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where: status ? { status } : undefined,
        include: {
            testResult: {
                include: {
                    testCase: true,
                    testRun: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })
}

export async function getDefectsCount(status?: DefectStatus) {
    return await prisma.defect.count({
        where: status ? { status } : undefined
    })
}

export async function createDefect(rawData: unknown) {
    try {
        const data = createDefectSchema.parse(rawData)

        const defect = await prisma.defect.create({
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority,
                status: 'OPEN',
                testResultId: data.testResultId,
                jiraIssueId: data.jiraIssueId,
            },
        })

        revalidatePath('/defects')
        if (data.testResultId) {
            const result = await prisma.testResult.findUnique({
                where: { id: data.testResultId },
                select: { testRunId: true }
            })
            if (result) {
                revalidatePath(`/test-runs/${result.testRunId}`)
            }
        }
        return { success: true, data: defect }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0]?.message || 'Validation error' }
        }
        return { success: false, error: 'Failed to create defect' }
    }
}

export async function updateDefectStatus(id: string, rawStatus: unknown) {
    try {
        z.string().cuid().parse(id)
        const { status } = updateDefectStatusSchema.parse({ status: rawStatus })

        const defect = await prisma.defect.update({
            where: { id },
            data: { status },
        })

        revalidatePath('/defects')
        return { success: true, data: defect }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0]?.message || 'Validation error' }
        }
        return { success: false, error: 'Failed to update defect status' }
    }
}

export async function deleteDefect(id: string) {
    try {
        z.string().cuid().parse(id)

        const defect = await prisma.defect.delete({
            where: { id },
        })
        revalidatePath('/defects')
        return { success: true, data: defect }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0]?.message || 'Validation error' }
        }
        return { success: false, error: 'Failed to delete defect' }
    }
}
