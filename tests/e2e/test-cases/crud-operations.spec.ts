import { test, expect } from '@playwright/test';
import { TestCasesPage } from '../../page-objects/test-cases.page.js';
import { generateTestCase, uniqueId } from '../../utils/test-data.factory.js';

test.describe('Test Case CRUD Operations', () => {
    let testCasesPage: TestCasesPage;

    test.beforeEach(async ({ page }) => {
        testCasesPage = new TestCasesPage(page);
        await testCasesPage.navigate();
    });

    test('should edit an existing test case', async () => {
        // 1. Create
        const title = `Edit Test ${uniqueId()}`;
        await testCasesPage.createTestCase({ title });

        // 2. Edit (Need to implement edit method in POM or do it manually here)
        await testCasesPage.clickTestCaseByTitle(title);
        await testCasesPage.page.getByRole('button', { name: /edit/i }).click();

        const newTitle = `${title} - Updated`;
        await testCasesPage.fillField(testCasesPage.titleInput, newTitle);
        await testCasesPage.submitButton.click();
        await testCasesPage.waitForSuccessToast();

        // 3. Verify
        await testCasesPage.navigate();
        await expect(testCasesPage.page.getByText(newTitle)).toBeVisible();
    });

    test('should delete a test case', async () => {
        // 1. Create
        const title = `Delete Test ${uniqueId()}`;
        await testCasesPage.createTestCase({ title });

        // 2. Delete
        await testCasesPage.deleteTestCaseByTitle(title);

        // 3. Verify
        await expect(testCasesPage.page.getByText(title)).not.toBeVisible();
    });
});
