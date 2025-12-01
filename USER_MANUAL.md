# QA Nexus User Manual

**Version 3.0.0**

Welcome to QA Nexus, your comprehensive AI-powered QA platform. This manual will guide you through all major features with step-by-step instructions.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Document Analysis](#3-document-analysis)
4. [Test Cases](#4-test-cases)
5. [Test Suites](#5-test-suites)
6. [Test Execution](#6-test-execution)
7. [API Testing](#7-api-testing)
8. [Defect Management](#8-defect-management)
9. [Analytics](#9-analytics)
10. [AI Insights](#10-ai-insights)
11. [Collaboration](#11-collaboration)
12. [Settings](#12-settings)

---

## 1. Getting Started

### First Time Setup

After installation, you'll need to configure your AI provider and optionally set up Jira integration.

#### Configure AI Provider

1. Navigate to [Settings](http://localhost:3000/settings) in the navigation bar
2. Choose your AI provider:
   - **OpenAI** (recommended): Requires API key from https://platform.openai.com/api-keys
   - **Foundry**: Requires local installation
3. Enter your API key or endpoint URL
4. Click **Save Settings**
5. Test the connection by creating a test case with AI

#### Configure Jira Integration (Optional)

1. Go to [Settings](http://localhost:3000/settings)
2. Scroll to **Jira Integration**
3. Enter your credentials:
   - **Jira Base URL**: Your Atlassian domain (e.g., `https://company.atlassian.net`)
   - **Email**: Your Atlassian account email
   - **API Token**: Generate at https://id.atlassian.com/manage-profile/security/api-tokens
4. Click **Save Settings**
5. Test by importing a Jira Epic

---

## 2. Dashboard Overview

The dashboard provides a high-level overview of your QA metrics.

### Key Metrics Displayed

- **Total Test Cases**: All test cases in the system
- **Test Suites**: Number of test suites
- **Active Defects**: Open and in-progress defects
- **Pass Rate**: Overall test execution success rate

### Quick Actions

From the dashboard, you can:
- Create new test cases
- Start test executions
- View recent activity
- Access analytics

---

## 3. Document Analysis

Analyze Jira Epics or Confluence Pages to automatically identify risks, gaps, and generate test cases.

### Analyzing a Document

1. Navigate to **Analytics** → **Document Analysis**
2. Click **Analyze New Document**
3. Select document type:
   - **Jira Epic**: Enter Epic key (e.g., `PROJ-123`)
   - **Confluence Page**: Enter page URL
4. Click **Analyze**
5. Wait for AI analysis (typically 10-30 seconds)

### Understanding Analysis Results

The analysis provides:

#### Risks
- **Severity**: Critical, High, Medium, Low
- **Description**: What could go wrong
- **Example**: "Authentication bypass vulnerability - CRITICAL"

#### Gaps
- Missing requirements or edge cases
- **Example**: "No validation for password complexity"

#### Missed Requirements
- Requirements not explicitly documented
- **Example**: "Session timeout handling not specified"

#### AI Recommendations
- Actionable suggestions for improvement
- **Example**: "Add test cases for concurrent user sessions"

### Viewing Coverage Matrix

1. Open any document analysis
2. Scroll to **Coverage Matrix**
3. View which test cases cover which risks/gaps/requirements
4. Items in red = no coverage (need test cases)
5. Items in green = covered by test cases

### Generating Test Suite from Analysis

1. Open the document analysis
2. Click **Generate Test Suite**
3. AI creates comprehensive test cases with:
   - Proper coverage tags (which risks/gaps/requirements each test addresses)
   - Suggested priority based on risk severity
   - Complete test steps and expected results
4. Review and edit generated test cases
5. Click **Save Test Suite**

**Use Case**: You have a Jira Epic for "User Authentication". Analyze it to get AI-generated test cases covering login, logout, password reset, session management, and security edge cases.

---

## 4. Test Cases

Create, manage, and organize individual test cases.

### Creating a Test Case Manually

1. Navigate to **Test Cases**
2. Click **Create Test Case**
3. Fill in details:
   - **Title**: Descriptive name (e.g., "Verify login with valid credentials")
   - **Description**: Optional context
   - **Priority**: Low, Medium, High, Critical
   - **Steps**: Click **Add Step** for each test step
   - **Expected Result**: What should happen
4. Click **Save**

### Creating a Test Case with AI

1. Navigate to **Test Cases**
2. Click **Create Test Case**
3. Click **Generate with AI**
4. Describe what you want to test (e.g., "Test user login flow")
5. AI generates:
   - Title
   - Steps
   - Expected results
   - Suggested priority
6. Review and edit as needed
7. Click **Save**

### Adding Test Cases to a Suite

1. Open the test case
2. Under **Suite**, select a test suite
3. Click **Save**

### Marking Test Cases as Automated

1. Open the test case
2. Toggle **Automated** switch
3. Optionally add **Automation ID** (e.g., Playwright test file name)
4. Click **Save**

**Pro Tip**: Use coverage tags (`coversRisks`, `coversGaps`, `coversRequirements`) to maintain traceability to requirements.

---

## 5. Test Suites

Group related test cases into logical collections for organized execution.

### Creating a Test Suite

1. Navigate to **Test Suites**
2. Click **Create Test Suite**
3. Enter:
   - **Title**: Suite name (e.g., "User Authentication Tests")
   - **Description**: Optional context
   - **Jira Epic Key**: Optional link to Epic
4. Click **Save**

### Adding Test Cases to a Suite

**Method 1: From Test Case**
1. Open a test case
2. Select the suite in the **Suite** dropdown
3. Save

**Method 2: From Suite Detail**
1. Open the test suite
2. Click **Add Test Cases**
3. Select test cases to add
4. Save

### Viewing Suite Metrics

On the suite detail page, you'll see:
- **Total Test Cases**: Number of tests in suite
- **Automation Coverage**: Percentage of automated tests
- **Last Run Date**: Most recent execution
- **Pass Rate**: Success rate from latest run

### Epic Metrics (Jira Integration)

If linked to a Jira Epic, view:
- Epic status and progress
- Epic-level quality metrics
- Requirements coverage

---

## 6. Test Execution

Execute test suites manually and record results.

### Starting a Test Run

1. Navigate to **Test Suites**
2. Open the suite you want to execute
3. Click **Start Execution**
4. A new test run is created with all test cases

### Executing Tests

1. Navigate to **Test Runs**
2. Open the in-progress test run
3. For each test case:
   - Review the test steps
   - Execute the test manually
   - Select result:
     - **Pass**: Test passed
     - **Fail**: Test failed
     - **Blocked**: Cannot execute (e.g., environment down)
     - **Skipped**: Intentionally skipped
   - Add **Notes**: Optional execution notes
   - Add **Evidence**: Screenshots, logs, etc.
4. Click **Save Result**
5. Proceed to next test case

### Creating Defects from Failures

1. When marking a test as **Fail**
2. Click **Create Defect**
3. Fill in defect details:
   - **Title**: Brief description
   - **Description**: Full details with reproduction steps
   - **Priority**: Low, Medium, High, Critical
   - **Severity**: Minor, Major, Critical, Blocker
4. Optionally create Jira issue
5. Save

### Viewing Test Run Results

1. Navigate to **Test Runs**
2. Open a completed test run
3. View:
   - **Pass Rate**: Percentage passed
   - **Total Duration**: Time taken
   - **Results Breakdown**: Count by status
   - **Individual Results**: Detailed results for each test

### Generating Test Automation

After achieving 100% pass rate on manual execution:

1. Open the test suite
2. Scroll to **Automated Test Generation**
3. Click **Check Readiness**
4. If ready (100% pass rate):
   - Enter **Base URL** (e.g., `http://localhost:3000`)
   - Click **Generate Automated Tests**
5. AI generates Playwright test code
6. Click **Download Test File**
7. Copy to your `tests/` directory
8. Run with `npx playwright test`

**Example Generated Code**:
```typescript
import { test, expect } from '@playwright/test'

test('Verify login with valid credentials', async ({ page }) => {
  await page.goto('http://localhost:3000/login')
  await page.getByRole('textbox', { name: /email/i }).fill('user@example.com')
  await page.getByRole('textbox', { name: /password/i }).fill('password123')
  await page.getByRole('button', { name: /login/i }).click()
  await expect(page).toHaveURL(/.*dashboard/)
})
```

---

## 7. API Testing

Create and execute API tests through a visual interface, powered by Playwright.

### Creating an API Collection

1. Navigate to **API Testing**
2. Click **Create Collection**
3. Enter:
   - **Name**: Collection name (e.g., "User API")
   - **Description**: Optional
4. Click **Save**

### Creating an API Request

1. Open an API collection
2. Click **New Request**
3. Configure request:
   - **Name**: Request name
   - **Method**: GET, POST, PUT, PATCH, DELETE, etc.
   - **URL**: Full endpoint URL or use variables like `{{baseUrl}}/api/users`
   - **Headers**: Add headers (e.g., `Content-Type: application/json`)
   - **Query Parameters**: Add URL params
   - **Body**:
     - **JSON**: Enter JSON payload
     - **Form Data**: Key-value pairs
     - **URL Encoded**: Form data
4. Click **Save**

### Importing OpenAPI/Swagger Specifications

Quickly import entire API collections from OpenAPI 3.x or Swagger 2.x specifications.

**Method 1: Import from URL**

1. Navigate to **API Testing**
2. Click **Import OpenAPI/Swagger**
3. Select **URL** tab
4. Enter the specification URL:
   - Example: `https://petstore3.swagger.io/api/v3/openapi.json`
5. Click **Validate** to verify the specification
6. (Optional) Enable **Create separate collections by tag**
   - Groups endpoints into multiple collections based on OpenAPI tags
   - Example: "Users", "Orders", "Products"
7. Click **Import Specification**
8. Wait for import to complete
9. View imported requests in your collections

**Method 2: Import from JSON Content**

1. Navigate to **API Testing**
2. Click **Import OpenAPI/Swagger**
3. Select **JSON Content** tab
4. Paste your OpenAPI/Swagger JSON specification
5. Click **Validate** to check format
6. (Optional) Enable **Create separate collections by tag**
7. Click **Import Specification**

**What Gets Imported**:
- ✅ All API endpoints with their HTTP methods (GET, POST, PUT, DELETE, etc.)
- ✅ Request parameters (query, path, header parameters)
- ✅ Request bodies with example data generated from schemas
- ✅ Authentication schemes (Bearer Token, Basic Auth, API Key, OAuth2)
- ✅ Response schemas for validation
- ✅ Organized by tags/folders for easy navigation

**Example: Importing Swagger Petstore**

1. Click **Import OpenAPI/Swagger**
2. Select **URL** tab
3. Click the sample URL: `https://petstore3.swagger.io/api/v3/openapi.json`
4. Click **Validate** - shows "Valid OpenAPI specification!"
5. Enable **Create separate collections by tag** to organize by "pet", "store", "user"
6. Click **Import Specification**
7. Success message shows: "Created 20 API requests in 3 collection(s)"
8. Three new collections appear:
   - **pet** - Contains /pet endpoints (addPet, updatePet, findByStatus, etc.)
   - **store** - Contains /store endpoints (placeOrder, getInventory, etc.)
   - **user** - Contains /user endpoints (createUser, loginUser, etc.)
9. Each request is pre-configured with:
   - Correct HTTP method
   - Full URL with path parameters
   - Example request bodies (JSON)
   - Required headers
   - Authentication (if specified in OpenAPI)

**Validation Errors**

If validation fails, you'll see specific error messages:
- **"Not a valid OpenAPI/Swagger specification"** - Missing required fields
- **"No paths defined"** - Specification has no API endpoints
- **"Invalid JSON format"** - Syntax error in JSON
- **"Invalid URL format"** - URL is malformed

**Tips**:
- Use **Validate** before importing to catch errors early
- Enable **Create separate collections by tag** for large APIs with many endpoints
- Review imported requests and adjust example values as needed
- Variables like `{userId}` in paths are replaced with example values

### Setting Up Environments

1. Navigate to **API Testing** → **Environments**
2. Click **Create Environment**
3. Enter:
   - **Name**: Environment name (e.g., "Dev", "Staging")
4. Add variables:
   - **Key**: Variable name (e.g., `baseUrl`)
   - **Value**: Variable value (e.g., `http://localhost:3000`)
5. Click **Save**

**Using Variables**: In your requests, use `{{variableName}}` syntax
- Example URL: `{{baseUrl}}/api/users/{{userId}}`
- Variables are substituted at execution time

### Executing an API Request

1. Open an API request
2. Select active environment (if using variables)
3. Click **Send**
4. View response:
   - **Status Code**: HTTP status (200, 404, etc.)
   - **Response Time**: Duration in milliseconds
   - **Response Body**: JSON, text, or HTML
   - **Headers**: Response headers

### Adding Assertions

Assertions automatically validate API responses.

1. Open an API request
2. Scroll to **Assertions**
3. Click **Add Assertion**
4. Choose assertion type:
   - **Status Code**: Verify HTTP status
   - **Response Time**: Ensure performance
   - **Header Value**: Check specific header
   - **JSON Path**: Validate JSON field (e.g., `data.user.id`)
   - **Schema Validation**: Validate JSON schema
5. Configure operator and expected value
6. Enable/disable assertions as needed

**Example Assertions**:
- Status Code equals 200
- Response Time less than 500ms
- JSON Path `data.users[0].email` contains "@example.com"

### Generating Assertions with AI

1. Execute an API request first
2. In **Assertions** section, click **Generate with AI**
3. AI analyzes the response and creates intelligent assertions
4. Review and edit generated assertions
5. Save

### Testing GraphQL APIs

QA Nexus includes a specialized GraphQL query builder for testing GraphQL APIs.

**Setting Up GraphQL Request:**

1. Create a new API request
2. Set method to **POST** (GraphQL typically uses POST)
3. Enter GraphQL endpoint URL (e.g., `https://api.example.com/graphql`)
4. In **Body** tab, select **GraphQL** from dropdown
5. The GraphQL query builder will appear with three tabs

**Query Tab:**

1. Write your GraphQL query, mutation, or subscription
2. Use GraphQL syntax with proper field selection
3. Example query:
```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      id
      title
    }
  }
}
```

**Variables Tab:**

1. Define query variables in JSON format
2. Variables correspond to parameters in your query
3. Example variables:
```json
{
  "id": "123",
  "filter": {
    "status": "published"
  }
}
```

**Examples Tab:**

The Examples tab provides ready-to-use templates:
- **Query Example**: Fetch data (GET operation)
- **Mutation Example**: Create/update data (POST/PUT operation)
- **Subscription Example**: Real-time data streaming
- Click any example to insert it into the query editor

**GraphQL Tips:**
- Use variables ($id, $input) for dynamic values
- Request only the fields you need to minimize payload
- Use fragments for reusable field selections
- GraphQL requests are always POST with JSON body
- The body contains: `{ "query": "...", "variables": {...} }`

**Executing GraphQL Request:**

1. Configure query and variables
2. Click **Send**
3. View response in standard response viewer
4. Add assertions to validate response data
5. Generate Playwright test code

**Generated Code Example:**
```typescript
import { test, expect } from '@playwright/test'

test('POST https://api.example.com/graphql', async ({ request }) => {
  const response = await request.post(
    'https://api.example.com/graphql',
    {
      data: {
        "query": "query GetUser($id: ID!) { user(id: $id) { id name email } }",
        "variables": { "id": "123" }
      }
    }
  )

  expect(response.ok()).toBeTruthy()
})
```

### Generating Playwright Code

1. Open an API request
2. Click **Generate Code**
3. Choose language: **Playwright (TypeScript)**
4. Copy generated code:

```typescript
import { test, expect } from '@playwright/test'

test('Get user by ID', async ({ request }) => {
  const response = await request.get('http://localhost:3000/api/users/123')
  expect(response.status()).toBe(200)
  const body = await response.json()
  expect(body.data.user.id).toBe('123')
})
```

5. Add to your test suite

### Request Chaining (Extract & Reuse Response Data)

Request chaining allows you to extract values from one API response and use them in subsequent requests - perfect for workflows like Login → Get Token → Use Token in authenticated requests.

**How It Works:**

1. Execute an API request that returns data you need
2. Go to **Chaining** tab
3. Click **Add Extraction Rule**
4. Configure extraction rule:
   - **Variable Name**: Name to reference the value (e.g., `authToken`)
   - **JSON Path**: Path to the value in response (e.g., `data.user.token`)
   - **Default Value** (optional): Fallback if extraction fails
5. Execute the request to see extraction preview
6. Use the extracted variable in other requests: `{{authToken}}`

**Real-World Example: Login Flow**

**Request 1: Login (POST /api/auth/login)**
- Body: `{ "email": "user@example.com", "password": "secret" }`
- Response: `{ "data": { "user": {...}, "token": "eyJhbG..." } }`
- Chaining Tab:
  - Variable Name: `authToken`
  - JSON Path: `data.token`
  - Preview: `"eyJhbG..."`

**Request 2: Get User Profile (GET /api/user/profile)**
- Headers:
  - `Authorization`: `Bearer {{authToken}}`
- The `{{authToken}}` will be automatically replaced with the extracted value

**JSON Path Examples:**

| Response Structure | JSON Path | Extracted Value |
|--------------------|-----------|-----------------|
| `{ "id": "123" }` | `id` | `"123"` |
| `{ "data": { "user": { "email": "..." } } }` | `data.user.email` | Email value |
| `{ "users": [{ "id": "1" }, { "id": "2" }] }` | `users[0].id` | `"1"` (first user ID) |
| `{ "response": { "token": "abc..." } }` | `response.token` | Token value |

**Where Variables Work:**
- ✅ Request URLs: `https://api.example.com/users/{{userId}}`
- ✅ Headers: `Authorization: Bearer {{authToken}}`
- ✅ Query Parameters: `?api_key={{apiKey}}`
- ✅ Request Body (JSON): `{ "token": "{{authToken}}" }`

**Tips:**
- Execute the request first to see a live preview of extracted values
- Green indicator = Extraction successful
- Red indicator = Path not found or invalid
- Use descriptive variable names for clarity
- Set default values for optional extractions
- Disable rules temporarily with the toggle switch

**Common Use Cases:**
- Authentication: Extract auth tokens from login responses
- Resource Creation: Extract newly created IDs for subsequent operations
- Pagination: Extract next page tokens for paginated APIs
- Session Management: Extract and maintain session identifiers

### Viewing Execution History

1. Navigate to **API Testing** → **History**
2. View all past executions:
   - Request details
   - Status code
   - Response time
   - Timestamp
   - Assertion results (passed/failed)
3. Click on an execution to view full details

**Use Case**: Test a REST API by creating a collection with requests for CRUD operations (Create User, Get User, Update User, Delete User), add assertions, and generate Playwright tests.

---

## 8. Defect Management

Track and manage defects with Jira integration.

### Creating a Defect

1. Navigate to **Defects**
2. Click **Create Defect**
3. Fill in details:
   - **Title**: Brief summary
   - **Description**: Full details with:
     - Steps to reproduce
     - Expected vs actual behavior
     - Environment details
   - **Priority**: Low, Medium, High, Critical
   - **Severity**: Minor, Major, Critical, Blocker
   - **Status**: Open (default)
4. Optionally link to:
   - Test result (if created from failed test)
   - Test case
5. Click **Save**

### Creating Defect from Failed Test

1. During test execution, mark result as **Fail**
2. Click **Create Defect**
3. Defect is pre-filled with:
   - Test case title
   - Test steps
   - Link to test result
4. Add additional details
5. Save

### Linking Defect to Jira

1. Open a defect
2. Click **Create Jira Issue**
3. Defect details are synced to Jira
4. Jira issue key is linked (e.g., `PROJ-456`)
5. Status updates sync bi-directionally

### Managing Defect Lifecycle

1. **Open**: Initial state, needs triage
2. **In Progress**: Developer working on fix
3. **Resolved**: Fix completed, ready for verification
4. **Closed**: Verified fixed

Update status:
1. Open the defect
2. Change **Status** dropdown
3. Save

### Adding Comments to Defects

1. Open a defect
2. Scroll to **Comments**
3. Type your comment
4. Use **@username** to mention team members
5. Click **Post Comment**
6. Mentioned users receive notifications

### Viewing Defect Metrics

In **Analytics** → **Defects**:
- Defects by priority
- Defects by status
- Defect trends over time
- Mean time to resolution

---

## 9. Analytics

View comprehensive metrics and trends across your QA activities.

### Dashboard Metrics

Navigate to **Analytics** to view:

#### Test Execution Trends
- 30-day execution history
- Pass/fail rates over time
- Total tests executed per day

#### Pass Rate Analysis
- Overall pass rate
- Pass rate by test suite
- Pass rate by priority

#### Defect Distribution
- Defects by priority (pie chart)
- Defects by status (bar chart)
- Defect creation trends

#### Automation Coverage
- Percentage of automated tests
- Manual vs automated ratio
- Automation progress over time

### Filtering Data

1. Select **Date Range**: Last 7 days, 30 days, 90 days, All time
2. Filter by **Test Suite**: View suite-specific metrics
3. Filter by **Priority**: Focus on critical tests
4. Export data (if needed)

### Epic-Level Metrics (Jira Integration)

When test suites are linked to Jira Epics:
- Epic progress and status
- Test coverage per epic
- Quality metrics by epic
- Risk coverage validation

---

## 10. AI Insights

Leverage AI to identify issues and get intelligent recommendations.

### Viewing AI Insights

1. Navigate to **AI Insights**
2. View insights by category:
   - **Flaky Tests**: Tests with inconsistent results
   - **Performance Issues**: Slow-running tests
   - **Predicted Failures**: Tests likely to fail
   - **Recommendations**: General suggestions

### Understanding Flaky Tests

**Flaky Score**: 0-100, higher = more unreliable
- Score < 30: Stable
- Score 30-70: Moderately flaky
- Score > 70: Highly flaky

**Actions**:
1. Open the flaky test insight
2. Review execution history
3. Identify patterns (specific environment, time of day, etc.)
4. Mark as **Resolved** when fixed
5. Add notes about the fix

### Performance Insights

Shows tests exceeding performance thresholds:
- Average execution time
- Slowest runs
- Recommendations for optimization

**Example Recommendation**: "Test 'Load user dashboard' takes 5.2s on average. Consider optimizing database queries or adding pagination."

### Predicted Failures

AI analyzes trends to predict which tests are likely to fail:
- Based on recent failure patterns
- Code changes
- Environmental factors
- Historical data

**Actions**:
1. Review predicted failures
2. Run tests proactively
3. Investigate before production deployment

### Acting on Recommendations

1. Review AI recommendation
2. Click **View Details**
3. Follow suggested actions
4. Mark as **Resolved** when implemented
5. Add notes about what was done

### Filtering Insights

- **Status**: Open, Resolved, Dismissed
- **Severity**: Critical, High, Medium, Low
- **Type**: Flaky, Performance, Prediction, Recommendation
- **Date Range**: Recent insights vs historical

---

## 11. Collaboration

Work with your team using comments, mentions, and reviews.

### Adding Comments

Comments can be added to:
- Test cases
- Test suites
- Defects
- Test results

**To add a comment**:
1. Open the item (test case, defect, etc.)
2. Scroll to **Comments** section
3. Type your comment in the text box
4. Click **Post Comment**

### Mentioning Team Members

1. In any comment, type `@`
2. Start typing the user's name
3. Select from the dropdown
4. User receives a notification
5. Post comment

**Example**: "@john Can you review this test case before execution?"

### Requesting Reviews

1. Open a test case or test suite
2. Click **Request Review**
3. Select reviewer
4. Add review comments/context
5. Click **Send Request**
6. Reviewer receives notification

### Completing Reviews

When you receive a review request:
1. Check your **Notifications** (bell icon)
2. Click on the review request
3. Review the content
4. Provide feedback in comments
5. Choose decision:
   - **Approve**: Content is good
   - **Request Changes**: Needs modifications
6. Submit review

### Viewing Notifications

1. Click the **Bell icon** in the header
2. View recent notifications:
   - Mentions in comments
   - Review requests
   - Review completions
   - Status changes
3. Click a notification to jump to the item
4. Mark as read

### Activity Timeline

View chronological history of all actions:
1. Open any item (test suite, defect, etc.)
2. Scroll to **Activity Timeline**
3. See:
   - Who did what
   - When it happened
   - Changes made
   - Comments posted

**Color Coding**:
- Blue: Comments
- Green: Status changes (positive)
- Red: Status changes (negative)
- Purple: Reviews

---

## 12. Settings

Configure system-wide settings and integrations.

### AI Provider Settings

**OpenAI Configuration**:
1. Navigate to **Settings**
2. Select **OpenAI** as provider
3. Enter API Key
4. Click **Save Settings**

**Foundry Configuration**:
1. Select **Foundry** as provider
2. Enter API URL (e.g., `http://localhost:8000`)
3. Click **Save Settings**

**Testing AI Connection**:
- Generate a test case with AI
- If it works, configuration is correct

### Jira Integration Settings

1. Navigate to **Settings** → **Jira Integration**
2. Enter:
   - **Jira Base URL**: Your Atlassian instance URL
   - **Email**: Your Atlassian account email
   - **API Token**: Generate at Atlassian account settings
3. Click **Save Settings**
4. Test by importing an Epic

### User Profile Settings

1. Navigate to **Settings** → **Profile**
2. Update:
   - Display name
   - Email
   - Notification preferences
3. Save changes

---

## Common Workflows

### Workflow 1: Requirements to Automated Tests

**Goal**: Convert Jira Epic into executable Playwright tests

1. **Analyze Epic**:
   - Go to Document Analysis
   - Enter Jira Epic key
   - Review AI analysis

2. **Generate Test Suite**:
   - Click "Generate Test Suite"
   - Review AI-generated test cases
   - Save

3. **Execute Manually**:
   - Start test execution
   - Record results (achieve 100% pass rate)
   - Create defects for any failures

4. **Generate Automation**:
   - Once pass rate is 100%
   - Generate Playwright tests
   - Download and integrate into CI/CD

**Result**: Jira Epic → AI Analysis → Test Suite → Manual Execution → Automated Tests

---

### Workflow 2: API Testing

**Goal**: Test a REST API endpoint thoroughly

1. **Create Collection**:
   - Navigate to API Testing
   - Create collection (e.g., "User API")

2. **Add Requests**:
   - Create User (POST)
   - Get User (GET)
   - Update User (PUT)
   - Delete User (DELETE)

3. **Set Up Environment**:
   - Create "Dev" environment
   - Add variables: `baseUrl`, `apiKey`

4. **Add Assertions**:
   - Status codes
   - Response structure
   - Data validation

5. **Generate AI Assertions**:
   - Execute requests
   - Use "Generate with AI"
   - Review and enable assertions

6. **Create Playwright Tests**:
   - Generate code for each request
   - Combine into test suite
   - Run with `npx playwright test`

**Result**: Complete API test suite with assertions and automation

---

### Workflow 3: Defect Lifecycle

**Goal**: Track defect from discovery to resolution

1. **Discovery**:
   - Failed test creates defect
   - Or manually create defect

2. **Triage**:
   - Assign priority and severity
   - Add reproduction steps
   - Create Jira issue

3. **Development**:
   - Update status to "In Progress"
   - Jira status syncs
   - Developer fixes issue

4. **Verification**:
   - Status updated to "Resolved"
   - Re-run test case
   - If passes, close defect

5. **Closure**:
   - Update status to "Closed"
   - Add comment with fix details
   - Jira issue closes

**Result**: Complete defect lifecycle with traceability

---

## Best Practices

### Test Case Management
- Use descriptive titles
- Keep steps atomic and clear
- Add coverage tags for traceability
- Link to requirements (Jira stories/epics)

### Test Execution
- Execute tests in consistent environment
- Add detailed notes for failures
- Attach evidence (screenshots, logs)
- Create defects immediately for failures

### API Testing
- Use environment variables for flexibility
- Add comprehensive assertions
- Organize requests into logical collections
- Generate automation code for CI/CD

### Defect Management
- Include clear reproduction steps
- Add environment details
- Link to failed test results
- Use appropriate priority and severity

### Collaboration
- Use @mentions for important notifications
- Request reviews before major changes
- Add comments with context
- Keep activity timeline clean

### AI Usage
- Review AI-generated content before using
- Provide clear, specific prompts
- Use AI insights to identify issues proactively
- Act on recommendations promptly

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Create Test Case | `Ctrl/Cmd + N` |
| Search | `Ctrl/Cmd + K` |
| View Notifications | `Ctrl/Cmd + Shift + N` |
| Save | `Ctrl/Cmd + S` |
| Execute Test | `Ctrl/Cmd + E` |

---

## Support and Resources

### Documentation
- **README.md**: Technical setup and architecture
- **PHASE Summaries**: Detailed implementation guides
- **API_TESTING_QUICKSTART.md**: Quick start for API testing

### Getting Help
- Check this user manual first
- Review README.md for technical issues
- Check GitHub issues for known problems

### Reporting Issues
1. Check if issue is already reported
2. Gather:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/logs
   - Environment details (browser, OS, version)
3. Create GitHub issue with details

---

**Version**: 3.0.0
**Last Updated**: 2025-11-30
**Platform**: QA Nexus

Built with ❤️ for QA Engineers
