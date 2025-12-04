# QA Nexus Architecture

## 1. System Overview

QA Nexus is an AI-powered Quality Assurance platform designed to bridge the gap between requirements, manual testing, and test automation. It leverages modern web technologies to provide a seamless experience for QA engineers.

### Core Philosophy
- **Traceability First**: Every test case must link back to a requirement (Jira Epic or Confluence Page).
- **AI as a Copilot**: AI assists in generating test cases, identifying risks, and writing automation code, but the human is always in the loop.
- **Unified Workflow**: Manage manual and automated tests in a single dashboard.

## 2. Technology Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with [Shadcn UI](https://ui.shadcn.com/) components
- **State Management**: React Server Components (RSC) for data fetching, Client Components for interactivity.

### Backend
- **Runtime**: Node.js (via Next.js Server Actions)
- **Database**: PostgreSQL (or SQLite for local dev)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)

### AI & Automation
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/docs)
- **Providers**: OpenAI (GPT-4) or Local LLMs (via Foundry)
- **Automation Engine**: [Playwright](https://playwright.dev/)

## 3. Directory Structure

```
/src
  /app              # Next.js App Router pages and layouts
    /api            # API Routes (for external integrations)
    /dashboard      # Main application dashboard
    /test-cases     # Test case management pages
    ...
  /components       # React components
    /ui             # Reusable UI atoms (buttons, inputs)
    /layout         # Sidebar, Header, etc.
    ...
  /lib              # Core business logic and utilities
    ai.ts           # AI provider configuration
    ai-automation.ts# Test generation logic
    prisma.ts       # Database client instance
    ...
  /types            # TypeScript type definitions
```

## 4. Key Components

### Data Layer (`src/lib/prisma.ts`)
We use Prisma as our ORM. The schema is defined in `prisma/schema.prisma`. All database access should go through Server Actions to ensure type safety and security.

### AI Integration (`src/lib/ai.ts`)
The `chatCompletion` function is the central entry point for all LLM interactions. It handles provider switching (OpenAI vs. Local) transparently.

### Test Generation Engine (`src/lib/ai-automation.ts`)
This module is responsible for converting natural language test cases into executable Playwright code. It includes:
- **Prompt Engineering**: Specialized prompts for generating robust test code.
- **Retry Logic**: Handles transient AI failures.
- **Fallback Mechanism**: Generates skeleton code if full automation fails.

## 5. Data Flow

1.  **User Action**: User clicks "Generate Tests" in the UI.
2.  **Server Action**: A Server Action is invoked.
3.  **AI Request**: The action calls `src/lib/ai.ts` to send a prompt to the configured LLM.
4.  **Processing**: The LLM response is parsed and validated.
5.  **Database Update**: The generated test case is saved to the database via Prisma.
6.  **UI Update**: The UI reflects the new test case via React Server Components streaming or client-side state update.

## 6. Development Guidelines

- **Strict TypeScript**: No `any` types allowed.
- **Server Actions**: Use Server Actions for all mutations.
- **Component Composition**: Build complex UIs from small, reusable components in `src/components/ui`.
