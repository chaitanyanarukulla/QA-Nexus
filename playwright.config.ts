import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for QA Nexus
 * 
 * Features:
 * - Multi-browser testing (Chromium, Firefox, WebKit)
 * - Screenshot and video recording on failure
 * - Enhanced HTML reporter
 * - Test retry strategy
 * - Configurable environments
 */
export default defineConfig({
    testDir: './tests',

    /* Run tests in files in parallel */
    fullyParallel: true,

    /* Fail the build on CI if you accidentally left test.only in the source code */
    forbidOnly: !!process.env.CI,

    /* Retry on CI only */
    retries: process.env.CI ? 2 : 1,

    /* Opt out of parallel tests on CI */
    workers: process.env.CI ? 1 : undefined,

    /* Reporter to use */
    reporter: process.env.CI
        ? [['html', { open: 'never' }], ['json', { outputFile: 'test-results.json' }], ['list'], ['junit', { outputFile: 'test-results/junit.xml' }]]
        : [['html', { open: 'never' }], ['json', { outputFile: 'test-results.json' }], ['list']],

    /* Shared settings for all the projects below */
    use: {
        /* Base URL to use in actions like `await page.goto('/')` */
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002',

        /* Collect trace when retrying the failed test */
        trace: 'retain-on-failure',

        /* Screenshot on failure */
        screenshot: 'only-on-failure',

        /* Video on failure */
        video: 'retain-on-failure',

        /* Maximum time each action can take */
        actionTimeout: 10000,
    },

    /* Global timeout for each test */
    timeout: 60000,

    /* Timeout for assertions */
    expect: {
        timeout: 5000,
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
            },
        },

        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                viewport: { width: 1920, height: 1080 },
            },
        },

        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                viewport: { width: 1920, height: 1080 },
            },
        },

        /* Test against mobile viewports */
        // {
        //     name: 'Mobile Chrome',
        //     use: { ...devices['Pixel 5'] },
        // },
        // {
        //     name: 'Mobile Safari',
        //     use: { ...devices['iPhone 12'] },
        // },
    ],

    /* Run your local dev server before starting the tests */
    /* Run your local dev server before starting the tests */
    /* Run your local dev server before starting the tests */
    // webServer: {
    //     command: 'npm run dev -- -p 3002',
    //     url: 'http://localhost:3002',
    //     reuseExistingServer: !process.env.CI,
    //     stdout: 'ignore',
    //     stderr: 'pipe',
    //     timeout: 120000,
    // },
});
