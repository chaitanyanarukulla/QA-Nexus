'use client'

import { useState } from 'react'
import { createTestCase } from '@/app/actions/test-cases'
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
import { Plus } from 'lucide-react'
import { Priority, Status } from '@/types'

export function CreateTestCaseDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)

        try {
            const result = await createTestCase({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                steps: JSON.stringify(formData.get('steps') as string), // Simple string for now
                expectedResult: formData.get('expectedResult') as string,
                priority: formData.get('priority') as Priority,
                status: Status.ACTIVE,
            })

            if (result.success) {
                toast.success('Test case created successfully')
                setOpen(false)
                // Reset form
                event.currentTarget.reset()
            } else {
                toast.error(result.error || 'Failed to create test case')
            }
        } catch (error) {
            console.error('Failed to create test case', error)
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <div className="flex flex-row items-center gap-2">
                        <Plus className="h-4 w-4" />
                        <span>New Test Case</span>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Test Case</DialogTitle>
                        <DialogDescription>
                            Add a new test case to your project.
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
                                placeholder="Login functionality"
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
                                placeholder="Verify user can login..."
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
                                placeholder="1. Go to login page..."
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
                                placeholder="User is redirected..."
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="priority" className="text-right">
                                Priority
                            </Label>
                            <Select name="priority" defaultValue={Priority.MEDIUM}>
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
