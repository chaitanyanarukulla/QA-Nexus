import { chatCompletion } from './ai'

export interface PlaywrightTestCode {
    testCaseId: string
    testCaseTitle: string
    code: string
    imports: string[]
    setup?: string
}

/**
 * Generate Playwright test code from test case
 */
export async function generatePlaywrightTest(
    testCase: {
        id: string
        title: string
        description: string | null
        steps: any
        expectedResult: string | null
    },
    baseUrl: string = 'http://localhost:3000'
): Promise<PlaywrightTestCode> {
    // Parse steps if they're JSON
    let stepsText = ''
    try {
        const stepsArray = typeof testCase.steps === 'string'
            ? JSON.parse(testCase.steps)
            : testCase.steps

        if (Array.isArray(stepsArray)) {
            stepsText = stepsArray.map((s, i) => `${i + 1}. ${s}`).join('\n')
        } else {
            stepsText = JSON.stringify(stepsArray, null, 2)
        }
    } catch {
        stepsText = String(testCase.steps)
    }

    const prompt = `You are an expert QA automation engineer. Generate a complete Playwright test based on the following test case.

Test Case Title: ${testCase.title}
Description: ${testCase.description || 'N/A'}

Test Steps:
${stepsText}

Expected Result: ${testCase.expectedResult || 'N/A'}

Base URL: ${baseUrl}

Generate a complete, production-ready Playwright test that:
1. Uses modern Playwright best practices (async/await, page object patterns where appropriate)
2. Includes proper selectors (prefer role-based selectors, data-testid, or accessible selectors)
3. Adds appropriate assertions based on the expected result
4. Handles common edge cases and waits
5. Includes comments explaining key actions
6. Uses proper TypeScript types
7. Follows the test steps accurately

Return ONLY the test function code. Start with "test(" and include the complete implementation.
Do NOT wrap in markdown code blocks, do NOT add explanations, just the raw TypeScript code.

Example format:
test('Test Title', async ({ page }) => {
  // Navigate to page
  await page.goto('${baseUrl}')

  // Perform actions
  await page.getByRole('button', { name: /submit/i }).click()

  // Assert results
  await expect(page.getByText('Success')).toBeVisible()
})`

    try {
        const content = await chatCompletion([
            {
                role: 'system',
                content: 'You are an expert QA automation engineer who writes production-ready Playwright tests. Return only executable TypeScript code, no markdown, no explanations.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ], { temperature: 0.3, maxTokens: 2000 })

        if (!content) {
            throw new Error('No content generated')
        }

        // Clean up the response - remove markdown if present
        let cleanCode = content.trim()
        if (cleanCode.startsWith('```typescript') || cleanCode.startsWith('```ts')) {
            cleanCode = cleanCode.replace(/^```(?:typescript|ts)\n/, '').replace(/\n```$/, '')
        } else if (cleanCode.startsWith('```')) {
            cleanCode = cleanCode.replace(/^```\n?/, '').replace(/\n?```$/, '')
        }

        // Ensure it starts with 'test('
        if (!cleanCode.trim().startsWith('test(') && !cleanCode.trim().startsWith('test.')) {
            throw new Error('Generated code does not start with test function')
        }

        return {
            testCaseId: testCase.id,
            testCaseTitle: testCase.title,
            code: cleanCode,
            imports: ['test', 'expect'],
            setup: undefined
        }
    } catch (error) {
        console.error('Error generating Playwright test:', error)
        throw new Error(`Failed to generate Playwright test for "${testCase.title}". Please try again.`)
    }
}

/**
 * Generate complete Playwright test file for a test suite
 */
export async function generatePlaywrightTestSuite(
    testCases: Array<{
        id: string
        title: string
        description: string | null
        steps: any
        expectedResult: string | null
    }>,
    suiteTitle: string,
    baseUrl: string = 'http://localhost:3000'
): Promise<string> {
    const generatedTests: PlaywrightTestCode[] = []

    // Generate tests for each test case
    for (const testCase of testCases) {
        try {
            const test = await generatePlaywrightTest(testCase, baseUrl)
            generatedTests.push(test)
        } catch (error) {
            console.error(`Failed to generate test for ${testCase.title}:`, error)

            // Retry logic for transient failures (up to 3 attempts)
            let retryCount = 0;
            let success = false;

            while (retryCount < 3 && !success) {
                try {
                    console.log(`Retrying generation for "${testCase.title}" (Attempt ${retryCount + 1}/3)...`);
                    const test = await generatePlaywrightTest(testCase, baseUrl);
                    generatedTests.push(test);
                    success = true;
                } catch (retryError) {
                    console.error(`Retry ${retryCount + 1} failed:`, retryError);
                    retryCount++;
                    // Wait a bit before retrying (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
                }
            }

            if (!success) {
                // Add a placeholder comment for failed test generation with steps
                const stepsComment = Array.isArray(testCase.steps)
                    ? testCase.steps.map((s: string, i: number) => `  // ${i + 1}. ${s}`).join('\n')
                    : `  // Steps: ${JSON.stringify(testCase.steps)}`;

                generatedTests.push({
                    testCaseId: testCase.id,
                    testCaseTitle: testCase.title,
                    code: `test.skip('${testCase.title}', async ({ page }) => {
  // TODO: Test generation failed after multiple attempts. Please implement manually.
  // Test Case ID: ${testCase.id}
  // Error: ${error instanceof Error ? error.message : 'Unknown error'}

  // Original Steps:
${stepsComment}

  // Skeleton for manual implementation:
  // await page.goto('${baseUrl}');
  // await page.getByRole('...').click();
  // await expect(page.getByText('...')).toBeVisible();
})`,
                    imports: ['test', 'expect'],
                    setup: undefined
                })
            }
        }
    }

    if (generatedTests.length === 0) {
        throw new Error('Failed to generate any tests. Please try again.')
    }

    // Collect all unique imports
    const allImports = new Set<string>()
    generatedTests.forEach(test => {
        test.imports.forEach(imp => allImports.add(imp))
    })

    // Build the complete test file
    const fileName = suiteTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

    const testFile = `import { ${Array.from(allImports).join(', ')} } from '@playwright/test';

/**
 * Test Suite: ${suiteTitle}
 * Generated automatically from QA Nexus
 * Date: ${new Date().toISOString()}
 */

const BASE_URL = '${baseUrl}';

${generatedTests.map(test => {
        let testCode = `
// Test Case: ${test.testCaseTitle}
// ID: ${test.testCaseId}
${test.setup ? `\n// Setup:\n${test.setup}\n` : ''}
${test.code}
`
        return testCode
    }).join('\n')}
`

    return testFile
}

/**
 * Generate test automation report
 */
export async function suggestAutomationPriority(
    testCases: Array<{
        id: string
        title: string
        priority: string
        steps: any
    }>
): Promise<Array<{
    testCaseId: string
    automationScore: number
    rationale: string
    complexity: 'LOW' | 'MEDIUM' | 'HIGH'
}>> {
    const prompt = `You are a test automation expert. Analyze these test cases and suggest which ones should be automated first.

Test Cases:
${testCases.map((tc, i) => `${i + 1}. [${tc.priority}] ${tc.title}`).join('\n')}

For each test case, provide:
1. automationScore: 1-10 (10 = highest priority for automation)
2. rationale: Brief explanation why this score
3. complexity: LOW, MEDIUM, or HIGH (automation difficulty)

Consider:
- Test priority and business impact
- Repeatability and frequency of execution
- Stability of the feature
- Complexity of automation
- ROI of automating this test

Return ONLY valid JSON array:
[
  {
    "testCaseId": "0",
    "automationScore": 9,
    "rationale": "High-priority, repetitive test with stable UI",
    "complexity": "LOW"
  }
]`

    try {
        const content = await chatCompletion([
            {
                role: 'system',
                content: 'You are a test automation expert. Return only valid JSON.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ], { temperature: 0.4, maxTokens: 1500 })

        let cleanContent = content.trim()
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '')
        } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '')
        }

        const results = JSON.parse(cleanContent) as Array<{
            testCaseId: string
            automationScore: number
            rationale: string
            complexity: 'LOW' | 'MEDIUM' | 'HIGH'
        }>

        // Map back to actual test case IDs
        return results.map((result, index) => ({
            ...result,
            testCaseId: testCases[index]?.id || result.testCaseId
        }))
    } catch (error) {
        console.error('Error suggesting automation priority:', error)
        return []
    }
}
