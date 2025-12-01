'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AIAssertionsGeneratorProps {
  responseBody: string
  statusCode: number
  onGenerate: (assertions: any[]) => void
  disabled?: boolean
}

export function AIAssertionsGenerator({
  responseBody,
  statusCode,
  onGenerate,
  disabled
}: AIAssertionsGeneratorProps) {
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!responseBody) {
      toast.error('No response body available')
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/ai/generate-assertions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseBody,
          statusCode
        })
      })

      const result = await response.json()

      if (result.success && result.assertions) {
        toast.success(`Generated ${result.assertions.length} assertions`)
        onGenerate(result.assertions)
      } else {
        toast.error(result.error || 'Failed to generate assertions')
      }
    } catch (error) {
      toast.error('An error occurred while generating assertions')
      console.error(error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleGenerate}
      disabled={disabled || generating || !responseBody}
    >
      {generating ? (
        <div className="flex flex-row items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating...</span>
        </div>
      ) : (
        <div className="flex flex-row items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span>AI Assertions</span>
        </div>
      )}
    </Button>
  )
}
