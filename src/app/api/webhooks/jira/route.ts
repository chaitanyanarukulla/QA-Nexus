import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import crypto from 'crypto'

// Jira webhook event types
type JiraWebhookEvent =
    | 'jira:issue_created'
    | 'jira:issue_updated'
    | 'jira:issue_deleted'
    | 'comment_created'
    | 'comment_updated'
    | 'comment_deleted'

interface JiraWebhookPayload {
    timestamp: number
    webhookEvent: JiraWebhookEvent
    issue_event_type_name?: string
    user?: {
        accountId: string
        displayName: string
        emailAddress?: string
    }
    issue?: {
        id: string
        key: string
        fields: {
            summary: string
            description?: any
            status: {
                name: string
                statusCategory?: {
                    key: string
                    name: string
                }
            }
            priority?: {
                name: string
            }
            assignee?: {
                displayName: string
                emailAddress?: string
            }
            resolution?: {
                name: string
            }
            updated: string
        }
    }
    changelog?: {
        items: {
            field: string
            fieldtype: string
            from: string | null
            fromString: string | null
            to: string | null
            toString: string | null
        }[]
    }
    comment?: {
        id: string
        body: string
        author: {
            displayName: string
        }
        created: string
        updated: string
    }
}

/**
 * Verify the webhook signature from Jira (if configured)
 */
async function verifyWebhookSignature(request: NextRequest, body: string): Promise<boolean> {
    const headersList = await headers()
    const signature = headersList.get('x-hub-signature')

    if (!signature) {
        // If no signature header, check if we have a webhook secret configured
        const settings = await prisma.settings.findFirst({
            where: { key: 'jira_webhook_secret' }
        })

        // If no secret is configured, allow the request (for development)
        if (!settings?.value) {
            return true
        }

        // Secret is configured but no signature provided
        console.warn('Webhook secret configured but no signature provided')
        return false
    }

    // Get the configured secret
    const settings = await prisma.settings.findFirst({
        where: { key: 'jira_webhook_secret' }
    })

    if (!settings?.value) {
        return true // No secret configured, allow request
    }

    // Verify HMAC signature
    const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', settings.value)
        .update(body)
        .digest('hex')

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    )
}

/**
 * Handle issue status changes
 */
async function handleIssueUpdated(payload: JiraWebhookPayload) {
    if (!payload.issue) return

    const { issue, changelog } = payload

    // Find the linked defect in our database
    const defect = await prisma.defect.findFirst({
        where: { jiraIssueId: issue.key }
    })

    if (!defect) {
        console.log(`No linked defect found for Jira issue ${issue.key}`)
        return
    }

    // Check if status changed
    const statusChange = changelog?.items.find(item => item.field === 'status')

    if (statusChange) {
        // Map Jira status to our defect status
        const jiraStatus = issue.fields.status.name.toUpperCase()
        let newStatus = defect.status

        // Common Jira status mappings
        if (['TO DO', 'OPEN', 'BACKLOG', 'NEW'].includes(jiraStatus)) {
            newStatus = 'OPEN'
        } else if (['IN PROGRESS', 'IN REVIEW', 'IN DEVELOPMENT'].includes(jiraStatus)) {
            newStatus = 'IN_PROGRESS'
        } else if (['RESOLVED', 'FIXED'].includes(jiraStatus)) {
            newStatus = 'RESOLVED'
        } else if (['DONE', 'CLOSED', 'VERIFIED'].includes(jiraStatus)) {
            newStatus = 'CLOSED'
        }

        // Update defect status
        await prisma.defect.update({
            where: { id: defect.id },
            data: {
                status: newStatus,
                updatedAt: new Date()
            }
        })

        // Log the sync event
        await prisma.webhookLog.create({
            data: {
                source: 'jira',
                eventType: 'issue_updated',
                entityType: 'defect',
                entityId: defect.id,
                payload: JSON.stringify({
                    issueKey: issue.key,
                    statusFrom: statusChange.fromString,
                    statusTo: statusChange.toString,
                    mappedStatus: newStatus
                }),
                status: 'SUCCESS'
            }
        })

        console.log(`Updated defect ${defect.id} status to ${newStatus} from Jira ${issue.key}`)
    }

    // Check if priority changed
    const priorityChange = changelog?.items.find(item => item.field === 'priority')

    if (priorityChange && issue.fields.priority) {
        const jiraPriority = issue.fields.priority.name.toUpperCase()
        let newPriority = defect.priority

        if (['HIGHEST', 'BLOCKER', 'CRITICAL'].includes(jiraPriority)) {
            newPriority = 'CRITICAL'
        } else if (['HIGH', 'MAJOR'].includes(jiraPriority)) {
            newPriority = 'HIGH'
        } else if (['MEDIUM', 'NORMAL'].includes(jiraPriority)) {
            newPriority = 'MEDIUM'
        } else if (['LOW', 'MINOR', 'TRIVIAL'].includes(jiraPriority)) {
            newPriority = 'LOW'
        }

        await prisma.defect.update({
            where: { id: defect.id },
            data: { priority: newPriority }
        })

        console.log(`Updated defect ${defect.id} priority to ${newPriority}`)
    }

    // Update the linked Jira issue record
    await prisma.jiraIssue.updateMany({
        where: { jiraKey: issue.key },
        data: {
            status: issue.fields.status.name,
            priority: issue.fields.priority?.name,
            assignee: issue.fields.assignee?.displayName,
            syncedAt: new Date()
        }
    })
}

/**
 * Handle issue deletion
 */
async function handleIssueDeleted(payload: JiraWebhookPayload) {
    if (!payload.issue) return

    const { issue } = payload

    // Find and update the linked defect
    const defect = await prisma.defect.findFirst({
        where: { jiraIssueId: issue.key }
    })

    if (defect) {
        // Don't delete the defect, just clear the Jira link
        await prisma.defect.update({
            where: { id: defect.id },
            data: { jiraIssueId: null }
        })

        // Log the event
        await prisma.webhookLog.create({
            data: {
                source: 'jira',
                eventType: 'issue_deleted',
                entityType: 'defect',
                entityId: defect.id,
                payload: JSON.stringify({ issueKey: issue.key }),
                status: 'SUCCESS'
            }
        })

        console.log(`Unlinked defect ${defect.id} from deleted Jira issue ${issue.key}`)
    }

    // Remove the Jira issue record
    await prisma.jiraIssue.deleteMany({
        where: { jiraKey: issue.key }
    })
}

/**
 * Main webhook handler
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text()

        // Verify webhook signature
        const isValid = await verifyWebhookSignature(request, body)
        if (!isValid) {
            console.error('Invalid webhook signature')
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            )
        }

        const payload: JiraWebhookPayload = JSON.parse(body)

        console.log(`Received Jira webhook: ${payload.webhookEvent}`)

        // Process based on event type
        switch (payload.webhookEvent) {
            case 'jira:issue_updated':
                await handleIssueUpdated(payload)
                break

            case 'jira:issue_deleted':
                await handleIssueDeleted(payload)
                break

            case 'jira:issue_created':
                // Log new issues but don't auto-create defects
                if (payload.issue) {
                    await prisma.webhookLog.create({
                        data: {
                            source: 'jira',
                            eventType: 'issue_created',
                            entityType: 'jira_issue',
                            entityId: payload.issue.key,
                            payload: JSON.stringify({
                                issueKey: payload.issue.key,
                                summary: payload.issue.fields.summary
                            }),
                            status: 'SUCCESS'
                        }
                    })
                }
                break

            default:
                console.log(`Unhandled webhook event: ${payload.webhookEvent}`)
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Webhook processing error:', error)

        // Log the error
        try {
            await prisma.webhookLog.create({
                data: {
                    source: 'jira',
                    eventType: 'unknown',
                    entityType: 'unknown',
                    entityId: 'unknown',
                    payload: JSON.stringify({ error: String(error) }),
                    status: 'ERROR',
                    errorMessage: error instanceof Error ? error.message : 'Unknown error'
                }
            })
        } catch {
            // Ignore logging errors
        }

        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}

/**
 * Health check endpoint for webhook verification
 */
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Jira webhook endpoint is active',
        timestamp: new Date().toISOString()
    })
}
