import { generatePlaywrightTest, generatePlaywrightTestSuite, suggestAutomationPriority } from './ai-automation';
import { chatCompletion } from './ai';

jest.mock('./ai');

describe('AI Automation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generatePlaywrightTest', () => {
        it('should generate valid test code', async () => {
            const mockCode = `test('My Test', async ({ page }) => { await page.goto('/'); });`;
            (chatCompletion as jest.Mock).mockResolvedValue(mockCode);

            const testCase = {
                id: '1',
                title: 'My Test',
                description: 'Desc',
                steps: ['Step 1'],
                expectedResult: 'Pass'
            };

            const result = await generatePlaywrightTest(testCase);
            expect(result.code).toBe(mockCode);
            expect(result.testCaseId).toBe('1');
        });

        it('should handle markdown wrapping', async () => {
            const mockCode = `test('My Test', async ({ page }) => { await page.goto('/'); });`;
            (chatCompletion as jest.Mock).mockResolvedValue(`\`\`\`typescript\n${mockCode}\n\`\`\``);

            const testCase = {
                id: '1',
                title: 'My Test',
                description: 'Desc',
                steps: ['Step 1'],
                expectedResult: 'Pass'
            };

            const result = await generatePlaywrightTest(testCase);
            expect(result.code).toBe(mockCode);
        });

        it('should throw error if code does not start with test', async () => {
            (chatCompletion as jest.Mock).mockResolvedValue(`console.log('not a test');`);

            const testCase = {
                id: '1',
                title: 'My Test',
                description: 'Desc',
                steps: ['Step 1'],
                expectedResult: 'Pass'
            };

            await expect(generatePlaywrightTest(testCase)).rejects.toThrow('Failed to generate Playwright test');
        });
    });

    describe('generatePlaywrightTestSuite', () => {
        it('should generate full suite', async () => {
            const mockCode = `test('My Test', async ({ page }) => { await page.goto('/'); });`;
            (chatCompletion as jest.Mock).mockResolvedValue(mockCode);

            const testCases = [{
                id: '1',
                title: 'My Test',
                description: 'Desc',
                steps: ['Step 1'],
                expectedResult: 'Pass'
            }];

            const result = await generatePlaywrightTestSuite(testCases, 'My Suite');
            expect(result).toContain('import { test, expect } from \'@playwright/test\';');
            expect(result).toContain('Test Suite: My Suite');
            expect(result).toContain(mockCode);
        });

        it('should handle failures gracefully', async () => {
            (chatCompletion as jest.Mock).mockRejectedValue(new Error('AI Error'));

            const testCases = [{
                id: '1',
                title: 'My Test',
                description: 'Desc',
                steps: ['Step 1'],
                expectedResult: 'Pass'
            }];

            const result = await generatePlaywrightTestSuite(testCases, 'My Suite');
            expect(result).toContain('test.skip(\'My Test\'');
            expect(result).toContain('Failed to generate Playwright test');
        });
    });

    describe('suggestAutomationPriority', () => {
        it('should return priority suggestions', async () => {
            const mockResponse = [{
                testCaseId: '0',
                automationScore: 9,
                rationale: 'High priority',
                complexity: 'LOW'
            }];
            (chatCompletion as jest.Mock).mockResolvedValue(JSON.stringify(mockResponse));

            const testCases = [{
                id: 'tc-1',
                title: 'Login',
                priority: 'HIGH',
                steps: []
            }];

            const result = await suggestAutomationPriority(testCases);
            expect(result).toHaveLength(1);
            expect(result[0].testCaseId).toBe('tc-1');
            expect(result[0].automationScore).toBe(9);
        });
    });
});
