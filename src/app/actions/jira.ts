'use server'

import { prisma } from '@/lib/prisma'
import { createJiraClient } from '@/lib/jira'
import { revalidatePath } from 'next/cache'

/**
 * Save or update Jira integration for a user
 */
export async function saveJiraIntegration(data: {
    userId: string
    instanceUrl: string
    email: string
    apiToken: string
}) {
    try {
        // Test the connection first
        const client = createJiraClient({
            instanceUrl: data.instanceUrl,
            email: data.email,
            apiToken: data.apiToken,
        })

        const isValid = await client.testConnection()
        if (!isValid) {
            return { success: false, error: 'Invalid Jira credentials or instance URL' }
        }

        // Save or update the integration
        const integration = await prisma.jiraIntegration.upsert({
            where: { userId: data.userId },
            update: {
                instanceUrl: data.instanceUrl,
                email: data.email,
                apiToken: data.apiToken, // In production, encrypt this!
                isActive: true,
            },
            create: {
                userId: data.userId,
                instanceUrl: data.instanceUrl,
                email: data.email,
                apiToken: data.apiToken, // In production, encrypt this!
            },
        })

        revalidatePath('/settings')
        return { success: true, integration }
    } catch (error: any) {
        console.error('Failed to save Jira integration:', error.response?.data || error.message)
        return {
            success: false,
            error: error.response?.data?.errorMessages?.[0] || error.message || 'Failed to save Jira integration'
        }
    }
}

/**
 * Get Jira integration for a user
 */
export async function getJiraIntegration(userId: string) {
    return await prisma.jiraIntegration.findUnique({
        where: { userId },
    })
}

/**
 * Create a Jira issue from a test failure
 */
export async function createJiraIssueFromTestFailure(data: {
    userId: string
    testResultId: string
    projectKey: string
    issueType?: string
}) {
    try {
        // Get the integration
        const integration = await getJiraIntegration(data.userId)
        if (!integration || !integration.isActive) {
            return { success: false, error: 'Jira integration not configured' }
        }

        // Get the test result with related data
        const testResult = await prisma.testResult.findUnique({
            where: { id: data.testResultId },
            include: {
                testCase: true,
                testRun: true,
            },
        })

        if (!testResult) {
            return { success: false, error: 'Test result not found' }
        }

        // Create Jira client
        const client = createJiraClient({
            instanceUrl: integration.instanceUrl,
            email: integration.email,
            apiToken: integration.apiToken,
        })

        // Build issue description
        const description = `
Test Case: ${testResult.testCase.title}
Test Run: ${testResult.testRun.title}

Steps:
${typeof testResult.testCase.steps === 'string' ? testResult.testCase.steps : JSON.stringify(testResult.testCase.steps, null, 2)}

Expected Result:
${testResult.testCase.expectedResult || 'N/A'}

Actual Result:
${testResult.notes || 'Test failed'}

Evidence:
${testResult.evidence || 'No evidence provided'}
    `.trim()

        // Create the issue (priority will be set to default in Jira)
        const jiraIssue = await client.createIssue({
            projectKey: data.projectKey,
            summary: `[Test Failure] ${testResult.testCase.title}`,
            description,
            issueType: data.issueType || 'Bug',
            // Note: priority is omitted as it may cause validation errors
            // Jira will use the project's default priority
        })

        if (!jiraIssue) {
            return { success: false, error: 'Failed to create Jira issue' }
        }

        // Save the Jira issue to our database
        const savedIssue = await prisma.jiraIssue.create({
            data: {
                jiraKey: jiraIssue.key,
                jiraId: jiraIssue.id,
                summary: jiraIssue.fields.summary,
                description: description,
                issueType: jiraIssue.fields.issuetype.name,
                status: jiraIssue.fields.status.name,
                priority: jiraIssue.fields.priority?.name,
                assignee: jiraIssue.fields.assignee?.displayName,
                reporter: jiraIssue.fields.reporter?.displayName,
                projectKey: jiraIssue.fields.project.key,
            },
        })

        // Create a defect linked to this test result
        await prisma.defect.create({
            data: {
                title: `[Test Failure] ${testResult.testCase.title}`,
                description: description,
                priority: testResult.testCase.priority,
                jiraIssueId: jiraIssue.key,
                testResultId: data.testResultId,
            },
        })

        revalidatePath('/test-runs')
        revalidatePath('/defects')

        return { success: true, issueKey: jiraIssue.key, issueUrl: `${integration.instanceUrl}/browse/${jiraIssue.key}` }
    } catch (error: any) {
        console.error('Failed to create Jira issue:', error)
        return { success: false, error: error.message || 'Failed to create Jira issue' }
    }
}

/**
 * Sync Jira issues
 */
export async function syncJiraIssues(userId: string, projectKey: string) {
    try {
        const integration = await getJiraIntegration(userId)
        if (!integration || !integration.isActive) {
            return { success: false, error: 'Jira integration not configured' }
        }

        if (!projectKey) {
            return { success: false, error: 'Project key is required' }
        }

        const client = createJiraClient({
            instanceUrl: integration.instanceUrl,
            email: integration.email,
            apiToken: integration.apiToken,
        })

        // Build JQL query with project restriction
        const jql = `project = ${projectKey} ORDER BY updated DESC`

        const issues = await client.searchIssues(jql, 100)

        let syncedCount = 0
        for (const issue of issues) {
            await prisma.jiraIssue.upsert({
                where: { jiraKey: issue.key },
                update: {
                    summary: issue.fields.summary,
                    status: issue.fields.status.name,
                    priority: issue.fields.priority?.name,
                    assignee: issue.fields.assignee?.displayName,
                    syncedAt: new Date(),
                },
                create: {
                    jiraKey: issue.key,
                    jiraId: issue.id,
                    summary: issue.fields.summary,
                    description: issue.fields.description?.content?.[0]?.content?.[0]?.text || '',
                    issueType: issue.fields.issuetype.name,
                    status: issue.fields.status.name,
                    priority: issue.fields.priority?.name,
                    assignee: issue.fields.assignee?.displayName,
                    reporter: issue.fields.reporter?.displayName,
                    projectKey: issue.fields.project.key,
                },
            })
            syncedCount++
        }

        // Update last sync time
        await prisma.jiraIntegration.update({
            where: { userId },
            data: { lastSyncAt: new Date() },
        })

        revalidatePath('/jira')
        return { success: true, syncedCount }
    } catch (error) {
        console.error('Failed to sync Jira issues:', error)
        return { success: false, error: 'Failed to sync Jira issues' }
    }
}

/**
 * Get Jira projects
 */
export async function getJiraProjects(userId: string) {
    try {
        const integration = await getJiraIntegration(userId)
        if (!integration || !integration.isActive) {
            return { success: false, error: 'Jira integration not configured', projects: [] }
        }

        const client = createJiraClient({
            instanceUrl: integration.instanceUrl,
            email: integration.email,
            apiToken: integration.apiToken,
        })

        const projects = await client.getProjects()
        return { success: true, projects }
    } catch (error) {
        console.error('Failed to get Jira projects:', error)
        return { success: false, error: 'Failed to get Jira projects', projects: [] }
    }
}
