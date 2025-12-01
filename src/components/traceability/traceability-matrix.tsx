'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    ChevronDown,
    ChevronRight,
    FileText,
    FolderKanban,
    TestTube2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    MinusCircle,
    Link2,
    TrendingUp,
    TrendingDown,
} from 'lucide-react'
import type { TraceabilityMatrix, TraceabilityItem } from '@/app/actions/traceability'

interface TraceabilityMatrixProps {
    data: TraceabilityMatrix
}

export function TraceabilityMatrixView({ data }: TraceabilityMatrixProps) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedItems)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedItems(newExpanded)
    }

    const expandAll = () => {
        setExpandedItems(new Set(data.items.map((i) => i.requirementId)))
    }

    const collapseAll = () => {
        setExpandedItems(new Set())
    }

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'PASS':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case 'FAIL':
                return <XCircle className="h-4 w-4 text-red-500" />
            case 'BLOCKED':
                return <MinusCircle className="h-4 w-4 text-yellow-500" />
            default:
                return <MinusCircle className="h-4 w-4 text-gray-400" />
        }
    }

    const getPriorityBadge = (priority: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline' | 'danger'> = {
            CRITICAL: 'danger',
            HIGH: 'danger',
            MEDIUM: 'secondary',
            LOW: 'outline',
        }
        return (
            <Badge variant={variants[priority] || 'outline'} className="text-xs">
                {priority}
            </Badge>
        )
    }

    const getCoverageColor = (percent: number) => {
        if (percent >= 80) return 'text-green-600'
        if (percent >= 50) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Requirements</CardDescription>
                        <CardTitle className="text-2xl">{data.summary.totalRequirements}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Covered</CardDescription>
                        <CardTitle className="text-2xl text-green-600">
                            {data.summary.coveredRequirements}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Uncovered</CardDescription>
                        <CardTitle className="text-2xl text-red-600">
                            {data.summary.uncoveredRequirements}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Test Cases</CardDescription>
                        <CardTitle className="text-2xl">{data.summary.totalTestCases}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Overall Coverage</CardDescription>
                        <CardTitle className={`text-2xl ${getCoverageColor(data.summary.overallCoverage)}`}>
                            {data.summary.overallCoverage}%
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Matrix Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Link2 className="h-5 w-5" />
                                Requirements to Test Cases Matrix
                            </CardTitle>
                            <CardDescription>
                                Visual mapping of requirements to test coverage
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={expandAll}>
                                Expand All
                            </Button>
                            <Button variant="outline" size="sm" onClick={collapseAll}>
                                Collapse All
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {data.items.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No requirements found.</p>
                            <p className="text-sm">Analyze a document to create traceability links.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[600px]">
                            <div className="space-y-2">
                                {data.items.map((item) => (
                                    <RequirementRow
                                        key={item.requirementId}
                                        item={item}
                                        isExpanded={expandedItems.has(item.requirementId)}
                                        onToggle={() => toggleExpand(item.requirementId)}
                                        getStatusIcon={getStatusIcon}
                                        getPriorityBadge={getPriorityBadge}
                                        getCoverageColor={getCoverageColor}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

interface RequirementRowProps {
    item: TraceabilityItem
    isExpanded: boolean
    onToggle: () => void
    getStatusIcon: (status?: string) => React.ReactNode
    getPriorityBadge: (priority: string) => React.ReactNode
    getCoverageColor: (percent: number) => string
}

function RequirementRow({
    item,
    isExpanded,
    onToggle,
    getStatusIcon,
    getPriorityBadge,
    getCoverageColor,
}: RequirementRowProps) {
    return (
        <Collapsible open={isExpanded} onOpenChange={onToggle}>
            <div className="border rounded-lg">
                {/* Requirement Header */}
                <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                                <div className="font-medium">{item.requirementTitle}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                        {item.requirementType}
                                    </Badge>
                                    {item.risks.length > 0 && (
                                        <span className="flex items-center gap-1 text-yellow-600">
                                            <AlertTriangle className="h-3 w-3" />
                                            {item.risks.length} risks
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            {/* Coverage Stats */}
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">Test Cases</div>
                                <div className="font-medium">{item.coverage.totalTestCases}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">Pass Rate</div>
                                <div className={`font-medium ${getCoverageColor(item.coverage.coveragePercent)}`}>
                                    {item.coverage.coveragePercent}%
                                </div>
                            </div>
                            <div className="w-32">
                                <Progress
                                    value={item.coverage.coveragePercent}
                                    className="h-2"
                                />
                            </div>
                        </div>
                    </div>
                </CollapsibleTrigger>

                {/* Expanded Content */}
                <CollapsibleContent>
                    <div className="border-t px-4 py-4 bg-muted/30">
                        {/* Risks Section */}
                        {item.risks.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    Identified Risks
                                </h4>
                                <div className="space-y-1">
                                    {item.risks.map((risk, idx) => (
                                        <div key={idx} className="text-sm flex items-center gap-2 pl-6">
                                            <Badge
                                                variant={
                                                    risk.severity === 'HIGH' || risk.severity === 'CRITICAL'
                                                        ? 'danger'
                                                        : 'outline'
                                                }
                                                className="text-xs"
                                            >
                                                {risk.severity}
                                            </Badge>
                                            <span className="text-muted-foreground">{risk.description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Test Suites and Cases */}
                        {item.testSuites.length > 0 ? (
                            <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <FolderKanban className="h-4 w-4 text-purple-500" />
                                    Linked Test Suites & Cases
                                </h4>
                                <div className="space-y-3">
                                    {item.testSuites.map((suite) => (
                                        <div key={suite.id} className="pl-6">
                                            <Link
                                                href={`/test-suites/${suite.id}`}
                                                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                                            >
                                                <FolderKanban className="h-3 w-3" />
                                                {suite.name}
                                            </Link>
                                            {suite.testCases.length > 0 && (
                                                <Table className="mt-2">
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-8">Status</TableHead>
                                                            <TableHead>Test Case</TableHead>
                                                            <TableHead className="w-24">Priority</TableHead>
                                                            <TableHead className="w-24">State</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {suite.testCases.map((tc) => (
                                                            <TableRow key={tc.id}>
                                                                <TableCell>{getStatusIcon(tc.lastResult)}</TableCell>
                                                                <TableCell>
                                                                    <Link
                                                                        href={`/test-cases/${tc.id}`}
                                                                        className="text-primary hover:underline flex items-center gap-1"
                                                                    >
                                                                        <TestTube2 className="h-3 w-3" />
                                                                        {tc.title}
                                                                    </Link>
                                                                </TableCell>
                                                                <TableCell>{getPriorityBadge(tc.priority)}</TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {tc.status}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                <TestTube2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                No test cases linked to this requirement.
                                <br />
                                <Link
                                    href={`/document-analysis/${item.requirementId}`}
                                    className="text-primary hover:underline"
                                >
                                    Generate test cases
                                </Link>
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    )
}
