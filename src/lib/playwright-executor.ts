/**
 * Playwright Test Executor
 * Executes generated Playwright tests and parses results
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface ExecutionResult {
  status: 'PASSED' | 'FAILED' | 'ERROR';
  statusCode?: number;
  responseTime: number;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  errorMessage?: string;
  stackTrace?: string;
  assertionsPassed: number;
  assertionsFailed: number;
  artifacts?: string[];
  logs?: string;
}

/**
 * Execute a Playwright test and return results
 */
export async function executePlaywrightTest(
  testCode: string,
  testId: string
): Promise<ExecutionResult> {
  try {
    // 1. Create test directory if it doesn't exist
    const testDir = path.join(process.cwd(), 'tests', 'api-generated');
    await fs.mkdir(testDir, { recursive: true });

    // 2. Write test file
    const testFile = path.join(testDir, `request-${testId}.spec.ts`);
    await fs.writeFile(testFile, testCode, 'utf-8');

    // 3. Execute Playwright test
    const resultsFile = path.join(process.cwd(), 'test-results.json');

    // Delete old results file if exists
    try {
      await fs.unlink(resultsFile);
    } catch (e) {
      // File doesn't exist, that's fine
    }

    const command = `npx playwright test ${testFile} --reporter=json --output=test-results.json`;

    let stdout = '';
    let stderr = '';
    let exitCode = 0;

    try {
      const result = await execAsync(command, {
        timeout: 60000, // 60 second timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (error: any) {
      stdout = error.stdout || '';
      stderr = error.stderr || '';
      exitCode = error.code || 1;
    }

    // 4. Parse JSON results
    let results: any;
    try {
      const resultsContent = await fs.readFile(resultsFile, 'utf-8');
      results = JSON.parse(resultsContent);
    } catch (e) {
      // If we can't parse results, return error
      return {
        status: 'ERROR',
        responseTime: 0,
        assertionsPassed: 0,
        assertionsFailed: 0,
        errorMessage: 'Failed to parse test results',
        stackTrace: stderr,
        logs: stdout
      };
    }

    // 5. Extract execution details
    const suite = results.suites?.[0];
    const spec = suite?.specs?.[0];
    const testResult = spec?.tests?.[0];
    const testRun = testResult?.results?.[0];

    if (!testRun) {
      return {
        status: 'ERROR',
        responseTime: 0,
        assertionsPassed: 0,
        assertionsFailed: 0,
        errorMessage: 'No test results found',
        logs: stdout
      };
    }

    // Parse console output for response details
    const logs = testRun.stdout || [];
    let statusCode: number | undefined;
    let responseTime = testRun.duration || 0;
    let responseBody: string | undefined;

    // Extract from logs
    const logsText = logs.map((l: any) => l.text || '').join('\n');

    const statusMatch = logsText.match(/Status:\s*(\d+)/);
    if (statusMatch) {
      statusCode = parseInt(statusMatch[1]);
    }

    const timeMatch = logsText.match(/Response Time:\s*(\d+)ms/);
    if (timeMatch) {
      responseTime = parseInt(timeMatch[1]);
    }

    const bodyMatch = logsText.match(/Response Body:\s*(.+)/);
    if (bodyMatch) {
      responseBody = bodyMatch[1].trim();
    }

    // Determine status
    const status = testRun.status === 'passed' ? 'PASSED' :
                   testRun.status === 'failed' ? 'FAILED' : 'ERROR';

    // Count assertions (approximation based on errors)
    const errors = testRun.errors || [];
    const assertionsFailed = errors.length;
    const assertionsPassed = status === 'PASSED' ? 1 : 0; // At least one if passed

    const result: ExecutionResult = {
      status,
      statusCode,
      responseTime,
      responseBody,
      assertionsPassed,
      assertionsFailed,
      logs: logsText
    };

    // Extract error if failed
    if (status === 'FAILED' && errors.length > 0) {
      result.errorMessage = errors[0].message;
      result.stackTrace = errors[0].stack;
    }

    // Collect artifacts (screenshots, traces, videos)
    const artifacts = testRun.attachments || [];
    if (artifacts.length > 0) {
      result.artifacts = artifacts
        .filter((a: any) => a.path)
        .map((a: any) => a.path);
    }

    // 6. Cleanup test file
    try {
      await fs.unlink(testFile);
    } catch (e) {
      // Cleanup failed, but that's okay
    }

    return result;

  } catch (error: any) {
    return {
      status: 'ERROR',
      responseTime: 0,
      assertionsPassed: 0,
      assertionsFailed: 0,
      errorMessage: error.message || 'Unknown error occurred',
      stackTrace: error.stack
    };
  }
}

/**
 * Execute multiple tests in parallel
 */
export async function executeMultipleTests(
  tests: Array<{ code: string; id: string }>
): Promise<ExecutionResult[]> {
  const results = await Promise.all(
    tests.map(({ code, id }) => executePlaywrightTest(code, id))
  );
  return results;
}

/**
 * Execute a collection of tests sequentially (preserving order)
 */
export async function executeTestsSequentially(
  tests: Array<{ code: string; id: string }>
): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = [];

  for (const { code, id } of tests) {
    const result = await executePlaywrightTest(code, id);
    results.push(result);
  }

  return results;
}
