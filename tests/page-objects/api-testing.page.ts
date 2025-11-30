import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ApiTestingPage extends BasePage {
    // Sidebar
    readonly sidebar: Locator;
    readonly newCollectionBtn: Locator;
    readonly importBtn: Locator;
    readonly generateBtn: Locator;
    readonly collectionList: Locator;

    // Request Builder
    readonly requestBuilder: Locator;
    readonly methodSelect: Locator;
    readonly urlInput: Locator;
    readonly sendBtn: Locator;
    readonly saveBtn: Locator;
    readonly titleInput: Locator;

    // Tabs
    readonly paramsTab: Locator;
    readonly headersTab: Locator;
    readonly bodyTab: Locator;
    readonly authTab: Locator;
    readonly assertionsTab: Locator;

    // Response
    readonly responseSection: Locator;
    readonly responseStatus: Locator;
    readonly responseBody: Locator;

    // Dialogs
    readonly importDialog: Locator;
    readonly importTextarea: Locator;
    readonly confirmImportBtn: Locator;

    readonly generateDialog: Locator;
    readonly generatePromptInput: Locator;
    readonly confirmGenerateBtn: Locator;

    // Assertions
    readonly generateAssertionsBtn: Locator;
    readonly assertionList: Locator;

    constructor(page: Page) {
        super(page);

        // Sidebar
        this.sidebar = page.locator('.w-64.border-r');
        this.newCollectionBtn = page.getByRole('button', { name: 'New', exact: true });
        this.importBtn = page.getByRole('button', { name: 'Import' });
        this.generateBtn = page.getByRole('button', { name: 'Generate' });
        this.collectionList = page.locator('[data-testid="collection-list"]'); // Assuming testid or use class

        // Request Builder
        this.requestBuilder = page.locator('.flex-1.p-6');
        this.methodSelect = page.getByRole('combobox').first(); // Adjust if multiple
        this.urlInput = page.getByPlaceholder('https://api.example.com/users');
        this.sendBtn = page.getByRole('button', { name: 'Send' });
        this.saveBtn = page.getByRole('button', { name: 'Save' });
        this.titleInput = page.getByLabel('Title (optional)');

        // Tabs
        this.paramsTab = page.getByRole('tab', { name: 'Query Params' });
        this.headersTab = page.getByRole('tab', { name: 'Headers' });
        this.bodyTab = page.getByRole('tab', { name: 'Body' });
        this.authTab = page.getByRole('tab', { name: 'Auth' });
        this.assertionsTab = page.getByRole('tab', { name: 'Assertions' });

        // Response
        this.responseSection = page.locator('.mt-4'); // Adjust selector
        this.responseStatus = page.locator('.badge'); // Adjust selector
        this.responseBody = page.getByRole('tabpanel', { name: 'Body' }).locator('pre');

        // Dialogs
        this.importDialog = page.getByRole('dialog', { name: 'Import OpenAPI Spec' });
        this.importTextarea = this.importDialog.locator('textarea');
        this.confirmImportBtn = this.importDialog.getByRole('button', { name: 'Import Collection' });

        this.generateDialog = page.getByRole('dialog', { name: 'Generate API Request with AI' });
        this.generatePromptInput = this.generateDialog.locator('textarea');
        this.confirmGenerateBtn = this.generateDialog.getByRole('button', { name: 'Generate Request' });

        // Assertions
        this.generateAssertionsBtn = page.getByRole('button', { name: 'Generate with AI' });
        this.assertionList = page.locator('.space-y-2 .card'); // Adjust selector
    }

    async navigate() {
        await this.goto('/api-testing');
    }

    async createRequest(method: string, url: string, title?: string) {
        // Select method (if not default GET)
        if (method !== 'GET') {
            await this.methodSelect.click();
            await this.page.getByRole('option', { name: method }).click();
        }

        await this.urlInput.fill(url);

        if (title) {
            await this.titleInput.fill(title);
        }
    }

    async sendRequest() {
        await this.sendBtn.click();
        // Wait for response
        await expect(this.page.getByText('Response', { exact: true })).toBeVisible();
    }

    async importSpec(specContent: string) {
        await this.importBtn.click();
        await expect(this.importDialog).toBeVisible();
        await this.importTextarea.fill(specContent);
        await this.confirmImportBtn.click();
        await expect(this.importDialog).not.toBeVisible();
    }

    async generateRequest(prompt: string) {
        await this.generateBtn.click();
        await expect(this.generateDialog).toBeVisible();
        await this.generatePromptInput.fill(prompt);
        await this.confirmGenerateBtn.click();
        await expect(this.generateDialog).not.toBeVisible();
    }

    async generateAssertions() {
        await this.assertionsTab.click();
        await this.generateAssertionsBtn.click();
        // Wait for assertions to appear
        await expect(this.page.getByText('Generated', { exact: false })).toBeVisible(); // Toast message
    }
}
