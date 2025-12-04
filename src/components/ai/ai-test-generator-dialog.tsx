'use client'

import { useState, useEffect } from 'react'
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
import { Sparkles, Loader2, Terminal, Cpu, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface GeneratedTestCase {
    title: string
    description: string
    steps: string
    expectedResult: string
    priority: string
}

// Typing effect component
const TypingEffect = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState('')

    useEffect(() => {
        let index = 0
        const interval = setInterval(() => {
            setDisplayedText((prev) => prev + text.charAt(index))
            index++
            if (index >= text.length) clearInterval(interval)
        }, 20) // Speed of typing
        return () => clearInterval(interval)
    }, [text])

    return <span>{displayedText}</span>
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
    const [loadingStep, setLoadingStep] = useState(0)

    // Simulate loading steps for "Command Center" feel
    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setLoadingStep((prev) => (prev + 1) % 4)
            }, 800)
            return () => clearInterval(interval)
        } else {
            setLoadingStep(0)
        }
    }, [loading])

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

    const loadingMessages = [
        "Initializing Neural Engine...",
        "Analyzing Requirements...",
        "Generating Test Scenarios...",
        "Optimizing Coverage..."
    ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300 text-indigo-400">
                    <div className="flex flex-row items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span>AI Generate</span>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.2)]">
                {!showPreview ? (
                    <>
                        <DialogHeader className="border-b border-indigo-500/20 pb-4">
                            <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-indigo-100">
                                <Cpu className="h-6 w-6 text-indigo-400 animate-pulse" />
                                Command Center: Test Generator
                            </DialogTitle>
                            <DialogDescription className="text-indigo-200/60">
                                Input your requirements below to initiate the automated test generation sequence.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-6">
                            <div className="grid gap-2">
                                <Label htmlFor="requirement" className="text-indigo-300 font-mono">
                                    <Terminal className="h-4 w-4 inline mr-2" />
                                    INPUT_REQUIREMENT
                                </Label>
                                <Textarea
                                    id="requirement"
                                    placeholder="> Enter user story or requirement specification..."
                                    value={requirement}
                                    onChange={(e) => setRequirement(e.target.value)}
                                    rows={6}
                                    className="resize-none bg-slate-900/50 border-indigo-500/30 focus:border-indigo-500/60 text-indigo-100 placeholder:text-indigo-500/30 font-mono"
                                />
                            </div>

                            <div className="grid gap-4 p-4 rounded-lg bg-indigo-950/20 border border-indigo-500/20">
                                <Label className="text-indigo-300 font-mono">CONFIGURATION_PARAMETERS</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="edge-cases"
                                            checked={includeEdgeCases}
                                            onCheckedChange={(checked) => setIncludeEdgeCases(checked as boolean)}
                                            className="border-indigo-500/50 data-[state=checked]:bg-indigo-500 data-[state=checked]:text-white"
                                        />
                                        <Label htmlFor="edge-cases" className="text-sm font-normal cursor-pointer text-indigo-200/80">
                                            Include Edge Cases
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="negative-cases"
                                            checked={includeNegativeCases}
                                            onCheckedChange={(checked) => setIncludeNegativeCases(checked as boolean)}
                                            className="border-indigo-500/50 data-[state=checked]:bg-indigo-500 data-[state=checked]:text-white"
                                        />
                                        <Label htmlFor="negative-cases" className="text-sm font-normal cursor-pointer text-indigo-200/80">
                                            Include Negative Scenarios
                                        </Label>
                                    </div>
                                </div>
                                <div className="grid gap-2 mt-2">
                                    <Label htmlFor="count" className="text-indigo-200/80 text-xs">GENERATION_COUNT</Label>
                                    <Input
                                        id="count"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={count}
                                        onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                                        className="bg-slate-900/50 border-indigo-500/30 text-indigo-100 h-8 w-24"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm text-rose-400 bg-rose-950/30 border border-rose-500/30 p-3 rounded-md flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="border-t border-indigo-500/20 pt-4">
                            <Button variant="ghost" onClick={() => setOpen(false)} className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-950/30">
                                Abort
                            </Button>
                            <Button
                                onClick={handleGenerate}
                                disabled={loading || !requirement.trim()}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white"
                            >
                                {loading ? (
                                    <div className="flex flex-row items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="font-mono min-w-[200px] text-left">
                                            {loadingMessages[loadingStep]}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-row items-center gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        <span>Initialize Generation</span>
                                    </div>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader className="border-b border-indigo-500/20 pb-4">
                            <DialogTitle className="text-2xl font-bold text-indigo-100">
                                Generation Complete
                            </DialogTitle>
                            <DialogDescription className="text-indigo-200/60">
                                {generatedCases.length} test scenarios generated successfully.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-500/30 scrollbar-track-transparent">
                            {generatedCases.map((testCase, index) => (
                                <Card key={index} className="bg-slate-900/40 border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <CardTitle className="text-base text-indigo-100 font-mono">
                                                <span className="text-indigo-500 mr-2">#{index + 1}</span>
                                                <TypingEffect text={testCase.title} />
                                            </CardTitle>
                                            <Badge variant={getPriorityColor(testCase.priority)} className="shrink-0">
                                                {testCase.priority}
                                            </Badge>
                                        </div>
                                        {testCase.description && (
                                            <p className="text-sm text-indigo-200/60">{testCase.description}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-black/20 p-3 rounded border border-indigo-500/10">
                                            <p className="text-xs font-bold text-indigo-400 mb-1 uppercase tracking-wider">Steps</p>
                                            <p className="text-sm text-indigo-100/80 whitespace-pre-line font-mono text-xs">
                                                {testCase.steps}
                                            </p>
                                        </div>
                                        <div className="bg-emerald-950/10 p-3 rounded border border-emerald-500/10">
                                            <p className="text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider">Expected Result</p>
                                            <p className="text-sm text-emerald-100/80 font-mono text-xs">{testCase.expectedResult}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <DialogFooter className="border-t border-indigo-500/20 pt-4">
                            <Button variant="ghost" onClick={handleReset} disabled={loading} className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-950/30">
                                Regenerate
                            </Button>
                            <Button
                                onClick={handleSaveAll}
                                disabled={loading}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Confirm & Save'
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
