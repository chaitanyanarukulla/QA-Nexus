import { AxiosInstance } from 'axios'
import { createAtlassianClient, AtlassianConfig } from './atlassian-client'

export type JiraConfig = AtlassianConfig

export interface JiraIssue {
    id: string
    key: string
    fields: {
        summary: string
        description?: any
        issuetype: {
            name: string
        }
        status: {
            name: string
        }
        priority?: {
            name: string
        }
        assignee?: {
            displayName: string
            emailAddress: string
        }
        reporter?: {
            displayName: string
            emailAddress: string
        }
        project: {
            key: string
        }
    }
}

export interface CreateIssueData {
    projectKey: string
    summary: string
    description: string
    issueType: string
    priority?: string
}

export class JiraClient {
    private client: AxiosInstance

    constructor(config: JiraConfig) {
        this.client = createAtlassianClient(config, '/rest/api/3')
    }

    /**
     * Test the connection to Jira
     */
    async testConnection(): Promise<boolean> {
        try {
            await this.client.get('/myself')
            return true
        } catch (error) {
            console.error('Jira connection test failed:', error)
            return false
        }
    }

    /**
     * Get a single issue by key
     */
    async getIssue(issueKey: string): Promise<JiraIssue | null> {
        try {
            const response = await this.client.get(`/issue/${issueKey}`)
            return response.data
        } catch (error) {
            console.error(`Failed to get issue ${issueKey}:`, error)
            return null
        }
    }

    /**
     * Search for issues using JQL
     */
    async searchIssues(jql: string, maxResults = 50): Promise<JiraIssue[]> {
        try {
            // Updated to use /search/jql as per deprecation warning
            const response = await this.client.post('/search/jql', {
                jql,
                maxResults,
                fields: ['summary', 'description', 'issuetype', 'status', 'priority', 'assignee', 'reporter', 'project'],
            })
            return response.data.issues || []
        } catch (error: any) {
            console.error('Failed to search issues:', error.message)
            if (error.response) {
                console.error('Response status:', error.response.status)
                console.error('Response data:', JSON.stringify(error.response.data))
                console.error('Request URL:', error.config?.url)
                console.error('Request BaseURL:', error.config?.baseURL)
            }
            return []
        }
    }

    /**
     * Get Epics for a project
     */
    async getEpics(projectKey: string): Promise<JiraIssue[]> {
        return this.searchIssues(`project = "${projectKey}" AND issuetype = "Epic" ORDER BY created DESC`)
    }

    /**
     * Get issues belonging to an Epic
     */
    async getEpicIssues(epicKey: string): Promise<JiraIssue[]> {
        return this.searchIssues(`"Parent Link" = ${epicKey} OR parent = ${epicKey} ORDER BY rank ASC`)
    }

    /**
     * Create a new issue
     */
    async createIssue(data: CreateIssueData): Promise<JiraIssue | null> {
        try {
            const payload = {
                fields: {
                    project: {
                        key: data.projectKey,
                    },
                    summary: data.summary,
                    description: {
                        type: 'doc',
                        version: 1,
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: data.description,
                                    },
                                ],
                            },
                        ],
                    },
                    issuetype: {
                        name: data.issueType,
                    },
                },
            }

            const response = await this.client.post('/issue', payload)

            // Fetch the created issue to get full details
            return await this.getIssue(response.data.key)
        } catch (error: any) {
            console.error('Failed to create issue:', error.response?.data || error)
            throw new Error(error.response?.data?.errorMessages?.[0] || 'Failed to create Jira issue')
        }
    }

    /**
     * Update an existing issue
     */
    async updateIssue(issueKey: string, updates: Partial<CreateIssueData>): Promise<boolean> {
        try {
            const fields: any = {}

            if (updates.summary) {
                fields.summary = updates.summary
            }

            if (updates.description) {
                fields.description = {
                    type: 'doc',
                    version: 1,
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: updates.description,
                                },
                            ],
                        },
                    ],
                }
            }

            if (updates.priority) {
                fields.priority = { name: updates.priority }
            }

            await this.client.put(`/issue/${issueKey}`, { fields })
            return true
        } catch (error) {
            console.error(`Failed to update issue ${issueKey}:`, error)
            return false
        }
    }

    /**
     * Add a comment to an issue
     */
    async addComment(issueKey: string, comment: string): Promise<boolean> {
        try {
            await this.client.post(`/issue/${issueKey}/comment`, {
                body: {
                    type: 'doc',
                    version: 1,
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: comment,
                                },
                            ],
                        },
                    ],
                },
            })
            return true
        } catch (error) {
            console.error(`Failed to add comment to ${issueKey}:`, error)
            return false
        }
    }

    /**
     * Get all projects
     */
    async getProjects(): Promise<Array<{ key: string; name: string }>> {
        try {
            const response = await this.client.get('/project')
            return response.data.map((p: any) => ({
                key: p.key,
                name: p.name,
            }))
        } catch (error) {
            console.error('Failed to get projects:', error)
            return []
        }
    }

    /**
     * Get issue types for a project
     */
    async getIssueTypes(projectKey: string): Promise<Array<{ name: string }>> {
        try {
            const response = await this.client.get(`/project/${projectKey}`)
            return response.data.issueTypes || []
        } catch (error) {
            console.error('Failed to get issue types:', error)
            return []
        }
    }

    /**
     * Get all webhooks
     */
    async getWebhooks(): Promise<JiraWebhook[]> {
        try {
            const response = await this.client.get('/webhook')
            return response.data || []
        } catch (error: any) {
            console.error('Failed to get webhooks:', error.message)
            return []
        }
    }

    /**
     * Register a new webhook
     */
    async registerWebhook(data: CreateWebhookData): Promise<JiraWebhook | null> {
        try {
            const payload = {
                name: data.name,
                url: data.url,
                events: data.events,
                filters: data.filters || {},
                excludeBody: false,
            }

            const response = await this.client.post('/webhook', payload)
            return response.data
        } catch (error: any) {
            console.error('Failed to register webhook:', error.response?.data || error.message)
            throw new Error(error.response?.data?.errorMessages?.[0] || 'Failed to register webhook')
        }
    }

    /**
     * Delete a webhook
     */
    async deleteWebhook(webhookId: string): Promise<boolean> {
        try {
            await this.client.delete(`/webhook/${webhookId}`)
            return true
        } catch (error: any) {
            console.error('Failed to delete webhook:', error.message)
            return false
        }
    }

    /**
     * Refresh a webhook (extend expiration)
     */
    async refreshWebhook(webhookId: string): Promise<boolean> {
        try {
            await this.client.put(`/webhook/${webhookId}/refresh`)
            return true
        } catch (error: any) {
            console.error('Failed to refresh webhook:', error.message)
            return false
        }
    }
}

export interface JiraWebhook {
    id: string
    name: string
    url: string
    events: string[]
    expirationDate?: string
    filters?: {
        'issue-related-events-section'?: string
    }
}

export interface CreateWebhookData {
    name: string
    url: string
    events: string[]
    filters?: {
        'issue-related-events-section'?: string
    }
}

/**
 * Create a Jira client from stored integration
 */
export function createJiraClient(integration: {
    instanceUrl: string
    email: string
    apiToken: string
}): JiraClient {
    return new JiraClient(integration)
}
