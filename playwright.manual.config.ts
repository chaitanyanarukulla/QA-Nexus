import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Manual Testing
 * Used when the dev server is already running
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 1,

    reporter: [['html', { open: 'never' }], ['list']],

    use: {
        baseURL: 'http://localhost:3000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 10000,
    },

    timeout: 60000,

    expect: {
        timeout: 5000,
    },

    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
            },
        },
    ],

    // NO webServer - assumes server is already running
});
