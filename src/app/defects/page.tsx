import { getDefects } from '@/app/actions/defects'
import { DefectList } from '@/components/defects/defect-list'
import { CreateDefectDialog } from '@/components/defects/create-defect-dialog'
import { PageHeader } from '@/components/common/page-header'
import { Breadcrumb } from '@/components/common/breadcrumb'

export default async function DefectsPage() {
    const defects = await getDefects()

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <div className="container mx-auto py-10 px-6">
                <Breadcrumb
                    items={[
                        { label: 'Dashboard', href: '/' },
                        { label: 'Defects', current: true },
                    ]}
                    className="mb-8"
                />
                <PageHeader
                    title="Defects"
                    description="Track bugs and issues linked to test executions across your test suite"
                    actions={<CreateDefectDialog />}
                    className="mb-8"
                />
                <DefectList defects={defects} />
            </div>
        </div>
    )
}
