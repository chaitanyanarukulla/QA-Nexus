'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
    Webhook,
    RefreshCw,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Copy,
    ExternalLink,
    Loader2,
    History,
} from 'lucide-react'
import { toast } from 'sonner'
import {
    getWebhookSettings,
    saveWebhookSettings,
    registerJiraWebhook,
    unregisterJiraWebhook,
    getWebhookLogs,
    testWebhookEndpoint,
    getWebhookUrl,
} from '@/app/actions/webhooks'

interface WebhookLog {
    id: string
    source: string
    eventType: string
    entityType: string
    entityId: string
    status: string
    errorMessage: string | null
    processedAt: Date
}

interface WebhookSettingsFormProps {
    userId: string
    jiraConfigured: boolean
}

export function WebhookSettingsForm({ userId, jiraConfigured }: WebhookSettingsFormProps) {
    const [loading, setLoading] = useState(false)
    const [testingEndpoint, setTestingEndpoint] = useState(false)
    const [webhookUrl, setWebhookUrl] = useState('')
    const [secret, setSecret] = useState('')
    const [enabled, setEnabled] = useState(false)
    const [lastSync, setLastSync] = useState<string | null>(null)
    const [logs, setLogs] = useState<WebhookLog[]>([])
    const [showLogs, setShowLogs] = useState(false)

    useEffect(() => {
        loadSettings()
        loadWebhookUrl()
    }, [])

    async function loadSettings() {
        const result = await getWebhookSettings()
        if (result.success && result.settings) {
            setSecret(result.settings.secret)
            setEnabled(result.settings.enabled)
            setLastSync(result.settings.lastSync)
        }
    }

    async function loadWebhookUrl() {
        const url = await getWebhookUrl()
        setWebhookUrl(url)
    }

    async function loadLogs() {
        const result = await getWebhookLogs(20)
        if (result.success) {
            setLogs(result.logs)
        }
    }

    async function handleSaveSecret() {
        setLoading(true)
        try {
            const result = await saveWebhookSettings({ secret })
            if (result.success) {
                toast.success('Webhook secret saved')
            } else {
                toast.error(result.error || 'Failed to save secret')
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleRegister() {
        if (!jiraConfigured) {
            toast.error('Please configure Jira integration first')
            return
        }

        setLoading(true)
        try {
            const result = await registerJiraWebhook(userId)
            if (result.success) {
                toast.success('Webhook registered with Jira')
                setEnabled(true)
                setLastSync(new Date().toISOString())
            } else {
                toast.error(result.error || 'Failed to register webhook')
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleUnregister() {
        setLoading(true)
        try {
            const result = await unregisterJiraWebhook(userId)
            if (result.success) {
                toast.success('Webhook unregistered')
                setEnabled(false)
            } else {
                toast.error(result.error || 'Failed to unregister webhook')
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleTestEndpoint() {
        setTestingEndpoint(true)
        try {
            const result = await testWebhookEndpoint()
            if (result.success) {
                toast.success('Webhook endpoint is reachable')
            } else {
                toast.error(result.error || 'Endpoint test failed')
            }
        } finally {
            setTestingEndpoint(false)
        }
    }

    async function handleToggleLogs() {
        if (!showLogs) {
            await loadLogs()
        }
        setShowLogs(!showLogs)
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard')
    }

    function formatDate(date: Date | string) {
        return new Date(date).toLocaleString()
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Webhook className="h-5 w-5" />
                        <CardTitle>Jira Webhook Integration</CardTitle>
                    </div>
                    <Badge variant={enabled ? 'default' : 'secondary'}>
                        {enabled ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
                <CardDescription>
                    Enable real-time bi-directional sync between QA Nexus and Jira.
                    When enabled, defect statuses will automatically update when Jira issues change.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Webhook URL */}
                <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2">
                        <Input
                            value={webhookUrl}
                            readOnly
                            className="font-mono text-sm"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(webhookUrl)}
                            title="Copy URL"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleTestEndpoint}
                            disabled={testingEndpoint}
                            title="Test Endpoint"
                        >
                            {testingEndpoint ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ExternalLink className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Use this URL when configuring webhooks in Jira.
                    </p>
                </div>

                {/* Webhook Secret */}
                <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Webhook Secret (Optional)</Label>
                    <div className="flex gap-2">
                        <Input
                            id="webhook-secret"
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            placeholder="Enter a secret for webhook verification"
                        />
                        <Button
                            variant="outline"
                            onClick={handleSaveSecret}
                            disabled={loading}
                        >
                            Save
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Set a secret to verify that webhook requests come from Jira.
                    </p>
                </div>

                <Separator />

                {/* Registration Status */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Webhook Registration</h4>
                            <p className="text-sm text-muted-foreground">
                                {enabled
                                    ? 'Webhook is registered and receiving events from Jira.'
                                    : 'Register a webhook with Jira to enable bi-directional sync.'}
                            </p>
                        </div>
                        {enabled ? (
                            <Button
                                variant="destructive"
                                onClick={handleUnregister}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                )}
                                Unregister
                            </Button>
                        ) : (
                            <Button
                                onClick={handleRegister}
                                disabled={loading || !jiraConfigured}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                )}
                                Register Webhook
                            </Button>
                        )}
                    </div>

                    {!jiraConfigured && (
                        <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
                            <AlertCircle className="h-4 w-4" />
                            Please configure Jira integration first to enable webhooks.
                        </div>
                    )}

                    {lastSync && (
                        <p className="text-xs text-muted-foreground">
                            Last synced: {formatDate(lastSync)}
                        </p>
                    )}
                </div>

                <Separator />

                {/* Events Being Monitored */}
                <div>
                    <h4 className="font-medium mb-2">Monitored Events</h4>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Issue Created</Badge>
                        <Badge variant="outline">Issue Updated</Badge>
                        <Badge variant="outline">Issue Deleted</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Status and priority changes in Jira will automatically sync to linked defects.
                    </p>
                </div>

                <Separator />

                {/* Webhook Logs */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Recent Webhook Events
                        </h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleLogs}
                        >
                            {showLogs ? 'Hide' : 'Show'}
                        </Button>
                    </div>

                    {showLogs && (
                        <ScrollArea className="h-[200px] border rounded-lg">
                            {logs.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                    No webhook events recorded yet.
                                </div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                {log.status === 'SUCCESS' ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                )}
                                                <span className="font-medium">{log.eventType}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {log.entityType}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(log.processedAt)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
