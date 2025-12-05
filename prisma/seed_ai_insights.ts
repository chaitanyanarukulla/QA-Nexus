
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding AI Insights data...')

    // 1. Get or create a user
    let user = await prisma.user.findFirst()
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: 'demo@example.com',
                name: 'Demo User',
                role: 'TESTER',
            },
        })
        console.log('Created demo user:', user.id)
    } else {
        console.log('Using existing user:', user.id)
    }

    // 2. Create a Test Suite
    const suite = await prisma.testSuite.create({
        data: {
            title: 'E-Commerce Checkout Flow',
            description: 'End-to-end tests for the checkout process',
        },
    })
    console.log('Created test suite:', suite.id)

    // 3. Create Test Cases

    // Case 1: Stable Passing Test
    const stableTest = await prisma.testCase.create({
        data: {
            title: 'Add Item to Cart',
            description: 'Verify user can add a product to the shopping cart',
            steps: [
                { action: 'Navigate to product page', expected: 'Page loads' },
                { action: 'Click Add to Cart', expected: 'Cart count updates' },
            ],
            priority: 'CRITICAL',
            isAutomated: true,
            suiteId: suite.id,
            executionTime: 2500, // 2.5s
        },
    })

    // Case 2: Flaky Test
    const flakyTest = await prisma.testCase.create({
        data: {
            title: 'Payment Gateway Integration',
            description: 'Process credit card payment via external gateway',
            steps: [
                { action: 'Enter card details', expected: 'Form valid' },
                { action: 'Submit payment', expected: 'Success message' },
            ],
            priority: 'CRITICAL',
            isAutomated: true,
            suiteId: suite.id,
            executionTime: 5000,
        },
    })

    // Case 3: High Failure Risk (Recent Failures)
    const riskyTest = await prisma.testCase.create({
        data: {
            title: 'Inventory Stock Check',
            description: 'Verify stock is reserved during checkout',
            steps: [
                { action: 'Add item', expected: 'Stock reserved' },
                { action: 'Complete order', expected: 'Stock deducted' },
            ],
            priority: 'HIGH',
            isAutomated: true,
            suiteId: suite.id,
            executionTime: 1500,
        },
    })

    // Case 4: Slow Test
    const slowTest = await prisma.testCase.create({
        data: {
            title: 'Generate Order Invoice PDF',
            description: 'Generate and download PDF invoice after order',
            steps: [
                { action: 'Go to order history', expected: 'List loaded' },
                { action: 'Click Download Invoice', expected: 'PDF downloaded' },
            ],
            priority: 'MEDIUM',
            isAutomated: true,
            suiteId: suite.id,
            executionTime: 45000, // 45s (Slow!)
        },
    })

    // 4. Generate History (Test Runs and Results)

    const daysToSimulate = 30
    const runsPerDay = 2

    for (let i = 0; i < daysToSimulate; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (daysToSimulate - i))

        for (let j = 0; j < runsPerDay; j++) {
            // Create a Test Run
            const run = await prisma.testRun.create({
                data: {
                    title: `Daily Run ${date.toISOString().split('T')[0]} #${j + 1}`,
                    status: 'COMPLETED',
                    userId: user.id,
                    suiteId: suite.id,
                    createdAt: date,
                },
            })

            // Result for Stable Test (Always PASS)
            await prisma.testResult.create({
                data: {
                    testCaseId: stableTest.id,
                    testRunId: run.id,
                    status: 'PASS',
                    createdAt: date,
                },
            })

            // Result for Flaky Test (Random PASS/FAIL)
            // Make it flip-flop a bit
            const isPass = Math.random() > 0.4 // 60% pass rate
            const flakyResult = await prisma.testResult.create({
                data: {
                    testCaseId: flakyTest.id,
                    testRunId: run.id,
                    status: isPass ? 'PASS' : 'FAIL',
                    createdAt: date,
                },
            })

            // Create a defect if it failed (sometimes)
            if (!isPass && Math.random() > 0.5) {
                await prisma.defect.create({
                    data: {
                        title: `Payment failure in run ${run.id.substring(0, 8)}`,
                        description: 'Payment gateway returned 500 error during test execution.',
                        status: 'OPEN',
                        priority: 'HIGH',
                        testResultId: flakyResult.id,
                        createdAt: date,
                    }
                })
            }

            // Result for Risky Test (Pass mostly, but FAIL recently)
            let riskyStatus = 'PASS'
            if (i >= daysToSimulate - 5) {
                // Fail in the last 5 days
                riskyStatus = 'FAIL'
            }
            const riskyResult = await prisma.testResult.create({
                data: {
                    testCaseId: riskyTest.id,
                    testRunId: run.id,
                    status: riskyStatus,
                    createdAt: date,
                },
            })

            if (riskyStatus === 'FAIL' && Math.random() > 0.3) {
                await prisma.defect.create({
                    data: {
                        title: `Inventory check failed in run ${run.id.substring(0, 8)}`,
                        description: 'Stock was not correctly deducted from inventory.',
                        status: 'OPEN',
                        priority: 'CRITICAL',
                        testResultId: riskyResult.id,
                        createdAt: date,
                    }
                })
            }

            // Result for Slow Test (Always PASS)
            await prisma.testResult.create({
                data: {
                    testCaseId: slowTest.id,
                    testRunId: run.id,
                    status: 'PASS',
                    createdAt: date,
                },
            })
        }
    }

    // 5. Seed AI Insights
    console.log('Seeding AI Insights...')

    await prisma.aIInsight.create({
        data: {
            type: 'FLAKY_TEST',
            severity: 'HIGH',
            title: 'Detected Flaky Test: Payment Gateway Integration',
            description: 'This test has a 40% failure rate over the last 30 days. Failures appear random.',
            recommendation: 'Investigate network timeouts or mock the payment gateway for more stability.',
            confidence: 85.5,
            testCaseId: flakyTest.id,
            isResolved: false,
        }
    })

    await prisma.aIInsight.create({
        data: {
            type: 'SLOW_EXECUTION',
            severity: 'MEDIUM',
            title: 'Slow Test Detected: Generate Order Invoice PDF',
            description: 'This test consistently takes over 40s to execute.',
            recommendation: 'Consider optimizing the PDF generation or moving this to a separate performance suite.',
            confidence: 92.0,
            testCaseId: slowTest.id,
            isResolved: false,
        }
    })

    await prisma.aIInsight.create({
        data: {
            type: 'HIGH_FAILURE_RISK',
            severity: 'CRITICAL',
            title: 'High Failure Risk: Inventory Stock Check',
            description: 'This test has failed in the last 5 consecutive runs.',
            recommendation: 'Immediate investigation required. Check inventory service logs.',
            confidence: 95.0,
            testCaseId: riskyTest.id,
            isResolved: false,
        }
    })

    console.log('Seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
