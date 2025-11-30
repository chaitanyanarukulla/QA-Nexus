import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

/**
 * Test Suites Page Object
 * 
 * Represents the test suites management page
 */
export class TestSuitesPage extends BasePage {
    // Locators
    readonly heading: Locator;
    readonly createButton: Locator;
    readonly suiteCards: Locator;

    // Form locators
    readonly titleInput: Locator;
    readonly descriptionInput: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page);

        this.heading = page.getByRole('heading', { name: 'Test Suites' });
        this.createButton = page.getByRole('button', { name: /create|new suite/i });
        this.suiteCards = page.locator('[data-testid="suite-card"]');

        this.titleInput = page.getByLabel(/title/i);
        this.descriptionInput = page.getByLabel(/description/i);
        this.submitButton = page.getByRole('button', { name: /save|create/i });
    }

    async navigate(): Promise<void> {
        await this.goto('/test-suites');
        await this.waitForPageLoad();
    }

    async createTestSuite(data: {
        title: string;
        description?: string;
    }): Promise<void> {
        await this.createButton.click();
        await this.fillField(this.titleInput, data.title);

        if (data.description) {
            await this.fillField(this.descriptionInput, data.description);
        }

        await this.submitButton.click();
        await this.waitForSuccessToast();
    }

    async clickSuiteByTitle(title: string): Promise<void> {
        await this.page.getByText(title).first().click();
        await this.waitForPageLoad();
    }

    async getSuiteCount(): Promise<number> {
        const cards = await this.suiteCards.all();
        return cards.length;
    }
}
