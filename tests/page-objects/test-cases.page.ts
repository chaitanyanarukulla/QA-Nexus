import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

/**
 * Test Cases Page Object
 * 
 * Represents the test cases management page
 */
export class TestCasesPage extends BasePage {
    // Locators
    readonly heading: Locator;
    readonly createButton: Locator;
    readonly searchInput: Locator;
    readonly testCaseTable: Locator;
    readonly testCaseRows: Locator;

    // Form locators
    readonly titleInput: Locator;
    readonly descriptionInput: Locator;
    readonly stepsInput: Locator;
    readonly expectedResultInput: Locator;
    readonly prioritySelect: Locator;
    readonly statusSelect: Locator;
    readonly suiteSelect: Locator;
    readonly submitButton: Locator;
    readonly cancelButton: Locator;

    constructor(page: Page) {
        super(page);

        // List view locators
        this.heading = page.getByRole('heading', { name: 'Test Cases' });
        this.createButton = page.getByRole('button', { name: /create|new test case/i });
        this.searchInput = page.getByPlaceholder(/search/i);
        this.testCaseTable = page.locator('table');
        this.testCaseRows = page.locator('tbody tr');

        // Form locators
        this.titleInput = page.getByLabel(/title/i);
        this.descriptionInput = page.getByLabel(/description/i);
        this.stepsInput = page.getByLabel(/steps/i);
        this.expectedResultInput = page.getByLabel(/expected result/i);
        this.prioritySelect = page.getByLabel(/priority/i);
        this.statusSelect = page.getByLabel(/status/i);
        this.suiteSelect = page.getByLabel(/suite/i);
        this.submitButton = page.getByRole('button', { name: /save|create/i });
        this.cancelButton = page.getByRole('button', { name: /cancel/i });
    }

    /**
     * Navigate to test cases page
     */
    async navigate(): Promise<void> {
        await this.goto('/test-cases');
        await this.waitForPageLoad();
    }

    /**
     * Click create new test case button
     */
    async clickCreate(): Promise<void> {
        await this.createButton.click();
        await this.page.waitForTimeout(500); // Wait for dialog to open
    }

    /**
     * Fill test case form
     */
    async fillTestCaseForm(data: {
        title: string;
        description?: string;
        steps?: string;
        expectedResult?: string;
        priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        status?: 'ACTIVE' | 'DRAFT' | 'DEPRECATED';
        suite?: string;
    }): Promise<void> {
        await this.fillField(this.titleInput, data.title);

        if (data.description) {
            await this.fillField(this.descriptionInput, data.description);
        }

        if (data.steps) {
            await this.fillField(this.stepsInput, data.steps);
        }

        if (data.expectedResult) {
            await this.fillField(this.expectedResultInput, data.expectedResult);
        }

        if (data.priority) {
            await this.selectOption(this.prioritySelect, data.priority);
        }

        if (data.status) {
            await this.selectOption(this.statusSelect, data.status);
        }

        if (data.suite) {
            await this.selectOption(this.suiteSelect, data.suite);
        }
    }

    /**
     * Submit test case form
     */
    async submitForm(): Promise<void> {
        await this.submitButton.click();
        await this.page.waitForTimeout(500); // Wait for submission
    }

    /**
     * Create a new test case
     */
    async createTestCase(data: {
        title: string;
        description?: string;
        steps?: string;
        expectedResult?: string;
        priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        status?: 'ACTIVE' | 'DRAFT' | 'DEPRECATED';
        suite?: string;
    }): Promise<void> {
        await this.clickCreate();
        await this.fillTestCaseForm(data);
        await this.submitForm();
        await this.waitForSuccessToast();
    }

    /**
     * Search for test cases
     */
    async search(query: string): Promise<void> {
        await this.fillField(this.searchInput, query);
        await this.page.waitForTimeout(500); // Wait for search results
    }

    /**
     * Get all test case titles from the table
     */
    async getTestCaseTitles(): Promise<string[]> {
        await this.waitForElement(this.testCaseTable);
        const rows = await this.testCaseRows.all();
        const titles: string[] = [];

        for (const row of rows) {
            const titleCell = row.locator('td').first();
            const title = await this.getTextContent(titleCell);
            titles.push(title);
        }

        return titles;
    }

    /**
     * Click on a test case by title
     */
    async clickTestCaseByTitle(title: string): Promise<void> {
        await this.page.getByRole('row', { name: new RegExp(title, 'i') }).click();
        await this.waitForPageLoad();
    }

    /**
     * Delete test case by title
     */
    async deleteTestCaseByTitle(title: string): Promise<void> {
        const row = this.page.getByRole('row', { name: new RegExp(title, 'i') });
        const deleteButton = row.getByRole('button', { name: /delete/i });
        await deleteButton.click();

        // Confirm deletion
        await this.page.getByRole('button', { name: /confirm|yes|delete/i }).click();
        await this.waitForSuccessToast();
    }

    /**
     * Get test case count
     */
    async getTestCaseCount(): Promise<number> {
        const rows = await this.testCaseRows.all();
        return rows.length;
    }

    /**
     * Filter by priority
     */
    async filterByPriority(priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): Promise<void> {
        await this.page.getByRole('button', { name: /filter/i }).click();
        await this.page.getByRole('checkbox', { name: priority }).check();
        await this.page.waitForTimeout(500);
    }

    /**
     * Filter by status
     */
    async filterByStatus(status: 'ACTIVE' | 'DRAFT' | 'DEPRECATED'): Promise<void> {
        await this.page.getByRole('button', { name: /filter/i }).click();
        await this.page.getByRole('checkbox', { name: status }).check();
        await this.page.waitForTimeout(500);
    }
}
