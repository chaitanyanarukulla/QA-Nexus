import { getAllDocumentAnalyses } from '@/app/actions/document-analysis'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import Link from 'next/link'

export default async function DocumentAnalysisPage() {
    const result = await getAllDocumentAnalyses({ limit: 50 })
    const analyses = result.success ? result.analyses : []

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Document Analysis</h1>
                    <p className="text-muted-foreground">
                        Review requirements analysis reports and generate test cases
                    </p>
                </div>
            </div>

            {analyses.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Use the Import Content dialog to analyze Jira Epics or Confluence Pages
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {analyses.map((analysis) => {
                        const risks = analysis.risks as any[]
                        const gaps = analysis.gaps as any[]
                        const missedReqs = analysis.missedRequirements as any[]
                        const recommendations = analysis.recommendations as any[]

                        return (
                            <Card key={analysis.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center gap-2">
                                                {analysis.sourceTitle}
                                                <Badge variant="outline">
                                                    {analysis.sourceType === 'JIRA_EPIC' ? 'Jira Epic' : 'Confluence'}
                                                </Badge>
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {analysis.sourceId} • Analyzed on {new Date(analysis.analyzedAt).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <Link href={`/document-analysis/${analysis.id}`}>
                                            <Button variant="outline" size="sm">
                                                View Report
                                                <ExternalLink className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                            <div>
                                                <p className="text-2xl font-bold">{risks.length}</p>
                                                <p className="text-xs text-muted-foreground">Risks</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-orange-500" />
                                            <div>
                                                <p className="text-2xl font-bold">{gaps.length}</p>
                                                <p className="text-xs text-muted-foreground">Gaps</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Info className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <p className="text-2xl font-bold">{missedReqs.length}</p>
                                                <p className="text-xs text-muted-foreground">Missed Reqs</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-green-500" />
                                            <div>
                                                <p className="text-2xl font-bold">{recommendations.length}</p>
                                                <p className="text-xs text-muted-foreground">Actions</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {analysis.summary}
                                    </p>
                                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                        <div className="text-xs text-muted-foreground">
                                            Source: {analysis.sourceType === 'JIRA_EPIC' ? 'Jira Epic' : 'Confluence Page'} • {analysis.sourceId}
                                        </div>
                                        {analysis.testSuiteId && (
                                            <Link href={`/test-suites/${analysis.testSuiteId}`}>
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer">
                                                    ✓ Test Suite Created
                                                </Badge>
                                            </Link>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
