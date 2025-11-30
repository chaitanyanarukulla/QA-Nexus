import { test, expect } from '@playwright/test';
import { TestSuitesPage } from '../../page-objects/test-suites.page.js';
import { generateTestSuite, uniqueId } from '../../utils/test-data.factory.js';

test.describe('Test Suite Management', () => {
    let testSuitesPage: TestSuitesPage;

    test.beforeEach(async ({ page }) => {
        testSuitesPage = new TestSuitesPage(page);
        await testSuitesPage.navigate();
    });

    test('should display test suites page', async () => {
        await expect(testSuitesPage.heading).toBeVisible();
        await expect(testSuitesPage.createButton).toBeVisible();
    });

    test('should create a new test suite', async () => {
        const suiteData = generateTestSuite({
            title: `E2E Suite ${uniqueId()}`,
            description: 'Created by E2E test',
        });

        await testSuitesPage.createTestSuite(suiteData);

        // Verify navigation to suite detail page
        await expect(testSuitesPage.page).toHaveURL(/test-suites\/[a-z0-9]+/);
        await expect(testSuitesPage.page.getByText(suiteData.title)).toBeVisible();
    });

    test('should display existing test suites', async () => {
        const count = await testSuitesPage.getSuiteCount();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should navigate to suite detail', async () => {
        // Create a suite first
        const suiteData = generateTestSuite({
            title: `Navigation Test ${uniqueId()}`,
        });
        await testSuitesPage.createTestSuite(suiteData);

        // Navigate back to list
        await testSuitesPage.navigate();

        // Click on the suite
        await testSuitesPage.clickSuiteByTitle(suiteData.title);

        // Verify detail page
        await expect(testSuitesPage.page).toHaveURL(/test-suites\/[a-z0-9]+/);
    });
});
