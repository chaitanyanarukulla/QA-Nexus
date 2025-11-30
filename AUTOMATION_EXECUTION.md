# Playwright Test Execution Design

## Overview

Enable execution of Playwright tests directly from QA Nexus against configurable environments, with real-time progress tracking and automatic result capture.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         QA Nexus UI                              │
├─────────────────────────────────────────────────────────────────┤
│  Test Suite Detail Page                                          │
│  ├─ Environment Selector (Dev, Staging, Prod, Custom)           │
│  ├─ Execute Button                                               │
│  └─ Real-time Progress Display                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Execution Service                             │
├─────────────────────────────────────────────────────────────────┤
│  Server Action: executeAutomatedTests()                          │
│  ├─ 1. Get/Generate Playwright code                             │
│  ├─ 2. Write temporary test file                                │
│  ├─ 3. Run Playwright with reporter                             │
│  ├─ 4. Stream progress back to UI                               │
│  └─ 5. Parse results and save to DB                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Playwright Runner                             │
├─────────────────────────────────────────────────────────────────┤
│  - Runs tests in isolated environment                           │
│  - JSON reporter for structured output                           │
│  - Screenshots/videos on failure                                 │
│  - Parallel execution support                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Result Processing                             │
├─────────────────────────────────────────────────────────────────┤
│  - Create TestRun record                                         │
│  - Create TestResult for each test                               │
│  - Store execution metadata (duration, environment, etc)         │
│  - Link to test cases                                            │
│  - Store artifacts (screenshots, traces)                         │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema Changes

### 1. Environment Model

```prisma
model Environment {
  id          String   @id @default(cuid())
  name        String   // "Development", "Staging", "Production"
  baseUrl     String   // "http://localhost:3000"
  description String?
  isActive    Boolean  @default(true)

  // Configuration
  config      Json?    // Additional config like auth, timeouts

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  testRuns    TestRun[]
}
```

### 2. TestRun Enhancement

```prisma
model TestRun {
  // ... existing fields ...

  // Automation fields
  executionType   ExecutionType @default(MANUAL)
  environmentId   String?
  environment     Environment?  @relation(fields: [environmentId], references: [id])

  // Execution metadata
  executionDuration Int?       // milliseconds
  automatedBy       String?    // User who triggered
  playwrightVersion String?

  // Artifacts
  artifacts         Json?      // Screenshots, videos, traces
}

enum ExecutionType {
  MANUAL
  AUTOMATED
  CI_CD
}
```

### 3. TestResult Enhancement

```prisma
model TestResult {
  // ... existing fields ...

  // Automation fields
  duration      Int?          // milliseconds
  retries       Int?          // Number of retries
  errorMessage  String?       // Full error message
  errorStack    String?       // Stack trace

  // Artifacts
  screenshotUrl String?
  videoUrl      String?
  traceUrl      String?
}
```

## Implementation Plan

### Phase 1: Setup & Configuration

1. **Environment Management**
   - Settings page: Add environment configuration
   - CRUD operations for environments
   - Default environments (Dev, Staging, Prod)
   - Custom environment support

2. **Playwright Setup in QA Nexus**
   - Add Playwright as production dependency
   - Configure playwright.config.ts for programmatic use
   - Set up artifact storage (local filesystem or S3)

### Phase 2: Test Storage & Retrieval

1. **Test Code Storage**
   - Store generated Playwright code in database
   - Add `automationCode` field to TestSuite or TestCase
   - Version control for test code changes

2. **Test File Management**
   - Temporary directory for test execution
   - Clean up after execution
   - Support for test data files

### Phase 3: Execution Engine

1. **Execution Service**
   ```typescript
   // src/lib/playwright-executor.ts
   export async function executeTests(
     suiteId: string,
     environmentId: string,
     options: {
       parallel?: boolean
       headed?: boolean
       retries?: number
     }
   ): Promise<ExecutionResult>
   ```

2. **Progress Streaming**
   - WebSocket or Server-Sent Events for real-time updates
   - Progress indicators: queued → running → completed
   - Live test status updates

3. **Result Capture**
   - Parse Playwright JSON reporter output
   - Capture screenshots/videos on failure
   - Store traces for debugging

### Phase 4: UI Components

1. **Environment Selector**
   ```tsx
   <Select>
     <SelectTrigger>
       <SelectValue placeholder="Select Environment" />
     </SelectTrigger>
     <SelectContent>
       <SelectItem value="dev">Development</SelectItem>
       <SelectItem value="staging">Staging</SelectItem>
       <SelectItem value="prod">Production</SelectItem>
       <SelectItem value="custom">Custom URL...</SelectItem>
     </SelectContent>
   </Select>
   ```

2. **Execution Control Panel**
   ```tsx
   <Card>
     <CardHeader>
       <CardTitle>Automated Execution</CardTitle>
     </CardHeader>
     <CardContent>
       <EnvironmentSelector />
       <ExecutionOptions />
       <Button onClick={handleExecute}>
         Run Automated Tests
       </Button>
       <ExecutionProgress />
     </CardContent>
   </Card>
   ```

3. **Real-time Progress Display**
   ```tsx
   <div className="space-y-2">
     {tests.map(test => (
       <div key={test.id} className="flex items-center gap-2">
         <StatusIcon status={test.status} />
         <span>{test.title}</span>
         <span className="text-muted-foreground">{test.duration}ms</span>
       </div>
     ))}
   </div>
   ```

### Phase 5: Result Integration

1. **Automatic Test Run Creation**
   - Create TestRun record before execution
   - Update status as tests complete
   - Link to test suite and environment

2. **Result Visualization**
   - Reuse existing test run detail page
   - Add automation-specific metadata
   - Show artifacts (screenshots, videos)
   - Link to Playwright traces

## Technical Implementation Details

### 1. Playwright Execution (Server-side)

```typescript
// src/lib/playwright-executor.ts
import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

export interface ExecutionResult {
  success: boolean
  testRunId: string
  results: TestCaseResult[]
  artifacts: ArtifactUrls[]
  duration: number
  error?: string
}

export async function executePlaywrightTests(
  testCode: string,
  baseUrl: string,
  options: ExecutionOptions = {}
): Promise<ExecutionResult> {
  // 1. Create temporary directory
  const tempDir = path.join(process.cwd(), '.temp', `run-${Date.now()}`)
  await fs.mkdir(tempDir, { recursive: true })

  try {
    // 2. Write test file
    const testFilePath = path.join(tempDir, 'generated-tests.spec.ts')
    await fs.writeFile(testFilePath, testCode, 'utf-8')

    // 3. Write Playwright config with custom baseUrl
    const configPath = path.join(tempDir, 'playwright.config.ts')
    const config = generatePlaywrightConfig(baseUrl, options)
    await fs.writeFile(configPath, config, 'utf-8')

    // 4. Execute Playwright
    const results = await runPlaywright(testFilePath, configPath, options)

    // 5. Parse results
    return parsePlaywrightResults(results)

  } finally {
    // 6. Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}

async function runPlaywright(
  testFile: string,
  configFile: string,
  options: ExecutionOptions
): Promise<PlaywrightOutput> {
  return new Promise((resolve, reject) => {
    const args = [
      'playwright', 'test',
      testFile,
      '--config', configFile,
      '--reporter', 'json',
      options.headed ? '--headed' : '',
      options.retries ? `--retries=${options.retries}` : ''
    ].filter(Boolean)

    const proc = spawn('npx', args, {
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
      // Emit progress events here
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      try {
        const results = JSON.parse(stdout)
        resolve(results)
      } catch (error) {
        reject(new Error(`Failed to parse results: ${stderr}`))
      }
    })
  })
}
```

### 2. Server Action

```typescript
// src/app/actions/test-execution.ts
'use server'

import { executePlaywrightTests } from '@/lib/playwright-executor'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function executeAutomatedTestSuite(
  suiteId: string,
  environmentId: string,
  userId: string,
  options: {
    parallel?: boolean
    headed?: boolean
    retries?: number
  } = {}
) {
  try {
    // 1. Get test suite and environment
    const suite = await prisma.testSuite.findUnique({
      where: { id: suiteId },
      include: { testCases: true }
    })

    const environment = await prisma.environment.findUnique({
      where: { id: environmentId }
    })

    if (!suite || !environment) {
      throw new Error('Suite or environment not found')
    }

    // 2. Generate or get Playwright code
    let testCode = suite.automationCode
    if (!testCode) {
      // Generate on-the-fly if not already generated
      testCode = await generatePlaywrightTestSuite(
        suite.testCases,
        suite.title,
        environment.baseUrl
      )
    }

    // 3. Create test run record
    const testRun = await prisma.testRun.create({
      data: {
        title: `Automated: ${suite.title}`,
        executionType: 'AUTOMATED',
        status: 'IN_PROGRESS',
        userId,
        suiteId,
        environmentId,
        automatedBy: userId
      }
    })

    // 4. Execute tests
    const results = await executePlaywrightTests(
      testCode,
      environment.baseUrl,
      options
    )

    // 5. Save results
    for (const result of results.results) {
      const testCase = suite.testCases.find(tc =>
        tc.title === result.testTitle
      )

      if (testCase) {
        await prisma.testResult.create({
          data: {
            testRunId: testRun.id,
            testCaseId: testCase.id,
            status: result.status,
            notes: result.error || result.notes,
            duration: result.duration,
            errorMessage: result.error,
            errorStack: result.stack,
            screenshotUrl: result.screenshotUrl,
            videoUrl: result.videoUrl,
            traceUrl: result.traceUrl
          }
        })
      }
    }

    // 6. Update test run
    await prisma.testRun.update({
      where: { id: testRun.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        executionDuration: results.duration,
        artifacts: results.artifacts
      }
    })

    revalidatePath(`/test-runs/${testRun.id}`)
    revalidatePath(`/test-suites/${suiteId}`)

    return {
      success: true,
      testRunId: testRun.id,
      results: results.results
    }

  } catch (error) {
    console.error('Error executing automated tests:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

### 3. UI Component

```typescript
// src/components/automation/automated-execution.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { executeAutomatedTestSuite } from '@/app/actions/test-execution'
import { Loader2, PlayCircle, CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AutomatedExecutionProps {
  suiteId: string
  environments: Array<{ id: string; name: string; baseUrl: string }>
  hasAutomationCode: boolean
}

export function AutomatedExecution({
  suiteId,
  environments,
  hasAutomationCode
}: AutomatedExecutionProps) {
  const router = useRouter()
  const [selectedEnv, setSelectedEnv] = useState<string>('')
  const [executing, setExecuting] = useState(false)
  const [progress, setProgress] = useState<ExecutionProgress | null>(null)

  async function handleExecute() {
    if (!selectedEnv) {
      toast.error('Please select an environment')
      return
    }

    setExecuting(true)
    try {
      const result = await executeAutomatedTestSuite(
        suiteId,
        selectedEnv,
        'demo-user', // Get from auth context
        {
          parallel: true,
          retries: 1
        }
      )

      if (result.success) {
        toast.success('Tests executed successfully!')
        router.push(`/test-runs/${result.testRunId}`)
      } else {
        toast.error(result.error || 'Execution failed')
      }
    } catch (error) {
      toast.error('An error occurred during execution')
    } finally {
      setExecuting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-primary" />
          Execute Automated Tests
        </CardTitle>
        <CardDescription>
          Run Playwright tests against selected environment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAutomationCode ? (
          <Alert>
            <AlertDescription>
              Generate automation code first before executing tests
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Target Environment</Label>
              <Select value={selectedEnv} onValueChange={setSelectedEnv}>
                <SelectTrigger>
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  {environments.map(env => (
                    <SelectItem key={env.id} value={env.id}>
                      <div>
                        <div>{env.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {env.baseUrl}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleExecute}
              disabled={executing || !selectedEnv}
              className="w-full"
              size="lg"
            >
              {executing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing Tests...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Execute Tests
                </>
              )}
            </Button>

            {progress && (
              <div className="space-y-2">
                <h4 className="font-medium">Execution Progress</h4>
                {progress.tests.map(test => (
                  <div key={test.id} className="flex items-center gap-2">
                    {test.status === 'running' && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {test.status === 'passed' && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                    {test.status === 'failed' && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="flex-1">{test.title}</span>
                    {test.duration && (
                      <span className="text-xs text-muted-foreground">
                        {test.duration}ms
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
```

## User Flow

1. **Setup Environments**
   - User goes to Settings → Environments
   - Adds Dev (http://localhost:3000), Staging (https://staging.app.com), Prod (https://app.com)

2. **Generate Tests**
   - User generates Playwright tests from test suite
   - Code is stored in database

3. **Execute Tests**
   - User selects environment from dropdown
   - Clicks "Execute Tests"
   - Real-time progress displayed
   - On completion, redirected to Test Run detail page

4. **View Results**
   - Test run shows execution metadata (environment, duration, Playwright version)
   - Each test result shows pass/fail with duration
   - Failed tests show error message, stack trace, screenshots
   - Traces available for detailed debugging

## Benefits

1. **No Manual Setup**: Tests run on server, no local Playwright installation needed
2. **Environment Flexibility**: Test against any environment on demand
3. **Full Traceability**: Results automatically captured and linked
4. **Artifact Storage**: Screenshots, videos, traces preserved
5. **CI/CD Ready**: Same execution engine can be used in pipelines

## Next Steps

1. Implement Environment model and CRUD operations
2. Add Playwright to production dependencies
3. Build execution engine with progress streaming
4. Create UI components
5. Add artifact storage (filesystem or cloud)
6. Implement real-time progress updates (WebSocket or SSE)
