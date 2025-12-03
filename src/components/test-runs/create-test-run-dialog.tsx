'use client'

import { useState } from 'react'
import { createTestRun } from '@/app/actions/test-runs'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus } from 'lucide-react'

interface CreateTestRunDialogProps {
    testCases?: any[]
}

export function CreateTestRunDialog({ testCases = [] }: CreateTestRunDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedCases, setSelectedCases] = useState<string[]>([])

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)

        try {
            await createTestRun({
                title: formData.get('title') as string,
                userId: 'demo-user',
                testCaseIds: selectedCases,
            })
            setOpen(false)
            setSelectedCases([])
            event.currentTarget.reset()
        } catch (error) {
            console.error('Failed to create test run', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleTestCase = (id: string) => {
        setSelectedCases(prev =>
            prev.includes(id)
                ? prev.filter((c: any) => c !== id)
                : [...prev, id]
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <div className="flex flex-row items-center gap-2">
                        <Plus className="h-4 w-4" />
                        <span>New Test Run</span>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Test Run</DialogTitle>
                        <DialogDescription>
                            Start a new test execution cycle.
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
                                placeholder="Sprint 24 Regression"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Select Test Cases</Label>
                            <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto space-y-2">
                                {testCases.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No test cases available.</p>
                                ) : (
                                    testCases.map((testCase: any) => (
                                        <div key={testCase.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={testCase.id}
                                                checked={selectedCases.includes(testCase.id)}
                                                onCheckedChange={() => toggleTestCase(testCase.id)}
                                            />
                                            <Label htmlFor={testCase.id} className="text-sm font-normal cursor-pointer">
                                                {testCase.title}
                                            </Label>
                                        </div>
                                    ))
                                )}
                            </div>
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
