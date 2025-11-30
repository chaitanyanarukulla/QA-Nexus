'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { PlayCircle, CheckCircle, XCircle, AlertCircle, MinusCircle } from 'lucide-react'
import { TestExecutionDialog } from './test-execution-dialog'
import { ResultStatus } from '@/types'

interface TestRunDetailProps {
    testRun: any // Typed properly in real app
}

export function TestRunDetail({ testRun }: TestRunDetailProps) {
    const [selectedResult, setSelectedResult] = useState<any>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const passedCount = testRun.results.filter((r: any) => r.status === 'PASS').length
    const totalCount = testRun.results.length
    const progress = totalCount > 0 ? (passedCount / totalCount) * 100 : 0

    const handleExecute = (result: any) => {
        setSelectedResult(result)
        setDialogOpen(true)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PASS':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Pass</Badge>
            case 'FAIL':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Fail</Badge>
            case 'BLOCKED':
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" /> Blocked</Badge>
            case 'SKIPPED':
                return <Badge variant="secondary"><MinusCircle className="w-3 h-3 mr-1" /> Skipped</Badge>
            default:
                return <Badge variant="outline"><PlayCircle className="w-3 h-3 mr-1" /> Pending</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{testRun.title}</h1>
                    <p className="text-muted-foreground mt-1">
                        Run ID: {testRun.id} • Created by {testRun.user?.name || 'Unknown'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-lg px-4 py-1">
                        {testRun.status}
                    </Badge>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Progress value={progress} className="h-3" />
                        <span className="text-sm font-medium whitespace-nowrap">
                            {passedCount} / {totalCount} Passed
                        </span>
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Status</TableHead>
                            <TableHead>Test Case</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {testRun.results.map((result: any) => (
                            <TableRow key={result.id} className={
                                result.status === 'FAIL' ? 'bg-red-50/50 hover:bg-red-50' :
                                    result.status === 'PASS' ? 'bg-green-50/50 hover:bg-green-50' :
                                        ''
                            }>
                                <TableCell>
                                    {getStatusBadge(result.status)}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{result.testCase.title}</div>
                                    <div className="text-sm text-muted-foreground truncate max-w-[500px]">
                                        {result.testCase.description}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{result.testCase.priority}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant={result.status === 'PENDING' ? 'primary' : 'outline'}
                                        size="sm"
                                        onClick={() => handleExecute(result)}
                                    >
                                        {result.status === 'PENDING' ? 'Execute' : 'Update'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <TestExecutionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                result={selectedResult}
            />
        </div>
    )
}
