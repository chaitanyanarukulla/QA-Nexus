'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, AlertCircle, ArrowUp, ArrowRight, ArrowDown, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { TestCaseDetailDialog } from './test-case-detail-dialog'

interface TestCaseListProps {
    testCases: any[]
}

export function TestCaseList({ testCases }: TestCaseListProps) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [priorityFilter, setPriorityFilter] = useState('ALL')
    const [selectedTestCase, setSelectedTestCase] = useState<any | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)

    const filteredCases = testCases.filter((tc: any) => {
        const matchesSearch = tc.title.toLowerCase().includes(search.toLowerCase()) ||
            tc.id.toLowerCase().includes(search.toLowerCase())
        const matchesPriority = priorityFilter === 'ALL' || tc.priority === priorityFilter
        return matchesSearch && matchesPriority
    })

    const handleRowClick = (testCase: any) => {
        router.push(`/test-cases/${testCase.id}`)
    }

    if (testCases.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <p>No test cases found.</p>
                    <p className="text-sm">Create your first test case to get started.</p>
                </CardContent>
            </Card>
        )
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'CRITICAL':
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Critical
                    </Badge>
                )
            case 'HIGH':
                return (
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 gap-1">
                        <ArrowUp className="w-3 h-3" />
                        High
                    </Badge>
                )
            case 'MEDIUM':
                return (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 gap-1">
                        <ArrowRight className="w-3 h-3" />
                        Medium
                    </Badge>
                )
            case 'LOW':
                return (
                    <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 gap-1">
                        <ArrowDown className="w-3 h-3" />
                        Low
                    </Badge>
                )
            default:
                return <Badge variant="outline">{priority}</Badge>
        }
    }

    const getLatestStatusBadge = (results: any[]) => {
        if (!results || results.length === 0) {
            return (
                <Badge variant="outline" className="text-muted-foreground font-normal gap-1">
                    <Clock className="w-3 h-3" />
                    No Run
                </Badge>
            )
        }
        const status = results[0].status
        switch (status) {
            case 'PASS':
                return (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Pass
                    </Badge>
                )
            case 'FAIL':
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 gap-1">
                        <XCircle className="w-3 h-3" />
                        Fail
                    </Badge>
                )
            case 'BLOCKED':
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Blocked
                    </Badge>
                )
            case 'SKIPPED':
                return (
                    <Badge variant="secondary" className="gap-1">
                        <ArrowRight className="w-3 h-3" />
                        Skipped
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                    </Badge>
                )
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search test cases by title or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10"
                    />
                </div>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[180px] h-10">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter by Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Priorities</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="font-semibold">ID</TableHead>
                            <TableHead className="font-semibold">Title</TableHead>
                            <TableHead className="font-semibold">Priority</TableHead>
                            <TableHead className="font-semibold">Lifecycle</TableHead>
                            <TableHead className="font-semibold">Last Run</TableHead>
                            <TableHead className="text-right font-semibold">Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCases.map((testCase: any) => (
                            <TableRow
                                key={testCase.id}
                                className="cursor-pointer hover:bg-muted/30 transition-colors group"
                                onClick={() => handleRowClick(testCase)}
                            >
                                <TableCell className="font-mono text-xs truncate max-w-[100px] text-muted-foreground">
                                    #{testCase.id.slice(-6)}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium group-hover:text-primary transition-colors">
                                        {testCase.title}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getPriorityBadge(testCase.priority)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={
                                            testCase.status === 'ACTIVE'
                                                ? 'border-green-500 text-green-700 bg-green-50'
                                                : testCase.status === 'DEPRECATED'
                                                    ? 'border-gray-400 text-gray-600 bg-gray-50'
                                                    : 'border-blue-500 text-blue-700 bg-blue-50'
                                        }
                                    >
                                        {testCase.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {getLatestStatusBadge(testCase.testResults)}
                                </TableCell>
                                <TableCell className="text-right text-sm text-muted-foreground">
                                    {new Date(testCase.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredCases.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-8 w-8 text-muted-foreground/50" />
                                        <p>No test cases match your filters.</p>
                                        <p className="text-xs">Try adjusting your search or filter criteria.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div>
                    Showing <span className="font-medium text-foreground">{filteredCases.length}</span> of <span className="font-medium text-foreground">{testCases.length}</span> test cases
                </div>
                {filteredCases.length > 0 && (
                    <div className="text-muted-foreground/70">
                        Click on any row to view details
                    </div>
                )}
            </div>

            <TestCaseDetailDialog
                testCase={selectedTestCase}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />
        </div>
    )
}
