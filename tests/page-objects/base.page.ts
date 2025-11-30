import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object
 * 
 * Common functionality shared across all page objects
 */
export class BasePage {
    readonly page: Page;
    readonly baseURL: string;

    constructor(page: Page) {
        this.page = page;
        this.baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
    }

    /**
     * Navigate to a specific path
     */
    async goto(path: string): Promise<void> {
        await this.page.goto(path);
    }

    /**
     * Wait for a specific element to be visible
     */
    async waitForElement(locator: Locator, timeout = 10000): Promise<void> {
        await locator.waitFor({ state: 'visible', timeout });
    }

    /**
     * Click and wait for navigation
     */
    async clickAndWaitForNavigation(locator: Locator): Promise<void> {
        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            locator.click(),
        ]);
    }

    /**
     * Fill form field with error handling
     */
    async fillField(locator: Locator, value: string): Promise<void> {
        await locator.clear();
        await locator.fill(value);
    }

    /**
     * Wait for success toast message
     */
    async waitForSuccessToast(message?: string): Promise<void> {
        const toast = message
            ? this.page.getByText(message)
            : this.page.locator('[data-sonner-toast][data-type="success"]');
        await toast.waitFor({ state: 'visible', timeout: 5000 });
    }

    /**
     * Wait for error toast message
     */
    async waitForErrorToast(message?: string): Promise<void> {
        const toast = message
            ? this.page.getByText(message)
            : this.page.locator('[data-sonner-toast][data-type="error"]');
        await toast.waitFor({ state: 'visible', timeout: 5000 });
    }

    /**
     * Take a screenshot with a descriptive name
     */
    async takeScreenshot(name: string): Promise<void> {
        await this.page.screenshot({
            path: `test-results/screenshots/${name}-${Date.now()}.png`,
            fullPage: true,
        });
    }

    /**
     * Wait for page to load completely
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Get text content from an element
     */
    async getTextContent(locator: Locator): Promise<string> {
        return (await locator.textContent()) || '';
    }

    /**
     * Check if element is visible
     */
    async isVisible(locator: Locator): Promise<boolean> {
        try {
            await locator.waitFor({ state: 'visible', timeout: 2000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Select option from dropdown
     */
    async selectOption(locator: Locator, value: string): Promise<void> {
        await locator.click();
        await this.page.getByRole('option', { name: value }).click();
    }

    /**
     * Navigate using header navigation
     */
    async navigateViaHeader(linkName: string): Promise<void> {
        await this.page.getByRole('link', { name: linkName, exact: true }).click();
        await this.waitForPageLoad();
    }
}
