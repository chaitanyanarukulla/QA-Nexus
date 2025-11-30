import { Priority, Status, RunStatus, ResultStatus, DefectStatus } from '@prisma/client';

/**
 * Test Data Factory
 * 
 * Generates realistic test data for use in Playwright tests
 */

const testCaseTitles = [
    'Verify user login with valid credentials',
    'Test password reset functionality',
    'Validate email format in registration form',
    'Check dashboard data loading',
    'Test file upload with large files',
    'Verify pagination in data tables',
    'Test search functionality',
    'Validate form submission with missing required fields',
    'Check accessibility of navigation menu',
    'Test responsive design on mobile viewport',
];

const testSuiteTitles = [
    'User Authentication Suite',
    'Dashboard Functionality Suite',
    'Data Management Suite',
    'API Integration Suite',
    'UI/UX Validation Suite',
    'Security Testing Suite',
    'Performance Testing Suite',
];

const defectTitles = [
    'Login button not responding on first click',
    'Dashboard charts showing incorrect data',
    'Form validation error messages not displaying',
    'Page crashes when uploading large files',
    'Search results not highlighting search terms',
    'Mobile menu not opening on iOS devices',
];

const steps = [
    [
        'Navigate to the application',
        'Enter valid credentials',
        'Click the login button',
        'Verify successful login',
    ],
    [
        'Open the dashboard',
        'Click on the test cases link',
        'Verify test cases are displayed',
    ],
    [
        'Navigate to create form',
        'Fill in all required fields',
        'Click submit button',
        'Verify success message',
    ],
];

/**
 * Generate test case data
 */
export function generateTestCase(overrides?: {
    title?: string;
    description?: string;
    steps?: string[];
    expectedResult?: string;
    priority?: Priority;
    status?: Status;
}) {
    const randomTitle = testCaseTitles[Math.floor(Math.random() * testCaseTitles.length)];
    const randomSteps = steps[Math.floor(Math.random() * steps.length)];

    return {
        title: overrides?.title || randomTitle,
        description: overrides?.description || `Description for ${randomTitle}`,
        steps: overrides?.steps || randomSteps,
        expectedResult: overrides?.expectedResult || 'Operation completes successfully',
        priority: overrides?.priority || 'MEDIUM' as Priority,
        status: overrides?.status || 'ACTIVE' as Status,
    };
}

/**
 * Generate test suite data
 */
export function generateTestSuite(overrides?: {
    title?: string;
    description?: string;
    jiraEpicKey?: string;
}) {
    const randomTitle = testSuiteTitles[Math.floor(Math.random() * testSuiteTitles.length)];

    return {
        title: overrides?.title || randomTitle,
        description: overrides?.description || `Comprehensive tests for ${randomTitle}`,
        jiraEpicKey: overrides?.jiraEpicKey,
    };
}

/**
 * Generate defect data
 */
export function generateDefect(overrides?: {
    title?: string;
    description?: string;
    priority?: Priority;
    status?: DefectStatus;
    stepsToReproduce?: string;
}) {
    const randomTitle = defectTitles[Math.floor(Math.random() * defectTitles.length)];

    return {
        title: overrides?.title || randomTitle,
        description: overrides?.description || `Detailed description of: ${randomTitle}`,
        priority: overrides?.priority || 'MEDIUM' as Priority,
        status: overrides?.status || 'OPEN' as DefectStatus,
        stepsToReproduce: overrides?.stepsToReproduce || '1. Step one\n2. Step two\n3. Step three',
    };
}

/**
 * Generate test run data
 */
export function generateTestRun(overrides?: {
    status?: RunStatus;
}) {
    return {
        status: overrides?.status || 'PENDING' as RunStatus,
    };
}

/**
 * Generate test result data
 */
export function generateTestResult(overrides?: {
    status?: ResultStatus;
    notes?: string;
    evidence?: string;
}) {
    return {
        status: overrides?.status || 'PENDING' as ResultStatus,
        notes: overrides?.notes || '',
        evidence: overrides?.evidence || '',
    };
}

/**
 * Generate random priority
 */
export function randomPriority(): Priority {
    const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    return priorities[Math.floor(Math.random() * priorities.length)];
}

/**
 * Generate random status
 */
export function randomStatus(): Status {
    const statuses: Status[] = ['ACTIVE', 'DRAFT', 'DEPRECATED'];
    return statuses[Math.floor(Math.random() * statuses.length)];
}

/**
 * Generate unique identifier
 */
export function uniqueId(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
