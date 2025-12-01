'use server'

import { prisma } from '@/lib/prisma'

export interface TraceabilityItem {
    requirementId: string
    requirementTitle: string
    requirementType: string
    risks: { description: string; severity: string }[]
    testSuites: {
        id: string
        name: string
        testCases: {
            id: string
            title: string
            priority: string
            status: string
            lastResult?: string
        }[]
    }[]
    coverage: {
        totalTestCases: number
        passingTests: number
        failingTests: number
        coveragePercent: number
    }
}

export interface TraceabilityMatrix {
    items: TraceabilityItem[]
    summary: {
        totalRequirements: number
        coveredRequirements: number
        uncoveredRequirements: number
        totalTestCases: number
        overallCoverage: number
    }
}

/**
 * Get traceability matrix data
 * Links DocumentAnalysis (requirements) → TestSuite → TestCases
 */
export async function getTraceabilityMatrix(): Promise<{ success: boolean; data?: TraceabilityMatrix; error?: string }> {
    try {
        // Fetch all document analyses with their test suite and test cases
        const documentAnalyses = await prisma.documentAnalysis.findMany({
            include: {
                testSuite: {
                    include: {
                        testCases: {
                            include: {
                                testResults: {
                                    orderBy: { createdAt: 'desc' },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        const items: TraceabilityItem[] = documentAnalyses.map((doc) => {
            // Parse risks from JSON
            let risks: { description: string; severity: string }[] = []
            try {
                const parsedRisks = typeof doc.risks === 'string' ? JSON.parse(doc.risks) : doc.risks
                if (Array.isArray(parsedRisks)) {
                    risks = parsedRisks.map((r: any) => ({
                        description: r.description || r.risk || String(r),
                        severity: r.severity || r.level || 'MEDIUM',
                    }))
                }
            } catch {
                risks = []
            }

            // Calculate test coverage
            let totalTestCases = 0
            let passingTests = 0
            let failingTests = 0

            // Handle single test suite (may be null)
            const testSuites: TraceabilityItem['testSuites'] = []

            if (doc.testSuite) {
                const suite = doc.testSuite
                const testCases = suite.testCases.map((tc) => {
                    totalTestCases++
                    const lastResult = tc.testResults[0]?.status
                    if (lastResult === 'PASS') passingTests++
                    if (lastResult === 'FAIL') failingTests++

                    return {
                        id: tc.id,
                        title: tc.title,
                        priority: tc.priority,
                        status: tc.status,
                        lastResult: lastResult || undefined,
                    }
                })

                testSuites.push({
                    id: suite.id,
                    name: suite.title,
                    testCases,
                })
            }

            const coveragePercent = totalTestCases > 0
                ? Math.round((passingTests / totalTestCases) * 100)
                : 0

            return {
                requirementId: doc.id,
                requirementTitle: doc.sourceTitle,
                requirementType: doc.sourceType,
                risks,
                testSuites,
                coverage: {
                    totalTestCases,
                    passingTests,
                    failingTests,
                    coveragePercent,
                },
            }
        })

        // Calculate summary
        const totalRequirements = items.length
        const coveredRequirements = items.filter((i) => i.coverage.totalTestCases > 0).length
        const uncoveredRequirements = totalRequirements - coveredRequirements
        const totalTestCases = items.reduce((sum, i) => sum + i.coverage.totalTestCases, 0)
        const overallCoverage = totalRequirements > 0
            ? Math.round((coveredRequirements / totalRequirements) * 100)
            : 0

        return {
            success: true,
            data: {
                items,
                summary: {
                    totalRequirements,
                    coveredRequirements,
                    uncoveredRequirements,
                    totalTestCases,
                    overallCoverage,
                },
            },
        }
    } catch (error) {
        console.error('Failed to get traceability matrix:', error)
        return { success: false, error: 'Failed to load traceability data' }
    }
}

/**
 * Get coverage statistics for a specific requirement/document
 */
export async function getRequirementCoverage(documentId: string) {
    try {
        const doc = await prisma.documentAnalysis.findUnique({
            where: { id: documentId },
            include: {
                testSuite: {
                    include: {
                        testCases: {
                            include: {
                                testResults: {
                                    orderBy: { createdAt: 'desc' },
                                    take: 5,
                                },
                            },
                        },
                    },
                },
            },
        })

        if (!doc) {
            return { success: false, error: 'Document not found' }
        }

        const testCases = doc.testSuite?.testCases || []
        const totalTests = testCases.length
        const passedTests = testCases.filter((tc) => tc.testResults[0]?.status === 'PASS').length
        const failedTests = testCases.filter((tc) => tc.testResults[0]?.status === 'FAIL').length
        const notRunTests = totalTests - passedTests - failedTests

        // Calculate trend (compare with older results)
        let trend = 0
        const recentPassRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0
        const olderResults = testCases.flatMap((tc) => tc.testResults.slice(1, 5))
        if (olderResults.length > 0) {
            const olderPassCount = olderResults.filter((r) => r.status === 'PASS').length
            const olderPassRate = (olderPassCount / olderResults.length) * 100
            trend = recentPassRate - olderPassRate
        }

        return {
            success: true,
            coverage: {
                documentId,
                documentTitle: doc.sourceTitle,
                totalTests,
                passedTests,
                failedTests,
                notRunTests,
                passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
                trend: Math.round(trend),
            },
        }
    } catch (error) {
        console.error('Failed to get requirement coverage:', error)
        return { success: false, error: 'Failed to get coverage data' }
    }
}

/**
 * Get test cases by requirement (document analysis)
 */
export async function getTestCasesByRequirement(documentId: string) {
    try {
        const doc = await prisma.documentAnalysis.findUnique({
            where: { id: documentId },
            include: {
                testSuite: {
                    include: {
                        testCases: {
                            include: {
                                testResults: {
                                    orderBy: { createdAt: 'desc' },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
        })

        if (!doc) {
            return { success: false, error: 'Document not found' }
        }

        const suite = doc.testSuite
        const testCases = suite?.testCases.map((tc) => ({
            id: tc.id,
            title: tc.title,
            priority: tc.priority,
            status: tc.status,
            suiteName: suite.title,
            suiteId: suite.id,
            lastResult: tc.testResults[0]?.status || null,
            lastExecuted: tc.testResults[0]?.createdAt || null,
        })) || []

        return { success: true, testCases }
    } catch (error) {
        console.error('Failed to get test cases by requirement:', error)
        return { success: false, error: 'Failed to get test cases' }
    }
}
