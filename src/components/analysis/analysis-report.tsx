'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, AlertCircle, Info, CheckCircle2, FileText, ExternalLink, Loader2 } from 'lucide-react'
import { DocumentAnalysisResult } from '@/lib/ai'
import { useState } from 'react'
import { generateTestCasesFromAnalysis } from '@/app/actions/document-analysis'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AnalysisReportProps {
    analysisId: string
    analysis: DocumentAnalysisResult
    sourceType: 'JIRA_EPIC' | 'CONFLUENCE_PAGE'
    sourceTitle: string
    sourceId: string
    testSuiteId?: string | null
}

export function AnalysisReport({
    analysisId,
    analysis,
    sourceType,
    sourceTitle,
    sourceId,
    testSuiteId
}: AnalysisReportProps) {
    const [generating, setGenerating] = useState(false)
    const router = useRouter()

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-500'
            case 'HIGH': return 'bg-orange-500'
            case 'MEDIUM': return 'bg-yellow-500'
            case 'LOW': return 'bg-blue-500'
            default: return 'bg-gray-500'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'bg-orange-500'
            case 'MEDIUM': return 'bg-yellow-500'
            case 'LOW': return 'bg-blue-500'
            default: return 'bg-gray-500'
        }
    }

    async function handleGenerateTestCases() {
        setGenerating(true)
        try {
            const result = await generateTestCasesFromAnalysis(analysisId)
            if (result.success) {
                toast.success(`Generated ${result.count} test cases successfully!`)
                router.push(`/test-suites`)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to generate test cases')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{sourceTitle}</h1>
                    <p className="text-muted-foreground mt-1">
                        {sourceType === 'JIRA_EPIC' ? 'Jira Epic' : 'Confluence Page'} • {sourceId}
                    </p>
                </div>
                {testSuiteId ? (
                    <Button onClick={() => router.push(`/test-suites`)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Test Suite
                    </Button>
                ) : (
                    <Button onClick={handleGenerateTestCases} disabled={generating}>
                        {generating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Test Cases...
                            </>
                        ) : (
                            'Generate Test Cases'
                        )}
                    </Button>
                )}
            </div>

            {/* Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Executive Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {analysis.summary}
                    </p>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Risks</p>
                                <p className="text-2xl font-bold">{analysis.risks.length}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Gaps</p>
                                <p className="text-2xl font-bold">{analysis.gaps.length}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Missed Requirements</p>
                                <p className="text-2xl font-bold">{analysis.missedRequirements.length}</p>
                            </div>
                            <Info className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Recommendations</p>
                                <p className="text-2xl font-bold">{analysis.recommendations.length}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Risks */}
            {analysis.risks.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Identified Risks
                        </CardTitle>
                        <CardDescription>
                            Potential issues that could affect quality or project success
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analysis.risks.map((risk, idx) => (
                            <div key={idx} className="border rounded-lg p-4 space-y-2">
                                <div className="flex items-start justify-between">
                                    <h4 className="font-semibold">{risk.title}</h4>
                                    <Badge className={getSeverityColor(risk.severity)}>
                                        {risk.severity}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{risk.description}</p>
                                <div className="bg-muted p-3 rounded-md">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Impact:</p>
                                    <p className="text-sm">{risk.impact}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Gaps */}
            {analysis.gaps.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                            Requirements Gaps
                        </CardTitle>
                        <CardDescription>
                            Missing information or unclear specifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analysis.gaps.map((gap, idx) => (
                            <div key={idx} className="border rounded-lg p-4 space-y-2">
                                <div className="flex items-start justify-between">
                                    <h4 className="font-semibold">{gap.title}</h4>
                                    <Badge variant="outline">{gap.category}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{gap.description}</p>
                                <div className="bg-muted p-3 rounded-md">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Suggestion:</p>
                                    <p className="text-sm">{gap.suggestion}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Missed Requirements */}
            {analysis.missedRequirements.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-500" />
                            Missed Requirements
                        </CardTitle>
                        <CardDescription>
                            Important requirements that should be included
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analysis.missedRequirements.map((req, idx) => (
                            <div key={idx} className="border rounded-lg p-4 space-y-2">
                                <h4 className="font-semibold">{req.title}</h4>
                                <p className="text-sm text-muted-foreground">{req.description}</p>
                                <div className="bg-muted p-3 rounded-md">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Why this matters:</p>
                                    <p className="text-sm">{req.reasoning}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Recommendations
                        </CardTitle>
                        <CardDescription>
                            Actionable suggestions to improve quality and coverage
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analysis.recommendations.map((rec, idx) => (
                            <div key={idx} className="border rounded-lg p-4 space-y-2">
                                <div className="flex items-start justify-between">
                                    <h4 className="font-semibold">{rec.title}</h4>
                                    <Badge className={getPriorityColor(rec.priority)}>
                                        {rec.priority}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{rec.description}</p>
                                {rec.actionItems.length > 0 && (
                                    <div className="bg-muted p-3 rounded-md">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Action Items:</p>
                                        <ul className="space-y-1">
                                            {rec.actionItems.map((item, itemIdx) => (
                                                <li key={itemIdx} className="text-sm flex items-start gap-2">
                                                    <span className="text-muted-foreground mt-1">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
