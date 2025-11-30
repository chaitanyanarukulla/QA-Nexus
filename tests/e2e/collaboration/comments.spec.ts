import { test, expect } from '@playwright/test';
import { TestCasesPage } from '../../page-objects/test-cases.page.js';
import { CommentsComponent } from '../../page-objects/components/comments.component.js';
import { generateTestCase, uniqueId } from '../../utils/test-data.factory.js';

test.describe('Collaboration Features', () => {
    let testCasesPage: TestCasesPage;
    let commentsComponent: CommentsComponent;

    test.beforeEach(async ({ page }) => {
        testCasesPage = new TestCasesPage(page);
        commentsComponent = new CommentsComponent(page);
        await testCasesPage.navigate();
    });

    test('should add a comment to a test case', async () => {
        // 1. Create Test Case
        const title = `Comment Test ${uniqueId()}`;
        await testCasesPage.createTestCase({ title });

        // 2. Open Detail
        await testCasesPage.clickTestCaseByTitle(title);

        // 3. Add Comment
        const commentText = `This is a test comment ${uniqueId()}`;
        await commentsComponent.addComment(commentText);

        // 4. Verify Comment
        await commentsComponent.verifyCommentVisible(commentText);
    });
});
