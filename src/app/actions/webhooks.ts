'use server'

import { prisma } from '@/lib/prisma'
import { createJiraClient } from '@/lib/jira'
import { revalidatePath } from 'next/cache'

/**
 * Get webhook URL for this instance
 */
export async function getWebhookUrl() {
    // In production, this would come from environment or settings
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/api/webhooks/jira`
}

/**
 * Get webhook settings
 */
export async function getWebhookSettings() {
    try {
        const [secret, enabled, lastSync] = await Promise.all([
            prisma.settings.findUnique({ where: { key: 'jira_webhook_secret' } }),
            prisma.settings.findUnique({ where: { key: 'jira_webhook_enabled' } }),
            prisma.settings.findUnique({ where: { key: 'jira_webhook_last_sync' } }),
        ])

        return {
            success: true,
            settings: {
                secret: secret?.value || '',
                enabled: enabled?.value === 'true',
                lastSync: lastSync?.value || null,
            },
        }
    } catch (error) {
        console.error('Failed to get webhook settings:', error)
        return { success: false, error: 'Failed to get settings' }
    }
}

/**
 * Save webhook settings
 */
export async function saveWebhookSettings(data: {
    secret?: string
    enabled?: boolean
}) {
    try {
        if (data.secret !== undefined) {
            await prisma.settings.upsert({
                where: { key: 'jira_webhook_secret' },
                update: { value: data.secret },
                create: { key: 'jira_webhook_secret', value: data.secret, category: 'webhooks' },
            })
        }

        if (data.enabled !== undefined) {
            await prisma.settings.upsert({
                where: { key: 'jira_webhook_enabled' },
                update: { value: String(data.enabled) },
                create: { key: 'jira_webhook_enabled', value: String(data.enabled), category: 'webhooks' },
            })
        }

        revalidatePath('/settings')
        return { success: true }
    } catch (error) {
        console.error('Failed to save webhook settings:', error)
        return { success: false, error: 'Failed to save settings' }
    }
}

/**
 * Register webhook with Jira
 */
export async function registerJiraWebhook(userId: string, projectKey?: string) {
    try {
        // Get integration settings
        const integration = await prisma.jiraIntegration.findUnique({
            where: { userId },
        })

        if (!integration || !integration.isActive) {
            return { success: false, error: 'Jira integration not configured' }
        }

        const client = createJiraClient({
            instanceUrl: integration.instanceUrl,
            email: integration.email,
            apiToken: integration.apiToken,
        })

        const webhookUrl = await getWebhookUrl()

        // Register the webhook
        const webhook = await client.registerWebhook({
            name: 'QA Nexus Sync',
            url: webhookUrl,
            events: [
                'jira:issue_created',
                'jira:issue_updated',
                'jira:issue_deleted',
            ],
            filters: projectKey ? {
                'issue-related-events-section': `project = ${projectKey}`,
            } : undefined,
        })

        if (!webhook) {
            return { success: false, error: 'Failed to register webhook' }
        }

        // Save webhook ID to settings
        await prisma.settings.upsert({
            where: { key: 'jira_webhook_id' },
            update: { value: webhook.id },
            create: { key: 'jira_webhook_id', value: webhook.id, category: 'webhooks' },
        })

        // Update last sync time
        await prisma.settings.upsert({
            where: { key: 'jira_webhook_last_sync' },
            update: { value: new Date().toISOString() },
            create: { key: 'jira_webhook_last_sync', value: new Date().toISOString(), category: 'webhooks' },
        })

        // Mark as enabled
        await prisma.settings.upsert({
            where: { key: 'jira_webhook_enabled' },
            update: { value: 'true' },
            create: { key: 'jira_webhook_enabled', value: 'true', category: 'webhooks' },
        })

        revalidatePath('/settings')

        return {
            success: true,
            webhook: {
                id: webhook.id,
                url: webhook.url,
                events: webhook.events,
            },
        }
    } catch (error: any) {
        console.error('Failed to register webhook:', error)
        return { success: false, error: error.message || 'Failed to register webhook' }
    }
}

/**
 * Unregister webhook from Jira
 */
export async function unregisterJiraWebhook(userId: string) {
    try {
        // Get integration and webhook ID
        const [integration, webhookIdSetting] = await Promise.all([
            prisma.jiraIntegration.findUnique({ where: { userId } }),
            prisma.settings.findUnique({ where: { key: 'jira_webhook_id' } }),
        ])

        if (!integration || !integration.isActive) {
            return { success: false, error: 'Jira integration not configured' }
        }

        if (!webhookIdSetting?.value) {
            return { success: false, error: 'No webhook registered' }
        }

        const client = createJiraClient({
            instanceUrl: integration.instanceUrl,
            email: integration.email,
            apiToken: integration.apiToken,
        })

        // Delete the webhook
        await client.deleteWebhook(webhookIdSetting.value)

        // Clear settings
        await Promise.all([
            prisma.settings.delete({ where: { key: 'jira_webhook_id' } }).catch(() => { }),
            prisma.settings.upsert({
                where: { key: 'jira_webhook_enabled' },
                update: { value: 'false' },
                create: { key: 'jira_webhook_enabled', value: 'false', category: 'webhooks' },
            }),
        ])

        revalidatePath('/settings')

        return { success: true }
    } catch (error: any) {
        console.error('Failed to unregister webhook:', error)
        return { success: false, error: error.message || 'Failed to unregister webhook' }
    }
}

/**
 * Get webhook logs
 */
export async function getWebhookLogs(limit = 50) {
    try {
        const logs = await prisma.webhookLog.findMany({
            take: limit,
            orderBy: { processedAt: 'desc' },
        })

        return {
            success: true,
            logs: logs.map((log: any) => ({
                id: log.id,
                source: log.source,
                eventType: log.eventType,
                entityType: log.entityType,
                entityId: log.entityId,
                status: log.status,
                errorMessage: log.errorMessage,
                processedAt: log.processedAt,
            })),
        }
    } catch (error) {
        console.error('Failed to get webhook logs:', error)
        return { success: false, error: 'Failed to get logs', logs: [] }
    }
}

/**
 * Test webhook endpoint
 */
export async function testWebhookEndpoint() {
    try {
        const webhookUrl = await getWebhookUrl()

        // Make a GET request to check if endpoint is reachable
        const response = await fetch(webhookUrl, { method: 'GET' })
        const data = await response.json()

        return {
            success: response.ok,
            url: webhookUrl,
            status: response.status,
            message: data.message || 'Endpoint check completed',
        }
    } catch (error: any) {
        console.error('Webhook test failed:', error)
        return {
            success: false,
            error: error.message || 'Failed to reach webhook endpoint',
        }
    }
}
