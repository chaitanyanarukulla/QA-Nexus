import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

export class AIFeaturesPage extends BasePage {
    readonly heading: Locator;
    readonly generateButton: Locator;
    readonly promptInput: Locator;
    readonly generateSubmitButton: Locator;
    readonly generatedResults: Locator;
    readonly acceptButton: Locator;

    constructor(page: Page) {
        super(page);
        this.heading = page.getByRole('heading', { name: /AI|Generation/i });
        this.generateButton = page.getByRole('button', { name: /generate tests/i });
        this.promptInput = page.getByLabel(/prompt|description/i);
        this.generateSubmitButton = page.getByRole('button', { name: /generate/i });
        this.generatedResults = page.locator('[data-testid="generated-results"]');
        this.acceptButton = page.getByRole('button', { name: /accept|save/i });
    }

    async navigate(): Promise<void> {
        await this.goto('/test-cases'); // Assuming it's part of test cases or a separate page
        await this.waitForPageLoad();
    }

    async generateTests(prompt: string): Promise<void> {
        await this.generateButton.click();
        await this.fillField(this.promptInput, prompt);
        await this.generateSubmitButton.click();
        // AI generation takes time
        await this.page.waitForTimeout(5000);
        await this.waitForElement(this.generatedResults);
    }

    async acceptGeneratedTests(): Promise<void> {
        await this.acceptButton.click();
        await this.waitForSuccessToast();
    }
}
