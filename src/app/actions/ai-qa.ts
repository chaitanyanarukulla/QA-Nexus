'use server'

import { answerQuestion } from '@/lib/ai/ai'
import { prisma } from '@/lib/prisma'

export async function askAI(question: string) {
    try {
        // Fetch context data
        // In a real app, we would use RAG or vector search here
        // For now, we fetch recent items to provide context
        const [testCases, testRuns, defects] = await Promise.all([
            prisma.testCase.findMany({
                take: 10,
                orderBy: { updatedAt: 'desc' },
                select: { title: true, priority: true, status: true },
            }),
            prisma.testRun.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { title: true, status: true },
            }),
            prisma.defect.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: { title: true, priority: true, status: true },
            }),
        ])

        const answer = await answerQuestion(question, {
            testCases,
            testRuns,
            defects,
        })

        return { success: true, answer }
    } catch (error) {
        console.error('Error in askAI:', error)
        return { success: false, error: 'Failed to get answer' }
    }
}
