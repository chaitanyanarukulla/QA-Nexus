'use server'

import { prisma } from '@/lib/prisma'
import { analyzeAllTests, detectFlakyTests, predictTestFailures, detectSlowTests, generateAIRecommendations } from '@/lib/ai-insights'
import type { InsightType, InsightSeverity } from '@prisma/client'

export async function runInsightsAnalysis(testSuiteId?: string) {
  try {
    await analyzeAllTests()

    // Generate AI recommendations if test suite specified
    if (testSuiteId) {
      const aiRecs = await generateAIRecommendations(testSuiteId)
      for (const rec of aiRecs) {
        await prisma.aIInsight.create({
          data: rec,
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to run insights analysis:', error)
    return { success: false, error: 'Failed to analyze tests' }
  }
}

export async function getInsights({
  testCaseId,
  testSuiteId,
  type,
  severity,
  includeResolved = false,
}: {
  testCaseId?: string
  testSuiteId?: string
  type?: InsightType
  severity?: InsightSeverity
  includeResolved?: boolean
} = {}) {
  try {
    const insights = await prisma.aIInsight.findMany({
      where: {
        testCaseId,
        testSuiteId,
        type,
        severity,
        ...(!includeResolved && { isResolved: false }),
      },
      include: {
        testCase: {
          select: {
            id: true,
            title: true,
          },
        },
        testSuite: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [
        { severity: 'desc' }, // CRITICAL first
        { createdAt: 'desc' },
      ],
    })

    return { success: true, insights }
  } catch (error) {
    console.error('Failed to get insights:', error)
    return { success: false, error: 'Failed to get insights' }
  }
}

export async function resolveInsight(insightId: string) {
  try {
    const insight = await prisma.aIInsight.update({
      where: { id: insightId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    })

    return { success: true, insight }
  } catch (error) {
    console.error('Failed to resolve insight:', error)
    return { success: false, error: 'Failed to resolve insight' }
  }
}

export async function unresolveInsight(insightId: string) {
  try {
    const insight = await prisma.aIInsight.update({
      where: { id: insightId },
      data: {
        isResolved: false,
        resolvedAt: null,
      },
    })

    return { success: true, insight }
  } catch (error) {
    console.error('Failed to unresolve insight:', error)
    return { success: false, error: 'Failed to unresolve insight' }
  }
}

export async function deleteInsight(insightId: string) {
  try {
    await prisma.aIInsight.delete({
      where: { id: insightId },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to delete insight:', error)
    return { success: false, error: 'Failed to delete insight' }
  }
}

export async function getInsightsSummary() {
  try {
    const [total, critical, high, flaky, highRisk] = await Promise.all([
      prisma.aIInsight.count({ where: { isResolved: false } }),
      prisma.aIInsight.count({ where: { isResolved: false, severity: 'CRITICAL' } }),
      prisma.aIInsight.count({ where: { isResolved: false, severity: 'HIGH' } }),
      prisma.aIInsight.count({ where: { isResolved: false, type: 'FLAKY_TEST' } }),
      prisma.aIInsight.count({ where: { isResolved: false, type: 'HIGH_FAILURE_RISK' } }),
    ])

    return {
      success: true,
      summary: {
        total,
        critical,
        high,
        flaky,
        highRisk,
      },
    }
  } catch (error) {
    console.error('Failed to get insights summary:', error)
    return { success: false, error: 'Failed to get summary' }
  }
}

export async function getTestHealthScore(testCaseId: string) {
  try {
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
      include: {
        insights: {
          where: { isResolved: false },
        },
        testResults: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!testCase) {
      return { success: false, error: 'Test case not found' }
    }

    // Calculate health score (0-100, higher is better)
    let healthScore = 100

    // Deduct for flaky score
    healthScore -= (testCase.flakyScore || 0) * 0.3

    // Deduct for failure prediction
    healthScore -= (testCase.failurePrediction || 0) * 0.5

    // Deduct for unresolved insights
    healthScore -= testCase.insights.length * 5

    // Deduct for recent failures
    const recentFailures = testCase.testResults.filter(r => r.status === 'FAIL').length
    healthScore -= recentFailures * 3

    healthScore = Math.max(0, Math.min(100, healthScore))

    return {
      success: true,
      healthScore,
      flakyScore: testCase.flakyScore || 0,
      failurePrediction: testCase.failurePrediction || 0,
      unresolvedInsights: testCase.insights.length,
      recentFailures,
    }
  } catch (error) {
    console.error('Failed to get test health score:', error)
    return { success: false, error: 'Failed to get health score' }
  }
}

export async function getPrioritizedTests(suiteId?: string) {
  try {
    const where = suiteId ? { suiteId } : {}

    const testCases = await prisma.testCase.findMany({
      where: {
        ...where,
        isAutomated: true,
      },
      include: {
        insights: {
          where: { isResolved: false },
        },
      },
    })

    // Calculate priority score for each test
    const prioritized = testCases.map(tc => {
      let priorityScore = 0

      // Higher priority for tests with high failure prediction
      priorityScore += (tc.failurePrediction || 0) * 2

      // Higher priority for flaky tests
      priorityScore += (tc.flakyScore || 0)

      // Higher priority for critical/high insights
      const criticalInsights = tc.insights.filter(i => i.severity === 'CRITICAL').length
      const highInsights = tc.insights.filter(i => i.severity === 'HIGH').length
      priorityScore += criticalInsights * 50
      priorityScore += highInsights * 25

      // Higher priority based on test case priority
      const priorityWeight = {
        CRITICAL: 40,
        HIGH: 30,
        MEDIUM: 20,
        LOW: 10,
      }
      priorityScore += priorityWeight[tc.priority] || 0

      return {
        ...tc,
        priorityScore,
      }
    })

    // Sort by priority score (highest first)
    prioritized.sort((a, b) => b.priorityScore - a.priorityScore)

    return { success: true, tests: prioritized }
  } catch (error) {
    console.error('Failed to get prioritized tests:', error)
    return { success: false, error: 'Failed to get prioritized tests' }
  }
}
