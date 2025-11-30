import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

/**
 * Dashboard Page Object
 * 
 * Represents the home dashboard page
 */
export class DashboardPage extends BasePage {
    // Locators
    readonly heading: Locator;
    readonly testCasesCard: Locator;
    readonly testSuitesCard: Locator;
    readonly testRunsCard: Locator;
    readonly defectsCard: Locator;
    readonly testCasesCount: Locator;
    readonly testSuitesCount: Locator;
    readonly testRunsCount: Locator;
    readonly defectsCount: Locator;

    constructor(page: Page) {
        super(page);

        // Initialize locators
        this.heading = page.getByRole('heading', { name: /QA Nexus/i });
        this.testCasesCard = page.locator('text=Test Cases').locator('..');
        this.testSuitesCard = page.locator('text=Test Suites').locator('..');
        this.testRunsCard = page.locator('text=Test Runs').locator('..');
        this.defectsCard = page.locator('text=Defects').locator('..');
        this.testCasesCount = page.locator('[data-testid="test-cases-count"]');
        this.testSuitesCount = page.locator('[data-testid="test-suites-count"]');
        this.testRunsCount = page.locator('[data-testid="test-runs-count"]');
        this.defectsCount = page.locator('[data-testid="defects-count"]');
    }

    /**
     * Navigate to dashboard
     */
    async navigate(): Promise<void> {
        await this.goto('/');
        await this.waitForPageLoad();
    }

    /**
     * Click on Test Cases card
     */
    async goToTestCases(): Promise<void> {
        await this.testCasesCard.click();
        await this.waitForPageLoad();
    }

    /**
     * Click on Test Suites card
     */
    async goToTestSuites(): Promise<void> {
        await this.testSuitesCard.click();
        await this.waitForPageLoad();
    }

    /**
     * Click on Test Runs card
     */
    async goToTestRuns(): Promise<void> {
        await this.testRunsCard.click();
        await this.waitForPageLoad();
    }

    /**
     * Click on Defects card
     */
    async goToDefects(): Promise<void> {
        await this.defectsCard.click();
        await this.waitForPageLoad();
    }

    /**
     * Get dashboard statistics
     */
    async getStatistics(): Promise<{
        testCases: number;
        testSuites: number;
        testRuns: number;
        defects: number;
    }> {
        const getText = async (locator: Locator) => {
            const text = await this.getTextContent(locator);
            return parseInt(text.replace(/\D/g, '')) || 0;
        };

        return {
            testCases: await getText(this.testCasesCount),
            testSuites: await getText(this.testSuitesCount),
            testRuns: await getText(this.testRunsCount),
            defects: await getText(this.defectsCount),
        };
    }

    /**
     * Verify dashboard loaded successfully
     */
    async isLoaded(): Promise<boolean> {
        return await this.isVisible(this.heading);
    }
}
