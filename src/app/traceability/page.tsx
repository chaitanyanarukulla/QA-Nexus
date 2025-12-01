import { getTraceabilityMatrix } from '@/app/actions/traceability'
import { TraceabilityMatrixView } from '@/components/traceability/traceability-matrix'
import { Separator } from '@/components/ui/separator'
import { Link2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default async function TraceabilityPage() {
    const result = await getTraceabilityMatrix()

    if (!result.success || !result.data) {
        return (
            <div className="container mx-auto py-10">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Failed to load traceability data. Please try again later.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent flex items-center gap-3">
                    <Link2 className="h-10 w-10 text-primary" />
                    Requirements Traceability
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Track coverage from requirements to test cases with a visual traceability matrix.
                </p>
            </div>
            <Separator />

            <TraceabilityMatrixView data={result.data} />
        </div>
    )
}
