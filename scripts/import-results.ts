import fs from 'fs';
import { PrismaClient } from '../src/generated/client';

// @ts-ignore
const prisma = new PrismaClient({});

async function main() {
    const reportPath = './test-results.json';
    if (!fs.existsSync(reportPath)) {
        console.error('Report file not found');
        process.exit(1);
    }

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

    // Create a new Test Run
    // We need a valid user ID. In dev, we can use the first user or 'demo-user' if it exists.
    // Let's try to find a user first.
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('No user found in database to assign test run to.');
        process.exit(1);
    }

    const run = await prisma.testRun.create({
        data: {
            title: `Automated Run - ${new Date().toLocaleString()}`,
            status: 'COMPLETED',
            userId: user.id,
        }
    });

    console.log(`Created Test Run: ${run.id}`);

    // Helper to process suites recursively
    async function processSuite(suite: any) {
        if (suite.specs) {
            for (const spec of suite.specs) {
                for (const test of spec.tests) {
                    const result = test.results[0];
                    if (!result) continue;

                    const status = result.status === 'passed' ? 'PASS' :
                        result.status === 'failed' ? 'FAIL' :
                            result.status === 'skipped' ? 'SKIPPED' : 'PENDING';

                    // Find matching test case by title
                    let testCase = await prisma.testCase.findFirst({
                        where: { title: spec.title }
                    });

                    if (!testCase) {
                        // Create a placeholder test case for the automated test
                        testCase = await prisma.testCase.create({
                            data: {
                                title: spec.title,
                                steps: [], // Empty steps for automated test
                                isAutomated: true,
                                automationId: spec.id,
                                status: 'ACTIVE'
                            }
                        });
                        console.log(`Created new automated test case: ${spec.title}`);
                    } else {
                        // Update automation status if not set
                        if (!testCase.isAutomated) {
                            await prisma.testCase.update({
                                where: { id: testCase.id },
                                data: { isAutomated: true, automationId: spec.id }
                            });
                        }
                    }

                    await prisma.testResult.create({
                        data: {
                            testRunId: run.id,
                            testCaseId: testCase.id,
                            status: status,
                            notes: `Duration: ${result.duration}ms`,
                        }
                    });
                }
            }
        }

        if (suite.suites) {
            for (const childSuite of suite.suites) {
                await processSuite(childSuite);
            }
        }
    }

    for (const suite of report.suites) {
        await processSuite(suite);
    }

    console.log('Import completed successfully.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
