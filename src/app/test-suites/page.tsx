import { getTestSuites } from '@/app/actions/test-suites'
import { TestSuiteList } from '@/components/test-suites/test-suite-list'
import { CreateTestSuiteDialog } from '@/components/test-suites/create-test-suite-dialog'
import { ImportDialog } from '@/components/import/import-dialog'
import { PageHeader } from '@/components/common/page-header'
import { Breadcrumb } from '@/components/common/breadcrumb'

export default async function TestSuitesPage() {
    const testSuites = await getTestSuites()

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <div className="container mx-auto py-10 px-6">
                <Breadcrumb
                    items={[
                        { label: 'Dashboard', href: '/' },
                        { label: 'Test Suites', current: true },
                    ]}
                    className="mb-8"
                />
                <PageHeader
                    title="Test Suites"
                    description="Organize your test cases into logical groups and manage collections"
                    actions={
                        <div className="flex gap-3">
                            <ImportDialog />
                            <CreateTestSuiteDialog />
                        </div>
                    }
                    className="mb-8"
                />
                <TestSuiteList testSuites={testSuites} />
            </div>
        </div>
    )
}
