'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, FileText } from 'lucide-react'
import Link from 'next/link'

interface CoverageItem {
    title: string
    type: 'risk' | 'gap' | 'requirement'
    severity?: string
    coveredBy: Array<{
        id: string
        title: string
        priority: string
    }>
}

interface CoverageMatrixProps {
    risks: any[]
    gaps: any[]
    missedRequirements: any[]
    testCases: any[]
    suiteId: string
}

export function CoverageMatrix({
    risks,
    gaps,
    missedRequirements,
    testCases,
    suiteId
}: CoverageMatrixProps) {
    // Build coverage map
    const coverageItems: CoverageItem[] = []

    // Process risks
    risks.forEach((risk: any) => {
        const coveredBy = testCases.filter((tc: any) => {
            const covers = tc.coversRisks as string[] || []
            return covers.includes(risk.title)
        }).map((tc: any) => ({
            id: tc.id,
            title: tc.title,
            priority: tc.priority
        }))

        coverageItems.push({
            title: risk.title,
            type: 'risk',
            severity: risk.severity,
            coveredBy
        })
    })

    // Process gaps
    gaps.forEach((gap: any) => {
        const coveredBy = testCases.filter((tc: any) => {
            const covers = tc.coversGaps as string[] || []
            return covers.includes(gap.title)
        }).map((tc: any) => ({
            id: tc.id,
            title: tc.title,
            priority: tc.priority
        }))

        coverageItems.push({
            title: gap.title,
            type: 'gap',
            coveredBy
        })
    })

    // Process missed requirements
    missedRequirements.forEach((req: any) => {
        const coveredBy = testCases.filter((tc: any) => {
            const covers = tc.coversRequirements as string[] || []
            return covers.includes(req.title)
        }).map((tc: any) => ({
            id: tc.id,
            title: tc.title,
            priority: tc.priority
        }))

        coverageItems.push({
            title: req.title,
            type: 'requirement',
            coveredBy
        })
    })

    // Calculate coverage stats
    const totalItems = coverageItems.length
    const coveredItems = coverageItems.filter(item => item.coveredBy.length > 0).length
    const coveragePercentage = totalItems > 0 ? Math.round((coveredItems / totalItems) * 100) : 0

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'risk': return 'bg-red-100 text-red-800 border-red-200'
            case 'gap': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'requirement': return 'bg-blue-100 text-blue-800 border-blue-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getSeverityColor = (severity?: string) => {
        if (!severity) return ''
        switch (severity) {
            case 'CRITICAL': return 'bg-red-500'
            case 'HIGH': return 'bg-orange-500'
            case 'MEDIUM': return 'bg-yellow-500'
            case 'LOW': return 'bg-blue-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <div className="space-y-6">
            {/* Coverage Summary */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                    <CardTitle>Requirements Coverage</CardTitle>
                    <CardDescription>
                        Traceability matrix showing which test cases cover which requirements
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{coveragePercentage}%</div>
                            <p className="text-sm text-muted-foreground">Coverage</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">{coveredItems}/{totalItems}</div>
                            <p className="text-sm text-muted-foreground">Items Covered</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">{testCases.length}</div>
                            <p className="text-sm text-muted-foreground">Test Cases</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">{totalItems - coveredItems}</div>
                            <p className="text-sm text-muted-foreground">Gaps Remaining</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Coverage Matrix */}
            <Card>
                <CardHeader>
                    <CardTitle>Detailed Coverage Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {coverageItems.map((item, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge className={getTypeColor(item.type)}>
                                                {item.type.toUpperCase()}
                                            </Badge>
                                            {item.severity && (
                                                <Badge className={getSeverityColor(item.severity)}>
                                                    {item.severity}
                                                </Badge>
                                            )}
                                        </div>
                                        <h4 className="font-medium">{item.title}</h4>
                                    </div>
                                    {item.coveredBy.length > 0 ? (
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Covered ({item.coveredBy.length})
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-red-200 text-red-800">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Not Covered
                                        </Badge>
                                    )}
                                </div>

                                {item.coveredBy.length > 0 && (
                                    <div className="pl-4 border-l-2 border-green-200 space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground">Covered by:</p>
                                        {item.coveredBy.map(tc => (
                                            <Link
                                                key={tc.id}
                                                href={`/test-suites/${suiteId}`}
                                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                                            >
                                                <FileText className="h-3 w-3" />
                                                {tc.title}
                                                <Badge variant="outline" className="ml-auto">
                                                    {tc.priority}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
