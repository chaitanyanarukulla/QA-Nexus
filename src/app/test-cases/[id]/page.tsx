import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CommentsSection } from '@/components/collaboration/comments-section'
import { ReviewPanel } from '@/components/collaboration/review-panel'
import { ActivityTimeline } from '@/components/collaboration/activity-timeline'
import { FileText, Tag, AlertCircle } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TestCaseDetailPage({ params }: PageProps) {
  const { id } = await params

  const testCase = await prisma.testCase.findUnique({
    where: { id },
    include: {
      suite: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  if (!testCase) {
    notFound()
  }

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

  // Handle steps - ensure it's an array
  const steps = Array.isArray(testCase.steps) ? testCase.steps : []

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500'
      case 'HIGH':
        return 'bg-orange-500'
      case 'MEDIUM':
        return 'bg-yellow-500'
      case 'LOW':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500'
      case 'DRAFT':
        return 'bg-yellow-500'
      case 'DEPRECATED':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{testCase.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Test Case ID: {testCase.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Test Case Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Priority</p>
                  <Badge className={getPriorityColor(testCase.priority)}>
                    {testCase.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Status</p>
                  <Badge className={getStatusColor(testCase.status)}>
                    {testCase.status}
                  </Badge>
                </div>
                {testCase.suite && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium mb-1">Test Suite</p>
                    <p className="text-sm">{testCase.suite.title}</p>
                  </div>
                )}
                {testCase.isAutomated && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium mb-1">Automation</p>
                    <Badge variant="outline" className="bg-blue-50">
                      Automated
                    </Badge>
                  </div>
                )}
              </div>

              {testCase.description && (
                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">{testCase.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Steps</p>
                <ol className="list-decimal list-inside space-y-2">
                  {steps.map((step, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {String(step)}
                    </li>
                  ))}
                </ol>
              </div>
              {testCase.expectedResult && (
                <div>
                  <p className="text-sm font-medium mb-1">Expected Result</p>
                  <p className="text-sm text-muted-foreground">{testCase.expectedResult}</p>
                </div>
              )}

              {/* Coverage Information */}
              {(testCase.coversRisks || testCase.coversGaps || testCase.coversRequirements) && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Coverage
                  </p>
                  <div className="space-y-3">
                    {testCase.coversRisks && (testCase.coversRisks as string[]).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Risks Covered</p>
                        <div className="flex flex-wrap gap-2">
                          {(testCase.coversRisks as string[]).map((risk, index) => (
                            <Badge key={index} variant="danger" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {risk}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {testCase.coversGaps && (testCase.coversGaps as string[]).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Gaps Covered</p>
                        <div className="flex flex-wrap gap-2">
                          {(testCase.coversGaps as string[]).map((gap, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {gap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {testCase.coversRequirements && (testCase.coversRequirements as string[]).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Requirements Covered</p>
                        <div className="flex flex-wrap gap-2">
                          {(testCase.coversRequirements as string[]).map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <CommentsSection testCaseId={testCase.id} currentUserId={userId} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Review Panel */}
          <ReviewPanel testCaseId={testCase.id} currentUserId={userId} users={users} />

          {/* Activity Timeline */}
          <ActivityTimeline entityType="test_case" entityId={testCase.id} limit={10} />
        </div>
      </div>
    </div>
  )
}
