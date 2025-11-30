'use server'

import { prisma } from '@/lib/prisma'
import { analyzeDocument, DocumentAnalysisResult } from '@/lib/ai'
import { generateTestCasesWithCoverage } from '@/lib/ai-enhanced'
import { createJiraClient } from '@/lib/jira'
import { createConfluenceClient } from '@/lib/confluence'
import { getJiraIntegration } from './jira'
import { revalidatePath } from 'next/cache'

/**
 * Analyze a Jira Epic and its stories
 */
export async function analyzeJiraEpic(userId: string, epicKey: string) {
    try {
        const integration = await getJiraIntegration(userId)
        if (!integration) {
            return { success: false, error: 'Jira integration not configured' }
        }

        const client = createJiraClient(integration)

        // Fetch Epic details
        const epic = await client.getIssue(epicKey)
        if (!epic) {
            return { success: false, error: 'Epic not found' }
        }

        // Fetch child issues (Stories)
        const stories = await client.getEpicIssues(epicKey)

        // Construct document content for analysis
        const documentContent = `
Epic: ${epic.fields.summary}
Description: ${epic.fields.description || 'No description'}

Stories (${stories.length}):
${stories.map((s, idx) => `
${idx + 1}. ${s.key}: ${s.fields.summary}
   Description: ${s.fields.description || 'No description'}
   Status: ${s.fields.status.name}
   Priority: ${s.fields.priority?.name || 'Not set'}
`).join('\n')}
`

        // Analyze the document using AI
        const analysis = await analyzeDocument(
            documentContent,
            epic.fields.summary,
            'JIRA_EPIC'
        )

        // Save the analysis to database
        const documentAnalysis = await prisma.documentAnalysis.create({
            data: {
                sourceType: 'JIRA_EPIC',
                sourceId: epicKey,
                sourceTitle: epic.fields.summary,
                sourceContent: documentContent,
                risks: JSON.stringify(analysis.risks),
                gaps: JSON.stringify(analysis.gaps),
                missedRequirements: JSON.stringify(analysis.missedRequirements),
                recommendations: JSON.stringify(analysis.recommendations),
                summary: analysis.summary,
            }
        })

        revalidatePath('/analytics')
        return { success: true, analysisId: documentAnalysis.id, analysis }
    } catch (error) {
        console.error('Failed to analyze Jira Epic:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to analyze document'
        }
    }
}

/**
 * Analyze a Confluence Page
 */
export async function analyzeConfluencePage(userId: string, pageId: string) {
    try {
        const integration = await getJiraIntegration(userId)
        if (!integration) {
            return { success: false, error: 'Integration not configured' }
        }

        const client = createConfluenceClient(integration)

        // Fetch Page Content
        const page = await client.getPage(pageId)
        if (!page) {
            return { success: false, error: 'Page not found' }
        }

        // Strip HTML tags for cleaner analysis (basic cleanup)
        const cleanContent = page.body
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()

        const documentContent = `
Title: ${page.title}

Content:
${cleanContent}
`

        // Analyze the document using AI
        const analysis = await analyzeDocument(
            documentContent,
            page.title,
            'CONFLUENCE_PAGE'
        )

        // Save the analysis to database
        const documentAnalysis = await prisma.documentAnalysis.create({
            data: {
                sourceType: 'CONFLUENCE_PAGE',
                sourceId: pageId,
                sourceTitle: page.title,
                sourceContent: documentContent,
                risks: JSON.stringify(analysis.risks),
                gaps: JSON.stringify(analysis.gaps),
                missedRequirements: JSON.stringify(analysis.missedRequirements),
                recommendations: JSON.stringify(analysis.recommendations),
                summary: analysis.summary,
            }
        })

        revalidatePath('/analytics')
        return { success: true, analysisId: documentAnalysis.id, analysis }
    } catch (error) {
        console.error('Failed to analyze Confluence Page:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to analyze document'
        }
    }
}

/**
 * Get a document analysis by ID
 */
export async function getDocumentAnalysis(analysisId: string) {
    try {
        const analysis = await prisma.documentAnalysis.findUnique({
            where: { id: analysisId },
            include: { testSuite: true }
        })

        if (!analysis) {
            return { success: false, error: 'Analysis not found' }
        }

        return { success: true, analysis }
    } catch (error) {
        console.error('Failed to get document analysis:', error)
        return { success: false, error: 'Failed to retrieve analysis' }
    }
}

/**
 * Get all document analyses
 */
export async function getAllDocumentAnalyses(options?: {
    cursor?: string
    limit?: number
    sourceType?: 'JIRA_EPIC' | 'CONFLUENCE_PAGE'
}) {
    try {
        const { cursor, limit = 20, sourceType } = options || {}

        const analyses = await prisma.documentAnalysis.findMany({
            where: sourceType ? { sourceType } : undefined,
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { analyzedAt: 'desc' },
            include: { testSuite: true }
        })

        return { success: true, analyses }
    } catch (error) {
        console.error('Failed to get document analyses:', error)
        return { success: false, error: 'Failed to retrieve analyses', analyses: [] }
    }
}

/**
 * Generate test cases from a document analysis
 */
export async function generateTestCasesFromAnalysis(analysisId: string) {
    try {
        const analysis = await prisma.documentAnalysis.findUnique({
            where: { id: analysisId }
        })

        if (!analysis) {
            return { success: false, error: 'Analysis not found' }
        }

        // Check if test suite already exists
        if (analysis.testSuiteId) {
            return {
                success: false,
                error: 'Test cases have already been generated for this analysis',
                suiteId: analysis.testSuiteId
            }
        }

        // Reconstruct analysis result object
        const analysisResult: DocumentAnalysisResult = {
            risks: JSON.parse(analysis.risks),
            gaps: JSON.parse(analysis.gaps),
            missedRequirements: JSON.parse(analysis.missedRequirements),
            recommendations: JSON.parse(analysis.recommendations),
            summary: analysis.summary
        }

        // Generate Test Cases with coverage tracking using enhanced AI
        const testCases = await generateTestCasesWithCoverage(
            analysisResult,
            analysis.sourceContent,
            20
        )

        // Create Test Suite with traceability link
        const suite = await prisma.testSuite.create({
            data: {
                title: `Analysis-Based: ${analysis.sourceTitle}`,
                description: `Generated from analysis of ${analysis.sourceType === 'JIRA_EPIC' ? 'Jira Epic' : 'Confluence Page'} ${analysis.sourceId}. This test suite addresses identified risks, gaps, and missed requirements.`,
                // Add traceability: if source is Jira Epic, link it
                ...(analysis.sourceType === 'JIRA_EPIC' ? { jiraEpicKey: analysis.sourceId } : {})
            }
        })

        // Save Test Cases with coverage tracking
        for (const tc of testCases) {
            await prisma.testCase.create({
                data: {
                    title: tc.title,
                    description: tc.description,
                    steps: JSON.stringify(tc.steps.split('\n')),
                    expectedResult: tc.expectedResult,
                    priority: tc.priority,
                    suiteId: suite.id,
                    status: 'ACTIVE',
                    // Add requirements coverage tracking
                    coversRisks: JSON.stringify(tc.coversRisks || []),
                    coversGaps: JSON.stringify(tc.coversGaps || []),
                    coversRequirements: JSON.stringify(tc.coversRequirements || [])
                }
            })
        }

        // Link the test suite to the analysis
        await prisma.documentAnalysis.update({
            where: { id: analysisId },
            data: { testSuiteId: suite.id }
        })

        revalidatePath('/test-cases')
        revalidatePath('/test-suites')
        revalidatePath('/analytics')

        return { success: true, suiteId: suite.id, count: testCases.length }
    } catch (error) {
        console.error('Failed to generate test cases from analysis:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate test cases'
        }
    }
}

/**
 * Delete a document analysis
 */
export async function deleteDocumentAnalysis(analysisId: string) {
    try {
        await prisma.documentAnalysis.delete({
            where: { id: analysisId }
        })

        revalidatePath('/analytics')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete document analysis:', error)
        return { success: false, error: 'Failed to delete analysis' }
    }
}
