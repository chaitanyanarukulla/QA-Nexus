import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { EpicMetrics } from '@/components/test-suites/epic-metrics'
import { ExportPdfButton } from '@/components/common/export-pdf-button'
import { SuiteExecution } from '@/components/test-suites/suite-execution'
import { AutomationGenerator } from '@/components/automation/automation-generator'
import { CommentsSection } from '@/components/collaboration/comments-section'
import { ReviewPanel } from '@/components/collaboration/review-panel'
import { ActivityTimeline } from '@/components/collaboration/activity-timeline'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileSearch, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function TestSuiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const suite = await prisma.testSuite.findUnique({
        where: { id },
        include: {
            testCases: {
                orderBy: { createdAt: 'asc' }
            },
            documentAnalysis: true
        }
    })

    if (!suite) notFound()

    // Get the first user (in a real app, you'd get from session/auth)
    const currentUser = await prisma.user.findFirst()
    const userId = currentUser?.id || ''

    // Get all users for review assignments
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
        },
    })

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{suite.title}</h1>
                    {suite.description && (
                        <p className="text-muted-foreground mt-2">{suite.description}</p>
                    )}

                    {/* Traceability Information */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {suite.jiraEpicKey && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                Jira Epic: {suite.jiraEpicKey}
                            </Badge>
                        )}
                        {suite.documentAnalysis && (
                            <Link href={`/document-analysis/${suite.documentAnalysis.id}`}>
                                <Badge variant="outline" className="flex items-center gap-1 hover:bg-accent cursor-pointer">
                                    <FileSearch className="h-3 w-3" />
                                    View Analysis Report
                                </Badge>
                            </Link>
                        )}
                        <Badge variant="secondary">
                            {suite.testCases.length} Test Cases
                        </Badge>
                    </div>
                </div>
                <ExportPdfButton />
            </div>

            {suite.jiraEpicKey && (
                <EpicMetrics suiteId={suite.id} epicKey={suite.jiraEpicKey} />
            )}

            <div className="mt-8 space-y-8">
                <div>
                    <h2 className="text-2xl font-semibold mb-6">Execute Test Cases</h2>

                    {suite.testCases.length > 0 ? (
                        <SuiteExecution
                            testCases={suite.testCases}
                            suiteId={suite.id}
                            suiteTitle={suite.title}
                        />
                    ) : (
                        <div className="text-center py-12 border border-dashed rounded-lg">
                            <p className="text-muted-foreground">No test cases in this suite.</p>
                            <p className="text-sm text-muted-foreground mt-1">Add test cases to start executing tests.</p>
                        </div>
                    )}
                </div>

                {suite.testCases.length > 0 && (
                    <>
                        <Separator />
                        <AutomationGenerator suiteId={suite.id} suiteTitle={suite.title} />
                    </>
                )}

                <Separator />

                {/* Collaboration Features */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <CommentsSection testSuiteId={suite.id} currentUserId={userId} />
                    </div>
                    <div className="space-y-6">
                        <ReviewPanel testSuiteId={suite.id} currentUserId={userId} users={users} />
                        <ActivityTimeline entityType="test_suite" entityId={suite.id} limit={10} />
                    </div>
                </div>
            </div>
        </div>
    )
}
