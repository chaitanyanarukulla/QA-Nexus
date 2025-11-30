import { getTestRuns } from '@/app/actions/test-runs'
import { getTestCases } from '@/app/actions/test-cases'
import { TestRunList } from '@/components/test-runs/test-run-list'
import { CreateTestRunDialog } from '@/components/test-runs/create-test-run-dialog'
import { PageHeader } from '@/components/common/page-header'
import { Breadcrumb } from '@/components/common/breadcrumb'

export default async function TestRunsPage() {
    const [testRuns, testCases] = await Promise.all([
        getTestRuns(),
        getTestCases(),
    ])

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <div className="container mx-auto py-10 px-6">
                <Breadcrumb
                    items={[
                        { label: 'Dashboard', href: '/' },
                        { label: 'Test Runs', current: true },
                    ]}
                    className="mb-8"
                />
                <PageHeader
                    title="Test Runs"
                    description="Execute test cases and track execution results in real-time"
                    actions={<CreateTestRunDialog testCases={testCases} />}
                    className="mb-8"
                />
                <TestRunList testRuns={testRuns} />
            </div>
        </div>
    )
}
