'use client'

import { useState, useEffect } from 'react'
import { updateTestResult } from '@/app/actions/test-runs'
import { createJiraIssueFromTestFailure, getJiraProjects } from '@/app/actions/jira'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ResultStatus } from '@/types'
import { Input } from '@/components/ui/input'
import { Loader2, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface TestExecutionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    result: any
}

export function TestExecutionDialog({ open, onOpenChange, result }: TestExecutionDialogProps) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<ResultStatus>(ResultStatus.PENDING)
    const [notes, setNotes] = useState('')
    const [evidence, setEvidence] = useState('')

    // Jira state
    const [jiraProjects, setJiraProjects] = useState<Array<{ key: string, name: string }>>([])
    const [selectedProject, setSelectedProject] = useState('')
    const [creatingIssue, setCreatingIssue] = useState(false)
    const [jiraIssueUrl, setJiraIssueUrl] = useState('')
    const [jiraError, setJiraError] = useState('')

    useEffect(() => {
        if (result) {
            setStatus(result.status as ResultStatus)
            setNotes(result.notes || '')
            setEvidence(result.evidence || '')
            setJiraIssueUrl('') // Reset on new result

            // If already has defect with Jira ID, we could show it, but for now let's just focus on creation
            if (result.defects && result.defects.length > 0 && result.defects[0].jiraIssueId) {
                // In a real app we'd construct the URL properly or fetch it
                // setJiraIssueUrl(...) 
            }
        }
    }, [result])

    // Fetch Jira projects when dialog opens
    useEffect(() => {
        if (open) {
            getJiraProjects('demo-user').then(res => {
                if (res.success && res.projects) {
                    setJiraProjects(res.projects)
                    if (res.projects.length > 0) {
                        setSelectedProject(res.projects[0].key)
                    }
                }
            })
        }
    }, [open])

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault()
        if (!result) return

        setLoading(true)

        try {
            await updateTestResult({
                resultId: result.id,
                status,
                notes,
                evidence,
            })
            onOpenChange(false)
        } catch (error) {
            console.error('Failed to update test result', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleCreateJiraIssue() {
        if (!result || !selectedProject) return

        setCreatingIssue(true)
        setJiraError('')

        try {
            // First save the result state
            await updateTestResult({
                resultId: result.id,
                status,
                notes,
                evidence,
            })

            const res = await createJiraIssueFromTestFailure({
                userId: 'demo-user',
                testResultId: result.id,
                projectKey: selectedProject,
                issueType: 'Bug' // Default for now
            })

            if (res.success && res.issueUrl) {
                setJiraIssueUrl(res.issueUrl)
                // Optionally close dialog or show success
            } else {
                setJiraError(res.error || 'Failed to create Jira issue')
            }
        } catch (error) {
            setJiraError('An unexpected error occurred')
        } finally {
            setCreatingIssue(false)
        }
    }

    if (!result) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Execute Test Case</DialogTitle>
                        <DialogDescription>
                            {result.testCase.title}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Steps</h4>
                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md whitespace-pre-wrap">
                                {result.testCase.steps}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Expected Result</h4>
                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md whitespace-pre-wrap">
                                {result.testCase.expectedResult || 'No expected result defined.'}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select
                                value={status}
                                onValueChange={(value) => setStatus(value as ResultStatus)}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ResultStatus.PASS}>Pass</SelectItem>
                                    <SelectItem value={ResultStatus.FAIL}>Fail</SelectItem>
                                    <SelectItem value={ResultStatus.BLOCKED}>Blocked</SelectItem>
                                    <SelectItem value={ResultStatus.SKIPPED}>Skipped</SelectItem>
                                    <SelectItem value={ResultStatus.PENDING}>Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="text-right">
                                Notes
                            </Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Observations, actual results..."
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="evidence" className="text-right">
                                Evidence
                            </Label>
                            <Input
                                id="evidence"
                                value={evidence}
                                onChange={(e) => setEvidence(e.target.value)}
                                placeholder="URL to screenshot or video"
                                className="col-span-3"
                            />
                        </div>

                        {status === ResultStatus.FAIL && (
                            <div className="grid grid-cols-4 items-start gap-4 pt-4 border-t">
                                <Label className="text-right pt-2">
                                    Defect
                                </Label>
                                <div className="col-span-3 space-y-3">
                                    {jiraIssueUrl ? (
                                        <Alert className="bg-green-50 border-green-200">
                                            <AlertDescription className="text-green-800 flex items-center gap-2">
                                                Jira Issue Created!
                                                <a href={jiraIssueUrl} target="_blank" rel="noopener noreferrer" className="underline font-medium flex items-center gap-1">
                                                    View Issue <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <>
                                            {jiraProjects.length > 0 ? (
                                                <div className="space-y-3 p-4 border rounded-md bg-slate-50">
                                                    <h4 className="font-medium text-sm">Create Jira Defect</h4>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="project" className="text-xs">Project</Label>
                                                        <Select
                                                            value={selectedProject}
                                                            onValueChange={setSelectedProject}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Project" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {jiraProjects.map(p => (
                                                                    <SelectItem key={p.key} value={p.key}>
                                                                        {p.name} ({p.key})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {jiraError && (
                                                        <p className="text-xs text-destructive">{jiraError}</p>
                                                    )}

                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={handleCreateJiraIssue}
                                                        disabled={creatingIssue || !selectedProject}
                                                    >
                                                        {creatingIssue ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                                Creating Issue...
                                                            </>
                                                        ) : (
                                                            'Create Jira Issue'
                                                        )}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                                                    Configure Jira integration in Settings to enable one-click bug creation.
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading || creatingIssue}>
                            {loading ? 'Saving...' : 'Save Result'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
