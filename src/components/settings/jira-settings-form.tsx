'use client'

import { useState, useEffect } from 'react'
import { saveJiraIntegration, getJiraIntegration, syncJiraIssues } from '@/app/actions/jira'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function JiraSettingsForm({ userId = 'demo-user' }: { userId?: string }) {
    const [loading, setLoading] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [instanceUrl, setInstanceUrl] = useState('')
    const [email, setEmail] = useState('')
    const [apiToken, setApiToken] = useState('')
    const [lastSync, setLastSync] = useState<Date | null>(null)
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })

    useEffect(() => {
        async function loadSettings() {
            const integration = await getJiraIntegration(userId)
            if (integration) {
                setInstanceUrl(integration.instanceUrl)
                setEmail(integration.email)
                setApiToken(integration.apiToken) // In a real app, don't return the full token back to client if possible, or mask it
                setLastSync(integration.lastSyncAt)
            }
        }
        loadSettings()
    }, [userId])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setStatus({ type: null, message: '' })

        try {
            const result = await saveJiraIntegration({
                userId,
                instanceUrl: instanceUrl.trim(),
                email: email.trim(),
                apiToken: apiToken.trim(),
            })

            if (result.success) {
                setStatus({ type: 'success', message: 'Jira integration saved and connection verified!' })
            } else {
                setStatus({ type: 'error', message: result.error || 'Failed to save settings' })
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An unexpected error occurred' })
        } finally {
            setLoading(false)
        }
    }

    async function handleSync() {
        setSyncing(true)
        setStatus({ type: null, message: '' })

        try {
            const result = await syncJiraIssues(userId)

            if (result.success) {
                setStatus({ type: 'success', message: `Successfully synced ${result.syncedCount} issues from Jira!` })
                setLastSync(new Date())
            } else {
                setStatus({ type: 'error', message: result.error || 'Failed to sync issues' })
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An unexpected error occurred during sync' })
        } finally {
            setSyncing(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Jira Integration</CardTitle>
                <CardDescription>
                    Configure your Jira instance to enable bi-directional sync and one-click bug creation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="instanceUrl">Jira Instance URL</Label>
                        <Input
                            id="instanceUrl"
                            placeholder="https://your-domain.atlassian.net"
                            value={instanceUrl}
                            onChange={(e) => setInstanceUrl(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="apiToken">API Token</Label>
                        <Input
                            id="apiToken"
                            type="password"
                            placeholder="Enter your Jira API token"
                            value={apiToken}
                            onChange={(e) => setApiToken(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Generate a token at <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="underline text-primary">id.atlassian.com</a>
                        </p>
                    </div>

                    {status.message && (
                        <Alert variant={status.type === 'error' ? 'destructive' : 'default'} className={status.type === 'success' ? 'border-green-500 text-green-600' : ''}>
                            {status.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertTitle>{status.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                            <AlertDescription>{status.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-between items-center pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying & Saving...
                                </>
                            ) : (
                                'Save Configuration'
                            )}
                        </Button>

                        <div className="flex items-center gap-4">
                            {lastSync && (
                                <span className="text-xs text-muted-foreground">
                                    Last synced: {lastSync.toLocaleString()}
                                </span>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSync}
                                disabled={syncing || !instanceUrl}
                            >
                                {syncing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Sync Now
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
