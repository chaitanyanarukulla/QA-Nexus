'use server'

import { generateTestCases, generateApiAssertions, generateApiRequest } from '@/lib/ai/ai'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createTestCase } from './test-cases'
import { Priority } from '@/types'

export async function generateAndSaveTestCases(data: {
    requirement: string
    includeEdgeCases: boolean
    includeNegativeCases: boolean
    count: number
    autoSave: boolean
}) {
    try {
        // Generate test cases using AI
        const generatedCases = await generateTestCases(data.requirement, {
            includeEdgeCases: data.includeEdgeCases,
            includeNegativeCases: data.includeNegativeCases,
            count: data.count,
        })

        // If autoSave is true, save them to the database
        if (data.autoSave) {
            const savedCases = await Promise.all(
                generatedCases.map((testCase) =>
                    createTestCase({
                        title: testCase.title,
                        description: testCase.description,
                        steps: testCase.steps,
                        expectedResult: testCase.expectedResult,
                        priority: testCase.priority as Priority,
                        status: 'ACTIVE' as const,
                    })
                )
            )
            return { success: true, testCases: savedCases, generated: generatedCases }
        }

        // Otherwise, just return the generated cases for preview
        return { success: true, testCases: [], generated: generatedCases }
    } catch (error) {
        console.error('Error in generateAndSaveTestCases:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate test cases',
            testCases: [],
            generated: [],
        }
    }
}

export async function generateAssertionsForRequest(responseBody: string, statusCode: number) {
    try {
        const assertions = await generateApiAssertions(responseBody, statusCode)
        return { success: true, assertions }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function generateRequestFromPrompt(prompt: string, collectionId: string, userId: string) {
    try {
        const generated = await generateApiRequest(prompt)

        const request = await prisma.apiRequest.create({
            data: {
                title: generated.title,
                description: generated.description,
                method: generated.method as any,
                url: generated.url,
                headers: generated.headers || {},
                queryParams: generated.queryParams || {},
                body: generated.body ? JSON.stringify(generated.body) : null,
                bodyType: generated.body ? 'JSON' : 'NONE',
                collectionId,
                createdBy: userId
            }
        })

        revalidatePath('/api-testing')
        return { success: true, request }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
