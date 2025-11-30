import { prisma } from './prisma'
import { chatCompletion } from './ai'
import type { InsightType, InsightSeverity } from '@prisma/client'

interface TestExecutionHistory {
  testCaseId: string
  results: {
    status: string
    createdAt: Date
    duration?: number
  }[]
}

/**
 * Analyze test execution history to detect flaky tests
 * A test is considered flaky if it has inconsistent results
 */
export async function detectFlakyTests(testCaseId?: string) {
  const where = testCaseId ? { testCaseId } : {}

  // Get test results from last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const testCases = await prisma.testCase.findMany({
    where: {
      ...where,
      testResults: {
        some: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      },
    },
    include: {
      testResults: {
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20, // Last 20 executions
      },
    },
  })

  const insights = []

  for (const testCase of testCases) {
    if (testCase.testResults.length < 5) continue // Need at least 5 executions

    const results = testCase.testResults
    const passCount = results.filter(r => r.status === 'PASS').length
    const failCount = results.filter(r => r.status === 'FAIL').length
    const totalCount = results.length

    // Calculate flaky score based on result variance
    const passRate = passCount / totalCount
    const failRate = failCount / totalCount

    // Flaky if it has both passes and failures
    if (passCount > 0 && failCount > 0) {
      // Higher score = more flaky (closer to 50/50 split)
      const flakyScore = 100 * (1 - Math.abs(passRate - failRate))

      // Check for flip-flopping pattern
      let flipCount = 0
      for (let i = 1; i < results.length; i++) {
        if (results[i].status !== results[i - 1].status) {
          flipCount++
        }
      }
      const flipRate = flipCount / (results.length - 1)

      // Boost flaky score if test flips frequently
      const adjustedFlakyScore = Math.min(100, flakyScore * (1 + flipRate))

      if (adjustedFlakyScore > 30) {
        // Update test case with flaky score
        await prisma.testCase.update({
          where: { id: testCase.id },
          data: {
            flakyScore: adjustedFlakyScore,
            lastAnalyzedAt: new Date(),
          },
        })

        // Create insight
        const severity: InsightSeverity =
          adjustedFlakyScore > 70 ? 'CRITICAL' :
            adjustedFlakyScore > 50 ? 'HIGH' :
              adjustedFlakyScore > 30 ? 'MEDIUM' : 'LOW'

        insights.push({
          type: 'FLAKY_TEST' as InsightType,
          severity,
          title: `Flaky Test Detected: ${testCase.title}`,
          description: `This test has inconsistent results with a flaky score of ${adjustedFlakyScore.toFixed(1)}%. It passed ${passCount} times and failed ${failCount} times out of ${totalCount} recent executions.`,
          recommendation: 'Review test for timing issues, race conditions, or environmental dependencies. Consider adding explicit waits or stabilizing test data.',
          confidence: Math.min(100, (totalCount / 20) * 100),
          testCaseId: testCase.id,
          metadata: {
            flakyScore: adjustedFlakyScore,
            passCount,
            failCount,
            totalCount,
            flipRate: flipRate * 100,
          },
        })
      }
    }
  }

  return insights
}

/**
 * Predict which tests are likely to fail in the next run
 * Based on recent trends, code changes, and historical patterns
 */
export async function predictTestFailures() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const testCases = await prisma.testCase.findMany({
    where: {
      isAutomated: true,
      testResults: {
        some: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      },
    },
    include: {
      testResults: {
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  })

  const insights = []

  for (const testCase of testCases) {
    if (testCase.testResults.length < 3) continue

    const recentResults = testCase.testResults.slice(0, 5)
    const recentFailures = recentResults.filter(r => r.status === 'FAIL').length

    // Calculate failure trend
    const failureRate = recentFailures / recentResults.length

    // Check if failures are increasing
    const last3 = testCase.testResults.slice(0, 3)
    const failuresInLast3 = last3.filter(r => r.status === 'FAIL').length

    if (failureRate > 0.3 || failuresInLast3 >= 2) {
      const failurePrediction = Math.min(100, failureRate * 100 + (failuresInLast3 * 15))

      // Update test case
      await prisma.testCase.update({
        where: { id: testCase.id },
        data: {
          failurePrediction,
          lastAnalyzedAt: new Date(),
        },
      })

      const severity: InsightSeverity =
        failurePrediction > 70 ? 'CRITICAL' :
          failurePrediction > 50 ? 'HIGH' :
            failurePrediction > 30 ? 'MEDIUM' : 'LOW'

      insights.push({
        type: 'HIGH_FAILURE_RISK' as InsightType,
        severity,
        title: `High Failure Risk: ${testCase.title}`,
        description: `This test has a ${failurePrediction.toFixed(1)}% probability of failing in the next run. It failed ${recentFailures} out of ${recentResults.length} recent executions.`,
        recommendation: 'Investigate recent failures and consider fixing underlying issues before next release. Review error logs and test environment.',
        confidence: Math.min(100, (recentResults.length / 10) * 100),
        testCaseId: testCase.id,
        metadata: {
          failurePrediction,
          recentFailures,
          totalRecent: recentResults.length,
          failureRate: failureRate * 100,
        },
      })
    }
  }

  return insights
}

/**
 * Identify slow-running tests that should be optimized
 */
export async function detectSlowTests() {
  // This would typically use execution time from test results
  // For now, we'll create a placeholder implementation

  const testCases = await prisma.testCase.findMany({
    where: {
      isAutomated: true,
      executionTime: {
        gt: 30000, // More than 30 seconds
      },
    },
  })

  const insights = []

  for (const testCase of testCases) {
    const executionTimeSeconds = (testCase.executionTime || 0) / 1000

    const severity: InsightSeverity =
      executionTimeSeconds > 120 ? 'HIGH' :
        executionTimeSeconds > 60 ? 'MEDIUM' : 'LOW'

    insights.push({
      type: 'SLOW_EXECUTION' as InsightType,
      severity,
      title: `Slow Test: ${testCase.title}`,
      description: `This test takes ${executionTimeSeconds.toFixed(1)} seconds to execute, which may slow down your test suite.`,
      recommendation: 'Consider optimizing test setup, reducing wait times, or parallelizing independent operations. Break down into smaller, focused tests if possible.',
      confidence: 95,
      testCaseId: testCase.id,
      metadata: {
        executionTime: testCase.executionTime,
        executionTimeSeconds,
      },
    })
  }

  return insights
}

/**
 * Use AI to generate intelligent recommendations
 */
export async function generateAIRecommendations(testSuiteId?: string) {
  const where = testSuiteId ? { suiteId: testSuiteId } : {}

  const testCases = await prisma.testCase.findMany({
    where,
    include: {
      testResults: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
    take: 50, // Limit to avoid overwhelming the AI
  })

  if (testCases.length === 0) return []

  // Prepare summary for AI
  const summary = {
    totalTests: testCases.length,
    automatedTests: testCases.filter(tc => tc.isAutomated).length,
    averageFlakyScore: testCases.reduce((sum, tc) => sum + (tc.flakyScore || 0), 0) / testCases.length,
    highRiskTests: testCases.filter(tc => (tc.failurePrediction || 0) > 50).length,
  }

  const prompt = `As a QA expert, analyze this test suite and provide actionable recommendations:

Test Suite Summary:
- Total Tests: ${summary.totalTests}
- Automated Tests: ${summary.automatedTests} (${(summary.automatedTests / summary.totalTests * 100).toFixed(1)}%)
- Average Flaky Score: ${summary.averageFlakyScore.toFixed(1)}
- High Risk Tests: ${summary.highRiskTests}

Provide 3-5 specific, actionable recommendations to improve test quality, coverage, and reliability. Format as JSON array with: { title, description, priority }.`

  try {
    const aiResponse = await chatCompletion([
      { role: 'system', content: 'You are a QA automation expert providing testing recommendations. Respond with valid JSON only.' },
      { role: 'user', content: prompt }
    ])

    // Parse AI response (expecting JSON)
    const recommendations = JSON.parse(aiResponse)

    const insights = []
    for (const rec of recommendations) {
      insights.push({
        type: 'OPTIMIZATION_OPPORTUNITY' as InsightType,
        severity: (rec.priority === 'high' ? 'HIGH' : rec.priority === 'medium' ? 'MEDIUM' : 'LOW') as InsightSeverity,
        title: rec.title,
        description: rec.description,
        recommendation: rec.recommendation || rec.description,
        confidence: 85,
        testSuiteId,
        metadata: { source: 'ai', priority: rec.priority },
      })
    }

    return insights
  } catch (error) {
    console.error('Failed to generate AI recommendations:', error)
    return []
  }
}

/**
 * Run all AI insights analysis
 */
export async function analyzeAllTests() {
  console.log('Running AI insights analysis...')

  const [flaky, failures, slow] = await Promise.all([
    detectFlakyTests(),
    predictTestFailures(),
    detectSlowTests(),
  ])

  const allInsights = [...flaky, ...failures, ...slow]

  // Save insights to database
  for (const insight of allInsights) {
    // Check if similar insight already exists
    const existing = await prisma.aIInsight.findFirst({
      where: {
        type: insight.type,
        testCaseId: insight.testCaseId || null,
        testSuiteId: (insight as any).testSuiteId || null,
        isResolved: false,
      },
    })

    if (!existing) {
      await prisma.aIInsight.create({
        data: {
          ...insight,
          testSuiteId: (insight as any).testSuiteId,
        },
      })
    } else {
      // Update existing insight
      await prisma.aIInsight.update({
        where: { id: existing.id },
        data: {
          severity: insight.severity,
          description: insight.description,
          confidence: insight.confidence,
          metadata: insight.metadata,
          updatedAt: new Date(),
        },
      })
    }
  }

  console.log(`Generated ${allInsights.length} insights`)
  return allInsights
}
