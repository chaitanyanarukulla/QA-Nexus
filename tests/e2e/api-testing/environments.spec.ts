import { test, expect } from '@playwright/test';
import { ApiTestingPage } from '../../page-objects/api-testing.page';
import { createTestUser, cleanupTestData } from '../../utils/db.helpers';
import { loginAsUser } from '../../utils/auth.helpers';

test.describe('API Environments', () => {
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
        await apiPage.navigateToEnvironments();
    });

    test('should create a new environment', async ({ page }) => {
        const envName = `Env ${Date.now()}`;
        const variables = { BASE_URL: 'https://api.test.com', API_KEY: '12345' };

        await apiPage.createEnvironment(envName, variables);

        // Verify it appears in the list
        await expect(page.getByText(envName)).toBeVisible();
        await expect(page.getByText('2 variable(s)')).toBeVisible();
    });

    test('should delete an environment', async ({ page }) => {
        const envName = `Delete Env ${Date.now()}`;
        const variables = { TEST: 'true' };

        await apiPage.createEnvironment(envName, variables);

        // Delete
        await apiPage.deleteEnvironment(envName);

        // Verify it's gone
        await expect(page.getByText(envName)).not.toBeVisible();
    });
});
