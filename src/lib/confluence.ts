import { AxiosInstance } from 'axios'
import { createAtlassianClient, AtlassianConfig } from './atlassian-client'

export interface ConfluencePage {
    id: string
    title: string
    body: {
        storage: {
            value: string
        }
    }
    _links: {
        base: string
        webui: string
    }
}

export class ConfluenceClient {
    private client: AxiosInstance

    constructor(config: AtlassianConfig) {
        this.client = createAtlassianClient(config, '/wiki/rest/api')
    }

    async searchPages(query: string): Promise<any[]> {
        try {
            const cql = query
                ? `type=page AND title ~ "${query}"`
                : `type=page order by lastModified desc`

            const response = await this.client.get('/content/search', {
                params: {
                    cql,
                    limit: 10
                }
            })
            return response.data.results
        } catch (error: any) {
            console.error('Failed to search Confluence pages:', error.message)
            if (error.response) {
                console.error('Response status:', error.response.status)
                console.error('Response data:', JSON.stringify(error.response.data))
                console.error('Request URL:', error.config?.url)
            }
            return []
        }
    }

    async getPage(pageId: string): Promise<{ title: string, body: string } | null> {
        try {
            const response = await this.client.get(`/content/${pageId}`, {
                params: {
                    expand: 'body.storage'
                }
            })
            return {
                title: response.data.title,
                body: response.data.body.storage.value
            }
        } catch (error) {
            console.error(`Failed to get page ${pageId}:`, error)
            return null
        }
    }
}

export function createConfluenceClient(config: AtlassianConfig): ConfluenceClient {
    return new ConfluenceClient(config)
}
