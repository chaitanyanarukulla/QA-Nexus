import { z } from 'zod'

// Test Case Validation
export const createTestCaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  steps: z.any(), // Accept any type since it's stored as JSON
  expectedResult: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['ACTIVE', 'DRAFT', 'DEPRECATED']),
})

export const updateTestCaseSchema = createTestCaseSchema.partial()

// Test Suite Validation
export const createTestSuiteSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  jiraEpicKey: z.string().optional(),
})

// Test Run Validation
export const createTestRunSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  testCaseIds: z.array(z.string().cuid()).min(1, 'At least one test case is required'),
  userId: z.string().cuid(),
})

export const updateTestResultSchema = z.object({
  status: z.enum(['PENDING', 'PASS', 'FAIL', 'BLOCKED', 'SKIPPED']),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
  evidence: z.string().url('Evidence must be a valid URL').optional().or(z.literal('')),
})

// Defect Validation
export const createDefectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  testResultId: z.string().cuid().optional(),
  jiraIssueId: z.string().optional(),
})

export const updateDefectStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
})

// Jira Integration Validation
export const jiraIntegrationSchema = z.object({
  instanceUrl: z.string().url('Instance URL must be a valid URL').or(
    z.string().regex(/^[a-zA-Z0-9-]+\.atlassian\.net$/, 'Must be a valid Atlassian URL')
  ),
  email: z.string().email('Must be a valid email address'),
  apiToken: z.string().min(10, 'API token must be at least 10 characters'),
})

export const createJiraIssueSchema = z.object({
  projectKey: z.string().min(1, 'Project key is required'),
  summary: z.string().min(3, 'Summary must be at least 3 characters').max(200),
  description: z.string().max(5000),
  issueType: z.string().min(1, 'Issue type is required'),
  priority: z.string().optional(),
})

// AI Test Generator Validation
export const generateTestCasesSchema = z.object({
  requirement: z.string().min(10, 'Requirement must be at least 10 characters').max(5000),
  includeEdgeCases: z.boolean().optional(),
  includeNegativeCases: z.boolean().optional(),
  count: z.number().int().min(1).max(20).optional(),
})

// Pagination Validation
export const paginationSchema = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(100).optional(),
})
