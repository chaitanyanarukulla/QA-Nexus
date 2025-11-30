# 🎯 QA Nexus

**AI-Powered End-to-End Quality Assurance Platform with Requirements Traceability & Test Automation**

A comprehensive, intelligent QA platform that transforms requirements into test cases, provides full traceability from requirements to defects, and automatically generates executable test automation. Built with Next.js 16, Prisma, and advanced AI integration.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19-blue)
![Prisma](https://img.shields.io/badge/Prisma-7.0-2D3748)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [AI Provider Configuration](#ai-provider-configuration)
- [Core Workflows](#core-workflows)
- [Requirements Traceability](#requirements-traceability)
- [Test Automation](#test-automation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)

---

## 🌟 Overview

QA Nexus is an enterprise-grade QA management platform that bridges the gap between requirements, testing, and defects. Unlike traditional test management tools, QA Nexus:

- **Analyzes Requirements**: AI-powered analysis of Jira Epics and Confluence Pages to identify risks, gaps, and missed requirements
- **Generates Test Cases**: Automatically creates comprehensive test cases with full traceability to specific requirements
- **Tracks Coverage**: Visual traceability matrix showing which test cases validate which requirements
- **Automates Testing**: One-click conversion of manual tests to Playwright automation code
- **Closes the Loop**: Complete traceability from Epic → Analysis → Test Suite → Test Cases → Test Runs → Defects

---

## ✨ Key Features

### 🤖 AI-Powered Requirements Analysis

- **Document Analysis**: Upload or sync Jira Epics and Confluence Pages
- **Risk Identification**: AI identifies potential risks with severity levels (Critical, High, Medium, Low)
- **Gap Detection**: Automatically finds gaps in requirements and test coverage
- **Missed Requirements**: Highlights requirements not addressed in documentation
- **AI Recommendations**: Actionable suggestions for improving quality

### 📊 Full Requirements Traceability

- **Coverage Matrix**: Visual matrix showing which test cases cover which risks/gaps/requirements
- **Bi-directional Links**: Navigate from requirements → test cases or test cases → requirements
- **Coverage Metrics**: Real-time calculation of requirement coverage percentage
- **Gap Identification**: Instantly see which requirements lack test coverage
- **Traceability Badges**: Visual indicators showing connections across the platform

### 🎯 Intelligent Test Generation

- **AI Test Case Creation**: Generate comprehensive test cases from requirements analysis
- **Coverage Tagging**: Each test case automatically tagged with risks/gaps/requirements it addresses
- **Priority Assignment**: AI suggests priority based on risk severity and requirement importance
- **Edge Case Coverage**: Includes positive, negative, boundary, and edge case scenarios
- **Preview & Edit**: Review AI-generated tests before saving

### 🔄 Test Automation Generation

- **Playwright Code Generation**: Convert manual test cases to production-ready Playwright tests
- **Readiness Validation**: Ensures all manual tests pass before generating automation
- **Best Practices**: Generated code follows Playwright best practices (role-based selectors, proper assertions)
- **Downloadable Tests**: Get complete `.spec.ts` files ready to run
- **Automation Tracking**: Mark tests as automated and track automation coverage

### 🌐 API Testing (Phase 1 - NEW!)

- **Visual Request Builder**: Create and execute API tests through an intuitive UI
- **Playwright-Powered**: Leverages Playwright's robust APIRequestContext for reliable test execution
- **Collections Management**: Organize API requests into logical collections and folders
- **Environment Support**: Manage multiple environments (Dev, Staging, Prod) with variable substitution
- **Request Configuration**: Full support for headers, query params, body (JSON, form-data, etc.)
- **Response Viewer**: Inspect response status, body, headers, and timing
- **Code Generation**: Automatically generates Playwright test code from visual configurations
- **Execution History**: Track all test executions with detailed results and metrics
- **Multi-Method Support**: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS

### 📝 Test Management

- **Test Cases**: Create, organize, and maintain test cases with steps and expected results
- **Test Suites**: Group related test cases into logical collections
- **Test Runs**: Execute tests with real-time progress tracking
- **Result Recording**: Pass, Fail, Blocked, Skipped, Pending statuses
- **Evidence Attachment**: Add notes and evidence to test results

### 🐛 Defect Management

- **Defect Tracking**: Create and manage defects with priority and status workflows
- **Jira Integration**: Bi-directional sync with Jira (create issues, sync status)
- **Test Result Linking**: Link defects to specific test failures
- **Traceability**: Track defects back to requirements and test cases
- **Comments**: Team discussions on defects with threaded replies

### 🤝 Collaboration Features

- **Comments System**: Add comments to test cases, test suites, and defects with threaded replies
- **Notifications**: Real-time notifications for mentions, reviews, and status changes with bell icon in header
- **Review Workflows**: Request and complete reviews with approval/rejection decisions
- **@Mentions**: Mention team members in comments to notify them
- **Activity Timeline**: Visual timeline of all actions with color-coded icons and user attribution

### 🧠 Advanced AI Features

- **Flaky Test Detection**: Automatically identifies tests with inconsistent results and calculates flaky scores
- **Predictive Analytics**: Predicts which tests are likely to fail in the next run based on trends
- **Performance Analysis**: Detects slow-running tests and provides optimization recommendations
- **AI Recommendations**: Generates intelligent suggestions for improving test quality and coverage
- **Test Prioritization**: Smart ordering of tests based on risk, flakiness, and priority
- **Insights Dashboard**: Centralized view of all AI-powered insights with filtering and resolution tracking

### 📈 Advanced Analytics

- **Interactive Dashboards**: Real-time metrics with Recharts visualizations
- **Execution Trends**: 30-day test execution history
- **Pass Rate Analysis**: Overall and per-suite pass rates
- **Defect Distribution**: Charts by priority, status, and type
- **Automation Coverage**: Track percentage of automated tests
- **Epic Metrics**: If linked to Jira Epic, show epic-level quality metrics

### 🔗 External Integration

- **Jira Integration**:
  - Import Epics for analysis
  - Create defects directly from failed tests
  - Bi-directional status sync
  - Epic-level metrics
- **Confluence Integration**:
  - Import pages for requirement analysis
  - Generate test cases from documentation
- **CI/CD Ready**: GitHub Actions workflow included for automated result import

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router, React 19, Turbopack)
- **UI Library**: Shadcn UI (Radix primitives)
- **Styling**: Tailwind CSS
- **Language**: TypeScript (Strict mode)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner (toast notifications)

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js Server Actions
- **Database**: SQLite (Prisma ORM v7.0.1)
- **Validation**: Zod
- **AI Integration**:
  - OpenAI GPT-4 (ChatGPT)
  - Foundry (local LLM support)

### Testing & Automation
- **Test Framework**: Playwright
- **Code Generation**: AI-powered TypeScript/Playwright generation

### Development
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript strict mode
- **Build Tool**: Turbopack (Next.js 16)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **AI Provider**: OpenAI API key OR local Foundry installation

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd QA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # AI Provider (choose one)
   # Option 1: OpenAI (recommended)
   OPENAI_API_KEY=your_openai_api_key_here
   AI_PROVIDER=openai

   # Option 2: Foundry (local LLM)
   # FOUNDRY_API_URL=http://localhost:8000
   # AI_PROVIDER=foundry

   # Optional: Jira/Confluence Integration
   # JIRA_BASE_URL=https://your-company.atlassian.net
   # JIRA_EMAIL=your-email@company.com
   # JIRA_API_TOKEN=your_jira_api_token
   ```

   **Getting API Keys**:
   - OpenAI: https://platform.openai.com/api-keys
   - Jira: https://id.atlassian.com/manage-profile/security/api-tokens

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

---

## 🤖 AI Provider Configuration

QA Nexus supports two AI providers:

### OpenAI (ChatGPT) - Recommended

Best for production use with high-quality results.

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...your-key...
```

**Pricing**: ~$0.02-0.05 per test case generation

### Foundry (Local LLM)

Best for privacy-sensitive environments or cost optimization.

```env
AI_PROVIDER=foundry
FOUNDRY_API_URL=http://localhost:8000
```

**Setup Foundry**:
```bash
# Install and run Foundry locally
# See Foundry documentation for setup
```

**Switching Providers**: Change `AI_PROVIDER` in Settings page (no restart required)

---

## 🔄 Core Workflows

### Workflow 1: Requirements to Test Cases

1. **Import Requirements**
   - Navigate to Analytics → Document Analysis
   - Click "Analyze New Document"
   - Select Jira Epic or Confluence Page
   - AI analyzes requirements, identifies risks/gaps

2. **Review Analysis**
   - View identified risks with severity levels
   - Review gaps in requirements
   - See missed requirements
   - Read AI recommendations

3. **Generate Test Suite**
   - Click "Generate Test Suite"
   - AI creates comprehensive test cases with coverage tags
   - Each test case linked to specific risks/gaps/requirements

4. **Review Coverage Matrix**
   - View traceability matrix
   - See coverage percentage
   - Identify gaps
   - Add additional test cases if needed

### Workflow 2: Manual Test Execution

1. **Create Test Run**
   - Navigate to test suite
   - Click "Start Execution"
   - Test run created with all test cases

2. **Execute Tests**
   - Step through each test case
   - Record results (Pass/Fail/Blocked/Skipped)
   - Add notes and evidence
   - Create defects for failures

3. **Review Results**
   - View pass rate and metrics
   - Link defects to Jira
   - Generate execution reports

### Workflow 3: Test Automation

1. **Validate Readiness**
   - Open test suite detail page
   - Scroll to "Automated Test Generation"
   - Click "Check Readiness"
   - Ensure 100% pass rate

2. **Generate Playwright Tests**
   - Enter base URL (e.g., http://localhost:3000)
   - Click "Generate Automated Tests"
   - AI converts manual steps to Playwright code

3. **Download & Run**
   - Download `.spec.ts` file
   - Copy to `tests/` directory
   - Install Playwright: `npm install -D @playwright/test`
   - Run tests: `npx playwright test`

### Workflow 4: Requirements Traceability

1. **View Traceability**
   - Epic → Test Suite (via badges on suite detail)
   - Test Suite → Test Cases (list view)
   - Test Cases → Requirements (coverage matrix)
   - Test Results → Defects (links on results)

2. **Track Coverage**
   - View coverage percentage
   - Identify uncovered requirements
   - Generate missing test cases
   - Validate complete traceability

---

## 📊 Requirements Traceability

### Traceability Chain

```
Jira Epic / Confluence Page
         ↓
    AI Analysis
         ↓
   Identified Risks/Gaps/Requirements
         ↓
    Test Suite
         ↓
   Test Cases (tagged with coverage)
         ↓
    Test Runs
         ↓
   Test Results
         ↓
     Defects
```

### Coverage Tracking

Each test case contains:
- `coversRisks`: Array of risk titles addressed
- `coversGaps`: Array of gaps covered
- `coversRequirements`: Array of requirements validated

Example:
```typescript
{
  title: "Verify user login with valid credentials",
  coversRisks: ["Authentication bypass vulnerability"],
  coversGaps: ["Missing password validation"],
  coversRequirements: ["User must authenticate with email and password"]
}
```

### Traceability Matrix

The Coverage Matrix component shows:
- All identified risks/gaps/requirements
- Which test cases cover each item
- Coverage percentage
- Uncovered items (highlighted in red)

**Navigate**: Document Analysis → [Analysis ID] → Coverage Matrix

---

## 🤖 Test Automation

### Playwright Test Generation

QA Nexus uses AI to convert manual test steps into executable Playwright tests.

#### Example Input (Manual Test)

```
Title: Verify user login

Steps:
1. Navigate to login page
2. Enter valid email
3. Enter valid password
4. Click login button

Expected Result: User is redirected to dashboard
```

#### Example Output (Playwright Test)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Test Suite: User Authentication', () => {
  test('Verify user login', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login')

    // Enter valid email
    await page.getByRole('textbox', { name: /email/i }).fill('user@example.com')

    // Enter valid password
    await page.getByRole('textbox', { name: /password/i }).fill('password123')

    // Click login button
    await page.getByRole('button', { name: /login|sign in/i }).click()

    // Expected Result: User is redirected to dashboard
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByText(/welcome/i)).toBeVisible()
  })
})
```

#### Best Practices Applied

- **Role-based selectors**: `getByRole()` for accessibility
- **Flexible matching**: Regex for text variations
- **Proper assertions**: `toHaveURL()`, `toBeVisible()`
- **TypeScript types**: Full type safety
- **Comments**: Each step documented

#### Running Generated Tests

```bash
# Install Playwright
npm install -D @playwright/test

# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/user-authentication.spec.ts

# Run in UI mode (recommended)
npx playwright test --ui

# Generate report
npx playwright show-report
```

---

## 📁 Project Structure

```
QA/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── actions/                 # Server Actions
│   │   │   ├── test-cases.ts       # Test case CRUD
│   │   │   ├── test-suites.ts      # Test suite CRUD
│   │   │   ├── test-runs.ts        # Test run execution
│   │   │   ├── defects.ts          # Defect management
│   │   │   ├── document-analysis.ts # AI analysis
│   │   │   ├── automation.ts        # Playwright generation
│   │   │   ├── jira.ts             # Jira integration
│   │   │   └── metrics.ts          # Analytics
│   │   ├── test-cases/              # Test case pages
│   │   ├── test-suites/             # Test suite pages
│   │   │   └── [id]/               # Suite detail with automation
│   │   ├── test-runs/               # Test run pages
│   │   │   └── [id]/               # Run detail with execution
│   │   ├── defects/                 # Defect pages
│   │   ├── analytics/               # Analytics dashboard
│   │   ├── document-analysis/       # Analysis pages
│   │   │   └── [id]/               # Analysis detail with coverage matrix
│   │   ├── settings/                # Settings page
│   │   ├── api/                     # API routes
│   │   │   └── import-results/     # Playwright result import
│   │   ├── layout.tsx               # Root layout with header
│   │   └── page.tsx                 # Home dashboard
│   ├── components/
│   │   ├── layout/                  # Layout components
│   │   │   └── header.tsx          # Navigation with traceability
│   │   ├── test-cases/              # Test case components
│   │   ├── test-suites/             # Test suite components
│   │   │   ├── suite-execution.tsx  # Test execution UI
│   │   │   └── epic-metrics.tsx    # Jira epic metrics
│   │   ├── test-runs/               # Test run components
│   │   ├── defects/                 # Defect components
│   │   ├── analysis/                # Analysis components
│   │   │   ├── coverage-matrix.tsx  # Traceability matrix
│   │   │   └── requirements-coverage.tsx
│   │   ├── automation/              # Automation components
│   │   │   └── automation-generator.tsx
│   │   ├── analytics/               # Analytics components
│   │   ├── common/                  # Shared components
│   │   └── ui/                      # Shadcn UI components
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── ai.ts                   # Core AI integration
│   │   ├── ai-enhanced.ts          # Coverage tagging AI
│   │   ├── ai-automation.ts        # Playwright generation AI
│   │   ├── jira.ts                 # Jira client
│   │   └── utils.ts                # Utility functions
│   └── types/
│       └── index.ts                 # TypeScript definitions
├── prisma/
│   ├── schema.prisma               # Database schema with coverage fields
│   ├── migrations/                 # Database migrations
│   └── seed.ts                     # Seed data
├── tests/                          # Playwright tests (generated)
├── scripts/                        # Utility scripts
├── .github/
│   └── workflows/
│       └── playwright.yml          # CI/CD workflow
├── playwright.config.ts            # Playwright configuration
├── .env                            # Environment variables
├── prd.md                          # Product Requirements Document
└── README.md                       # This file
```

---

## 🗄️ Database Schema

### Core Models

#### TestCase
```prisma
model TestCase {
  id          String   @id @default(cuid())
  title       String
  description String?
  steps       Json                    // Array of step strings
  expectedResult String?
  priority    Priority @default(MEDIUM)
  status      Status   @default(ACTIVE)

  // Automation
  automationId String?
  isAutomated Boolean  @default(false)

  // Relations
  suiteId     String?
  suite       TestSuite? @relation(fields: [suiteId], references: [id])

  // Requirements Traceability
  coversRisks Json?                  // Array of risk titles
  coversGaps  Json?                  // Array of gap titles
  coversRequirements Json?           // Array of requirement titles

  // Jira Integration
  jiraStoryKey String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  testResults TestResult[]
  jiraIssues  JiraIssue[]
}
```

#### DocumentAnalysis
```prisma
model DocumentAnalysis {
  id              String   @id @default(cuid())
  sourceType      SourceType
  sourceId        String
  sourceName      String
  sourceContent   String

  // Analysis Results (JSON)
  risks           Json                // Array of { title, description, severity }
  gaps            Json                // Array of { title, description }
  missedRequirements Json             // Array of { title, description }
  recommendations Json                // Array of recommendation strings
  summary         String

  // Generated Test Suite
  testSuiteId     String? @unique
  testSuite       TestSuite? @relation(fields: [testSuiteId], references: [id])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum SourceType {
  JIRA_EPIC
  CONFLUENCE_PAGE
}
```

#### TestSuite
```prisma
model TestSuite {
  id          String   @id @default(cuid())
  title       String
  description String?

  // Traceability
  jiraEpicKey String?                // Link to Jira Epic
  documentAnalysisId String? @unique
  documentAnalysis DocumentAnalysis?

  testCases   TestCase[]
  testRuns    TestRun[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Enums

```prisma
enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum Status {
  ACTIVE
  DRAFT
  DEPRECATED
}

enum RunStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  ABORTED
}

enum ResultStatus {
  PENDING
  PASS
  FAIL
  BLOCKED
  SKIPPED
}

enum DefectStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum SourceType {
  JIRA_EPIC
  CONFLUENCE_PAGE
}
```

---

## 🔌 API Documentation

### Server Actions

#### Document Analysis

```typescript
// Analyze a Jira Epic or Confluence Page
async function analyzeDocument(
  sourceType: 'JIRA_EPIC' | 'CONFLUENCE_PAGE',
  sourceId: string
): Promise<{ success: boolean; analysisId?: string; error?: string }>

// Get analysis details
async function getDocumentAnalysis(analysisId: string): Promise<AnalysisResult>

// List all analyses
async function listDocumentAnalyses(): Promise<AnalysisResult[]>
```

#### Test Automation

```typescript
// Generate Playwright tests for a suite
async function generateAutomationForSuite(
  suiteId: string,
  baseUrl: string
): Promise<{
  success: boolean
  fileName?: string
  content?: string
  testCaseCount?: number
  error?: string
}>

// Check if suite is ready for automation
async function checkAutomationReadiness(suiteId: string): Promise<{
  success: boolean
  ready: boolean
  passRate: number
  totalTests: number
  passedTests: number
  reason: string
}>
```

#### Test Execution

```typescript
// Create test run from suite
async function createTestRunFromSuite(
  userId: string,
  suiteId: string
): Promise<TestRun>

// Update test result
async function updateTestResult(
  resultId: string,
  status: ResultStatus,
  notes?: string,
  evidence?: string
): Promise<TestResult>
```

### REST API Endpoints

#### Import Playwright Results

```http
POST /api/import-results
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "suiteTitle": "User Authentication",
  "results": [
    {
      "testTitle": "Verify user login",
      "status": "PASS",
      "duration": 1234,
      "error": null
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "testRunId": "clx123456",
  "importedCount": 1
}
```

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev                    # Start dev server (Turbopack)
npm run build                  # Build for production
npm start                      # Start production server
npm run lint                   # Run ESLint

# Database
npm run db:seed                # Seed database with demo data
npx prisma studio              # Open Prisma Studio GUI
npx prisma migrate dev         # Create and apply migration
npx prisma generate            # Generate Prisma Client
npx prisma db push             # Push schema without migration

# Testing
npx playwright test            # Run Playwright tests
npx playwright test --ui       # Run tests in UI mode
npx playwright show-report     # View test report
```

### Code Style Guidelines

This project follows strict coding standards:

- **UI Components**: Shadcn UI only (no custom components)
- **Styling**: Tailwind CSS only (no CSS modules or styled-components)
- **TypeScript**: Strict mode enabled
- **Code Reuse**: Reuse before creating new components
- **Dead Code**: Aggressive removal of unused code
- **Testing**: No mocks (real database, real API calls)

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import in Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your repository

3. **Configure Environment Variables**
   ```
   DATABASE_URL=your_production_db_url
   OPENAI_API_KEY=your_openai_key
   AI_PROVIDER=openai
   ```

4. **Deploy**
   - Vercel automatically deploys on push

### Docker

```bash
# Build image
docker build -t qa-nexus .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -e OPENAI_API_KEY="your_key" \
  -e AI_PROVIDER="openai" \
  qa-nexus
```

### CI/CD Integration

QA Nexus includes a GitHub Actions workflow for automated testing:

**.github/workflows/playwright.yml**
- Runs on every push and PR
- Executes Playwright tests
- Automatically imports results to QA Nexus

**Setup**:
1. Add GitHub Secrets:
   - `QA_NEXUS_URL`: Your deployed URL
   - `QA_NEXUS_API_KEY`: Your API key
2. Push to GitHub
3. Results automatically imported after each run

---

## 🗺️ Roadmap

### Completed Features ✅

- Core test management (cases, suites, runs)
- Defect tracking with Jira integration
- AI-powered requirements analysis
- Automatic test case generation with coverage tagging
- Requirements traceability matrix
- Playwright test automation generation
- Advanced analytics dashboard
- Jira Epic and Confluence integration
- CI/CD GitHub Actions workflow
- **Phase 5 - Collaboration**: Comments, notifications, reviews, @mentions, activity timeline
- **Phase 6 - Advanced AI**: Flaky test detection, predictive analytics, AI insights dashboard

### Upcoming Features 🚀

- **Phase 9**: Enterprise Features
  - Multi-tenant architecture
  - RBAC (Role-Based Access Control)
  - SSO integration
  - Advanced reporting (PDF/Excel export)

---

## 📄 License

MIT

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the Repository**
2. **Create Feature Branch** (`git checkout -b feature/amazing-feature`)
3. **Follow Code Style** (see Development section)
4. **Write Tests** (if applicable)
5. **Commit Changes** (`git commit -m 'feat: add amazing feature'`)
6. **Push to Branch** (`git push origin feature/amazing-feature`)
7. **Open Pull Request**

---

## 📧 Support

For support, email support@qanexus.com or open an issue.

---

**Built with ❤️ using Next.js 16, React 19, Prisma, and AI**

**Made by**: QA Engineers, for QA Engineers
