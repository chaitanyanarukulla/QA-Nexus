'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Code, Download, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import { generateAutomationForSuite, checkAutomationReadiness } from '@/app/actions/automation'
import { toast } from 'sonner'

interface AutomationGeneratorProps {
    suiteId: string
    suiteTitle: string
}

export function AutomationGenerator({ suiteId, suiteTitle }: AutomationGeneratorProps) {
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(false)
    const [readiness, setReadiness] = useState<any>(null)
    const [baseUrl, setBaseUrl] = useState('http://localhost:3000')
    const [generatedCode, setGeneratedCode] = useState<{
        fileName: string
        content: string
        testCaseCount: number
    } | null>(null)

    async function handleCheckReadiness() {
        setChecking(true)
        try {
            const result = await checkAutomationReadiness(suiteId)
            if (result.success) {
                setReadiness(result)
                if (result.ready) {
                    toast.success('Suite is ready for automation!')
                } else {
                    toast.info(result.reason)
                }
            } else {
                toast.error(result.error || 'Failed to check readiness')
            }
        } catch (error) {
            toast.error('An error occurred')
        } finally {
            setChecking(false)
        }
    }

    async function handleGenerate() {
        setLoading(true)
        try {
            const result = await generateAutomationForSuite(suiteId, baseUrl)
            if (result.success && result.content) {
                setGeneratedCode({
                    fileName: result.fileName!,
                    content: result.content,
                    testCaseCount: result.testCaseCount!
                })
                toast.success(`Generated Playwright tests for ${result.testCaseCount} test cases!`)
            } else {
                toast.error(result.error || 'Failed to generate automation')
            }
        } catch (error) {
            toast.error('An error occurred during generation')
        } finally {
            setLoading(false)
        }
    }

    function handleDownload() {
        if (!generatedCode) return

        const blob = new Blob([generatedCode.content], { type: 'text/typescript' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = generatedCode.fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success('Test file downloaded!')
    }

    function copyToClipboard() {
        if (!generatedCode) return
        navigator.clipboard.writeText(generatedCode.content)
        toast.success('Code copied to clipboard!')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Automated Test Generation
                </CardTitle>
                <CardDescription>
                    Generate Playwright tests from your manual test cases
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Readiness Check */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">Automation Readiness</h4>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCheckReadiness}
                            disabled={checking}
                        >
                            {checking ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                'Check Readiness'
                            )}
                        </Button>
                    </div>

                    {readiness && (
                        <Alert className={readiness.ready ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
                            {readiness.ready ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                            )}
                            <AlertDescription>
                                <div className="space-y-1">
                                    <p className="font-medium">{readiness.reason}</p>
                                    {readiness.passRate !== undefined && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        readiness.passRate === 100
                                                            ? 'bg-green-500'
                                                            : 'bg-yellow-500'
                                                    }`}
                                                    style={{ width: `${readiness.passRate}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium">{readiness.passRate.toFixed(0)}%</span>
                                        </div>
                                    )}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Generation Settings */}
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label htmlFor="baseUrl">Base URL</Label>
                        <Input
                            id="baseUrl"
                            type="url"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            placeholder="http://localhost:3000"
                        />
                        <p className="text-xs text-muted-foreground">
                            The base URL where your application is running
                        </p>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={loading || (readiness && !readiness.ready)}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Playwright Tests...
                            </>
                        ) : (
                            <>
                                <Code className="mr-2 h-4 w-4" />
                                Generate Automated Tests
                            </>
                        )}
                    </Button>

                    {readiness && !readiness.ready && (
                        <p className="text-xs text-muted-foreground text-center">
                            Run all tests and ensure they pass before generating automation
                        </p>
                    )}
                </div>

                {/* Generated Code */}
                {generatedCode && (
                    <div className="space-y-3 border-t pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Generated Test File</h4>
                                <p className="text-sm text-muted-foreground">
                                    {generatedCode.fileName} • {generatedCode.testCaseCount} tests
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                                    Copy Code
                                </Button>
                                <Button size="sm" onClick={handleDownload}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96 text-xs">
                                <code>{generatedCode.content}</code>
                            </pre>
                        </div>

                        <Alert>
                            <AlertDescription className="text-sm">
                                <strong>Next steps:</strong>
                                <ol className="list-decimal list-inside space-y-1 mt-2">
                                    <li>Download the test file or copy the code</li>
                                    <li>Add it to your <code className="bg-muted px-1 py-0.5 rounded">tests/</code> directory</li>
                                    <li>Install Playwright: <code className="bg-muted px-1 py-0.5 rounded">npm install -D @playwright/test</code></li>
                                    <li>Run tests: <code className="bg-muted px-1 py-0.5 rounded">npx playwright test</code></li>
                                </ol>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
