import { test, expect } from '@playwright/test';
import { ApiTestingPage } from '../../page-objects/api-testing.page';
import { createTestUser, cleanupTestData } from '../../utils/db.helpers';
import { loginAsUser } from '../../utils/auth.helpers';

test.describe('API Collections', () => {
    let apiPage: ApiTestingPage;

    test.beforeAll(async () => {
        await createTestUser({ role: 'TESTER' });
    });

    test.afterAll(async () => {
        await cleanupTestData();
    });

    test.beforeEach(async ({ page }) => {
        await loginAsUser(page, 'TESTER');
        apiPage = new ApiTestingPage(page);
        await apiPage.navigate();
    });

    test('should create a new collection', async ({ page }) => {
        const collectionName = `Collection ${Date.now()}`;
        await apiPage.createCollection(collectionName);

        // Verify it appears in the list
        await expect(page.getByText(collectionName, { exact: true })).toBeVisible();
    });

    test('should delete a collection', async ({ page }) => {
        const collectionName = `Delete Me ${Date.now()}`;
        await apiPage.createCollection(collectionName);

        // Delete
        await apiPage.deleteCollection(collectionName);

        // Verify it's gone
        await expect(page.getByText(collectionName, { exact: true })).not.toBeVisible();
    });
});
