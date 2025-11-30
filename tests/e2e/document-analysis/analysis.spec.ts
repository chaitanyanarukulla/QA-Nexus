import { test, expect } from '@playwright/test';
import { DocumentAnalysisPage } from '../../page-objects/document-analysis.page.js';

test.describe('Document Analysis', () => {
    let analysisPage: DocumentAnalysisPage;

    test.beforeEach(async ({ page }) => {
        analysisPage = new DocumentAnalysisPage(page);
        await analysisPage.navigate();
    });

    test('should analyze a document and generate test suite', async () => {
        // Mock the API response for analysis to avoid external calls/costs
        await analysisPage.page.route('**/api/analyze', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    risks: ['Risk 1', 'Risk 2'],
                    gaps: ['Gap 1'],
                    requirements: ['Req 1']
                })
            });
        });

        // 1. Start Analysis
        await analysisPage.analyzeDocument('JIRA_EPIC', 'PROJ-123');

        // 2. Verify Results
        await expect(analysisPage.risksSection).toBeVisible();
        await expect(analysisPage.gapsSection).toBeVisible();

        // 3. Generate Suite
        await analysisPage.generateSuite();

        // 4. Verify Navigation to Suite
        await expect(analysisPage.page).toHaveURL(/test-suites/);
    });
});
