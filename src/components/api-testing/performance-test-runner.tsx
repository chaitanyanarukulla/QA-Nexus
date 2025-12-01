'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Zap, Loader2, TrendingUp, Activity, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PerformanceTestRunnerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId?: string
  collectionId?: string
  requestName: string
  userId: string
  environmentId?: string | null
}

type TestType = 'load' | 'stress' | 'spike' | 'soak'

interface PerformanceResult {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  requestsPerSecond: number
  duration: number
  errors: Array<{ message: string; count: number }>
}

export function PerformanceTestRunner({
  open,
  onOpenChange,
  requestId,
  collectionId,
  requestName,
  userId,
  environmentId
}: PerformanceTestRunnerProps) {
  const [testType, setTestType] = useState<TestType>('load')
  const [virtualUsers, setVirtualUsers] = useState('10')
  const [duration, setDuration] = useState('60')
  const [rampUpTime, setRampUpTime] = useState('10')
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<PerformanceResult | null>(null)

  const testDescriptions = {
    load: 'Simulate normal user load to test system behavior under expected traffic',
    stress: 'Push system beyond normal capacity to find breaking point',
    spike: 'Sudden surge of traffic to test system resilience',
    soak: 'Sustained load over extended period to detect memory leaks'
  }

  const handleRunTest = async () => {
    if (!requestId && !collectionId) {
      toast.error('No request or collection selected')
      return
    }

    setRunning(true)
    setProgress(0)
    setResults(null)

    try {
      const response = await fetch('/api/performance/run-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          collectionId,
          userId,
          environmentId,
          testType,
          virtualUsers: parseInt(virtualUsers),
          duration: parseInt(duration),
          rampUpTime: parseInt(rampUpTime)
        })
      })

      const result = await response.json()

      if (result.success && result.results) {
        setResults(result.results)
        toast.success('Performance test completed')
      } else {
        toast.error(result.error || 'Performance test failed')
      }
    } catch (error) {
      toast.error('An error occurred during performance test')
      console.error(error)
    } finally {
      setRunning(false)
      setProgress(100)
    }
  }

  const getSuccessRate = () => {
    if (!results) return 0
    return (results.successfulRequests / results.totalRequests) * 100
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Performance Testing: {requestName}
          </DialogTitle>
          <DialogDescription>
            Test your API's performance under various load conditions
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-6">
            {/* Test Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test-type">Test Type</Label>
                <Select value={testType} onValueChange={(value) => setTestType(value as TestType)}>
                  <SelectTrigger id="test-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="load">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        <span>Load Test</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="stress">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Stress Test</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="spike">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>Spike Test</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="soak">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Soak Test</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {testDescriptions[testType]}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="virtual-users">Virtual Users</Label>
                <Input
                  id="virtual-users"
                  type="number"
                  min="1"
                  max="1000"
                  value={virtualUsers}
                  onChange={(e) => setVirtualUsers(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Number of concurrent users (1-1000)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="10"
                  max="3600"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  How long to run the test (10-3600 seconds)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ramp-up">Ramp-up Time (seconds)</Label>
                <Input
                  id="ramp-up"
                  type="number"
                  min="0"
                  max="300"
                  value={rampUpTime}
                  onChange={(e) => setRampUpTime(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Time to gradually reach target users (0-300)
                </p>
              </div>
            </div>

            {/* Progress */}
            {running && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Running performance test...</span>
                  <span className="text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  This may take several minutes depending on test duration
                </p>
              </div>
            )}

            {/* Warning */}
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Performance Testing Warning
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    • Only run performance tests on test/staging environments<br />
                    • High load may affect server performance<br />
                    • Ensure you have permission to run load tests<br />
                    • Start with low user counts and gradually increase
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results Summary */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Requests</CardDescription>
                  <CardTitle className="text-3xl">{results.totalRequests}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Success Rate</CardDescription>
                  <CardTitle className="text-3xl text-green-600">
                    {getSuccessRate().toFixed(1)}%
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Avg Response Time</CardDescription>
                  <CardTitle className="text-3xl">
                    {results.averageResponseTime.toFixed(0)}ms
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Requests/sec</CardDescription>
                  <CardTitle className="text-3xl">
                    {results.requestsPerSecond.toFixed(1)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Detailed Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Successful:</span>
                    <Badge className="bg-green-600">{results.successfulRequests}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Failed:</span>
                    <Badge variant="danger">{results.failedRequests}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Min Response:</span>
                    <span className="font-mono text-sm">{results.minResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Max Response:</span>
                    <span className="font-mono text-sm">{results.maxResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">P95 Response:</span>
                    <span className="font-mono text-sm">{results.p95ResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">P99 Response:</span>
                    <span className="font-mono text-sm">{results.p99ResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="font-mono text-sm">{results.duration}s</span>
                  </div>
                </div>

                {results.errors && results.errors.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-medium text-red-600">Errors:</p>
                    {results.errors.map((error, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{error.message}</span>
                        <Badge variant="outline" className="text-red-600">
                          {error.count}x
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {getSuccessRate() >= 99 && (
                    <div className="flex items-start gap-2 text-green-600">
                      <span>✓</span>
                      <span>Excellent success rate - system handles load well</span>
                    </div>
                  )}
                  {getSuccessRate() < 95 && (
                    <div className="flex items-start gap-2 text-orange-600">
                      <span>⚠</span>
                      <span>Success rate below 95% - investigate errors</span>
                    </div>
                  )}
                  {results.averageResponseTime < 200 && (
                    <div className="flex items-start gap-2 text-green-600">
                      <span>✓</span>
                      <span>Fast average response time (&lt;200ms)</span>
                    </div>
                  )}
                  {results.averageResponseTime > 1000 && (
                    <div className="flex items-start gap-2 text-orange-600">
                      <span>⚠</span>
                      <span>Slow average response time (&gt;1000ms) - optimize performance</span>
                    </div>
                  )}
                  {results.p99ResponseTime > results.averageResponseTime * 5 && (
                    <div className="flex items-start gap-2 text-orange-600">
                      <span>⚠</span>
                      <span>High P99 latency - some requests are very slow</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {results && (
              <Button
                variant="outline"
                onClick={() => setResults(null)}
              >
                Run Again
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={running}
            >
              {results ? 'Close' : 'Cancel'}
            </Button>
            {!results && (
              <Button
                onClick={handleRunTest}
                disabled={running}
              >
                {running ? (
                  <div className="flex flex-row items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Running Test...</span>
                  </div>
                ) : (
                  <div className="flex flex-row items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Start Test</span>
                  </div>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
