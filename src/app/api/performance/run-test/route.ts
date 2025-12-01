import { NextRequest, NextResponse } from 'next/server'
import { executeApiRequest } from '@/app/actions/api-testing'
import { prisma } from '@/lib/prisma'

interface PerformanceTestConfig {
  collectionId: string
  environmentId?: string
  testType: 'load' | 'stress' | 'spike' | 'soak'
  virtualUsers: number
  duration: number // seconds
  rampUpTime: number // seconds
  userId: string
}

interface RequestMetrics {
  responseTime: number
  status: 'PASSED' | 'FAILED' | 'ERROR'
  timestamp: number
}

export async function POST(request: NextRequest) {
  try {
    const config: PerformanceTestConfig = await request.json()

    const {
      collectionId,
      environmentId,
      virtualUsers,
      duration,
      rampUpTime,
      userId
    } = config

    // Validate inputs
    if (!collectionId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Collection ID and User ID are required' },
        { status: 400 }
      )
    }

    if (virtualUsers < 1 || virtualUsers > 1000) {
      return NextResponse.json(
        { success: false, error: 'Virtual users must be between 1 and 1000' },
        { status: 400 }
      )
    }

    if (duration < 10 || duration > 3600) {
      return NextResponse.json(
        { success: false, error: 'Duration must be between 10 and 3600 seconds' },
        { status: 400 }
      )
    }

    // Fetch requests in collection
    const requests = await prisma.apiRequest.findMany({
      where: { collectionId },
      orderBy: { order: 'asc' }
    })

    if (requests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No requests found in collection' },
        { status: 404 }
      )
    }

    // Run performance test
    const startTime = Date.now()
    const endTime = startTime + (duration * 1000)
    const metrics: RequestMetrics[] = []
    let activeUsers = 0
    const maxUsers = virtualUsers

    // Calculate ramp-up rate (users per second)
    const rampUpRate = rampUpTime > 0 ? maxUsers / rampUpTime : maxUsers

    console.log(`Starting performance test: ${maxUsers} users over ${duration}s (ramp-up: ${rampUpTime}s)`)

    // Track execution promises
    const executionPromises: Promise<void>[] = []

    // Ramp-up period: gradually add users
    const rampUpInterval = setInterval(() => {
      if (activeUsers < maxUsers && Date.now() < endTime) {
        const usersToAdd = Math.min(
          Math.ceil(rampUpRate),
          maxUsers - activeUsers
        )

        for (let i = 0; i < usersToAdd; i++) {
          activeUsers++
          executionPromises.push(
            simulateVirtualUser(requests, userId, environmentId, endTime, metrics)
          )
        }
      }
    }, 1000)

    // Wait for test duration
    await new Promise(resolve => setTimeout(resolve, duration * 1000))
    clearInterval(rampUpInterval)

    // Wait for all ongoing requests to complete (with timeout)
    await Promise.allSettled(executionPromises)

    // Calculate results
    const results = calculateMetrics(metrics, duration)

    console.log(`Performance test completed: ${metrics.length} requests executed`)

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Performance test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run performance test'
      },
      { status: 500 }
    )
  }
}

/**
 * Simulate a virtual user executing requests repeatedly until test ends
 */
async function simulateVirtualUser(
  requests: any[],
  userId: string,
  environmentId: string | undefined,
  endTime: number,
  metrics: RequestMetrics[]
): Promise<void> {
  while (Date.now() < endTime) {
    // Execute each request in the collection
    for (const request of requests) {
      if (Date.now() >= endTime) break

      const requestStartTime = Date.now()

      try {
        const result = await executeApiRequest(
          request.id,
          userId,
          environmentId
        )

        const responseTime = Date.now() - requestStartTime

        metrics.push({
          responseTime,
          status: (result.execution?.status as 'PASSED' | 'FAILED' | 'ERROR') || 'ERROR',
          timestamp: Date.now()
        })

      } catch (error) {
        metrics.push({
          responseTime: Date.now() - requestStartTime,
          status: 'ERROR',
          timestamp: Date.now()
        })
      }
    }

    // Small delay between iterations to prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

/**
 * Calculate performance metrics from collected data
 */
function calculateMetrics(metrics: RequestMetrics[], duration: number) {
  if (metrics.length === 0) {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      errorRequests: 0,
      successRate: 0,
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      requestsPerSecond: 0
    }
  }

  // Status counts
  const successfulRequests = metrics.filter(m => m.status === 'PASSED').length
  const failedRequests = metrics.filter(m => m.status === 'FAILED').length
  const errorRequests = metrics.filter(m => m.status === 'ERROR').length
  const totalRequests = metrics.length

  // Response times
  const responseTimes = metrics.map(m => m.responseTime).sort((a, b) => a - b)
  const avgResponseTime = Math.round(
    responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
  )
  const minResponseTime = responseTimes[0]
  const maxResponseTime = responseTimes[responseTimes.length - 1]

  // Percentiles
  const p95Index = Math.floor(responseTimes.length * 0.95)
  const p99Index = Math.floor(responseTimes.length * 0.99)
  const p95ResponseTime = responseTimes[p95Index] || 0
  const p99ResponseTime = responseTimes[p99Index] || 0

  // Throughput
  const requestsPerSecond = Math.round((totalRequests / duration) * 10) / 10

  // Success rate
  const successRate = Math.round((successfulRequests / totalRequests) * 100 * 10) / 10

  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    errorRequests,
    successRate,
    avgResponseTime,
    minResponseTime,
    maxResponseTime,
    p95ResponseTime,
    p99ResponseTime,
    requestsPerSecond
  }
}
