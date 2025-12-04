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
            risks: JSON.parse(analysis.risks as string),
            gaps: JSON.parse(analysis.gaps as string),
            missedRequirements: JSON.parse(analysis.missedRequirements as string),
            recommendations: JSON.parse(analysis.recommendations as string),
            summary: analysis.summary
        }

        // Generate Test Cases with coverage tracking using enhanced AI
        const testCases = await generateTestCasesWithCoverage(
            analysisResult,
            analysis.sourceContent,
            30
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

/**
 * Chat with a document analysis
 */
export async function chatWithAnalysis(
    analysisId: string,
    message: string,
    history: Array<{ role: 'user' | 'assistant', content: string }>
) {
    try {
        const analysis = await prisma.documentAnalysis.findUnique({
            where: { id: analysisId }
        })

        if (!analysis) {
            return { success: false, error: 'Analysis not found' }
        }

        // Construct context from analysis
        const context = `
Document Title: ${analysis.sourceTitle}
Source Type: ${analysis.sourceType}

Original Content:
${analysis.sourceContent.substring(0, 10000)}... (truncated)

Analysis Summary:
${analysis.summary}

Identified Risks:
${analysis.risks}

Identified Gaps:
${analysis.gaps}
`

        // Prepare messages for AI
        const messages: any[] = [
            {
                role: 'system',
                content: `You are a helpful QA Assistant. You are answering questions about a requirements document and its analysis.
Use the provided context to answer the user's question accurately.
If the answer is not in the context, say so politely.
Keep answers concise and relevant to QA/Testing.`
            },
            {
                role: 'user',
                content: `Context:\n${context}`
            },
            ...history.map(m => ({ role: m.role, content: m.content })),
            {
                role: 'user',
                content: message
            }
        ]

        // Import chatCompletion dynamically to avoid circular deps if any, or just use the one imported at top
        // We already imported analyzeDocument, let's check if chatCompletion is exported from lib/ai
        // It is exported.
        const { chatCompletion } = await import('@/lib/ai')

        const response = await chatCompletion(messages, { temperature: 0.7 })

        return { success: true, message: response }
    } catch (error) {
        console.error('Failed to chat with analysis:', error)
        return { success: false, error: 'Failed to process message' }
    }
}

/**
 * Create a Jira ticket from an analysis item
 */
export async function createJiraTicketFromAnalysis(
    userId: string,
    analysisId: string,
    itemType: 'RISK' | 'GAP' | 'MISSED_REQ',
    itemData: { title: string, description: string, priority?: string }
) {
    try {
        const integration = await getJiraIntegration(userId)
        if (!integration) {
            return { success: false, error: 'Jira integration not configured' }
        }

        const client = createJiraClient(integration)

        // Fetch analysis to get project key if possible, or use default
        const analysis = await prisma.documentAnalysis.findUnique({
            where: { id: analysisId }
        })

        if (!analysis) {
            return { success: false, error: 'Analysis not found' }
        }

        // Determine project key. If source is Jira Epic, use that project.
        // Otherwise, we might need a default project or ask user.
        // For now, let's try to extract from sourceId if it looks like a key (PROJ-123)
        let projectKey = ''
        if (analysis.sourceType === 'JIRA_EPIC') {
            projectKey = analysis.sourceId.split('-')[0]
        } else {
            // Fallback: Try to find a project from the user's integration or recent issues
            // This is a simplification. Ideally we should pass projectKey from UI.
            // For this MVP, let's assume we can't easily guess if not Jira Epic, 
            // so we might fail or need to ask user.
            // Let's try to fetch one project to use as default
            // Or better, let's require projectKey to be passed if we want to be robust.
            // But to keep it simple as per plan, let's try to use the first project available.
            // Actually, let's just error if we can't determine it, or maybe the UI should have a project selector?
            // The plan didn't specify project selector.
            // Let's try to get the first project from Jira.
            // const projects = await client.getProjects() // Assuming this method exists
            // For now, let's assume 'KAN' or 'PROJ' or fail gracefully.
            return { success: false, error: 'Cannot determine Jira Project. Please configure a default project.' }
        }

        const summary = `[${itemType}] ${itemData.title}`
        const description = `${itemData.description}\n\nGenerated from Document Analysis: ${analysis.sourceTitle}`

        // Map priority
        // Jira priorities are usually High, Medium, Low.
        // Our analysis uses CRITICAL, HIGH, MEDIUM, LOW.
        let jiraPriority = 'Medium'
        if (itemData.priority) {
            if (itemData.priority === 'CRITICAL' || itemData.priority === 'HIGH') jiraPriority = 'High'
            else if (itemData.priority === 'LOW') jiraPriority = 'Low'
        }

        const issue = await client.createIssue({
            projectKey,
            summary,
            description,
            issueType: 'Task',
            priority: jiraPriority
        })

        if (!issue) {
            throw new Error('Failed to create Jira issue (no response)')
        }

        return { success: true, issueKey: issue.key, issueId: issue.id }
    } catch (error) {
        console.error('Failed to create Jira ticket:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create Jira ticket'
        }
    }
}
