'use client'

import { useState } from 'react'
import { Play, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { executeCollection } from '@/app/actions/api-testing'

interface CollectionRunnerProps {
  collectionId: string;
  collectionName: string;
  requestCount: number;
  userId: string;
  environmentId?: string | null;
  onComplete: () => void;
}

export function CollectionRunner({
  collectionId,
  collectionName,
  requestCount,
  userId,
  environmentId,
  onComplete
}: CollectionRunnerProps) {
  const [open, setOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleRun = async () => {
    setRunning(true)
    setResults(null)

    toast.info(`Running ${requestCount} requests...`)

    const result = await executeCollection(collectionId, userId, environmentId || undefined)

    if (result.success && result.summary) {
      setResults(result)
      toast.success(`Collection completed: ${result.summary.passed}/${result.summary.total} passed`)
    } else {
      toast.error('Collection execution failed: ' + result.error)
      setOpen(false)
    }

    setRunning(false)
    onComplete()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <Badge className="bg-green-600">Passed</Badge>
      case 'FAILED':
        return <Badge variant="danger">Failed</Badge>
      case 'ERROR':
        return <Badge className="bg-orange-600">Error</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          setOpen(true)
          if (!running && !results) {
            handleRun()
          }
        }}
        disabled={requestCount === 0}
      >
        <div className="flex flex-row items-center gap-2">
          <Play className="h-4 w-4" />
          <span>Run Collection</span>
        </div>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Run Collection: {collectionName}</DialogTitle>
            <DialogDescription>
              {running
                ? `Executing ${requestCount} requests...`
                : results
                ? `Completed ${results.summary.total} requests`
                : 'Ready to execute'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Progress */}
            {running && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Running tests...</span>
                  <span className="text-muted-foreground">Please wait</span>
                </div>
                <Progress value={undefined} className="animate-pulse" />
              </div>
            )}

            {/* Summary */}
            {results && results.summary && (
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{results.summary.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.summary.passed}</div>
                  <div className="text-xs text-muted-foreground">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{results.summary.failed}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{results.summary.errors}</div>
                  <div className="text-xs text-muted-foreground">Errors</div>
                </div>
              </div>
            )}

            {/* Results List */}
            {results && results.results && (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {results.results.map((result: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent"
                    >
                      <div>{getStatusIcon(result.execution?.status)}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Request {index + 1}</div>
                        {result.execution && (
                          <div className="text-xs text-muted-foreground">
                            {result.execution.statusCode && `${result.execution.statusCode} · `}
                            {result.execution.responseTime}ms
                          </div>
                        )}
                        {result.error && (
                          <div className="text-xs text-red-600 mt-1">{result.error}</div>
                        )}
                      </div>
                      <div>{getStatusBadge(result.execution?.status || 'ERROR')}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              {results && !running && (
                <Button onClick={handleRun} variant="outline">
                  <div className="flex flex-row items-center gap-2">
                    <Play className="h-4 w-4" />
                    <span>Run Again</span>
                  </div>
                </Button>
              )}
              <Button onClick={() => setOpen(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
