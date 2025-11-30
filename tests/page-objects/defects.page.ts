import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

export class DefectsPage extends BasePage {
    readonly heading: Locator;
    readonly createButton: Locator;
    readonly defectRows: Locator;

    // Form
    readonly titleInput: Locator;
    readonly descriptionInput: Locator;
    readonly prioritySelect: Locator;
    readonly statusSelect: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.heading = page.getByRole('heading', { name: 'Defects' });
        this.createButton = page.getByRole('button', { name: /create|new defect/i });
        this.defectRows = page.locator('tbody tr');

        this.titleInput = page.getByLabel(/title/i);
        this.descriptionInput = page.getByLabel(/description/i);
        this.prioritySelect = page.getByLabel(/priority/i);
        this.statusSelect = page.getByLabel(/status/i);
        this.submitButton = page.getByRole('button', { name: /save|create/i });
    }

    async navigate(): Promise<void> {
        await this.goto('/defects');
        await this.waitForPageLoad();
    }

    async createDefect(data: {
        title: string;
        description?: string;
        priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }): Promise<void> {
        await this.createButton.click();
        await this.fillField(this.titleInput, data.title);
        if (data.description) await this.fillField(this.descriptionInput, data.description);
        if (data.priority) await this.selectOption(this.prioritySelect, data.priority);

        await this.submitButton.click();
        await this.waitForSuccessToast();
    }

    async updateStatus(title: string, status: string): Promise<void> {
        await this.page.getByRole('row', { name: new RegExp(title, 'i') }).click();
        await this.waitForPageLoad();
        await this.selectOption(this.statusSelect, status);
        await this.waitForSuccessToast();
    }
}
