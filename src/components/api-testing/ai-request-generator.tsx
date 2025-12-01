'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Loader2, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'

interface AIRequestGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (request: {
    title: string
    method: string
    url: string
    headers?: Record<string, string>
    queryParams?: Record<string, string>
    body?: any
    description?: string
  }) => void
}

export function AIRequestGenerator({
  open,
  onOpenChange,
  onGenerate
}: AIRequestGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)

  const examplePrompts = [
    "Get a list of users with pagination",
    "Create a new blog post with title and content",
    "Update user profile with email and name",
    "Delete a product by ID",
    "Search for products by category and price range"
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description')
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/ai/generate-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      })

      const result = await response.json()

      if (result.success && result.request) {
        toast.success('Request generated successfully!')
        onGenerate(result.request)
        onOpenChange(false)
        setPrompt('')
      } else {
        toast.error(result.error || 'Failed to generate request')
      }
    } catch (error) {
      toast.error('An error occurred while generating the request')
      console.error(error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Request Generator
          </DialogTitle>
          <DialogDescription>
            Describe what you want to test in plain English, and AI will generate the API request for you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">What do you want to test?</Label>
            <Textarea
              id="ai-prompt"
              placeholder="Example: Get all users from the API with pagination support..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Lightbulb className="h-4 w-4" />
              <span>Example prompts:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="text-xs px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full border border-purple-500/20 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> Be specific about the HTTP method, endpoint, and any parameters or body data you need.
              The AI will generate a complete request configuration including headers, query params, and request body.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={generating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
          >
            {generating ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              <div className="flex flex-row items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Generate Request</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
