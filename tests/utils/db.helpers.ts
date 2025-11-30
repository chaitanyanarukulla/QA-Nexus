import { PrismaClient } from '@prisma/client';
import { Priority, Status, RunStatus, ResultStatus, DefectStatus } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({});

/**
 * Database Helpers for Playwright Tests
 * 
 * Provides utilities for seeding and cleaning test data
 */

/**
 * Clean all test data from the database
 * Use with caution - this will delete data!
 */
export async function cleanupTestData(): Promise<void> {
    // Delete in order to respect foreign key constraints
    await prisma.activityLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.aIInsight.deleteMany({});
    await prisma.testResult.deleteMany({});
    await prisma.testRun.deleteMany({});
    await prisma.defect.deleteMany({});
    await prisma.testCase.deleteMany({});
    await prisma.testSuite.deleteMany({});
    await prisma.documentAnalysis.deleteMany({});
    await prisma.jiraIssue.deleteMany({});

    // Note: We don't delete users as they might be needed across tests
}

/**
 * Seed basic test data
 */
export async function seedTestData(): Promise<void> {
    // This will be called before tests if needed
    // For now, we'll create data on-demand in tests
}

/**
 * Create a test user
 */
export async function createTestUser(data?: {
    email?: string;
    name?: string;
    role?: 'ADMIN' | 'MANAGER' | 'TESTER' | 'DEVELOPER';
}) {
    return await prisma.user.create({
        data: {
            email: data?.email || `test-${Date.now()}@qanexus.test`,
            name: data?.name || 'Test User',
            role: data?.role || 'TESTER',
        },
    });
}

/**
 * Create a test case
 */
export async function createTestCase(data?: {
    title?: string;
    description?: string;
    steps?: string[];
    expectedResult?: string;
    priority?: Priority;
    status?: Status;
    suiteId?: string;
}) {
    return await prisma.testCase.create({
        data: {
            title: data?.title || `Test Case ${Date.now()}`,
            description: data?.description || 'Test case description',
            steps: data?.steps || ['Step 1', 'Step 2'],
            expectedResult: data?.expectedResult || 'Expected result',
            priority: data?.priority || 'MEDIUM',
            status: data?.status || 'ACTIVE',
            suiteId: data?.suiteId,
        },
    });
}

/**
 * Create a test suite
 */
export async function createTestSuite(data?: {
    title?: string;
    description?: string;
    jiraEpicKey?: string;
}) {
    return await prisma.testSuite.create({
        data: {
            title: data?.title || `Test Suite ${Date.now()}`,
            description: data?.description || 'Test suite description',
            jiraEpicKey: data?.jiraEpicKey,
        },
    });
}

/**
 * Create a test run
 */
export async function createTestRun(data: {
    userId: string;
    suiteId: string;
    status?: RunStatus;
}) {
    return await prisma.testRun.create({
        data: {
            title: 'Test Run',
            userId: data.userId,
            suiteId: data.suiteId,
            status: data.status || 'PENDING',
        },
    });
}

/**
 * Create a test result
 */
export async function createTestResult(data: {
    testRunId: string;
    testCaseId: string;
    status?: ResultStatus;
    notes?: string;
    evidence?: string;
}) {
    return await prisma.testResult.create({
        data: {
            testRunId: data.testRunId,
            testCaseId: data.testCaseId,
            status: data.status || 'PENDING',
            notes: data.notes,
            evidence: data.evidence,
        },
    });
}

/**
 * Create a defect
 */
export async function createDefect(data: {
    title: string;
    description: string;
    priority?: Priority;
    status?: DefectStatus;
    testResultId?: string;
}) {
    return await prisma.defect.create({
        data: {
            title: data.title,
            description: data.description,
            priority: data.priority || 'MEDIUM',
            status: data.status || 'OPEN',
            testResultId: data.testResultId,
        },
    });
}

/**
 * Get test suite with test cases
 */
export async function getTestSuiteWithCases(suiteId: string) {
    return await prisma.testSuite.findUnique({
        where: { id: suiteId },
        include: {
            testCases: true,
        },
    });
}

/**
 * Get test run with results
 */
export async function getTestRunWithResults(runId: string) {
    return await prisma.testRun.findUnique({
        where: { id: runId },
        include: {
            results: {
                include: {
                    testCase: true,
                },
            },
        },
    });
}

/**
 * Count entities
 */
export async function getEntityCounts() {
    const [testCases, testSuites, testRuns, defects] = await Promise.all([
        prisma.testCase.count(),
        prisma.testSuite.count(),
        prisma.testRun.count(),
        prisma.defect.count(),
    ]);

    return {
        testCases,
        testSuites,
        testRuns,
        defects,
    };
}
