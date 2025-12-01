// Type-only exports to avoid importing Prisma in client components

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const

export type Priority = typeof Priority[keyof typeof Priority]

export const Status = {
  ACTIVE: 'ACTIVE',
  DRAFT: 'DRAFT',
  DEPRECATED: 'DEPRECATED',
} as const

export type Status = typeof Status[keyof typeof Status]

export const RunStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  ABORTED: 'ABORTED',
} as const

export type RunStatus = typeof RunStatus[keyof typeof RunStatus]

export const ResultStatus = {
  PENDING: 'PENDING',
  PASS: 'PASS',
  FAIL: 'FAIL',
  BLOCKED: 'BLOCKED',
  SKIPPED: 'SKIPPED',
} as const

export type ResultStatus = typeof ResultStatus[keyof typeof ResultStatus]

export const DefectStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const

export type DefectStatus = typeof DefectStatus[keyof typeof DefectStatus]

export const Role = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  TESTER: 'TESTER',
  DEVELOPER: 'DEVELOPER',
} as const

export type Role = typeof Role[keyof typeof Role]
