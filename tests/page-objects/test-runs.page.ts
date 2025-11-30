import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

export class TestRunsPage extends BasePage {
    readonly heading: Locator;
    readonly createButton: Locator;
    readonly testRunRows: Locator;

    // Create Dialog
    readonly suiteSelect: Locator;
    readonly titleInput: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.heading = page.getByRole('heading', { name: 'Test Runs' });
        this.createButton = page.getByRole('button', { name: /create|new run/i });
        this.testRunRows = page.locator('tbody tr');

        this.suiteSelect = page.getByLabel(/test suite/i);
        this.titleInput = page.getByLabel(/title/i);
        this.submitButton = page.getByRole('button', { name: /create/i });
    }

    async navigate(): Promise<void> {
        await this.goto('/test-runs');
        await this.waitForPageLoad();
    }

    async createTestRun(data: { title: string; suiteName: string }): Promise<void> {
        await this.createButton.click();
        await this.fillField(this.titleInput, data.title);
        // Assuming suite select is a dropdown or combobox
        await this.selectOption(this.suiteSelect, data.suiteName);
        await this.submitButton.click();
        await this.waitForSuccessToast();
    }

    async clickTestRunByTitle(title: string): Promise<void> {
        await this.page.getByRole('row', { name: new RegExp(title, 'i') }).click();
        await this.waitForPageLoad();
    }
}
