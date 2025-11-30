'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { getAISettings, updateAISettings, testAIConnection } from '@/app/actions/ai-settings'
import { toast } from 'sonner'
import { Loader2, Brain, Zap } from 'lucide-react'

export function AISettingsForm() {
    const [loading, setLoading] = useState(false)
    const [testing, setTesting] = useState(false)
    const [provider, setProvider] = useState<'OPENAI' | 'FOUNDRY'>('OPENAI')
    const [openaiApiKey, setOpenaiApiKey] = useState('')
    const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini')
    const [foundryUrl, setFoundryUrl] = useState('http://localhost:8000')
    const [foundryModel, setFoundryModel] = useState('llama2')

    useEffect(() => {
        // Load existing settings
        async function loadSettings() {
            try {
                const settings = await getAISettings()
                if (settings) {
                    setProvider(settings.provider as 'OPENAI' | 'FOUNDRY')
                    setOpenaiApiKey(settings.openaiApiKey || '')
                    setOpenaiModel(settings.openaiModel || 'gpt-4o-mini')
                    setFoundryUrl(settings.foundryUrl || 'http://localhost:8000')
                    setFoundryModel(settings.foundryModel || 'llama2')
                }
            } catch (error) {
                console.error('Failed to load settings', error)
            }
        }
        loadSettings()
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await updateAISettings({
                provider,
                openaiApiKey,
                openaiModel,
                foundryUrl,
                foundryModel,
            })

            if (result.success) {
                toast.success('AI settings saved successfully')
            } else {
                toast.error(result.error || 'Failed to save settings')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    async function handleTest() {
        setTesting(true)
        try {
            const result = await testAIConnection(provider)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.error || 'Connection test failed')
            }
        } catch (error) {
            toast.error('Connection test failed')
        } finally {
            setTesting(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Provider Settings
                </CardTitle>
                <CardDescription>
                    Configure your AI provider for test case generation and Q&A assistance
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <Label>AI Provider</Label>
                        <RadioGroup
                            value={provider}
                            onValueChange={(value) => setProvider(value as 'OPENAI' | 'FOUNDRY')}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div>
                                <RadioGroupItem
                                    value="OPENAI"
                                    id="openai"
                                    className="peer sr-only"
                                />
                                <Label
                                    htmlFor="openai"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Zap className="mb-3 h-6 w-6" />
                                    <div className="text-center">
                                        <div className="font-semibold">ChatGPT</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            OpenAI's powerful models
                                        </div>
                                    </div>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem
                                    value="FOUNDRY"
                                    id="foundry"
                                    className="peer sr-only"
                                />
                                <Label
                                    htmlFor="foundry"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Brain className="mb-3 h-6 w-6" />
                                    <div className="text-center">
                                        <div className="font-semibold">Local LLM</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Foundry (Privacy-focused)
                                        </div>
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {provider === 'OPENAI' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                                <Input
                                    id="openaiApiKey"
                                    type="password"
                                    placeholder="sk-proj-..."
                                    value={openaiApiKey}
                                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                                    required={provider === 'OPENAI'}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Get your API key from{' '}
                                    <a
                                        href="https://platform.openai.com/api-keys"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline"
                                    >
                                        OpenAI Platform
                                    </a>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="openaiModel">Model</Label>
                                <select
                                    id="openaiModel"
                                    value={openaiModel}
                                    onChange={(e) => setOpenaiModel(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="gpt-4o">GPT-4o (Most capable)</option>
                                    <option value="gpt-4o-mini">GPT-4o Mini (Balanced)</option>
                                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fastest)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {provider === 'FOUNDRY' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="foundryUrl">Foundry URL</Label>
                                <Input
                                    id="foundryUrl"
                                    type="url"
                                    placeholder="http://localhost:8000"
                                    value={foundryUrl}
                                    onChange={(e) => setFoundryUrl(e.target.value)}
                                    required={provider === 'FOUNDRY'}
                                />
                                <p className="text-xs text-muted-foreground">
                                    URL of your local Foundry LLM service
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="foundryModel">Model Name</Label>
                                <Input
                                    id="foundryModel"
                                    type="text"
                                    placeholder="llama2"
                                    value={foundryModel}
                                    onChange={(e) => setFoundryModel(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Name of the model to use (e.g., llama2, codellama, mistral)
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Settings
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleTest}
                            disabled={testing || !((provider === 'OPENAI' && openaiApiKey) || (provider === 'FOUNDRY' && foundryUrl))}
                        >
                            {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Test Connection
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
