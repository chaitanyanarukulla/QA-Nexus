import { test, expect } from '@playwright/test';
import { ApiTestingPage } from '../../page-objects/api-testing.page';
import { createTestUser, cleanupTestData } from '../../utils/db.helpers';
import { loginAsUser } from '../../utils/auth.helpers';

test.describe('API Testing Platform', () => {
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

    test('should create and execute a manual request', async ({ page }) => {
        // Create Request
        await apiPage.createRequest('GET', 'https://jsonplaceholder.typicode.com/posts/1', 'Get Post 1');

        // Send Request
        await apiPage.sendRequest();

        // Verify Response
        await expect(page.getByText('200')).toBeVisible();
        await expect(page.locator('pre').first()).toContainText('userId');
    });

    test('should import OpenAPI spec', async ({ page }) => {
        const spec = JSON.stringify({
            openapi: '3.0.0',
            info: { title: 'Imported API', version: '1.0.0' },
            paths: {
                '/users': {
                    get: {
                        summary: 'Get Users',
                        responses: { '200': { description: 'OK' } }
                    }
                }
            }
        });

        await apiPage.importSpec(spec);

        // Verify collection created
        await expect(page.getByText('Imported API (1.0.0)')).toBeVisible();
        await expect(page.getByText('Get Users')).toBeVisible();
    });

    test('should generate request from AI prompt', async ({ page }) => {
        // Mock the AI response if possible, or rely on real integration if configured
        // For this test, we assume the AI service is mocked or functional

        await apiPage.generateRequest('Create a POST request to /api/login with email and password');

        // Verify request populated
        await expect(apiPage.methodSelect).toContainText('POST');
        await expect(apiPage.urlInput).toHaveValue('/api/login');

        // Check body tab
        await apiPage.bodyTab.click();
        await expect(page.locator('textarea').last()).toContainText('email');
        await expect(page.locator('textarea').last()).toContainText('password');
    });

    test('should generate assertions from response', async ({ page }) => {
        // First execute a request to get a response
        await apiPage.createRequest('GET', 'https://jsonplaceholder.typicode.com/todos/1');
        await apiPage.sendRequest();

        // Generate assertions
        await apiPage.generateAssertions();

        // Verify assertions added
        // Note: The exact assertions depend on AI, but we expect some to appear
        await expect(page.locator('.space-y-2 .border').first()).toBeVisible();
        await expect(page.getByText('Status Code')).toBeVisible();
    });
});
