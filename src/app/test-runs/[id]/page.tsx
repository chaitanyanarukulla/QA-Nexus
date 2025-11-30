import { notFound } from 'next/navigation'
import { getTestRun } from '@/app/actions/test-runs'
import { TestRunDetail } from '@/components/test-runs/test-run-detail'

interface TestRunPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function TestRunPage({ params }: TestRunPageProps) {
    const { id } = await params
    const testRun = await getTestRun(id)

    if (!testRun) {
        notFound()
    }

    return (
        <div className="container mx-auto py-10">
            <TestRunDetail testRun={testRun} />
        </div>
    )
}
