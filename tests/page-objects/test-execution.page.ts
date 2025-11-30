import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

export class TestExecutionPage extends BasePage {
    readonly heading: Locator;
    readonly testCaseList: Locator;
    readonly passButton: Locator;
    readonly failButton: Locator;
    readonly blockedButton: Locator;
    readonly skippedButton: Locator;
    readonly notesInput: Locator;
    readonly evidenceInput: Locator;
    readonly saveResultButton: Locator;
    readonly logDefectButton: Locator;

    constructor(page: Page) {
        super(page);
        this.heading = page.getByRole('heading');
        this.testCaseList = page.locator('[data-testid="execution-test-list"]');

        // Execution controls
        this.passButton = page.getByRole('button', { name: /pass/i });
        this.failButton = page.getByRole('button', { name: /fail/i });
        this.blockedButton = page.getByRole('button', { name: /block/i });
        this.skippedButton = page.getByRole('button', { name: /skip/i });

        this.notesInput = page.getByLabel(/notes/i);
        this.evidenceInput = page.getByLabel(/evidence/i);
        this.saveResultButton = page.getByRole('button', { name: /save/i });
        this.logDefectButton = page.getByRole('button', { name: /log defect/i });
    }

    async selectTestCase(title: string): Promise<void> {
        await this.page.getByText(title).click();
    }

    async markAsPassed(notes?: string): Promise<void> {
        if (notes) await this.fillField(this.notesInput, notes);
        await this.passButton.click();
        await this.waitForSuccessToast();
    }

    async markAsFailed(notes?: string): Promise<void> {
        if (notes) await this.fillField(this.notesInput, notes);
        await this.failButton.click();
        await this.waitForSuccessToast();
    }

    async logDefect(): Promise<void> {
        await this.logDefectButton.click();
        await this.waitForPageLoad(); // Should navigate to defect creation
    }
}
