import { test, expect } from '@playwright/test';
import { DashboardPage } from '../page-objects/dashboard.page.js';

test.describe('Dashboard', () => {
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        dashboardPage = new DashboardPage(page);
        await dashboardPage.navigate();
    });

    test('should load dashboard successfully', async () => {
        // Verify page title
        await expect(dashboardPage.page).toHaveTitle(/QA Nexus/);

        // Verify dashboard heading is visible
        const isLoaded = await dashboardPage.isLoaded();
        expect(isLoaded).toBe(true);
    });

    test('should display all feature cards', async () => {
        // Verify all cards are visible
        await expect(dashboardPage.testCasesCard).toBeVisible();
        await expect(dashboardPage.testSuitesCard).toBeVisible();
        await expect(dashboardPage.testRunsCard).toBeVisible();
        await expect(dashboardPage.defectsCard).toBeVisible();
    });

    test('should navigate to Test Cases from card', async () => {
        await dashboardPage.goToTestCases();

        // Verify navigation
        await expect(dashboardPage.page).toHaveURL(/test-cases/);
        await expect(dashboardPage.page.getByRole('heading', { name: 'Test Cases' })).toBeVisible();
    });

    test('should navigate to Test Suites from card', async () => {
        await dashboardPage.goToTestSuites();

        await expect(dashboardPage.page).toHaveURL(/test-suites/);
        await expect(dashboardPage.page.getByRole('heading', { name: 'Test Suites' })).toBeVisible();
    });

    test('should navigate to Test Runs from card', async () => {
        await dashboardPage.goToTestRuns();

        await expect(dashboardPage.page).toHaveURL(/test-runs/);
        await expect(dashboardPage.page.getByRole('heading', { name: 'Test Runs' })).toBeVisible();
    });

    test('should navigate to Defects from card', async () => {
        await dashboardPage.goToDefects();

        await expect(dashboardPage.page).toHaveURL(/defects/);
        await expect(dashboardPage.page.getByRole('heading', { name: 'Defects' })).toBeVisible();
    });

    test('should display statistics', async () => {
        const stats = await dashboardPage.getStatistics();

        // Verify stats are numbers (even if 0)
        expect(typeof stats.testCases).toBe('number');
        expect(typeof stats.testSuites).toBe('number');
        expect(typeof stats.testRuns).toBe('number');
        expect(typeof stats.defects).toBe('number');

        // All stats should be >= 0
        expect(stats.testCases).toBeGreaterThanOrEqual(0);
        expect(stats.testSuites).toBeGreaterThanOrEqual(0);
        expect(stats.testRuns).toBeGreaterThanOrEqual(0);
        expect(stats.defects).toBeGreaterThanOrEqual(0);
    });

    test('should navigate via header navigation', async () => {
        // Test header navigation to Analytics
        await dashboardPage.navigateViaHeader('Analytics');
        await expect(dashboardPage.page).toHaveURL(/analytics/);

        // Navigate back to home
        await dashboardPage.navigate();
        await expect(dashboardPage.page).toHaveURL(/^\//);
    });
});
