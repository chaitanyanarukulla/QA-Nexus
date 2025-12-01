'use client'

import { useState } from 'react'
import { generateAndSaveTestCases } from '@/app/actions/ai-test-generator'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Sparkles, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface GeneratedTestCase {
    title: string
    description: string
    steps: string
    expectedResult: string
    priority: string
}

export function AITestGeneratorDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [requirement, setRequirement] = useState('')
    const [includeEdgeCases, setIncludeEdgeCases] = useState(true)
    const [includeNegativeCases, setIncludeNegativeCases] = useState(true)
    const [count, setCount] = useState(5)
    const [generatedCases, setGeneratedCases] = useState<GeneratedTestCase[]>([])
    const [showPreview, setShowPreview] = useState(false)
    const [error, setError] = useState('')

    async function handleGenerate() {
        if (!requirement.trim()) {
            setError('Please enter a requirement')
            return
        }

        setLoading(true)
        setError('')

        try {
            const result = await generateAndSaveTestCases({
                requirement,
                includeEdgeCases,
                includeNegativeCases,
                count,
                autoSave: false, // Preview first
            })

            if (result.success && result.generated) {
                setGeneratedCases(result.generated)
                setShowPreview(true)
            } else {
                setError(result.error || 'Failed to generate test cases')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    async function handleSaveAll() {
        setLoading(true)
        try {
            const result = await generateAndSaveTestCases({
                requirement,
                includeEdgeCases,
                includeNegativeCases,
                count,
                autoSave: true,
            })

            if (result.success) {
                setOpen(false)
                setRequirement('')
                setGeneratedCases([])
                setShowPreview(false)
                // Refresh the page to show new test cases
                window.location.reload()
            } else {
                setError(result.error || 'Failed to save test cases')
            }
        } catch (err) {
            setError('Failed to save test cases')
        } finally {
            setLoading(false)
        }
    }

    function handleReset() {
        setGeneratedCases([])
        setShowPreview(false)
        setError('')
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL':
                return 'danger'
            case 'HIGH':
                return 'danger'
            case 'MEDIUM':
                return 'warning'
            case 'LOW':
                return 'info'
            default:
                return 'secondary'
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <div className="flex flex-row items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span>AI Generate</span>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                {!showPreview ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                AI Test Case Generator
                            </DialogTitle>
                            <DialogDescription>
                                Describe your requirement and let AI generate comprehensive test cases.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="requirement">Requirement / User Story</Label>
                                <Textarea
                                    id="requirement"
                                    placeholder="Example: As a user, I want to be able to login with email and password so that I can access my account..."
                                    value={requirement}
                                    onChange={(e) => setRequirement(e.target.value)}
                                    rows={6}
                                    className="resize-none"
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label>Generation Options</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="edge-cases"
                                        checked={includeEdgeCases}
                                        onCheckedChange={(checked) => setIncludeEdgeCases(checked as boolean)}
                                    />
                                    <Label htmlFor="edge-cases" className="text-sm font-normal cursor-pointer">
                                        Include edge cases and boundary conditions
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="negative-cases"
                                        checked={includeNegativeCases}
                                        onCheckedChange={(checked) => setIncludeNegativeCases(checked as boolean)}
                                    />
                                    <Label htmlFor="negative-cases" className="text-sm font-normal cursor-pointer">
                                        Include negative test scenarios
                                    </Label>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="count">Number of test cases to generate</Label>
                                <Input
                                    id="count"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={count}
                                    onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                    {error}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleGenerate} disabled={loading || !requirement.trim()}>
                                {loading ? (
                                    <div className="flex flex-row items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Generating...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-row items-center gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        <span>Generate</span>
                                    </div>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Generated Test Cases ({generatedCases.length})</DialogTitle>
                            <DialogDescription>
                                Review the generated test cases below. Click "Save All" to add them to your test repository.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4 max-h-[500px] overflow-y-auto">
                            {generatedCases.map((testCase, index) => (
                                <Card key={index}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-base">{testCase.title}</CardTitle>
                                            <Badge variant={getPriorityColor(testCase.priority)}>
                                                {testCase.priority}
                                            </Badge>
                                        </div>
                                        {testCase.description && (
                                            <p className="text-sm text-muted-foreground">{testCase.description}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div>
                                            <p className="text-sm font-medium mb-1">Steps:</p>
                                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                                {testCase.steps}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium mb-1">Expected Result:</p>
                                            <p className="text-sm text-muted-foreground">{testCase.expectedResult}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleReset} disabled={loading}>
                                Regenerate
                            </Button>
                            <Button onClick={handleSaveAll} disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save All'
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
