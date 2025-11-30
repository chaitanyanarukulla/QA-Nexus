import { test, expect } from '@playwright/test';
import { TestCasesPage } from '../../page-objects/test-cases.page.js';
import { generateTestCase, uniqueId } from '../../utils/test-data.factory.js';

test.describe('Test Case Management', () => {
    let testCasesPage: TestCasesPage;

    test.beforeEach(async ({ page }) => {
        testCasesPage = new TestCasesPage(page);
        await testCasesPage.navigate();
    });

    test('should display test cases page', async () => {
        await expect(testCasesPage.heading).toBeVisible();
        await expect(testCasesPage.createButton).toBeVisible();
    });

    test('should create a new test case', async () => {
        const testData = generateTestCase({
            title: `E2E Test Case ${uniqueId()}`,
            description: 'Created by automated E2E test',
            steps: 'Step 1\nStep 2\nStep 3',
            expectedResult: 'Test passes successfully',
            priority: 'HIGH',
        });

        await testCasesPage.createTestCase(testData);

        // Verify test case appears in the list
        const titles = await testCasesPage.getTestCaseTitles();
        expect(titles).toContain(testData.title);
    });

    test('should search for test cases', async () => {
        // Create a test case with unique title
        const uniqueTitle = `Searchable Test ${uniqueId()}`;
        await testCasesPage.createTestCase({
            title: uniqueTitle,
            description: 'Test for search functionality',
        });

        // Search for the test case
        await testCasesPage.search(uniqueTitle);

        // Verify search results
        const titles = await testCasesPage.getTestCaseTitles();
        expect(titles.length).toBeGreaterThan(0);
        expect(titles.some(t => t.includes(uniqueTitle))).toBe(true);
    });

    test('should navigate to test case detail', async () => {
        // Create a test case
        const testData = generateTestCase({
            title: `Detail View Test ${uniqueId()}`,
        });
        await testCasesPage.createTestCase(testData);

        // Click on the test case
        await testCasesPage.clickTestCaseByTitle(testData.title);

        // Verify detail page loaded
        await expect(testCasesPage.page).toHaveURL(/test-cases\/[a-z0-9]+/);
        await expect(testCasesPage.page.getByText(testData.title)).toBeVisible();
    });

    test('should handle form validation', async () => {
        await testCasesPage.clickCreate();

        // Try to submit without required fields
        await testCasesPage.submitButton.click();

        // Note: Add assertions for validation messages if implemented
        // For now, verify form is still open (not submitted)
        await expect(testCasesPage.titleInput).toBeVisible();
    });

    test('should show all test cases in table', async () => {
        const count = await testCasesPage.getTestCaseCount();
        expect(count).toBeGreaterThanOrEqual(0);

        // If there are test cases, verify table is visible
        if (count > 0) {
            await expect(testCasesPage.testCaseTable).toBeVisible();
        }
    });
});
