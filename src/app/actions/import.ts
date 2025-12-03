'use server'

import { getJiraIntegration } from './jira'
import { createJiraClient } from '@/lib/jira'
import { createConfluenceClient } from '@/lib/confluence'
import { generateTestCases } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

export async function getJiraEpics(userId: string, projectKey: string) {
    const integration = await getJiraIntegration(userId)
    if (!integration) return { success: false, error: 'Jira integration not configured' }

    const client = createJiraClient(integration)
    const epics = await client.getEpics(projectKey)
    return { success: true, epics }
}

export async function searchConfluencePages(userId: string, query: string) {
    const integration = await getJiraIntegration(userId)
    if (!integration) return { success: false, error: 'Integration not configured' }

    const client = createConfluenceClient(integration)

    // If query is empty, fetch recent pages
    const cql = query
        ? `type=page AND title ~ "${query}"`
        : `type=page order by lastModified desc`

    // We need to expose a method in client that accepts raw CQL or modify searchPages
    // Let's modify the client usage here. 
    // Wait, searchPages takes a query string and constructs CQL: `type=page AND title ~ "${query}"`
    // I should update the client to be more flexible or update the action to pass the full CQL if I change the client.

    // Let's update the client first.
    // Actually, I can just update the client to handle the logic.
    const pages = await client.searchPages(query)
    return { success: true, pages }
}

export async function generateTestPlanFromEpic(userId: string, epicKey: string) {
    const integration = await getJiraIntegration(userId)
    if (!integration) return { success: false, error: 'Integration not configured' }

    const client = createJiraClient(integration)

    // Fetch Epic details
    const epic = await client.getIssue(epicKey)
    if (!epic) return { success: false, error: 'Epic not found' }

    // Fetch child issues (Stories)
    const stories = await client.getEpicIssues(epicKey)

    // Construct context for AI
    const context = `
Epic: ${epic.fields.summary}
Description: ${epic.fields.description || 'No description'}

Stories:
${stories.map((s: any) => `- ${s.key}: ${s.fields.summary}`).join('\n')}
`

    // Generate Test Cases using AI
    try {
        const testCases = await generateTestCases(context, { count: 15 })

        // Create Test Suite
        const suite = await prisma.testSuite.create({
            data: {
                title: `Test Plan: ${epic.fields.summary}`,
                description: `Generated from Epic ${epicKey}`,
                jiraEpicKey: epicKey,
            }
        })

        // Save Test Cases
        for (const tc of testCases) {
            await prisma.testCase.create({
                data: {
                    title: tc.title,
                    description: tc.description,
                    steps: JSON.stringify(tc.steps.split('\n')), // Simple split for now
                    expectedResult: tc.expectedResult,
                    priority: tc.priority,
                    suiteId: suite.id,
                    status: 'ACTIVE'
                }
            })
        }

        return { success: true, suiteId: suite.id, count: testCases.length }
    } catch (error) {
        console.error('Failed to generate test plan:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: `Failed to generate test plan: ${errorMessage}` }
    }
}

export async function generateTestCasesFromPage(userId: string, pageId: string) {
    const integration = await getJiraIntegration(userId)
    if (!integration) return { success: false, error: 'Integration not configured' }

    const client = createConfluenceClient(integration)

    // Fetch Page Content
    const page = await client.getPage(pageId)
    if (!page) return { success: false, error: 'Page content not found' }

    // Generate Test Cases
    try {
        // We might need to truncate content if it's too long for LLM context
        const truncatedContent = page.body.substring(0, 15000) // ~4k tokens safety buffer

        const testCases = await generateTestCases(truncatedContent, { count: 15 })

        // Save Test Cases
        const suite = await prisma.testSuite.create({
            data: {
                title: `Confluence: ${page.title}`,
                description: `Generated from Confluence Page ${pageId}`,
            }
        })

        for (const tc of testCases) {
            await prisma.testCase.create({
                data: {
                    title: tc.title,
                    description: tc.description,
                    steps: JSON.stringify(tc.steps.split('\n')),
                    expectedResult: tc.expectedResult,
                    priority: tc.priority,
                    suiteId: suite.id,
                    status: 'ACTIVE'
                }
            })
        }

        return { success: true, suiteId: suite.id, count: testCases.length }
    } catch (error) {
        console.error('Failed to generate from page:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: `Failed to generate test cases: ${errorMessage}` }
    }
}
