import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/QA Nexus/);
});

test('navigation to test cases', async ({ page }) => {
    await page.goto('/');

    // Click the Test Cases link
    await page.getByRole('link', { name: 'Test Cases', exact: true }).click();

    // Expects page to have a heading with the name of Test Cases.
    await expect(page.getByRole('heading', { name: 'Test Cases' })).toBeVisible();
});
