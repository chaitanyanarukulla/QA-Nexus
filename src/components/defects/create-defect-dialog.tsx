'use client'

import { useState } from 'react'
import { createDefect } from '@/app/actions/defects'
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
import { Priority } from '@/types'
import { Plus } from 'lucide-react'

export function CreateDefectDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [priority, setPriority] = useState<Priority>(Priority.MEDIUM)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)

        try {
            const result = await createDefect({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                priority: priority,
                jiraIssueId: formData.get('jiraIssueId') as string,
            })

            if (result.success) {
                toast.success('Defect created successfully')
                setOpen(false)
                event.currentTarget.reset()
                setPriority(Priority.MEDIUM)
            } else {
                toast.error(result.error || 'Failed to create defect')
            }
        } catch (error) {
            console.error('Failed to create defect', error)
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Defect
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Defect</DialogTitle>
                        <DialogDescription>
                            Log a new defect or issue.
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
                                placeholder="Login button not working"
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
                                placeholder="Steps to reproduce..."
                                className="col-span-3"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="priority" className="text-right">
                                Priority
                            </Label>
                            <Select
                                value={priority}
                                onValueChange={(value) => setPriority(value as Priority)}
                            >
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
                            <Label htmlFor="jiraIssueId" className="text-right">
                                Jira Issue
                            </Label>
                            <Input
                                id="jiraIssueId"
                                name="jiraIssueId"
                                placeholder="PROJ-123"
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
