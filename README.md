
# 🚀 **QA Nexus – AI-Driven Quality Engineering Platform**

*Next-Generation Requirements Analysis, Test Management, Automation & Traceability*

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)

---

# 📚 **Table of Contents**

* [🎉 What’s New in v3.0.0](#-whats-new-in-v300)
* [🌟 Overview](#-overview)
* [✨ Key Features](#-key-features)
* [🛠️ Tech Stack](#️-tech-stack)
* [🚀 Getting Started](#-getting-started)
* [🤖 AI Provider Configuration](#-ai-provider-configuration)
* [🔄 Core Workflows](#-core-workflows)
* [📂 Project Structure](#-project-structure)
* [🗄 Database Schema](#-database-schema)
* [📡 API Documentation](#-api-documentation)
* [🛠 Troubleshooting](#-troubleshooting)
* [🧪 Development](#-development)
* [🚢 Deployment](#-deployment)
* [🗺 Roadmap](#-roadmap)
* [🤝 Contributing](#-contributing)
* [📄 License](#-license)

---

# 🎉 **What’s New in v3.0.0**

## 🚀 Performance Testing (k6 Integration)

* Load testing dashboard
* Configurable VUs, duration & thresholds
* k6 test execution with real-time metrics
* Historical performance analytics
* Regression detection

## ✅ API Testing Suite (Playwright-Powered)

* No-code visual API request builder
* OpenAPI / Swagger import
* Collections & environment management
* AI-generated assertions
* Full auth support (OAuth2, API Key, SigV4, Basic, Bearer)
* Playwright code generation
* Pre-request scripts
* Request chaining
* GraphQL builder
* Execution history & reports

## 🤝 Collaboration & Governance

* Threaded comments & @mentions
* Review workflows & approvals
* Activity timelines & notifications

## 🧠 Advanced AI Intelligence

* Risk, gap, requirement & recommendation analysis (5–7 insights each)
* Automatic 30-test extensive test case generation
* Flaky test detection with confidence
* Predictive failure & performance analysis
* AI insights dashboard
* File-based analysis (PDF, TXT)
* Interactive conversational refinement

## 🎨 UI/UX Enhancements

* Full dark mode (persistent settings)
* Responsive layouts
* Polished empty states
* Visual hierarchy improvements
* Hydration/rendering stability fixes

---

# 🌟 **Overview**

**QA Nexus** is a modern AI-powered Quality Engineering platform combining:

* Requirements analysis
* Full traceability
* Manual & automated testing
* Defect management
* Predictive analytics
* CI/CD integration

## **End-to-End Traceability Flow**

```
Jira / Confluence
        ↓
     AI Analysis
        ↓
Risks • Gaps • Requirements
        ↓
     Test Suites
        ↓
     Test Cases
        ↓
      Test Runs
        ↓
     Test Results
        ↓
       Defects
```

---

# ✨ **Key Features**

## 🤖 AI-Powered Requirement Analysis

* Jira Epic & Confluence ingestion
* Risk scoring & gap detection
* Quality recommendations
* Traceability auto-generation

## 📊 Traceability & Coverage

* Live real-time coverage matrix
* Bi-directional linking
* Coverage gap detection
* Traceability badges

## 🎯 Intelligent Test Generation

* AI-generated test suites & cases
* Risk-based prioritization
* Boundary & edge-case generation
* Editable human-in-the-loop workflows

## 🔄 Test Automation

* Playwright automation generation
* Selector & assertion validation
* Downloadable `.spec.ts` files
* Automation coverage reporting

## 🌐 API Testing (v3.0)

* Visual request builder
* Full HTTP/GraphQL support
* Auth handling
* Code generation & history

## 📝 Test Management

* Test suites, cases, runs
* Evidence attachments
* Result states: Pass/Fail/Blocked/Skipped

## 🐛 Defect Management

* Built-in defect tracking
* Jira bi-directional sync
* Relationship mapping to test results

## 🤝 Collaboration

* Reviews, approvals
* Threaded comments
* Mentions & notifications
* Audit activity logs

## 🧠 Advanced AI Insights

* Flaky test scoring
* Predictive risk analytics
* Test prioritization
* Optimization recommendations

## 📈 Analytics & Reporting

* Pass-rate trends
* Defect analytics
* Automation coverage
* Epic-level health metrics

## 🔗 Integrations

* Jira Epics / Issues
* Confluence Documents
* GitHub Actions

---

# 🛠️ **Tech Stack**

## **Frontend**

* Next.js 16 (App Router)
* React 19
* TypeScript (strict)
* Tailwind CSS
* Shadcn UI + Radix
* Recharts
* Lucide Icons

## **Backend**

* Node.js 18+
* Next.js Server Actions
* Prisma ORM 5.22
* PostgreSQL / SQLite
* Zod Validation

## **AI**

* OpenAI GPT-4
* Foundry (Local LLM)

## **Testing**

* Playwright
* AI-generated test automation

---

# 🚀 **Getting Started**

You can run QA Nexus **locally** or using **Docker**.

---

## **Option 1: Local Development (Recommended)**

### **Prerequisites**

* Node.js 18+
* npm 9+
* PostgreSQL 15+
* OpenAI API key (or local Foundry LLM)

### **1. Clone Repository**

```bash
git clone <repository-url>
cd QA
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Configure Environment**

```bash
cp .env.example .env
```

Update your `.env` values.

### **4. Database Setup**

```bash
npx prisma generate
npx prisma migrate deploy
npm run db:seed   # optional recommended
```

### **5. Start Application**

```bash
npm run dev
```

Access: **[http://localhost:3004](http://localhost:3004)**

---

## **Option 2: Docker Deployment**

### **Prerequisites**

* Docker
* Docker Compose

### **1. Prepare Environment**

```bash
cp .env.example .env
```

### **2. Build & Start**

```bash
docker-compose up -d --build
```

### **3. Run Migrations**

#### From host:

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/qanexus?schema=public"
npx prisma migrate deploy
npm run db:seed
```

#### OR inside container:

```bash
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npm run db:seed
```

### **4. Access**

Visit **[http://localhost:3004](http://localhost:3004)**

---

# 🤖 **AI Provider Configuration**

### **OpenAI**

```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
```

### **Foundry (Local LLM)**

```
AI_PROVIDER=foundry
FOUNDRY_API_URL=http://localhost:8000
```

Switch providers anytime in the **Settings** panel.

---

# 🔄 **Core Workflows**

## **1. Requirements → Test Cases**

1. Import from Jira or Confluence
2. Run AI analysis
3. Review risks & recommendations
4. Auto-generate suites
5. Validate traceability

## **2. Manual Test Execution**

1. Create test run
2. Execute steps
3. Capture evidence
4. Auto-generate defects

## **3. Test Automation**

1. Validate automation readiness
2. Generate Playwright `.spec.ts`
3. Download & execute
4. Import execution results

---

# 📂 **Project Structure**

```
/
├── prisma/                # Database schema and migrations
├── public/                # Static assets
├── scripts/               # Utility scripts
├── src/
│   ├── app/               # Next.js App Router pages and API routes
│   ├── components/        # React components
│   ├── lib/               # Utility functions and libraries
│   └── ...
├── tests/                 # Test suites
├── docs/                  # Documentation files
├── .env.example           # Environment variables example
├── package.json           # Project dependencies and scripts
└── README.md              # Project documentation
```

---

# 🗄 **Database Schema**

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User**: Application users with roles (TESTER, etc.).
- **TestCase**: Test cases with steps, expected results, and AI insights.
- **TestRun**: Execution of a test suite or set of test cases.
- **TestResult**: Result of a single test case execution.
- **Defect**: Bugs/defects found during testing, linked to Jira.
- **JiraIntegration**: Configuration for Jira integration.
- **AIProviderSettings**: Settings for AI providers (OpenAI, Foundry).
- **ApiCollection/ApiRequest**: API testing capabilities.
- **PerformanceTest**: Performance testing configurations (k6).

For the full schema, refer to [`prisma/schema.prisma`](prisma/schema.prisma).

---

# 📡 **API Documentation**

## AI Routes
- `POST /api/ai/generate-assertions`: Generate API assertions using AI.
- `POST /api/ai/generate-mock-data`: Generate mock data based on schema/description.
- `POST /api/ai/generate-request`: Generate API request details from a prompt.

## CI/CD & Export
- `POST /api/export/cicd`: Export API collections to Playwright, Newman, GitHub Actions, GitLab CI, or Jenkins formats.
- `POST /api/import-results`: Import test results from external sources.

## Performance Testing
- `POST /api/performance/run-test`: Execute performance tests (load, stress, spike, soak).

## Integrations
- `POST /api/webhooks/jira`: Handle incoming Jira webhooks (issue updates, deletions).

## System
- `GET /api/health`: Application health check.

---

# 🛠 **Troubleshooting**

* Database connection issues
* Migration failures
* Missing API keys
* Docker permission errors

---

# 🧪 **Development**

* Code standards
* Linting rules
* Testing guidelines
* PR requirements

---

# 🚢 **Deployment**

## **Vercel (Recommended)**

* Zero-config Next.js
* Automatic builds
* Managed environment variables

## **Docker**

* Enterprise-ready
* Local or production clusters

## **CI/CD**

* GitHub Actions pipeline
* Playwright test integration

---

# 🗺 **Roadmap**

## **Completed**

✓ Core test management
✓ Jira sync
✓ AI analysis
✓ API testing suite
✓ Collaboration tools
✓ Predictive analytics
✓ Performance testing

## **Upcoming**

* RBAC & SSO
* Multi-tenant support
* PDF / Excel reporting
* Appium mobile automation

---

# 🤝 **Contributing**

Standard GitHub fork → branch → PR workflow.
Follow strict coding standards & commit conventions.

---

# 📄 **License**

**MIT License**

---

# 📧 **Support**

* GitHub Issues
* Internal documentation
* Phase guides

---

Built with ❤️ using **Next.js, React, Prisma, and AI**
**Author: Chai Narukulla – Built for QA Engineers**

---

