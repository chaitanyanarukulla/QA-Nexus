import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page.js';

export class CommentsComponent extends BasePage {
    readonly commentInput: Locator;
    readonly postButton: Locator;
    readonly commentList: Locator;

    constructor(page: Page) {
        super(page);
        this.commentInput = page.getByPlaceholder(/write a comment/i);
        this.postButton = page.getByRole('button', { name: /post|comment/i });
        this.commentList = page.locator('[data-testid="comment-list"]');
    }

    async addComment(text: string): Promise<void> {
        await this.fillField(this.commentInput, text);
        await this.postButton.click();
        await this.waitForSuccessToast();
    }

    async verifyCommentVisible(text: string): Promise<void> {
        await this.waitForElement(this.commentList);
        await this.isVisible(this.page.getByText(text));
    }
}
