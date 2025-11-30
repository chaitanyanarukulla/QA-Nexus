# Playwright Testing Guide for QA Nexus

## 📚 Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Page Object Model](#page-object-model)
- [Test Utilities](#test-utilities)
- [Visual Regression Testing](#visual-regression-testing)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

QA Nexus uses Playwright for end-to-end testing, providing comprehensive test coverage across all features. Our testing infrastructure includes:

- **Page Object Model (POM)** for maintainable tests
- **Cross-browser testing** (Chromium, Firefox, WebKit)
- **Visual regression testing** with screenshot comparison
- **Utility helpers** for auth, database, and test data
- **CI/CD integration** with GitHub Actions

### Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── dashboard.spec.ts
│   ├── test-cases/
│   │   ├── create-test-case.spec.ts
│   │   └── crud-operations.spec.ts
│   ├── test-suites/
│   │   ├── suite-management.spec.ts
│   │   └── crud-operations.spec.ts
│   ├── test-runs/
│   │   └── execution-workflow.spec.ts
│   ├── defects/
│   │   └── defect-lifecycle.spec.ts
│   ├── document-analysis/
│   │   └── analysis.spec.ts
│   ├── ai-features/
│   │   └── generation.spec.ts
│   └── collaboration/
│       └── comments.spec.ts
├── visual/                 # Visual regression tests
│   └── pages.visual.spec.ts
├── page-objects/           # Page Object Model
│   ├── base.page.ts
│   ├── dashboard.page.ts
│   ├── test-cases.page.ts
│   ├── test-suites.page.ts
│   ├── test-runs.page.ts
│   ├── test-execution.page.ts
│   ├── defects.page.ts
│   ├── document-analysis.page.ts
│   ├── ai-features.page.ts
│   └── components/
│       └── comments.component.ts
└── utils/                  # Test utilities
    ├── auth.helpers.ts
    ├── db.helpers.ts
    └── test-data.factory.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm install`)
- Database set up (`npx prisma migrate dev`)

### Installation

Playwright is already installed as a dev dependency. To set up browsers:

```bash
# Install all browsers
npx playwright install

# Install specific browser
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Install system dependencies (Linux only)
npx playwright install-deps
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/dashboard.spec.ts

# Run tests matching a pattern
npx playwright test test-cases

# Run tests in debug mode
npx playwright test --debug
```

### Browser-Specific Tests

```bash
# Run in Chromium only
npx playwright test --project=chromium

# Run in Firefox only
npx playwright test --project=firefox

# Run in WebKit (Safari) only
npx playwright test --project=webkit

# Run in all browsers
npx playwright test --project=chromium --project=firefox --project=webkit
```

### Test Reports

```bash
# View HTML report
npx playwright show-report

# Generate and open report
npx playwright test; npx playwright show-report
```

### Advanced Options

```bash
# Run tests with retries
npx playwright test --retries=2

# Run tests in parallel workers
npx playwright test --workers=4

# Run only failed tests
npx playwright test --last-failed

# Update visual snapshots
npx playwright test --update-snapshots
```

---

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../page-objects/dashboard.page';

test.describe('Feature Name', () => {
    let page: DashboardPage;

    test.beforeEach(async ({ page: playwrightPage }) => {
        page = new DashboardPage(playwrightPage);
        await page.navigate();
    });

    test('should do something', async () => {
        // Arrange
        const testData = { title: 'Test' };

        // Act
        await page.performAction(testData);

        // Assert
        await expect(page.element).toBeVisible();
    });
});
```

### Using Test Data Factory

```typescript
import {  generateTestCase, uniqueId } from '../utils/test-data.factory';

test('create test case', async () => {
    const testData = generateTestCase({
        title: `E2E Test ${uniqueId()}`,
        priority: 'HIGH',
    });

    await testCasesPage.createTestCase(testData);
});
```

### Using Database Helpers

```typescript
import { createTestUser, createTestCase, cleanupTestData } from '../utils/db.helpers';

test.beforeAll(async () => {
    const user = await createTestUser({ role: 'TESTER' });
    await createTestCase({ title: 'Seed Test Case' });
});

test.afterAll(async () => {
    await cleanupTestData();
});
```

---

## Page Object Model

### Base Page

All page objects extend `BasePage` which provides common functionality:

```typescript
import { BasePage } from './base.page';

export class MyPage extends BasePage {
    // Locators
    readonly myButton: Locator;

    constructor(page: Page) {
        super(page);
        this.myButton = page.getByRole('button', { name: 'Click Me' });
    }

    async clickButton(): Promise<void> {
        await this.myButton.click();
    await this.waitForSuccessToast();
    }
}
```

### Common Methods

- `goto(path)` - Navigate to a path
- `waitForElement(locator)` - Wait for element to be visible
- `fillField(locator, value)` - Fill form field
- `waitForSuccessToast()` - Wait for success notification
- `waitForErrorToast()` - Wait for error notification
- `selectOption(locator, value)` - Select from dropdown
- `navigateViaHeader(linkName)` - Navigate using header

### Creating a New Page Object

1. Create file in `tests/page-objects/`
2. Extend `BasePage`
3. Define locators in constructor
4. Add action methods
5. Add assertion helpers

Example:

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class NewPage extends BasePage {
    readonly heading: Locator;
    readonly createButton: Locator;

    constructor(page: Page) {
        super(page);
        this.heading = page.getByRole('heading');
        this.createButton = page.getByRole('button', { name: 'Create' });
    }

    async navigate(): Promise<void> {
        await this.goto('/new-page');
        await this.waitForPageLoad();
    }

    async createItem(data: { title: string }): Promise<void> {
        await this.createButton.click();
        // ... fill form
        await this.waitForSuccessToast();
    }
}
```

---

## Test Utilities

### Authentication Helpers

```typescript
import { loginAsUser, getTestUser } from '../utils/auth.helpers';

// Get test user
const user = await getTestUser('TESTER');

// Login as specific role
await loginAsUser(page, 'ADMIN');
```

### Database Helpers

```typescript
import {
    createTestCase,
    createTestSuite,
    createDefect,
    getEntityCounts,
    cleanupTestData,
} from '../utils/db.helpers';

// Create test data
const testCase = await createTestCase({ title: 'Test' });
const suite = await createTestSuite({ title: 'Suite' });

// Get counts
const counts = await getEntityCounts();

// Cleanup
await cleanupTestData();
```

### Test Data Factory

```typescript
import {
    generateTestCase,
    generateTestSuite,
    generateDefect,
    uniqueId,
    randomPriority,
} from '../utils/test-data.factory';

const testCase = generateTestCase({ priority: 'HIGH' });
const suite = generateTestSuite();
const priority = randomPriority();
const id = uniqueId();
```

---

## Visual Regression Testing

### Taking Snapshots

```typescript
test('visual test', async ({ page }) => {
    await page.goto('/');
    
    // Full page screenshot
    await expect(page).toHaveScreenshot('page-name.png', {
        fullPage: true,
        animations: 'disabled',
    });
    
    // Element screenshot
    const element = page.locator('.my-component');
    await expect(element).toHaveScreenshot('component.png');
});
```

### Updating Baselines

When UI changes are intentional:

```bash
# Update all snapshots
npx playwright test --update-snapshots

# Update specific test snapshots
npx playwright test visual/ --update-snapshots
```

### Snapshot Location

Snapshots are stored in:
- `tests/visual/pages.visual.spec.ts-snapshots/`

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests
- Manual workflow dispatch

### Matrix Testing

Tests run on:
- Node 18.x and 20.x
- Chromium, Firefox, and WebKit
- Total: 6 combinations

### Viewing Results

- Test reports uploaded as artifacts
- Screenshots/videos uploaded on failure
- PR comments with test results

### Running Locally Like CI

```bash
CI=true npx playwright test --project=chromium --retries=2
```

---

## Best Practices

### 1. Use Page Object Model

✅ **Good:**
```typescript
await dashboardPage.goToTestCases();
```

❌ **Bad:**
```typescript
await page.getByRole('link', { name: 'Test Cases' }).click();
```

### 2. Use Meaningful Test Names

✅ **Good:**
```typescript
test('should create test case with high priority', async () => {});
```

❌ **Bad:**
```typescript
test('test1', async () => {});
```

### 3. Use Test Data Factory

✅ **Good:**
```typescript
const data = generateTestCase({ priority: 'HIGH' });
```

❌ **Bad:**
```typescript
const data = { title: 'Test', priority: 'HIGH', ... };
```

### 4. Clean Up After Tests

```typescript
test.afterEach(async () => {
    // Clean up test data if needed
});
```

### 5. Use Proper Selectors

Priority order:
1. `getByRole()` - Most resilient
2. `getByLabel()` - For form inputs
3. `getByPlaceholder()` - For inputs
4. `getByText()` - For text content
5. CSS/XPath - Last resort

### 6. Wait Properly

✅ **Good:**
```typescript
await waitForSuccessToast();
await expect(element).toBeVisible();
```

❌ **Bad:**
```typescript
await page.waitForTimeout(3000);
```

---

## Troubleshooting

### Common Issues

#### Tests Timing Out

```typescript
// Increase timeout for specific test
test('slow test', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes
});
```

#### Element Not Found

```typescript
// Wait for element before interacting
await element.waitFor({ state: 'visible' });
await element.click();
```

#### Flaky Tests

```typescript
// Use auto-waiting and stable selectors
await expect(element).toBeVisible();
await element.click();
```

#### Visual Regression Failures

```bash
# Check diff in HTML report
npx playwright show-report

# Update if changes are intentional
npx playwright test --update-snapshots
```

### Debug Mode

```bash
# Run with debugger
npx playwright test --debug

# Run specific test with debugger
npx playwright test tests/e2e/dashboard.spec.ts --debug
```

### Trace Viewer

```bash
# If test failed, view trace
npx playwright show-trace test-results/[test-name]/trace.zip
```

---

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [Test Reporters](https://playwright.dev/docs/test-reporters)

---

## Need Help?

- Check the [Playwright Discord](https://aka.ms/playwright-discord)
- Review existing tests for examples
- Run tests with `--debug` flag
- Check the HTML report for detailed errors

Happy Testing! 🎭
