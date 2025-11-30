import axios, { AxiosInstance } from 'axios'

export interface AtlassianConfig {
    instanceUrl: string
    email: string
    apiToken: string
}

/**
 * Create a base Atlassian API client with authentication
 */
export function createAtlassianClient(config: AtlassianConfig, apiPath: string): AxiosInstance {
    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64')

    let baseUrl = config.instanceUrl
    try {
        // Ensure we only use the origin (e.g. https://domain.atlassian.net)
        // This handles cases where user pastes a full board URL
        const url = new URL(config.instanceUrl.startsWith('http') ? config.instanceUrl : `https://${config.instanceUrl}`)
        baseUrl = url.origin
    } catch (e) {
        baseUrl = config.instanceUrl.replace(/\/$/, '')
    }

    return axios.create({
        baseURL: `${baseUrl}${apiPath}`,
        headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    })
}
