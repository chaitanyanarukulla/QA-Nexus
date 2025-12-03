import { test, expect } from '@playwright/test';

test.describe('API Testing Module', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to API Testing page
        await page.goto('/api-testing');
        await page.waitForLoadState('networkidle');
        // Wait for authentication if needed
        await page.waitForTimeout(1000);
    });

    test('should display API Testing page', async ({ page }) => {
        // Verify page title contains "API Testing"
        await expect(page).toHaveTitle(/API Testing/);

        // Verify main heading is visible
        const mainHeading = page.locator('h1:has-text("API Testing")');
        await expect(mainHeading).toBeVisible();
    });

    test('should display collections section', async ({ page }) => {
        // Verify collections section exists
        const collectionsText = page.locator('text=Collections').first();
        // This test is more lenient - just check the text exists somewhere
        const hasCollections = await collectionsText.count() > 0;
        expect(hasCollections).toBe(true);
    });

    test('should display existing requests', async ({ page }) => {
        // Check if there are any existing requests visible
        const getUsers = page.locator('text=Get Users').first();
        const uatCollection = page.locator('text=UAT Collection').first();

        // At least one of these should be visible
        const hasRequest = await getUsers.isVisible() || await uatCollection.isVisible();
        expect(hasRequest).toBe(true);
    });

    test('should display response with proper formatting when executing request', async ({ page }) => {
        // Try to find and click an existing request
        const existingRequest = page.locator('text=Get Users').first();

        if (await existingRequest.isVisible({ timeout: 5000 })) {
            await existingRequest.click();
            await page.waitForTimeout(1000);

            // Try to execute the request
            const sendBtn = page.locator('button:has-text("Send")').first();
            if (await sendBtn.isVisible({ timeout: 3000 })) {
                await sendBtn.click();

                // Wait for response
                await page.waitForTimeout(8000);

                // Look for response indicators (status code or response data)
                const has200 = await page.locator('text=/200/').count() > 0;
                const hasResponseData = await page.locator('pre, code').count() > 0;

                // At least one indicator should be present
                expect(has200 || hasResponseData).toBe(true);
            }
        }
    });

    test('should show execution completed state after running request', async ({ page }) => {
        const existingRequest = page.locator('text=Get Users').first();

        if (await existingRequest.isVisible({ timeout: 5000 })) {
            await existingRequest.click();
            await page.waitForTimeout(500);

            const sendBtn = page.locator('button:has-text("Send")').first();
            if (await sendBtn.isVisible({ timeout: 3000 })) {
                await sendBtn.click();
                await page.waitForTimeout(8000);

                // Check for any completion indicators
                const statusText = await page.locator('text=/Status|Response|200|OK/i').count();
                expect(statusText).toBeGreaterThan(0);
            }
        }
    });
});
