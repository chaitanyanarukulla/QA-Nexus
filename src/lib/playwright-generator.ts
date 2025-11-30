/**
 * Playwright Code Generator
 * Converts API request configurations into executable Playwright test code
 */

export interface ApiRequestConfig {
  method: string;
  url: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: any;
  bodyType?: string;
  authType?: string;
  authConfig?: any;
  assertions?: Assertion[];
  preRequestScript?: string;
  environmentVariables?: Record<string, string>;
}

export interface Assertion {
  type: string;
  field?: string;
  operator: string;
  expectedValue?: string;
}

/**
 * Generate authentication headers and query parameters
 */
function generateAuthHeaders(
  authType: string | undefined,
  authConfig: any,
  headers: Record<string, string>
): { headers: Record<string, string>; queryParams: Record<string, string> } {
  const authHeaders = { ...headers };
  const queryParams: Record<string, string> = {};

  if (!authType || authType === 'NONE') {
    return { headers: authHeaders, queryParams };
  }

  switch (authType) {
    case 'BEARER_TOKEN': {
      const token = authConfig?.token || '';
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }
      break;
    }
    case 'BASIC_AUTH': {
      const username = authConfig?.username || '';
      const password = authConfig?.password || '';
      if (username && password) {
        const credentials = Buffer.from(`${username}:${password}`).toString('base64');
        authHeaders['Authorization'] = `Basic ${credentials}`;
      }
      break;
    }
    case 'API_KEY': {
      const keyName = authConfig?.keyName || 'X-API-Key';
      const keyValue = authConfig?.keyValue || '';
      const location = authConfig?.location || 'header';

      if (keyValue) {
        if (location === 'header') {
          authHeaders[keyName] = keyValue;
        } else if (location === 'query') {
          queryParams[keyName] = keyValue;
        }
      }
      break;
    }
    case 'OAUTH2': {
      const token = authConfig?.accessToken || '';
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }
      break;
    }
    case 'AWS_SIGNATURE': {
      // AWS signature generation requires more complex logic
      // For now, just add a placeholder
      break;
    }
  }

  return { headers: authHeaders, queryParams };
}

/**
 * Replace variables in format {{variableName}} with actual values
 */
function replaceVariables(
  obj: any,
  variables: Record<string, string>
): any {
  if (typeof obj === 'string') {
    return obj.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => replaceVariables(item, variables));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceVariables(value, variables);
    }
    return result;
  }

  return obj;
}

/**
 * Convert assertion operator to Playwright expect matcher
 */
function operatorToExpect(operator: string): string {
  const mapping: Record<string, string> = {
    'EQUALS': 'toBe',
    'NOT_EQUALS': 'not.toBe',
    'CONTAINS': 'toContain',
    'NOT_CONTAINS': 'not.toContain',
    'GREATER_THAN': 'toBeGreaterThan',
    'LESS_THAN': 'toBeLessThan',
    'MATCHES_REGEX': 'toMatch',
    'EXISTS': 'toBeDefined',
    'NOT_EXISTS': 'toBeUndefined',
  };
  return mapping[operator] || 'toBe';
}

/**
 * Generate assertion code
 */
function generateAssertion(assertion: Assertion): string {
  const { type, field, operator, expectedValue } = assertion;

  switch (type) {
    case 'STATUS_CODE':
      return `  expect(response.status()).toBe(${expectedValue});\n`;

    case 'RESPONSE_TIME':
      return `  expect(responseTime).toBeLessThan(${expectedValue});\n`;

    case 'JSON_PATH':
      const expectMatcher = operatorToExpect(operator);
      const value = expectedValue ? JSON.stringify(expectedValue) : '';
      if (operator === 'EXISTS') {
        return `  expect(data.${field}).toBeDefined();\n`;
      } else if (operator === 'NOT_EXISTS') {
        return `  expect(data.${field}).toBeUndefined();\n`;
      }
      return `  expect(data.${field}).${expectMatcher}(${value});\n`;

    case 'HEADER_VALUE':
      const headerMatcher = operatorToExpect(operator);
      const headerValue = expectedValue ? JSON.stringify(expectedValue) : '';
      return `  expect(response.headers()['${field}']).${headerMatcher}(${headerValue});\n`;

    case 'SCHEMA_VALIDATION':
      return `  // Schema validation would require additional setup\n`;

    case 'CUSTOM':
      return `  ${assertion.expectedValue}\n`;

    default:
      return '';
  }
}

/**
 * Generate complete Playwright test code from API request configuration
 */
export function generatePlaywrightTest(config: ApiRequestConfig): string {
  const {
    method,
    url,
    headers = {},
    queryParams = {},
    body,
    bodyType,
    authType,
    authConfig,
    assertions = [],
    preRequestScript,
    environmentVariables = {}
  } = config;

  // Replace variables
  const processedUrl = replaceVariables(url, environmentVariables);
  let processedHeaders = replaceVariables(headers, environmentVariables);
  const processedBody = body ? replaceVariables(body, environmentVariables) : undefined;

  // Add authentication headers
  let processedQueryParams = { ...queryParams };
  const { headers: authHeaders, queryParams: authQueryParams } = generateAuthHeaders(authType, authConfig, processedHeaders);
  processedHeaders = authHeaders;
  processedQueryParams = { ...processedQueryParams, ...authQueryParams };

  // Build request options
  const requestOptions: string[] = [];

  if (Object.keys(processedHeaders).length > 0) {
    requestOptions.push(`    headers: ${JSON.stringify(processedHeaders, null, 6).replace(/\n/g, '\n    ')}`);
  }

  if (Object.keys(processedQueryParams).length > 0) {
    requestOptions.push(`    params: ${JSON.stringify(processedQueryParams, null, 6).replace(/\n/g, '\n    ')}`);
  }

  if (processedBody && method !== 'GET' && method !== 'HEAD') {
    if (bodyType === 'JSON') {
      requestOptions.push(`    data: ${JSON.stringify(processedBody, null, 6).replace(/\n/g, '\n    ')}`);
    } else if (bodyType === 'FORM_DATA') {
      requestOptions.push(`    multipart: ${JSON.stringify(processedBody, null, 6).replace(/\n/g, '\n    ')}`);
    } else if (bodyType === 'FORM_URLENCODED') {
      requestOptions.push(`    form: ${JSON.stringify(processedBody, null, 6).replace(/\n/g, '\n    ')}`);
    } else if (bodyType === 'RAW') {
      requestOptions.push(`    data: ${JSON.stringify(processedBody)}`);
    }
  }

  const optionsString = requestOptions.length > 0
    ? `,\n  {\n${requestOptions.join(',\n')}\n  }`
    : '';

  // Generate test code
  let testCode = `import { test, expect } from '@playwright/test';\n\n`;
  testCode += `test('${method} ${url}', async ({ request }) => {\n`;

  // Pre-request script
  if (preRequestScript) {
    testCode += `  // Pre-request script\n`;
    testCode += `  ${preRequestScript.split('\n').join('\n  ')}\n\n`;
  }

  // Timing
  testCode += `  const startTime = Date.now();\n\n`;

  // Request
  testCode += `  const response = await request.${method.toLowerCase()}(\n`;
  testCode += `  '${processedUrl}'${optionsString}\n`;
  testCode += `  );\n\n`;

  testCode += `  const responseTime = Date.now() - startTime;\n\n`;

  // Default assertions
  testCode += `  // Assertions\n`;
  testCode += `  expect(response.ok()).toBeTruthy();\n`;

  // Custom assertions
  if (assertions.length > 0) {
    // Check if we need to parse JSON
    const hasJsonAssertion = assertions.some(a => a.type === 'JSON_PATH');
    if (hasJsonAssertion) {
      testCode += `  const data = await response.json();\n`;
    }

    for (const assertion of assertions) {
      testCode += generateAssertion(assertion);
    }
  }

  // Log response for debugging
  testCode += `\n  // Log response for debugging\n`;
  testCode += `  console.log('Status:', response.status());\n`;
  testCode += `  console.log('Response Time:', responseTime + 'ms');\n`;
  testCode += `  try {\n`;
  testCode += `    const responseBody = await response.json();\n`;
  testCode += `    console.log('Response Body:', JSON.stringify(responseBody, null, 2));\n`;
  testCode += `  } catch (e) {\n`;
  testCode += `    console.log('Response Body (text):', await response.text());\n`;
  testCode += `  }\n`;

  testCode += `});\n`;

  return testCode;
}

/**
 * Generate a simple API test without full configuration
 */
export function generateSimpleApiTest(
  method: string,
  url: string,
  expectedStatus: number = 200
): string {
  return generatePlaywrightTest({
    method,
    url,
    assertions: [
      {
        type: 'STATUS_CODE',
        operator: 'EQUALS',
        expectedValue: expectedStatus.toString()
      }
    ]
  });
}
