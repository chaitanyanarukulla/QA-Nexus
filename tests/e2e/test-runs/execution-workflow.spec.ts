import { test, expect } from '@playwright/test';
import { TestRunsPage } from '../../page-objects/test-runs.page.js';
import { TestExecutionPage } from '../../page-objects/test-execution.page.js';
import { TestSuitesPage } from '../../page-objects/test-suites.page.js';
import { TestCasesPage } from '../../page-objects/test-cases.page.js';
import { generateTestSuite, generateTestCase, uniqueId } from '../../utils/test-data.factory.js';

test.describe('Test Execution Workflow', () => {
    let testRunsPage: TestRunsPage;
    let testExecutionPage: TestExecutionPage;
    let testSuitesPage: TestSuitesPage;
    let testCasesPage: TestCasesPage;

    const suiteData = generateTestSuite({ title: `Execution Suite ${uniqueId()}` });
    const testCaseData = generateTestCase({
        title: `Execution Test ${uniqueId()}`,
        priority: 'HIGH'
    });
    const runTitle = `E2E Run ${uniqueId()}`;

    test.beforeEach(async ({ page }) => {
        testRunsPage = new TestRunsPage(page);
        testExecutionPage = new TestExecutionPage(page);
        testSuitesPage = new TestSuitesPage(page);
        testCasesPage = new TestCasesPage(page);

        // Setup: Create Suite and Test Case
        await testSuitesPage.navigate();
        await testSuitesPage.createTestSuite(suiteData);

        await testCasesPage.navigate();
        await testCasesPage.createTestCase({
            ...testCaseData,
            suite: suiteData.title
        });
    });

    test('should create and execute a test run', async () => {
        // 1. Create Test Run
        await testRunsPage.navigate();
        await testRunsPage.createTestRun({
            title: runTitle,
            suiteName: suiteData.title
        });

        // 2. Open Test Run
        await testRunsPage.clickTestRunByTitle(runTitle);

        // 3. Execute Test Case
        await testExecutionPage.selectTestCase(testCaseData.title);

        // 4. Mark as Passed
        await testExecutionPage.markAsPassed('Executed via E2E test');

        // 5. Verify Status
        // Add assertion here to check if status updated in UI
        await expect(testExecutionPage.page.getByText('Passed')).toBeVisible();
    });

    test('should log a defect from execution', async () => {
        // 1. Create Test Run
        const defectRunTitle = `Defect Run ${uniqueId()}`;
        await testRunsPage.navigate();
        await testRunsPage.createTestRun({
            title: defectRunTitle,
            suiteName: suiteData.title
        });

        // 2. Open Run & Select Test
        await testRunsPage.clickTestRunByTitle(defectRunTitle);
        await testExecutionPage.selectTestCase(testCaseData.title);

        // 3. Fail and Log Defect
        await testExecutionPage.markAsFailed('Test failed, logging defect');
        await testExecutionPage.logDefect();

        // 4. Verify Defect Creation Page
        await expect(testExecutionPage.page).toHaveURL(/defects\/new/);
    });
});
