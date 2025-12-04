import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ApiTestingPage extends BasePage {
    // Sidebar
    readonly sidebar: Locator;
    readonly newCollectionBtn: Locator;
    readonly importBtn: Locator;
    readonly generateBtn: Locator;
    readonly collectionList: Locator;
    readonly collectionNameInput: Locator;
    readonly addCollectionBtn: Locator;

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

    // Environments
    readonly environmentSelector: Locator;
    readonly manageEnvironmentsBtn: Locator;
    readonly newEnvironmentBtn: Locator;
    readonly envNameInput: Locator;
    readonly envDescInput: Locator;
    readonly envVarsInput: Locator;
    readonly createEnvBtn: Locator;
    readonly saveEnvBtn: Locator;

    constructor(page: Page) {
        super(page);

        // Sidebar
        this.sidebar = page.locator('.w-80.border-r');
        this.newCollectionBtn = page.getByRole('button', { name: 'New', exact: true });
        this.importBtn = page.getByRole('button', { name: 'Import', exact: true });
        this.generateBtn = page.getByRole('button', { name: 'Generate', exact: true });
        this.collectionList = page.locator('.flex-1 .p-2');
        this.collectionNameInput = page.getByPlaceholder('Collection name');
        this.addCollectionBtn = page.getByRole('button', { name: 'Add', exact: true });

        // Request Builder
        this.requestBuilder = page.locator('.flex-1.flex.flex-col');
        this.methodSelect = page.getByRole('combobox').first();
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
        this.responseSection = page.locator('.mt-4');
        this.responseStatus = page.locator('.badge');
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
        // Assertions
        this.generateAssertionsBtn = page.getByRole('button', { name: 'Generate with AI' });
        this.assertionList = page.locator('.space-y-2 [data-slot="card"]');

        // Environments
        this.environmentSelector = page.getByRole('combobox').nth(1); // Assuming second combobox
        this.manageEnvironmentsBtn = page.getByRole('button', { name: 'Manage Environments' }); // Or link
        this.newEnvironmentBtn = page.getByRole('button', { name: 'New Environment' });
        this.envNameInput = page.locator('#create-name');
        this.envDescInput = page.locator('#create-description');
        this.envVarsInput = page.locator('#create-variables');
        this.createEnvBtn = page.getByRole('button', { name: 'Create', exact: true });
        this.saveEnvBtn = page.getByRole('button', { name: 'Save', exact: true });
    }

    async navigate() {
        await this.goto('/api-testing');
    }

    async createCollection(name: string) {
        await this.newCollectionBtn.click();
        await this.collectionNameInput.fill(name);
        await this.addCollectionBtn.click();
        await expect(this.page.getByText(name, { exact: true })).toBeVisible();
        await this.page.getByText(name, { exact: true }).click();
    }

    async deleteCollection(name: string) {
        const collection = this.page.locator('.group', { hasText: name }).first();
        await collection.hover();
        this.page.once('dialog', dialog => dialog.accept());
        await collection.getByRole('button').last().click(); // Trash icon
        await expect(this.page.getByText(name, { exact: true })).not.toBeVisible();
    }

    async createRequest(method: string, url: string, title?: string) {
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
        await expect(this.page.getByText('Generated', { exact: false })).toBeVisible();
    }

    // Environment Methods
    async navigateToEnvironments() {
        await this.goto('/api-testing/environments');
    }

    async createEnvironment(name: string, variables: object) {
        await this.newEnvironmentBtn.click();
        await this.envNameInput.fill(name);
        await this.envVarsInput.fill(JSON.stringify(variables, null, 2));
        await this.createEnvBtn.click();
        await expect(this.page.getByText(name)).toBeVisible();
    }

    async deleteEnvironment(name: string) {
        const envCard = this.page.locator('[data-slot="card"]', { hasText: name }); // Adjust selector based on Card structure
        // Assuming delete button is in the card
        this.page.once('dialog', dialog => dialog.accept());
        await envCard.getByRole('button').filter({ has: this.page.locator('svg.lucide-trash-2') }).click();
        // Note: This selector is risky, better to find within card
    }
}
