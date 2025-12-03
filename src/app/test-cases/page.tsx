import { getTestCases } from '@/app/actions/test-cases'
export const dynamic = 'force-dynamic'
import { TestCaseList } from '@/components/test-cases/test-case-list'
import { CreateTestCaseDialog } from '@/components/test-cases/create-test-case-dialog'
import { AITestGeneratorDialog } from '@/components/ai/ai-test-generator-dialog'
import { PageHeader } from '@/components/common/page-header'
import { Breadcrumb } from '@/components/common/breadcrumb'

export default async function TestCasesPage() {
    const testCases = await getTestCases()

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <div className="container mx-auto py-10 px-6">
                <Breadcrumb
                    items={[
                        { label: 'Dashboard', href: '/' },
                        { label: 'Test Cases', current: true },
                    ]}
                    className="mb-8"
                />
                <PageHeader
                    title="Test Cases"
                    description="Manage and organize your comprehensive test repository"
                    actions={
                        <div className="flex gap-3">
                            <AITestGeneratorDialog />
                            <CreateTestCaseDialog />
                        </div>
                    }
                    className="mb-8"
                />
                <TestCaseList testCases={testCases} />
            </div>
        </div>
    )
}
