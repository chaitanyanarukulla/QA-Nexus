# QA Nexus: System Design & Testing Epics

## 📚 Document Overview
This document serves as the central repository for the QA Nexus platform's design specifications and testing requirements. It is intended for use in Jira (as Epics/Stories) and Confluence (as Design Documentation).

---

# Part 1: System Design Document

## 1. Executive Summary
QA Nexus is an enterprise-grade, AI-powered Quality Assurance platform designed to bridge the gap between requirements, manual testing, and test automation. It leverages advanced LLMs (OpenAI/Foundry) to analyze requirements, generate test cases, and create automated Playwright scripts, while providing full traceability from Jira Epics to Defects.

## 2. System Architecture

### 2.1 High-Level Architecture
The application follows a modern Next.js App Router architecture with Server Actions for backend logic, ensuring type safety and performance.

```mermaid
graph TD
    Client[Client Browser] -->|HTTP/HTTPS| NextJS[Next.js Server]
    NextJS -->|Server Actions| Controller[Business Logic Layer]
    
    subgraph "Core Services"
        Controller -->|CRUD| Prisma[Prisma ORM]
        Controller -->|Analysis/Gen| AI[AI Service Adapter]
        Controller -->|Sync| Jira[Jira Integration Service]
        Controller -->|Exec| Playwright[Playwright Runner]
    end
    
    subgraph "Data Persistence"
        Prisma --> SQLite[(SQLite Database)]
    end
    
    subgraph "External Services"
        AI --> OpenAI[OpenAI API]
        AI --> Foundry[Local Foundry LLM]
        Jira --> Atlassian[Atlassian Cloud]
    end
```

### 2.2 Technology Stack
- **Frontend**: Next.js 16 (React 19), Tailwind CSS, Shadcn UI, Lucide Icons, Recharts
- **Backend**: Next.js Server Actions, Node.js 18+
- **Database**: SQLite with Prisma ORM v7.0
- **Testing Engine**: Playwright (for automation execution)
- **AI Integration**: OpenAI SDK (compatible with OpenAI & Local LLMs)
- **Validation**: Zod schemas

### 2.3 Project Structure
The project is organized as follows:
- **`src/app`**: Next.js App Router pages and layouts.
- **`src/app/actions`**: Server Actions containing business logic and database interactions.
- **`src/app/api`**: API Routes for external integrations.
- **`src/lib`**: Core utilities and services:
    - `ai.ts`: AI service adapter (OpenAI/Foundry).
    - `jira.ts`: Jira integration client.
    - `playwright-executor.ts`: Test execution engine.
    - `playwright-generator.ts`: Code generation logic.
- **`src/components`**: Reusable UI components.
- **`prisma`**: Database schema and migrations.

## 3. Data Model (Core Entities)

### 3.1 Primary Entities
- **User**: System users with roles (Admin, Tester, Developer).
- **TestCase**: Individual test scenarios with steps, priority, and status.
- **TestSuite**: Collections of test cases, often mapped to Jira Epics.
- **TestRun**: Execution instances of Test Suites.
- **TestResult**: Outcome (Pass/Fail) of a Test Case within a Run.
- **Defect**: Bugs found during testing, linked to Jira Issues.
- **DocumentAnalysis**: AI analysis of requirements (Risks, Gaps).
- **ApiCollection/Request**: API testing structures.

### 3.2 Key Relationships
- **Traceability**: `DocumentAnalysis` -> `TestSuite` -> `TestCase` -> `TestResult` -> `Defect`
- **Jira Mapping**: `JiraEpic` -> `TestSuite`, `JiraStory` -> `TestCase`, `JiraIssue` -> `Defect`

## 4. Key Modules

### 4.1 AI Core
- **Requirement Analysis**: Extracts risks, gaps, and requirements from text.
- **Test Generation**: Creates structured test cases from requirements.
- **Automation Generation**: Converts manual steps to Playwright code.
- **Insight Engine**: Predicts flakiness and failure risks.

### 4.2 Automation Engine
- **Code Generator**: Translates natural language steps to TypeScript/Playwright.
- **Execution Runner**: Runs Playwright tests in a headless browser environment.
- **Result Parser**: Ingests JSON results back into the database.

### 4.3 API Testing Engine
- **Request Builder**: Visual interface for HTTP requests.
- **Collection Runner**: Sequential execution of request groups.
- **AI Assertion Generator**: Creates validation logic from responses.

---

# Part 2: Epics & User Stories

Use these Epics to organize your Jira backlog. Each User Story represents a testable feature.

## 🚀 Epic 1: Dashboard & Analytics
**Description**: Provide a centralized view of quality metrics, recent activity, and AI insights to help teams make data-driven decisions.

### User Stories
1.  **View Overall Metrics**
    *   *As a QA Manager, I want to see total test cases, pass rates, and open defects so that I can gauge project health.*
    *   **Acceptance Criteria**: Display cards for Total Tests, Pass Rate %, Open Defects, and Automation Coverage %.
2.  **Analyze Execution Trends**
    *   *As a Tester, I want to see a chart of test executions over the last 30 days so that I can track testing velocity.*
    *   **Acceptance Criteria**: Line chart showing Pass/Fail counts by date.
3.  **View Recent Activity**
    *   *As a User, I want to see a feed of recent actions (created tests, runs, comments) so that I stay updated.*
    *   **Acceptance Criteria**: List of last 10 activities with user, action type, and timestamp.
4.  **Monitor AI Insights**
    *   *As a Lead, I want to see flaky tests and failure predictions so that I can prioritize maintenance.*
    *   **Acceptance Criteria**: Dashboard widget listing top 5 risky/flaky tests.
5.  **Release Readiness Score**
    *   *As a Manager, I want a single score to determine if we are ready to ship.*
    *   **Acceptance Criteria**: "Quality Score" (0-100) calculated from Pass Rate, Automation Coverage, and Defect Resolution Rate.
    *   **Implementation**: Calculated in `getAnalyticsData` in `src/app/actions/analytics.ts`.

## 🧪 Epic 2: Test Case Management
**Description**: Comprehensive management of manual test cases, including creation, editing, organization, and versioning.

### User Stories
1.  **Create Manual Test Case**
    *   *As a Tester, I want to create a test case with title, steps, expected results, and priority.*
    *   **Acceptance Criteria**: Form saves successfully; appears in list; supports rich text or step-by-step input.
2.  **Edit & Delete Test Cases**
    *   *As a Tester, I want to update or remove test cases as requirements change.*
    *   **Acceptance Criteria**: Edit updates DB; Delete removes (or archives) the case.
3.  **Filter & Search Test Cases**
    *   *As a User, I want to filter tests by priority, status, and suite.*
    *   **Acceptance Criteria**: Search bar works; dropdown filters update the list list.
4.  **AI Test Improvement**
    *   *As a Tester, I want AI to suggest improvements to my test steps for clarity.*
    *   **Acceptance Criteria**: "Improve with AI" button updates the description/steps text.

## 📦 Epic 3: Test Suite Management
**Description**: Grouping test cases into logical suites for organization and batch execution.

### User Stories
1.  **Create Test Suite**
    *   *As a Lead, I want to create a suite (e.g., "Smoke Test", "Regression") and assign test cases to it.*
    *   **Acceptance Criteria**: Suite creation form; ability to select multiple test cases to add.
2.  **Link Suite to Jira Epic**
    *   *As a Manager, I want to link a suite to a Jira Epic Key so that I can track coverage.*
    *   **Acceptance Criteria**: Input field for Jira Key; fetches Epic details if integration is active.
3.  **Automation Readiness Check**
    *   *As an Automation Engineer, I want to check if a suite is ready for automation (all tests passing manually).*
    *   **Acceptance Criteria**: Visual indicator of % tests passing; "Ready for Automation" badge.

## ▶️ Epic 4: Test Execution & Runs
**Description**: Executing test suites, recording results, and tracking history.

### User Stories
1.  **Start Test Run**
    *   *As a Tester, I want to start a new execution run for a specific suite.*
    *   **Acceptance Criteria**: Creates a `TestRun` record; status set to "In Progress".
2.  **Execute Test Steps**
    *   *As a Tester, I want to mark individual test cases as Pass, Fail, or Skipped during a run.*
    *   **Acceptance Criteria**: Interface to cycle through tests; buttons for status; progress bar updates.
3.  **Add Evidence & Notes**
    *   *As a Tester, I want to attach screenshots or notes to a failed test result.*
    *   **Acceptance Criteria**: Text area for notes; file upload or URL input for evidence.
4.  **View Run History**
    *   *As a User, I want to see past execution runs and their outcomes.*
    *   **Acceptance Criteria**: List of past runs; detail view showing results of each case in that run.

## 🐛 Epic 5: Defect Management & Jira Integration
**Description**: Tracking bugs found during testing and syncing them with Jira.

### User Stories
1.  **Create Defect from Failure**
    *   *As a Tester, I want to create a defect immediately when a test fails.*
    *   **Acceptance Criteria**: "Create Defect" button on failed test result; pre-fills data from test case.
2.  **Sync with Jira**
    *   *As a User, I want defects created in QA Nexus to automatically create Jira Issues.*
    *   **Acceptance Criteria**: Jira Issue created; Jira Key saved in QA Nexus; link provided.
3.  **Bi-directional Sync**
    *   *As a User, I want status changes in Jira (e.g., "Done") to reflect in QA Nexus.*
    *   **Acceptance Criteria**: Webhook or polling updates QA Nexus defect status when Jira issue updates.

## 🧠 Epic 6: AI-Powered Document Analysis
**Description**: Using AI to analyze requirements documents and generate test assets.

### User Stories
1.  **Analyze Requirements Text**
    *   *As a QA Lead, I want to paste requirements or select a Jira Epic to analyze for risks and gaps.*
    *   **Acceptance Criteria**: AI returns list of Risks (Severity, Impact), Gaps (Category, Suggestion), and Missed Requirements.
    *   **Implementation**: Uses `analyzeDocument` from `src/lib/ai.ts`.
2.  **Generate Test Cases from Analysis**
    *   *As a Tester, I want to generate a full test suite based on the AI analysis.*
    *   **Acceptance Criteria**: "Generate Tests" button creates Test Cases in DB linked to the analysis. Supports edge cases and negative scenarios options.
    *   **Implementation**: Uses `generateTestCases` from `src/lib/ai.ts`.
3.  **Traceability Matrix**
    *   *As a Manager, I want to see which test cases cover which requirements/risks.*
    *   **Acceptance Criteria**: Visual matrix showing relationships between Requirements and Test Cases.

## 🔌 Epic 7: API Testing Platform
**Description**: A complete environment for creating, organizing, and running API tests.

### User Stories
1.  **Visual Request Builder**
    *   *As a Tester, I want a UI to create HTTP requests (GET, POST, etc.) without writing code.*
    *   **Acceptance Criteria**: Inputs for URL, Method, Headers, Body, Params; "Send" button works. Supports variable substitution (e.g., `{{baseUrl}}`).
2.  **Import OpenAPI Spec**
    *   *As a Developer, I want to import a Swagger/OpenAPI JSON file to automatically create test collections.*
    *   **Acceptance Criteria**: Upload dialog; parses spec; creates Collections and Requests in DB.
3.  **AI Request Generation**
    *   *As a Tester, I want to describe a request in English and have AI build it for me.*
    *   **Acceptance Criteria**: "Generate" dialog; input prompt; populates Request Builder fields.
    *   **Implementation**: Uses `generateApiRequest` from `src/lib/ai.ts`.
4.  **AI Assertion Generation**
    *   *As a Tester, I want AI to analyze a response and suggest validation assertions.*
    *   **Acceptance Criteria**: "Generate Assertions" button; adds checks for status code, schema, and data.
    *   **Implementation**: Uses `generateApiAssertions` from `src/lib/ai.ts`.
5.  **Playwright Code Export**
    *   *As an Automation Engineer, I want to export my API tests as executable Playwright code.*
    *   **Acceptance Criteria**: "Export Code" button; generates valid `test('...', async ({ request }) => { ... })` code block.
    *   **Implementation**: Uses `generatePlaywrightTest` from `src/lib/playwright-generator.ts`.
6.  **Performance Testing**
    *   *As a Tester, I want to run load tests on my API endpoints to check for bottlenecks.*
    *   **Acceptance Criteria**: "Run Load Test" option; configurable users/duration; reports latency and error rates.
7.  **CI/CD Export**
    *   *As a DevOps Engineer, I want to export test collections as CI-ready scripts (GitHub Actions/GitLab CI).*
    *   **Acceptance Criteria**: Export dialog with CI provider selection; generates YAML configuration.
8.  **GraphQL Support**
    *   *As a Developer, I want to test GraphQL endpoints with query/mutation support.*
    *   **Acceptance Criteria**: GraphQL body editor with syntax highlighting; supports variables and schema fetching.
9.  **Request Chaining**
    *   *As a Tester, I want to use values from one request (e.g., auth token) in subsequent requests.*
    *   **Acceptance Criteria**: UI to extract response fields into variables; variables usable in next request headers/body.

## 🤝 Epic 8: Collaboration
**Description**: Features enabling team communication and review processes.

### User Stories
1.  **Comment on Assets**
    *   *As a User, I want to add comments to test cases, runs, and defects.*
    *   **Acceptance Criteria**: Comment section on detail pages; supports threading.
2.  **Request Review**
    *   *As a Tester, I want to request a peer review for a new test suite.*
    *   **Acceptance Criteria**: "Request Review" action; assigns to user; status changes to "In Review".
3.  **Notifications**
    *   *As a User, I want to be notified when I am mentioned or assigned a review.*
    *   **Acceptance Criteria**: Notification bell icon; list of unread notifications.

## ⚙️ Epic 9: Settings & Configuration
**Description**: System-wide configuration for AI providers and integrations.

### User Stories
1.  **Configure AI Provider**
    *   *As an Admin, I want to switch between OpenAI and Local Foundry LLM.*
    *   **Acceptance Criteria**: Settings form; API Key input for OpenAI; URL input for Foundry; persists to DB.
2.  **Configure Jira Connection**
    *   *As an Admin, I want to set up the Jira URL and API Token.*
    *   **Acceptance Criteria**: Connection test button; secure storage of tokens.

## 🔮 Epic 10: AI Insights & Analytics
**Description**: Advanced AI features for predictive quality analysis and natural language data querying.

### User Stories
1.  **Flaky Test Detection**
    *   *As a Lead, I want to identify tests that frequently toggle between pass/fail.*
    *   **Acceptance Criteria**: System analyzes execution history; assigns "Flaky Score" (0-100); alerts user.
2.  **Failure Prediction**
    *   *As a Tester, I want to know which tests are likely to fail in the next run.*
    *   **Acceptance Criteria**: AI model predicts failure probability based on code changes and history.
3.  **Chat with Data (QA Assistant)**
    *   *As a Manager, I want to ask questions like "How many critical bugs were found last week?" and get an answer.*
    *   **Acceptance Criteria**: Chat interface; AI queries database context (`testCases`, `defects`, `testRuns`) and returns natural language answer.
    *   **Implementation**: Uses `answerQuestion` from `src/lib/ai.ts`.

## 🤖 Epic 11: Automation Engine
**Description**: The core engine for generating, executing, and reporting on automated tests.

### User Stories
1.  **Execute Playwright Tests**
    *   *As a System, I need to execute generated Playwright scripts in a controlled environment.*
    *   **Acceptance Criteria**: `executePlaywrightTest` function runs `npx playwright test`; captures stdout/stderr.
2.  **Parse Execution Results**
    *   *As a System, I need to parse JSON results from Playwright into database records.*
    *   **Acceptance Criteria**: Maps Playwright JSON report to `TestResult` and `ApiExecution` models.
3.  **Parallel Execution**
    *   *As a User, I want to run multiple tests simultaneously to save time.*
    *   **Acceptance Criteria**: Support for `Promise.all` execution of test batches.

---

# Part 3: API Reference

The application exposes APIs through two primary mechanisms: **Server Actions** (for internal frontend usage) and **API Routes** (for external integrations and specific HTTP-based features).

## 1. Server Actions (Internal API)

These actions are located in `src/app/actions` and are directly callable by React Client Components.

### 🤖 AI Services
| Action | Description |
| :--- | :--- |
| `generateAndSaveTestCases` | Generates test cases from requirements and optionally saves them. |
| `generateAssertionsForRequest` | Analyzes an API response and suggests validation assertions. |
| `generateRequestFromPrompt` | Converts a natural language prompt into a structured API request. |
| `runInsightsAnalysis` | Triggers a full analysis of test history to detect flakes and risks. |
| `getTestHealthScore` | Calculates a 0-100 health score for a specific test case. |
| `getPrioritizedTests` | Returns a list of tests sorted by risk and importance. |

### 🧪 API Testing Platform
| Action | Description |
| :--- | :--- |
| `createCollection` / `getCollections` | Manages test collections. |
| `createApiRequest` / `updateApiRequest` | CRUD operations for API request definitions. |
| `executeApiRequest` | Executes a single request via Playwright and stores results. |
| `executeCollection` | Runs all requests in a collection sequentially. |
| `importOpenAPISpec` | Parses a Swagger/OpenAPI file and generates collections/requests. |
| `getApiTestingStats` | Returns dashboard metrics for API testing. |

### 🔗 Traceability & Requirements
| Action | Description |
| :--- | :--- |
| `getTraceabilityMatrix` | Returns the full matrix linking Requirements → Suites → Tests. |
| `getRequirementCoverage` | Calculates testing coverage stats for a specific document. |

### ⚙️ Integrations & Webhooks
| Action | Description |
| :--- | :--- |
| `registerJiraWebhook` | Registers the QA Nexus webhook with the connected Jira instance. |
| `getWebhookSettings` | Retrieves secret and status for the Jira webhook. |
| `getWebhookLogs` | Returns a history of received webhook events. |

## 2. API Routes (External API)

These endpoints are available at `/api/...` and handle standard HTTP requests.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/ai/generate-assertions` | `POST` | Generates assertions from a provided response body. |
| `/api/ai/generate-mock-data` | `POST` | Generates realistic mock data based on a schema. |
| `/api/ai/generate-request` | `POST` | Generates an API request structure from a text prompt. |
| `/api/export/cicd` | `GET` | Exports test suites in a format suitable for CI/CD pipelines. |
| `/api/webhooks/jira` | `POST` | Receives and processes events from Jira (Issue Created/Updated). |

## 3. External Integrations

The application consumes the following external APIs via `src/lib`:

- **OpenAI API**: Used for all AI generation and analysis tasks.
- **Jira Cloud REST API v3**: Used for syncing issues, epics, and comments.
- **Playwright**: Used as an internal service for executing HTTP requests and browser tests.
