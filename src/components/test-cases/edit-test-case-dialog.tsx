'use client'

import { useState } from 'react'
import { updateTestCase } from '@/app/actions/test-cases'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Pencil } from 'lucide-react'
import { Priority, Status } from '@/types'

interface EditTestCaseDialogProps {
    testCase: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditTestCaseDialog({ testCase, open, onOpenChange }: EditTestCaseDialogProps) {
    const [loading, setLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)

        try {
            // Handle steps parsing/formatting
            let steps = formData.get('steps') as string
            // If it was stored as JSON array string, we might want to keep it that way or simplify.
            // For now, assuming the backend handles it or we send it as string.
            // The create dialog sends JSON.stringify(string), which is a bit odd but consistent.
            // Let's try to match the create dialog's behavior if possible, or just send the string.
            // Looking at create-test-case-dialog: steps: JSON.stringify(formData.get('steps') as string)

            const result = await updateTestCase(testCase.id, {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                steps: JSON.stringify(steps),
                expectedResult: formData.get('expectedResult') as string,
                priority: formData.get('priority') as Priority,
                status: formData.get('status') as Status,
            })

            if (result.success) {
                toast.success('Test case updated successfully')
                onOpenChange(false)
            } else {
                toast.error(result.error || 'Failed to update test case')
            }
        } catch (error) {
            console.error('Failed to update test case', error)
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    // Helper to format steps for display in textarea
    const getStepsValue = () => {
        if (!testCase.steps) return ''
        if (Array.isArray(testCase.steps)) {
            return (testCase.steps as string[]).join('\n')
        }
        try {
            // Try to parse if it's a JSON string
            const parsed = JSON.parse(testCase.steps as string)
            if (Array.isArray(parsed)) return parsed.join('\n')
            return String(parsed)
        } catch {
            return String(testCase.steps)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Test Case</DialogTitle>
                        <DialogDescription>
                            Make changes to your test case here.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                defaultValue={testCase.title}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={testCase.description || ''}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="steps" className="text-right">
                                Steps
                            </Label>
                            <Textarea
                                id="steps"
                                name="steps"
                                defaultValue={getStepsValue()}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="expectedResult" className="text-right">
                                Expected
                            </Label>
                            <Textarea
                                id="expectedResult"
                                name="expectedResult"
                                defaultValue={testCase.expectedResult || ''}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="priority" className="text-right">
                                Priority
                            </Label>
                            <Select name="priority" defaultValue={testCase.priority}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={Priority.LOW}>Low</SelectItem>
                                    <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                                    <SelectItem value={Priority.HIGH}>High</SelectItem>
                                    <SelectItem value={Priority.CRITICAL}>Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select name="status" defaultValue={testCase.status}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={Status.ACTIVE}>Active</SelectItem>
                                    <SelectItem value={Status.DRAFT}>Draft</SelectItem>
                                    <SelectItem value={Status.DEPRECATED}>Deprecated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
