import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key')

    // Simple API Key check
    // In production, you should set QA_NEXUS_API_KEY in your .env
    const validApiKey = process.env.QA_NEXUS_API_KEY || 'dev-api-key'

    if (apiKey !== validApiKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const report = await req.json()

        // We need a user ID. For API uploads, we use the first user found.
        const user = await prisma.user.findFirst()
        if (!user) return NextResponse.json({ error: 'No users found' }, { status: 500 })

        const run = await prisma.testRun.create({
            data: {
                title: `CI Run - ${new Date().toLocaleString()}`,
                status: 'COMPLETED',
                userId: user.id,
            }
        })

        // Recursive function to process suites
        async function processSuite(suite: any) {
            if (suite.specs) {
                for (const spec of suite.specs) {
                    for (const test of spec.tests) {
                        const result = test.results[0]
                        if (!result) continue

                        const status = result.status === 'passed' ? 'PASS' :
                            result.status === 'failed' ? 'FAIL' :
                                result.status === 'skipped' ? 'SKIPPED' : 'PENDING'

                        let testCase = await prisma.testCase.findFirst({
                            where: { title: spec.title }
                        })

                        if (!testCase) {
                            testCase = await prisma.testCase.create({
                                data: {
                                    title: spec.title,
                                    steps: [],
                                    isAutomated: true,
                                    automationId: spec.id,
                                    status: 'ACTIVE'
                                }
                            })
                        } else if (!testCase.isAutomated) {
                            await prisma.testCase.update({
                                where: { id: testCase.id },
                                data: { isAutomated: true, automationId: spec.id }
                            })
                        }

                        await prisma.testResult.create({
                            data: {
                                testRunId: run.id,
                                testCaseId: testCase.id,
                                status: status,
                                notes: `Duration: ${result.duration}ms`,
                            }
                        })
                    }
                }
            }

            if (suite.suites) {
                for (const childSuite of suite.suites) {
                    await processSuite(childSuite)
                }
            }
        }

        for (const suite of report.suites) {
            await processSuite(suite)
        }

        return NextResponse.json({ success: true, runId: run.id })

    } catch (error) {
        console.error('Import failed:', error)
        return NextResponse.json({ error: 'Import failed' }, { status: 500 })
    }
}
