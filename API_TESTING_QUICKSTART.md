# API Testing - Quick Start Guide

## Overview

QA Nexus now includes Playwright-powered API testing with a visual request builder. This guide will help you get started quickly.

## 🚀 Getting Started

### 1. Start the Application

```bash
npm run dev
```

Navigate to: **http://localhost:3000/api-testing**

### 2. Create Your First Collection

1. Click **"New"** button in the left sidebar
2. Enter a collection name (e.g., "My API Tests")
3. Press Enter or click "Add"

### 3. Create Your First API Request

#### Using the Request Builder:

**Method & URL:**
- Select HTTP method from dropdown (GET, POST, PUT, etc.)
- Enter the API endpoint URL
- Example: `https://jsonplaceholder.typicode.com/posts/1`

**Add Headers (Optional):**
- Click the "Headers" tab
- Add key-value pairs (e.g., `Content-Type`: `application/json`)
- Click "+ Add Header" for additional headers

**Add Query Parameters (Optional):**
- Click the "Query Params" tab
- Add key-value pairs (e.g., `userId`: `1`)

**Add Request Body (For POST/PUT/PATCH):**
- Click the "Body" tab
- Select body type (JSON, Form Data, etc.)
- Enter request body in the textarea

### 4. Execute the Request

1. Click the **"Send"** button
2. View the response in the Response section:
   - **Status Code**: See if request was successful
   - **Response Time**: View execution time in milliseconds
   - **Body Tab**: Inspect the response body
   - **Headers Tab**: View response headers
   - **Generated Code Tab**: See the Playwright test code

### 5. Save Your Request

- Click the **"Save"** button
- Your request is now saved in the collection
- Click on it in the sidebar to load it again

## 📝 Example Requests

### Example 1: GET Request

```
Method: GET
URL: https://jsonplaceholder.typicode.com/users/1
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "Leanne Graham",
  "username": "Bret",
  "email": "Sincere@april.biz",
  ...
}
```

### Example 2: POST Request

```
Method: POST
URL: https://jsonplaceholder.typicode.com/posts
Body Type: JSON
Body:
{
  "title": "Test Post",
  "body": "This is a test post",
  "userId": 1
}
```

### Example 3: Using Variables

**Setup Environment Variables:**
1. Create an environment (future feature)
2. Define variables like `{{BASE_URL}}`, `{{API_KEY}}`

**Use in Request:**
```
URL: {{BASE_URL}}/users
Headers:
  Authorization: Bearer {{API_KEY}}
```

## 🎯 Key Features

### Visual Request Builder
- All HTTP methods supported (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- Tabbed interface for Headers, Query Params, Body, Auth
- Multiple body types: JSON, Form Data, URL Encoded, Raw

### Real-time Execution
- Powered by Playwright's APIRequestContext
- Execution time tracking
- Status code verification
- Full response inspection

### Code Generation
- Automatically generates Playwright test code
- Copy to clipboard functionality
- Ready to integrate into test suites

### Execution History
- All test runs are saved
- View historical results
- Track performance over time
- Re-run failed tests

### Collections Management
- Organize requests into folders
- Quick execution from sidebar
- Request count badges
- Delete and rename operations

## 🧪 Testing Real APIs

### Test Public APIs

**JSONPlaceholder** (Fake REST API for testing):
```
Base URL: https://jsonplaceholder.typicode.com
Endpoints:
  - GET /posts - List all posts
  - GET /posts/1 - Get post by ID
  - POST /posts - Create new post
  - PUT /posts/1 - Update post
  - DELETE /posts/1 - Delete post
```

**ReqRes** (Fake REST API):
```
Base URL: https://reqres.in/api
Endpoints:
  - GET /users - List users
  - GET /users/2 - Get user by ID
  - POST /users - Create user
```

**Example Request to ReqRes:**
```
Method: GET
URL: https://reqres.in/api/users?page=2
```

## 🔧 Generated Playwright Code

When you execute a request, QA Nexus generates production-ready Playwright test code:

```typescript
import { test, expect } from '@playwright/test';

test('GET https://jsonplaceholder.typicode.com/posts/1', async ({ request }) => {
  const startTime = Date.now();

  const response = await request.get(
  'https://jsonplaceholder.typicode.com/posts/1'
  );

  const responseTime = Date.now() - startTime;

  // Assertions
  expect(response.ok()).toBeTruthy();

  // Log response for debugging
  console.log('Status:', response.status());
  console.log('Response Time:', responseTime + 'ms');
  try {
    const responseBody = await response.json();
    console.log('Response Body:', JSON.stringify(responseBody, null, 2));
  } catch (e) {
    console.log('Response Body (text):', await response.text());
  }
});
```

**Copy this code and run it with:**
```bash
npx playwright test path/to/your/test.spec.ts
```

## 📊 View Execution Results

Each execution stores:
- **Status**: PASSED, FAILED, ERROR
- **Status Code**: HTTP response code (200, 404, 500, etc.)
- **Response Time**: Execution duration in milliseconds
- **Response Body**: Full response content
- **Response Headers**: All response headers
- **Error Details**: Stack trace if execution fails
- **User**: Who executed the test
- **Timestamp**: When it was executed

## 🌍 Environment Management (Coming Soon)

Future releases will include:
- Multiple environments (Dev, Staging, Production)
- Variable substitution with `{{variableName}}`
- Secure storage for API keys
- Per-collection environment selection

## 🔐 Authentication (Coming Soon)

Future releases will support:
- Bearer Token
- Basic Auth
- API Key
- OAuth2
- AWS Signature

## 🚦 Best Practices

1. **Organize by Feature**: Create collections for each API feature or microservice
2. **Use Descriptive Names**: Name requests clearly (e.g., "Create User - Valid Data")
3. **Save Before Executing**: Save complex requests before running them
4. **Check Generated Code**: Review the Playwright code for quality
5. **Monitor Response Times**: Watch for performance degradation
6. **Document Headers**: Add comments explaining custom headers

## 🐛 Troubleshooting

### Request Fails with CORS Error
- CORS errors occur in browsers, not in Playwright
- Your API request should work fine in QA Nexus
- If testing locally, ensure your API allows requests from localhost

### "Request not found" Error
- Make sure you saved the request before executing
- Refresh the page if the sidebar doesn't show your requests

### Generated Code Has Syntax Errors
- Check that your JSON body is valid
- Ensure headers don't have special characters
- Verify the URL is properly formatted

### Response Body is Empty
- Some APIs return empty responses (e.g., 204 No Content)
- Check the Status Code - this might be expected behavior
- Try a different endpoint to verify connectivity

## 📚 Next Steps

1. **Explore Phase 2-6**: Check [PLAYWRIGHT_API_TESTING_PLAN.md](PLAYWRIGHT_API_TESTING_PLAN.md) for upcoming features
2. **Integrate with Test Cases**: Link API requests to test cases for full traceability
3. **Run Collections**: Execute all requests in a collection at once
4. **Monitor Performance**: Track API response times over time
5. **AI Generation**: Future: Generate tests from OpenAPI specs

## 🆘 Need Help?

- **Documentation**: See [PLAYWRIGHT_API_TESTING_PLAN.md](PLAYWRIGHT_API_TESTING_PLAN.md)
- **Changelog**: See [CHANGELOG.md](CHANGELOG.md) for recent updates
- **Issues**: Report bugs on GitHub

---

**Happy API Testing! 🚀**
