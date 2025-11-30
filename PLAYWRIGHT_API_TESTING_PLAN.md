# Playwright API Testing Integration Plan for QA Nexus

## Executive Summary

This document outlines a comprehensive plan to integrate Playwright's powerful API testing capabilities into QA Nexus, creating a modern, AI-powered API testing platform that combines the best of visual UIs (like Postman) with code-based testing (like Playwright).

## Table of Contents
1. [Vision & Goals](#vision--goals)
2. [Architecture Overview](#architecture-overview)
3. [Database Schema](#database-schema)
4. [Implementation Phases](#implementation-phases)
5. [Feature Details](#feature-details)
6. [AI Integration](#ai-integration)
7. [UI/UX Design](#uiux-design)
8. [Code Examples](#code-examples)
9. [Integration with Existing Features](#integration-with-existing-features)
10. [Risk Assessment](#risk-assessment)

---

## Vision & Goals

### Primary Goal
Enable users to create, manage, and execute API tests through an intuitive UI while leveraging Playwright's robust TypeScript-based testing engine underneath.

### Key Differentiators
- **Visual + Code**: GUI for quick test creation, full code control for advanced users
- **AI-Powered**: Generate tests from OpenAPI specs, natural language, or API responses
- **Hybrid Testing**: Seamlessly combine UI and API tests in the same workflow
- **Collaboration**: Leverage existing QA Nexus features (comments, reviews, insights)
- **Git-Friendly**: Store tests as code, not proprietary formats
- **Type-Safe**: Full TypeScript support with autocomplete

### Success Metrics
- Create an API test in <2 minutes (vs 5+ in pure code)
- Generate 80%+ of test code automatically from OpenAPI specs
- Execute 100+ API tests in parallel in <30 seconds
- Reduce API testing learning curve by 70% (GUI + AI assistance)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     QA Nexus Frontend                       │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ API Request    │  │ Collection     │  │ Environment  │  │
│  │ Builder UI     │  │ Manager        │  │ Switcher     │  │
│  └────────┬───────┘  └───────┬────────┘  └──────┬───────┘  │
│           │                   │                   │          │
│           └───────────────────┼───────────────────┘          │
│                               │                              │
└───────────────────────────────┼──────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Server Actions Layer                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Create/Update/Delete API Requests                 │  │
│  │  - Execute Playwright Tests                          │  │
│  │  - Parse Test Results                                │  │
│  │  - AI Test Generation                                │  │
│  └──────────────────┬───────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Code Generation Layer                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Request Config → Playwright Test Code Generator     │  │
│  │  OpenAPI Spec → Playwright Test Suite                │  │
│  │  Postman Collection → Playwright Migration           │  │
│  └──────────────────┬───────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Playwright Execution Layer                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Dynamic Test File Generation                        │  │
│  │  ├─ tests/api-generated/collection-{id}.spec.ts      │  │
│  │  └─ tests/api-generated/request-{id}.spec.ts         │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  Playwright Test Runner (playwright.config.ts)       │  │
│  │  - Multi-browser execution                           │  │
│  │  - Parallel test runs                                │  │
│  │  - Retry strategies                                  │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  Test Results & Artifacts                            │  │
│  │  - test-results.json                                 │  │
│  │  - test-results/junit.xml                            │  │
│  │  - Screenshots, Videos, Traces                       │  │
│  └──────────────────┬───────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer (Prisma)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - ApiCollection (folders, organization)             │  │
│  │  - ApiRequest (method, URL, headers, body)           │  │
│  │  - ApiExecution (results, timing, assertions)        │  │
│  │  - Environment (variables, auth configs)             │  │
│  │  - OpenApiSpec (imported schemas)                    │  │
│  │  - ApiAssertion (validation rules)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Request Execution Flow:**
```
1. User builds request in UI
   ↓
2. QA Nexus stores request config in database
   ↓
3. Code generator creates Playwright test file
   ↓
4. Execute: npx playwright test {generated-file}.spec.ts --reporter=json
   ↓
5. Parse test-results.json
   ↓
6. Store execution results in database
   ↓
7. Display results in UI with pass/fail, timing, response preview
```

---

## Database Schema

### Complete Prisma Schema

```prisma
// API Collection - Organize API requests into folders
model ApiCollection {
  id          String   @id @default(cuid())
  title       String
  description String?
  parentId    String?  // For nested folders
  parent      ApiCollection? @relation("CollectionHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    ApiCollection[] @relation("CollectionHierarchy")
  requests    ApiRequest[]

  // Metadata
  createdBy   String
  user        User     @relation(fields: [createdBy], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Environment association
  environmentId String?
  environment Environment? @relation(fields: [environmentId], references: [id])

  // Sharing & collaboration
  isPublic    Boolean  @default(false)
  tags        String[] // For categorization

  @@index([createdBy])
  @@index([parentId])
}

// API Request - Individual API test definition
model ApiRequest {
  id            String   @id @default(cuid())
  title         String
  description   String?

  // HTTP Configuration
  method        HttpMethod  @default(GET)
  url           String      // Can contain {{variables}}
  headers       Json?       // Key-value pairs
  queryParams   Json?       // Key-value pairs
  body          Json?       // Request body (JSON, form-data, etc.)
  bodyType      BodyType    @default(JSON)

  // Authentication
  authType      AuthType    @default(NONE)
  authConfig    Json?       // Stores auth details (token, credentials, etc.)

  // Pre-request & Test Scripts
  preRequestScript  String?  // JavaScript to run before request
  testScript        String?  // Playwright test assertions

  // Collection association
  collectionId  String
  collection    ApiCollection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  // Environment
  environmentId String?
  environment   Environment? @relation(fields: [environmentId], references: [id])

  // Execution history
  executions    ApiExecution[]
  assertions    ApiAssertion[]

  // Metadata
  createdBy     String
  user          User     @relation(fields: [createdBy], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Test Suite integration
  testCaseId    String?
  testCase      TestCase? @relation(fields: [testCaseId], references: [id])

  // Ordering within collection
  order         Int      @default(0)

  @@index([collectionId])
  @@index([createdBy])
  @@index([testCaseId])
}

// API Execution - Results from test runs
model ApiExecution {
  id            String   @id @default(cuid())

  // Request reference
  requestId     String
  request       ApiRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  // Execution details
  status        ExecutionStatus
  statusCode    Int?
  responseTime  Int          // Milliseconds
  responseBody  String?      // Actual response
  responseHeaders Json?

  // Error details
  errorMessage  String?
  stackTrace    String?

  // Screenshots/artifacts (for hybrid UI+API tests)
  artifacts     Json?        // Paths to screenshots, videos, traces

  // Assertion results
  assertionsPassed Int    @default(0)
  assertionsFailed Int    @default(0)
  assertionResults Json?  // Detailed assertion outcomes

  // Environment used
  environmentId String?
  environment   Environment? @relation(fields: [environmentId], references: [id])

  // Test Run integration
  testRunId     String?
  testRun       TestRun? @relation(fields: [testRunId], references: [id])

  // Metadata
  executedBy    String
  user          User     @relation(fields: [executedBy], references: [id])
  executedAt    DateTime @default(now())

  @@index([requestId])
  @@index([status])
  @@index([testRunId])
  @@index([executedAt])
}

// Environment - Variable management
model Environment {
  id          String   @id @default(cuid())
  name        String
  description String?

  // Variables (name-value pairs)
  variables   Json     // { "API_KEY": "xxx", "BASE_URL": "https://api.example.com" }

  // Global auth config for this environment
  authConfig  Json?

  // Collections using this environment
  collections ApiCollection[]
  requests    ApiRequest[]
  executions  ApiExecution[]

  // Metadata
  createdBy   String
  user        User     @relation(fields: [createdBy], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([createdBy])
}

// OpenAPI Spec - Imported API specifications
model OpenApiSpec {
  id          String   @id @default(cuid())
  title       String
  version     String
  description String?

  // Spec content
  specContent Json     // Full OpenAPI spec
  sourceUrl   String?  // Original URL if imported from URL

  // Generated collections
  collectionId String?
  collection   ApiCollection? @relation(fields: [collectionId], references: [id])

  // Metadata
  importedBy  String
  user        User     @relation(fields: [importedBy], references: [id])
  importedAt  DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([importedBy])
}

// API Assertion - Reusable validation rules
model ApiAssertion {
  id          String   @id @default(cuid())

  // Request association
  requestId   String
  request     ApiRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  // Assertion details
  type        AssertionType
  field       String?      // JSONPath or field name
  operator    AssertionOperator
  expectedValue String?

  // Custom assertion code
  customCode  String?      // For complex assertions

  // Metadata
  order       Int      @default(0)
  enabled     Boolean  @default(true)

  @@index([requestId])
}

// Enums
enum HttpMethod {
  GET
  POST
  PUT
  PATCH
  DELETE
  HEAD
  OPTIONS
}

enum BodyType {
  NONE
  JSON
  FORM_DATA
  FORM_URLENCODED
  RAW
  BINARY
  GRAPHQL
}

enum AuthType {
  NONE
  BEARER_TOKEN
  BASIC_AUTH
  API_KEY
  OAUTH2
  AWS_SIGNATURE
}

enum ExecutionStatus {
  PASSED
  FAILED
  ERROR
  SKIPPED
  RUNNING
}

enum AssertionType {
  STATUS_CODE
  RESPONSE_TIME
  HEADER_VALUE
  JSON_PATH
  SCHEMA_VALIDATION
  CUSTOM
}

enum AssertionOperator {
  EQUALS
  NOT_EQUALS
  CONTAINS
  NOT_CONTAINS
  GREATER_THAN
  LESS_THAN
  MATCHES_REGEX
  EXISTS
  NOT_EXISTS
}

// Update existing models with API relations
model User {
  // ... existing fields ...
  apiCollections  ApiCollection[]
  apiRequests     ApiRequest[]
  apiExecutions   ApiExecution[]
  environments    Environment[]
  openApiSpecs    OpenApiSpec[]
}

model TestCase {
  // ... existing fields ...
  apiRequests     ApiRequest[]
}

model TestRun {
  // ... existing fields ...
  apiExecutions   ApiExecution[]
}
```

### Schema Design Rationale

**1. Collection Hierarchy:**
- Self-referential relationship allows unlimited nesting
- Similar to file/folder structure users are familiar with

**2. Request Configuration:**
- JSON fields for flexibility (headers, query params, body)
- Support for variable substitution via `{{variableName}}`
- Pre-request and test scripts for advanced customization

**3. Execution History:**
- Complete audit trail of all test runs
- Performance metrics (response time)
- Assertion results for debugging

**4. Environment Management:**
- Separate environments (Dev, Staging, Prod)
- Variable inheritance and overrides
- Secure storage for sensitive data

**5. Integration Points:**
- Links to TestCase for traceability
- Links to TestRun for batch execution
- User associations for collaboration

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2) - PRIORITY: HIGH

**Goal:** Basic request builder and execution

**Tasks:**
1. Database schema migration
2. Basic UI: Create collection, add request
3. Request builder form (method, URL, headers, body)
4. Code generator: Request config → Playwright test
5. Execute single request via Playwright
6. Parse results and display in UI

**Complexity:** Medium

**Deliverables:**
- User can create a GET request
- Execute it against a real API
- See response status, body, timing

**Code Example:**
```typescript
// Generated Playwright test
import { test, expect } from '@playwright/test';

test('GET /api/users', async ({ request }) => {
  const response = await request.get('https://api.example.com/users', {
    headers: {
      'Authorization': 'Bearer {{API_TOKEN}}',
    }
  });

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
});
```

---

### Phase 2: Collections & Environments (Week 3-4) - PRIORITY: HIGH

**Goal:** Organize tests and manage variables

**Tasks:**
1. Collection management (create, rename, delete, nest)
2. Environment CRUD operations
3. Variable substitution engine
4. Run entire collection
5. Execution history view
6. Export collection as Playwright test suite

**Complexity:** Medium

**Deliverables:**
- Collections with folders
- Environment switcher
- Run all requests in collection
- View historical results

---

### Phase 3: Advanced Request Features (Week 5-6) - PRIORITY: MEDIUM

**Goal:** Support complex API testing scenarios

**Tasks:**
1. Authentication flows (Bearer, OAuth2, Basic Auth)
2. Request chaining (use response in next request)
3. Assertions builder UI
4. Pre-request scripts
5. File upload/download
6. GraphQL support
7. WebSocket testing

**Complexity:** High

**Deliverables:**
- Complete auth support
- Chained workflows
- Visual assertion builder

---

### Phase 4: AI-Powered Generation (Week 7-8) - PRIORITY: HIGH

**Goal:** Automate test creation with AI

**Tasks:**
1. OpenAPI/Swagger import
2. AI-generated assertions from response
3. Natural language → API test
4. Postman collection import
5. Generate mock data
6. Test optimization suggestions

**Complexity:** Medium-High

**Deliverables:**
- Import OpenAPI spec → full test suite
- "Create test for user login" → generated code
- AI-suggested assertions

**AI Prompts:**
```typescript
// Example: Generate assertions from response
const prompt = `
Analyze this API response and suggest meaningful assertions:

Endpoint: GET /api/users/123
Response:
${JSON.stringify(response, null, 2)}

Generate Playwright test assertions that validate:
1. Critical fields exist and have correct types
2. Business logic constraints (e.g., email format, age > 0)
3. Response structure matches expected schema
`;

// AI generates:
expect(data.id).toBe(123);
expect(data.email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
expect(data.age).toBeGreaterThan(0);
expect(data.roles).toEqual(expect.arrayContaining(['user']));
```

---

### Phase 5: Hybrid UI + API Testing (Week 9-10) - PRIORITY: MEDIUM

**Goal:** Combine browser and API tests

**Tasks:**
1. Visual test builder (mix UI steps + API calls)
2. API mocking for UI tests
3. Shared authentication context
4. End-to-end workflow templates
5. API setup/teardown for E2E tests

**Complexity:** High

**Deliverables:**
- Tests that combine UI and API actions
- Mock API responses for UI testing
- Reusable auth flows

**Example:**
```typescript
test('Complete checkout flow', async ({ page, request }) => {
  // 1. Setup: Create test product via API
  const product = await request.post('/api/products', {
    data: { name: 'Test Product', price: 99.99 }
  });
  const productId = (await product.json()).id;

  // 2. UI: Navigate and add to cart
  await page.goto('/products');
  await page.click(`[data-product-id="${productId}"]`);
  await page.click('button:has-text("Add to Cart")');

  // 3. Verify API updated
  const cart = await request.get('/api/cart');
  expect(await cart.json()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ productId })
    ])
  );

  // 4. Cleanup: Delete test product
  await request.delete(`/api/products/${productId}`);
});
```

---

### Phase 6: Advanced Features (Week 11-12) - PRIORITY: LOW

**Goal:** Performance, monitoring, CI/CD integration

**Tasks:**
1. Performance testing (load, stress)
2. API monitoring & alerting
3. Schedule automated runs
4. CI/CD pipeline integration
5. Contract testing (Pact-style)
6. API documentation generation

**Complexity:** Very High

**Deliverables:**
- Load testing capabilities
- Scheduled API health checks
- Auto-generated API docs

---

## Feature Details

### 1. Request Builder UI

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  [GET ▼]  [https://api.example.com/users     ] [Send]  │
├─────────────────────────────────────────────────────────┤
│  Tabs: [ Params ] [ Headers ] [ Body ] [ Auth ] [...] │
│                                                          │
│  ┌─ Headers ─────────────────────────────────────────┐ │
│  │                                                     │ │
│  │  Key               Value                  Actions  │ │
│  │  [Authorization] [Bearer {{TOKEN}}]       [X]      │ │
│  │  [Content-Type ] [application/json]       [X]      │ │
│  │  [+ Add Header]                                    │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  Environment: [Development ▼]                           │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Response                                  200 OK 145ms │
├─────────────────────────────────────────────────────────┤
│  [ Body ] [ Headers ] [ Test Results ] [ Code ]        │
│                                                          │
│  {                                                       │
│    "users": [                                            │
│      { "id": 1, "name": "John Doe" }                    │
│    ]                                                     │
│  }                                                       │
│                                                          │
│  ✓ Status code is 200                                   │
│  ✓ Response time < 500ms                                │
│  ✓ Body contains 'users' array                          │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- Method dropdown (GET, POST, PUT, DELETE, etc.)
- URL bar with variable substitution preview
- Tabbed interface for request configuration
- Environment selector
- Real-time response preview
- Test results with pass/fail indicators
- Generated code viewer

---

### 2. Collection Manager

**Sidebar Layout:**
```
┌─────────────────────────────┐
│  📁 My Collections          │
│                             │
│  ▼ 📁 E-commerce API        │
│     📄 Create Product       │
│     📄 Get Product          │
│     ▼ 📁 User Management    │
│        📄 Register User     │
│        📄 Login             │
│        📄 Get Profile       │
│     📁 Orders               │
│                             │
│  ▼ 📁 Payment Gateway       │
│     📄 Process Payment      │
│     📄 Refund               │
│                             │
│  [+ New Collection]         │
└─────────────────────────────┘
```

**Features:**
- Drag-and-drop reordering
- Right-click context menu (rename, delete, duplicate)
- Search/filter
- Run entire collection
- Export collection

---

### 3. Environment Manager

**UI:**
```
┌────────────────────────────────────────────────────┐
│  Environments                                       │
│                                                     │
│  [ Development ] [ Staging ] [ Production ] [+ ]   │
│                                                     │
│  Development Environment                            │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Variable Name        Value                        │
│  ────────────────────────────────────────────────  │
│  BASE_URL            http://localhost:3000         │
│  API_KEY             dev_key_12345                 │
│  AUTH_TOKEN          {{secret}}    [🔒 Hide]       │
│  DB_CONNECTION       sqlite:dev.db                 │
│                                                     │
│  [+ Add Variable]                                  │
│                                                     │
│  [Save]  [Cancel]                                  │
└────────────────────────────────────────────────────┘
```

**Features:**
- Multiple environments
- Variable CRUD
- Secure storage for sensitive values
- Variable preview in requests
- Import/export variables

---

### 4. Execution History

**Table View:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Request: GET /api/users                                         │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Date/Time           Status  Code  Time   Environment  User     │
│  ────────────────────────────────────────────────────────────  │
│  2025-01-15 10:30am  ✓ Pass  200   145ms  Development  John    │
│  2025-01-15 09:15am  ✓ Pass  200   132ms  Development  John    │
│  2025-01-14 04:45pm  ✗ Fail  500   2.3s   Production   Sarah   │
│  2025-01-14 02:30pm  ✓ Pass  200   158ms  Staging      John    │
│                                                                  │
│  [View Details] [Compare] [Re-run]                              │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Chronological execution log
- Filter by status, environment, user
- Detailed view (full request/response)
- Compare executions
- Re-run failed requests

---

## AI Integration

### 1. OpenAPI Import with AI Enhancement

**Flow:**
```typescript
// 1. User uploads OpenAPI spec
const openApiSpec = await parseOpenApiFile(file);

// 2. Extract endpoints
const endpoints = extractEndpoints(openApiSpec);

// 3. For each endpoint, use AI to enhance test generation
for (const endpoint of endpoints) {
  const prompt = `
  Generate comprehensive Playwright API test for:

  Endpoint: ${endpoint.method} ${endpoint.path}
  Parameters: ${JSON.stringify(endpoint.parameters)}
  Request Body Schema: ${JSON.stringify(endpoint.requestBody)}
  Response Schema: ${JSON.stringify(endpoint.responses)}

  Include:
  1. Request with realistic test data
  2. Assertions for response status, structure, and business logic
  3. Edge case tests (missing fields, invalid data)
  4. Performance assertion (response time)
  `;

  const aiGeneratedTest = await chatCompletion([
    { role: 'system', content: 'You are an expert API testing engineer.' },
    { role: 'user', content: prompt }
  ]);

  // Store generated test
  await createApiRequest({
    title: endpoint.summary,
    method: endpoint.method,
    url: endpoint.path,
    testScript: aiGeneratedTest,
    // ...
  });
}
```

**AI Output Example:**
```typescript
test('POST /api/users - Create new user', async ({ request }) => {
  // Test with valid data
  const response = await request.post('/api/users', {
    data: {
      name: 'Test User',
      email: 'test@example.com',
      age: 25
    }
  });

  expect(response.status()).toBe(201);
  const user = await response.json();
  expect(user).toMatchObject({
    id: expect.any(Number),
    name: 'Test User',
    email: 'test@example.com',
    age: 25,
    createdAt: expect.any(String)
  });

  // Edge case: Missing required field
  const invalidResponse = await request.post('/api/users', {
    data: { name: 'Test User' } // Missing email
  });
  expect(invalidResponse.status()).toBe(400);

  // Performance check
  const start = Date.now();
  await request.post('/api/users', { data: validData });
  expect(Date.now() - start).toBeLessThan(500);
});
```

---

### 2. Natural Language Test Generation

**UI:**
```
┌──────────────────────────────────────────────────────┐
│  🤖 AI Test Generator                                 │
│  ──────────────────────────────────────────────────  │
│                                                       │
│  Describe what you want to test:                     │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Test that creating a user with invalid email    │ │
│  │ returns 400 error and proper error message      │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  [Generate Test]                                      │
│                                                       │
│  Generated Test:                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ test('Invalid email returns 400', async (...) { │ │
│  │   const response = await request.post(          │ │
│  │     '/api/users',                               │ │
│  │     { data: { email: 'invalid-email' } }        │ │
│  │   );                                            │ │
│  │   expect(response.status()).toBe(400);          │ │
│  │   const error = await response.json();          │ │
│  │   expect(error.message).toContain('Invalid');   │ │
│  │ });                                             │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  [Save Test]  [Regenerate]  [Edit]                   │
└──────────────────────────────────────────────────────┘
```

---

### 3. Smart Assertion Generation

**After executing a request, AI suggests assertions:**

```typescript
// User executes GET /api/users/123
// Response:
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "roles": ["admin", "user"],
  "lastLogin": "2025-01-15T10:30:00Z",
  "isActive": true
}

// AI analyzes response and suggests:
const suggestions = [
  {
    code: 'expect(response.status()).toBe(200);',
    confidence: 0.99,
    reason: 'Verify successful response'
  },
  {
    code: 'expect(data.id).toBe(123);',
    confidence: 0.95,
    reason: 'Verify correct user ID'
  },
  {
    code: 'expect(data.email).toMatch(/^[^@]+@[^@]+$/);',
    confidence: 0.90,
    reason: 'Validate email format'
  },
  {
    code: 'expect(data.roles).toContain("admin");',
    confidence: 0.85,
    reason: 'Verify user has admin role'
  },
  {
    code: 'expect(new Date(data.lastLogin)).toBeInstanceOf(Date);',
    confidence: 0.80,
    reason: 'Validate date format'
  }
];

// User can select which assertions to add
```

---

### 4. Test Optimization AI

**Analyze test suite and suggest improvements:**

```typescript
const optimizationPrompt = `
Analyze this API test suite and suggest optimizations:

${testSuiteCode}

Consider:
1. Redundant requests that could be combined
2. Missing error handling
3. Opportunities for parallel execution
4. Hard-coded values that should be variables
5. Missing edge case tests
6. Performance improvements
`;

// AI returns:
{
  suggestions: [
    {
      type: 'COMBINE_REQUESTS',
      description: 'Requests 3 and 4 could share authentication',
      codeChange: '...',
      impact: 'Reduce execution time by 30%'
    },
    {
      type: 'ADD_ERROR_HANDLING',
      description: 'Test missing 404 error case',
      codeChange: '...',
      impact: 'Improve test coverage'
    }
  ]
}
```

---

## Code Examples

### Request Builder → Playwright Code Generator

```typescript
// src/lib/playwright-generator.ts

export interface ApiRequestConfig {
  method: string;
  url: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: any;
  bodyType?: string;
  assertions?: Assertion[];
  preRequestScript?: string;
  environmentVariables?: Record<string, string>;
}

export function generatePlaywrightTest(config: ApiRequestConfig): string {
  const {
    method,
    url,
    headers = {},
    queryParams = {},
    body,
    bodyType,
    assertions = [],
    preRequestScript,
    environmentVariables = {}
  } = config;

  // Replace variables
  let processedUrl = replaceVariables(url, environmentVariables);
  const processedHeaders = replaceVariables(headers, environmentVariables);

  // Build request options
  const requestOptions: string[] = [];

  if (Object.keys(processedHeaders).length > 0) {
    requestOptions.push(`headers: ${JSON.stringify(processedHeaders, null, 2)}`);
  }

  if (Object.keys(queryParams).length > 0) {
    requestOptions.push(`params: ${JSON.stringify(queryParams, null, 2)}`);
  }

  if (body && method !== 'GET') {
    if (bodyType === 'JSON') {
      requestOptions.push(`data: ${JSON.stringify(body, null, 2)}`);
    } else if (bodyType === 'FORM_DATA') {
      requestOptions.push(`multipart: ${JSON.stringify(body, null, 2)}`);
    }
  }

  const optionsString = requestOptions.length > 0
    ? `,\n    {\n      ${requestOptions.join(',\n      ')}\n    }`
    : '';

  // Generate test code
  let testCode = `import { test, expect } from '@playwright/test';\n\n`;
  testCode += `test('${method} ${url}', async ({ request }) => {\n`;

  // Pre-request script
  if (preRequestScript) {
    testCode += `  // Pre-request script\n`;
    testCode += `  ${preRequestScript.split('\n').join('\n  ')}\n\n`;
  }

  // Request
  testCode += `  const response = await request.${method.toLowerCase()}(\n`;
  testCode += `    '${processedUrl}'${optionsString}\n`;
  testCode += `  );\n\n`;

  // Default assertions
  testCode += `  // Assertions\n`;
  testCode += `  expect(response.ok()).toBeTruthy();\n`;

  // Custom assertions
  for (const assertion of assertions) {
    testCode += generateAssertion(assertion);
  }

  // Log response for debugging
  testCode += `\n  // Log response\n`;
  testCode += `  const responseBody = await response.json();\n`;
  testCode += `  console.log('Response:', JSON.stringify(responseBody, null, 2));\n`;

  testCode += `});\n`;

  return testCode;
}

function generateAssertion(assertion: Assertion): string {
  const { type, field, operator, expectedValue } = assertion;

  switch (type) {
    case 'STATUS_CODE':
      return `  expect(response.status()).toBe(${expectedValue});\n`;

    case 'RESPONSE_TIME':
      return `  // Response time assertion would be handled by Playwright timeout\n`;

    case 'JSON_PATH':
      return `  const data = await response.json();\n` +
             `  expect(data.${field}).${operatorToExpect(operator)}(${JSON.stringify(expectedValue)});\n`;

    case 'HEADER_VALUE':
      return `  expect(response.headers()['${field}']).${operatorToExpect(operator)}(${JSON.stringify(expectedValue)});\n`;

    default:
      return '';
  }
}

function operatorToExpect(operator: string): string {
  const mapping: Record<string, string> = {
    'EQUALS': 'toBe',
    'NOT_EQUALS': 'not.toBe',
    'CONTAINS': 'toContain',
    'NOT_CONTAINS': 'not.toContain',
    'GREATER_THAN': 'toBeGreaterThan',
    'LESS_THAN': 'toBeLessThan',
    'MATCHES_REGEX': 'toMatch',
  };
  return mapping[operator] || 'toBe';
}

function replaceVariables(
  obj: any,
  variables: Record<string, string>
): any {
  if (typeof obj === 'string') {
    return obj.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
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
```

---

### Executing Playwright Tests

```typescript
// src/lib/playwright-executor.ts

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
}

export async function executePlaywrightTest(
  testCode: string,
  testId: string
): Promise<ExecutionResult> {
  try {
    // 1. Write test file to temporary location
    const testDir = path.join(process.cwd(), 'tests', 'api-generated');
    await fs.mkdir(testDir, { recursive: true });

    const testFile = path.join(testDir, `request-${testId}.spec.ts`);
    await fs.writeFile(testFile, testCode);

    // 2. Execute Playwright test
    const command = `npx playwright test ${testFile} --reporter=json`;
    const { stdout, stderr } = await execAsync(command, {
      timeout: 60000, // 60 second timeout
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    // 3. Parse JSON results
    const resultsFile = path.join(process.cwd(), 'test-results.json');
    const resultsContent = await fs.readFile(resultsFile, 'utf-8');
    const results = JSON.parse(resultsContent);

    // 4. Extract execution details
    const testResult = results.suites[0]?.specs[0]?.tests[0];
    const result: ExecutionResult = {
      status: testResult.status === 'expected' ? 'PASSED' : 'FAILED',
      responseTime: testResult.results[0].duration,
      assertionsPassed: testResult.results[0].attachments?.filter((a: any) =>
        a.name === 'passed'
      ).length || 0,
      assertionsFailed: testResult.results[0].attachments?.filter((a: any) =>
        a.name === 'failed'
      ).length || 0,
    };

    // Extract response from console logs
    const logs = testResult.results[0].stdout || '';
    const responseMatch = logs.match(/Response: (.*)/s);
    if (responseMatch) {
      result.responseBody = responseMatch[1];
    }

    // Extract error if failed
    if (result.status === 'FAILED') {
      result.errorMessage = testResult.results[0].error?.message;
      result.stackTrace = testResult.results[0].error?.stack;
    }

    // Collect artifacts (screenshots, traces)
    result.artifacts = testResult.results[0].attachments?.map((a: any) => a.path) || [];

    // 5. Cleanup test file
    await fs.unlink(testFile);

    return result;

  } catch (error: any) {
    return {
      status: 'ERROR',
      responseTime: 0,
      assertionsPassed: 0,
      assertionsFailed: 0,
      errorMessage: error.message,
      stackTrace: error.stack
    };
  }
}
```

---

### Server Actions

```typescript
// src/app/actions/api-requests.ts

'use server';

import { prisma } from '@/lib/prisma';
import { generatePlaywrightTest, executePlaywrightTest } from '@/lib/playwright-executor';
import { revalidatePath } from 'next/cache';

export async function createApiRequest(data: {
  title: string;
  method: string;
  url: string;
  collectionId: string;
  userId: string;
  // ... other fields
}) {
  try {
    const request = await prisma.apiRequest.create({
      data: {
        title: data.title,
        method: data.method as any,
        url: data.url,
        collectionId: data.collectionId,
        createdBy: data.userId,
        // ... other fields
      }
    });

    revalidatePath('/api-testing');
    return { success: true, request };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function executeApiRequest(
  requestId: string,
  environmentId?: string,
  userId?: string
) {
  try {
    // 1. Fetch request configuration
    const request = await prisma.apiRequest.findUnique({
      where: { id: requestId },
      include: {
        assertions: true,
        environment: true
      }
    });

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    // 2. Fetch environment variables if specified
    let envVars = {};
    if (environmentId) {
      const environment = await prisma.environment.findUnique({
        where: { id: environmentId }
      });
      envVars = (environment?.variables as any) || {};
    }

    // 3. Generate Playwright test code
    const testCode = generatePlaywrightTest({
      method: request.method,
      url: request.url,
      headers: request.headers as any,
      queryParams: request.queryParams as any,
      body: request.body as any,
      bodyType: request.bodyType,
      assertions: request.assertions as any,
      preRequestScript: request.preRequestScript || undefined,
      environmentVariables: envVars
    });

    // 4. Execute test
    const executionResult = await executePlaywrightTest(testCode, requestId);

    // 5. Store execution results
    const execution = await prisma.apiExecution.create({
      data: {
        requestId,
        status: executionResult.status,
        statusCode: executionResult.statusCode,
        responseTime: executionResult.responseTime,
        responseBody: executionResult.responseBody,
        responseHeaders: executionResult.responseHeaders as any,
        errorMessage: executionResult.errorMessage,
        stackTrace: executionResult.stackTrace,
        assertionsPassed: executionResult.assertionsPassed,
        assertionsFailed: executionResult.assertionsFailed,
        artifacts: executionResult.artifacts as any,
        environmentId,
        executedBy: userId!
      }
    });

    revalidatePath(`/api-testing/requests/${requestId}`);

    return {
      success: true,
      execution,
      testCode // Return for display in UI
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function executeCollection(
  collectionId: string,
  environmentId?: string,
  userId?: string
) {
  try {
    // Fetch all requests in collection
    const requests = await prisma.apiRequest.findMany({
      where: { collectionId },
      orderBy: { order: 'asc' }
    });

    const results = [];

    // Execute sequentially (could be parallel with Promise.all)
    for (const request of requests) {
      const result = await executeApiRequest(
        request.id,
        environmentId,
        userId
      );
      results.push(result);
    }

    const passed = results.filter(r => r.execution?.status === 'PASSED').length;
    const failed = results.filter(r => r.execution?.status === 'FAILED').length;

    return {
      success: true,
      results,
      summary: {
        total: results.length,
        passed,
        failed,
        passRate: (passed / results.length) * 100
      }
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

---

## Integration with Existing Features

### 1. Requirements Traceability

Link API requests to requirements:

```prisma
model Requirement {
  // ... existing fields ...
  apiRequests    ApiRequest[]
}

model ApiRequest {
  // ... existing fields ...
  requirementId  String?
  requirement    Requirement? @relation(fields: [requirementId], references: [id])
}
```

**UI Enhancement:**
- Show linked API tests on requirement detail page
- Execution status badges (✓ passing tests)
- Coverage metrics (% of requirements with API tests)

---

### 2. Test Runs Integration

Include API executions in test runs:

```typescript
// When creating a test run
export async function createTestRun(data: {
  testSuiteId: string;
  includeApiTests?: boolean;
}) {
  const testRun = await prisma.testRun.create({
    data: {
      testSuiteId: data.testSuiteId,
      // ...
    }
  });

  if (data.includeApiTests) {
    // Find API requests linked to test cases in suite
    const testCases = await prisma.testCase.findMany({
      where: { testSuiteId: data.testSuiteId },
      include: { apiRequests: true }
    });

    // Execute all API requests
    for (const testCase of testCases) {
      for (const apiRequest of testCase.apiRequests) {
        await executeApiRequest(apiRequest.id, undefined, testRun.id);
      }
    }
  }

  return { success: true, testRun };
}
```

**Dashboard Enhancement:**
- Test run shows UI test results + API test results
- Combined pass/fail metrics
- Performance comparison (UI vs API execution time)

---

### 3. Defect Linking

Create defects from failed API assertions:

```typescript
// Auto-create defect when API test fails
if (executionResult.status === 'FAILED') {
  await prisma.defect.create({
    data: {
      title: `API Test Failed: ${request.title}`,
      description: `
        Request: ${request.method} ${request.url}
        Status Code: ${executionResult.statusCode}
        Error: ${executionResult.errorMessage}

        Failed Assertions:
        ${executionResult.assertionResults}
      `,
      severity: 'MEDIUM',
      status: 'OPEN',
      reportedBy: userId,
      // Link to test case if exists
      testCaseId: request.testCaseId
    }
  });
}
```

---

### 4. Analytics Dashboard

Extend analytics with API testing metrics:

```typescript
// API Testing Analytics
const apiMetrics = await prisma.apiExecution.groupBy({
  by: ['status'],
  _count: true,
  _avg: { responseTime: true },
  where: {
    executedAt: { gte: last30Days }
  }
});

// Dashboard widgets:
// - API Test Pass Rate (trend over time)
// - Average Response Time by Endpoint
// - Slowest Endpoints
// - Most Flaky API Tests
// - API Test Coverage (% of endpoints tested)
```

---

### 5. AI Insights

Apply existing AI insights to API tests:

```typescript
// Detect flaky API tests
export async function detectFlakyApiTests() {
  const apiRequests = await prisma.apiRequest.findMany({
    include: {
      executions: {
        take: 20,
        orderBy: { executedAt: 'desc' }
      }
    }
  });

  const flakyTests = [];

  for (const request of apiRequests) {
    const executions = request.executions;
    if (executions.length < 5) continue;

    const passCount = executions.filter(e => e.status === 'PASSED').length;
    const failCount = executions.filter(e => e.status === 'FAILED').length;

    // Flip-flop detection
    let flipCount = 0;
    for (let i = 1; i < executions.length; i++) {
      if (executions[i].status !== executions[i-1].status) {
        flipCount++;
      }
    }

    const flakyScore = (flipCount / executions.length) * 100;

    if (flakyScore > 30) {
      await prisma.aIInsight.create({
        data: {
          type: 'FLAKY_TEST',
          severity: flakyScore > 60 ? 'HIGH' : 'MEDIUM',
          title: `Flaky API Test: ${request.title}`,
          description: `This API test has inconsistent results (${flakyScore.toFixed(0)}% flaky score)`,
          recommendation: 'Review test for timing issues, network dependencies, or environment configuration problems',
          confidence: flakyScore,
          testCaseId: request.testCaseId
        }
      });

      flakyTests.push(request);
    }
  }

  return flakyTests;
}

// Predict API test failures
export async function predictApiFailures() {
  // Similar to existing failure prediction
  // Analyze trends in API response times, error rates
  // Flag tests likely to fail in next run
}
```

---

### 6. Collaboration Features

Apply comments, reviews, and activity logging to API tests:

```typescript
// Comments on API requests
<CommentsSection
  apiRequestId={request.id}
  currentUserId={user.id}
/>

// Review API test collections
<ReviewPanel
  entityType="api_collection"
  entityId={collection.id}
  currentUserId={user.id}
/>

// Activity timeline
await logActivity({
  action: 'API_TEST_EXECUTED',
  entityType: 'ApiRequest',
  entityId: request.id,
  userId,
  metadata: {
    status: execution.status,
    responseTime: execution.responseTime
  }
});
```

---

## Risk Assessment

### Technical Risks

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| **Dynamic test file generation conflicts** | High | Medium | Use unique test file names with request IDs, cleanup after execution |
| **Playwright execution timeout** | Medium | High | Configurable timeouts, fallback to async execution with status polling |
| **Large response payloads** | Medium | Medium | Stream responses, truncate in UI, store full response separately |
| **Environment variable security** | High | Low | Encrypt sensitive values, role-based access, audit logs |
| **Concurrent execution race conditions** | Medium | Medium | Queue system for test execution, lock mechanisms |
| **Test result parsing errors** | Low | Medium | Robust error handling, fallback to raw output |

### Business Risks

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| **User adoption (too complex)** | Medium | Medium | Intuitive UI, onboarding tutorials, AI assistance |
| **Postman migration challenges** | Low | High | Import tool, side-by-side comparison guide |
| **Performance at scale (1000+ tests)** | Medium | Medium | Pagination, parallel execution, indexing |
| **Incomplete OpenAPI import** | Low | High | Manual editing after import, AI enhancement |

### Security Risks

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| **API key exposure in logs** | High | Medium | Mask sensitive values, secure storage |
| **SSRF attacks via user-provided URLs** | High | Low | URL validation, whitelist domains |
| **Code injection via test scripts** | High | Low | Sanitize inputs, sandboxed execution |
| **Unauthorized access to API tests** | Medium | Low | Role-based permissions, audit logs |

---

## Success Criteria

### Phase 1 Success Metrics
- [ ] User can create and execute an API request in <2 minutes
- [ ] 95%+ test execution success rate
- [ ] Results display within 3 seconds of completion
- [ ] Zero data loss in execution history

### Phase 4 Success Metrics (AI Features)
- [ ] 80%+ of OpenAPI imports produce runnable tests
- [ ] AI-generated assertions are accepted 70%+ of the time
- [ ] Natural language test generation works for 60%+ of requests

### Overall Success Metrics
- [ ] 50+ active users within 3 months
- [ ] 1000+ API tests created
- [ ] 10,000+ test executions
- [ ] 4.5+ user satisfaction rating
- [ ] <5% bug report rate

---

## Appendix

### A. Comparison with Competitors

| Feature | Postman | Insomnia | QA Nexus + Playwright |
|---------|---------|----------|----------------------|
| **Request Builder** | ✅ Excellent | ✅ Good | ✅ Planned |
| **Collections** | ✅ | ✅ | ✅ Planned |
| **Environments** | ✅ | ✅ | ✅ Planned |
| **Code Generation** | ✅ Limited | ✅ Limited | ✅ Full TypeScript |
| **Test Execution** | ✅ | ✅ | ✅ Playwright-powered |
| **CI/CD Integration** | ✅ Newman | ❌ | ✅ Native Playwright |
| **Collaboration** | ✅ Paid | ❌ | ✅ Built-in (free) |
| **Version Control** | ❌ Manual | ✅ Git-based | ✅ Git-based |
| **AI Features** | ❌ | ❌ | ✅ Unique advantage |
| **Hybrid UI+API** | ❌ | ❌ | ✅ Unique advantage |
| **Requirements Traceability** | ❌ | ❌ | ✅ Built-in |
| **Defect Linking** | ❌ | ❌ | ✅ Built-in |
| **Analytics** | ✅ Paid | ❌ | ✅ Built-in |
| **Open Source** | ❌ | ✅ | ✅ |

### B. Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions, Prisma ORM
- **Database**: SQLite (dev), PostgreSQL (prod)
- **Testing**: Playwright (API + E2E)
- **AI**: OpenAI GPT-4
- **Code Editor**: Monaco Editor (for test script editing)
- **Deployment**: Vercel

### C. Resources Required

**Development Team:**
- 1 Full-stack engineer (lead)
- 1 Frontend engineer
- 1 Backend engineer
- 1 QA engineer (testing + feedback)

**Timeline:** 12 weeks (3 months)

**Infrastructure:**
- OpenAI API credits: ~$500/month
- Vercel Pro: $20/month
- PostgreSQL hosting: $25/month

**Total Budget:** ~$50K (assuming $150/hr * 3 engineers * 12 weeks)

---

## Conclusion

This plan provides a comprehensive roadmap for integrating Playwright API testing into QA Nexus. The phased approach ensures we deliver value incrementally while building toward a feature-rich platform that competes with and exceeds existing tools like Postman.

**Key Differentiators:**
1. ✅ AI-powered test generation and optimization
2. ✅ Hybrid UI + API testing in one platform
3. ✅ Built-in collaboration and traceability
4. ✅ Code-first approach with visual UI
5. ✅ Seamless integration with existing QA Nexus features

**Next Steps:**
1. Review and approve this plan
2. Set up project board and tasks
3. Begin Phase 1 implementation
4. Iterate based on user feedback

---

*Document Version: 1.0*
*Last Updated: 2025-01-15*
*Author: QA Nexus Team*
