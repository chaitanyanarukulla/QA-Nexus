import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
    test('dashboard page visual snapshot', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Take a screenshot for visual comparison
        await expect(page).toHaveScreenshot('dashboard.png', {
            fullPage: true,
            animations: 'disabled',
        });
    });

    test('test cases page visual snapshot', async ({ page }) => {
        await page.goto('/test-cases');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveScreenshot('test-cases-list.png', {
            fullPage: true,
            animations: 'disabled',
        });
    });

    test('test suites page visual snapshot', async ({ page }) => {
        await page.goto('/test-suites');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveScreenshot('test-suites-list.png', {
            fullPage: true,
            animations: 'disabled',
        });
    });

    test('analytics page visual snapshot', async ({ page }) => {
        await page.goto('/analytics');
        await page.waitForLoadState('networkidle');

        // Wait for charts to render
        await page.waitForTimeout(1000);

        await expect(page).toHaveScreenshot('analytics.png', {
            fullPage: true,
            animations: 'disabled',
        });
    });

    test('settings page visual snapshot', async ({ page }) => {
        await page.goto('/settings');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveScreenshot('settings.png', {
            fullPage: true,
            animations: 'disabled',
        });
    });
});
