'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { deleteDefect } from '@/app/actions/defects'
import { useState } from 'react'
import { toast } from 'sonner'

interface DefectListProps {
    defects: any[]
}

export function DefectList({ defects }: DefectListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (confirm('Are you sure you want to delete this defect?')) {
            setDeletingId(id)
            try {
                const result = await deleteDefect(id)
                if (result.success) {
                    toast.success('Defect deleted successfully')
                } else {
                    toast.error(result.error || 'Failed to delete defect')
                }
            } catch (error) {
                console.error('Failed to delete defect', error)
                toast.error('An unexpected error occurred')
            } finally {
                setDeletingId(null)
            }
        }
    }

    if (defects.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <p>No defects found.</p>
                    <p className="text-sm">Log defects from test executions or create them manually.</p>
                </CardContent>
            </Card>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN':
                return 'danger'
            case 'IN_PROGRESS':
                return 'warning'
            case 'RESOLVED':
                return 'success'
            case 'CLOSED':
                return 'secondary'
            default:
                return 'outline'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL':
                return 'danger'
            case 'HIGH':
                return 'warning'
            case 'MEDIUM':
                return 'info'
            case 'LOW':
                return 'secondary'
            default:
                return 'outline'
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Jira Issue</TableHead>
                        <TableHead>Linked Test</TableHead>
                        <TableHead className="text-right">Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {defects.map((defect) => (
                        <TableRow key={defect.id}>
                            <TableCell className="font-medium truncate max-w-[100px]">
                                {defect.id}
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{defect.title}</div>
                                {defect.description && (
                                    <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                                        {defect.description}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusColor(defect.status)}>
                                    {defect.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={`
                                    ${defect.priority === 'CRITICAL' ? 'border-red-500 text-red-600 bg-red-50' : ''}
                                    ${defect.priority === 'HIGH' ? 'border-orange-500 text-orange-600 bg-orange-50' : ''}
                                    ${defect.priority === 'MEDIUM' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' : ''}
                                    ${defect.priority === 'LOW' ? 'border-green-500 text-green-600 bg-green-50' : ''}
                                `}>
                                    {defect.priority}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {defect.jiraIssueId ? (
                                    <a
                                        href="#"
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-medium"
                                        title="View in Jira"
                                    >
                                        <img src="https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon.png" className="w-3 h-3" alt="Jira" />
                                        {defect.jiraIssueId}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                ) : (
                                    <span className="text-muted-foreground text-xs">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {defect.testResult ? (
                                    <Link href={`/test-runs/${defect.testResult.testRunId}`} className="hover:underline text-primary text-sm">
                                        {defect.testResult.testCase.title}
                                    </Link>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {new Date(defect.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => handleDelete(e, defect.id)}
                                    disabled={deletingId === defect.id}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
