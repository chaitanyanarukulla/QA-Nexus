import { test, expect } from '@playwright/test';
import { DefectsPage } from '../../page-objects/defects.page.js';
import { generateDefect, uniqueId } from '../../utils/test-data.factory.js';

test.describe('Defect Lifecycle', () => {
    let defectsPage: DefectsPage;

    test.beforeEach(async ({ page }) => {
        defectsPage = new DefectsPage(page);
        await defectsPage.navigate();
    });

    test('should create and update a defect', async () => {
        const defectData = generateDefect({
            title: `E2E Defect ${uniqueId()}`,
            priority: 'HIGH'
        });

        // 1. Create Defect
        await defectsPage.createDefect({
            title: defectData.title,
            description: 'Found during E2E testing',
            priority: 'HIGH'
        });

        // 2. Verify in List
        await expect(defectsPage.page.getByText(defectData.title)).toBeVisible();

        // 3. Update Status
        await defectsPage.updateStatus(defectData.title, 'IN_PROGRESS');

        // 4. Verify Status Update
        // Assuming status is visible in the row or detail view
        await expect(defectsPage.page.getByText('IN_PROGRESS')).toBeVisible();
    });
});
