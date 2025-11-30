import { getDocumentAnalysis } from '@/app/actions/document-analysis'
import { AnalysisReport } from '@/components/analysis/analysis-report'
import { CoverageMatrix } from '@/components/analysis/coverage-matrix'
import { DocumentAnalysisResult } from '@/lib/ai'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Separator } from '@/components/ui/separator'

export default async function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const result = await getDocumentAnalysis(id)

    if (!result.success || !result.analysis) {
        notFound()
    }

    const { analysis } = result
    const analysisResult: DocumentAnalysisResult = {
        risks: analysis.risks as any,
        gaps: analysis.gaps as any,
        missedRequirements: analysis.missedRequirements as any,
        recommendations: analysis.recommendations as any,
        summary: analysis.summary,
    }

    // Fetch test cases if suite exists
    let testCases: any[] = []
    if (analysis.testSuiteId) {
        testCases = await prisma.testCase.findMany({
            where: { suiteId: analysis.testSuiteId },
            orderBy: { createdAt: 'asc' }
        })
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <AnalysisReport
                analysisId={analysis.id}
                analysis={analysisResult}
                sourceType={analysis.sourceType as 'JIRA_EPIC' | 'CONFLUENCE_PAGE'}
                sourceTitle={analysis.sourceTitle}
                sourceId={analysis.sourceId}
                testSuiteId={analysis.testSuiteId}
            />

            {analysis.testSuiteId && testCases.length > 0 && (
                <>
                    <Separator />
                    <CoverageMatrix
                        risks={analysisResult.risks}
                        gaps={analysisResult.gaps}
                        missedRequirements={analysisResult.missedRequirements}
                        testCases={testCases}
                        suiteId={analysis.testSuiteId}
                    />
                </>
            )}
        </div>
    )
}
