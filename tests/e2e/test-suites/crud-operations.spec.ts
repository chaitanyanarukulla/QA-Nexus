import { test, expect } from '@playwright/test';
import { TestSuitesPage } from '../../page-objects/test-suites.page.js';
import { generateTestSuite, uniqueId } from '../../utils/test-data.factory.js';

test.describe('Test Suite CRUD Operations', () => {
    let testSuitesPage: TestSuitesPage;

    test.beforeEach(async ({ page }) => {
        testSuitesPage = new TestSuitesPage(page);
        await testSuitesPage.navigate();
    });

    test('should edit an existing test suite', async () => {
        // 1. Create
        const title = `Edit Suite ${uniqueId()}`;
        await testSuitesPage.createTestSuite({ title });

        // 2. Edit
        await testSuitesPage.clickSuiteByTitle(title);
        await testSuitesPage.page.getByRole('button', { name: /edit/i }).click();

        const newTitle = `${title} - Updated`;
        await testSuitesPage.fillField(testSuitesPage.titleInput, newTitle);
        await testSuitesPage.submitButton.click();
        await testSuitesPage.waitForSuccessToast();

        // 3. Verify
        await testSuitesPage.navigate();
        await expect(testSuitesPage.page.getByText(newTitle)).toBeVisible();
    });

    test('should delete a test suite', async () => {
        // 1. Create
        const title = `Delete Suite ${uniqueId()}`;
        await testSuitesPage.createTestSuite({ title });

        // 2. Delete
        await testSuitesPage.clickSuiteByTitle(title);
        await testSuitesPage.page.getByRole('button', { name: /delete/i }).click();
        await testSuitesPage.page.getByRole('button', { name: /confirm|yes/i }).click();
        await testSuitesPage.waitForSuccessToast();

        // 3. Verify
        await testSuitesPage.navigate();
        await expect(testSuitesPage.page.getByText(title)).not.toBeVisible();
    });
});
