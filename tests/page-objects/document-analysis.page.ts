import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

export class DocumentAnalysisPage extends BasePage {
    readonly heading: Locator;
    readonly analyzeButton: Locator;

    // Analysis Form
    readonly sourceTypeSelect: Locator;
    readonly sourceIdInput: Locator; // Jira Key or Confluence ID
    readonly startAnalysisButton: Locator;

    // Results
    readonly risksSection: Locator;
    readonly gapsSection: Locator;
    readonly generateSuiteButton: Locator;

    constructor(page: Page) {
        super(page);
        this.heading = page.getByRole('heading', { name: /analysis|document/i });
        this.analyzeButton = page.getByRole('button', { name: /analyze new/i });

        this.sourceTypeSelect = page.getByLabel(/source type/i);
        this.sourceIdInput = page.getByLabel(/source id|key|url/i);
        this.startAnalysisButton = page.getByRole('button', { name: /start analysis/i });

        this.risksSection = page.locator('text=Risks');
        this.gapsSection = page.locator('text=Gaps');
        this.generateSuiteButton = page.getByRole('button', { name: /generate test suite/i });
    }

    async navigate(): Promise<void> {
        await this.goto('/analytics/document-analysis'); // Adjust path if needed
        await this.waitForPageLoad();
    }

    async analyzeDocument(type: 'JIRA_EPIC' | 'CONFLUENCE_PAGE', id: string): Promise<void> {
        await this.analyzeButton.click();
        await this.selectOption(this.sourceTypeSelect, type);
        await this.fillField(this.sourceIdInput, id);
        await this.startAnalysisButton.click();
        // Analysis might take time
        await this.page.waitForTimeout(5000);
        await this.waitForPageLoad();
    }

    async generateSuite(): Promise<void> {
        await this.generateSuiteButton.click();
        await this.waitForSuccessToast();
    }
}
