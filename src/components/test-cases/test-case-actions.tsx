'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { deleteTestCase } from '@/app/actions/test-cases'
import { toast } from 'sonner'
import { EditTestCaseDialog } from './edit-test-case-dialog'

interface TestCaseActionsProps {
    testCase: any
}

export function TestCaseActions({ testCase }: TestCaseActionsProps) {
    const router = useRouter()
    const [editOpen, setEditOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this test case? This action cannot be undone.')) {
            setLoading(true)
            try {
                const result = await deleteTestCase(testCase.id)
                if (result.success) {
                    toast.success('Test case deleted successfully')
                    router.push('/test-cases')
                    router.refresh()
                } else {
                    toast.error(result.error || 'Failed to delete test case')
                }
            } catch (error) {
                console.error('Failed to delete test case', error)
                toast.error('An unexpected error occurred')
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                </Button>
            </div>

            <EditTestCaseDialog
                testCase={testCase}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    )
}
