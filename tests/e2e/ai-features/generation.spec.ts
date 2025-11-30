import { test, expect } from '@playwright/test';
import { AIFeaturesPage } from '../../page-objects/ai-features.page.js';

test.describe('AI Test Generation', () => {
    let aiPage: AIFeaturesPage;

    test.beforeEach(async ({ page }) => {
        aiPage = new AIFeaturesPage(page);
        await aiPage.navigate();
    });

    test('should generate test cases from description', async () => {
        // Mock AI response
        await aiPage.page.route('**/api/generate-tests', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    tests: [
                        { title: 'Generated Test 1', steps: 'Step 1' },
                        { title: 'Generated Test 2', steps: 'Step 1' }
                    ]
                })
            });
        });

        // 1. Generate
        await aiPage.generateTests('Test login functionality');

        // 2. Verify Results
        await expect(aiPage.generatedResults).toBeVisible();
        await expect(aiPage.page.getByText('Generated Test 1')).toBeVisible();

        // 3. Accept
        await aiPage.acceptGeneratedTests();

        // 4. Verify added to list
        await expect(aiPage.page.getByText('Generated Test 1')).toBeVisible();
    });
});
