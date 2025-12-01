'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Loader2, Database } from 'lucide-react'
import { toast } from 'sonner'

interface AIMockDataGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (mockData: any) => void
}

export function AIMockDataGenerator({
  open,
  onOpenChange,
  onGenerate
}: AIMockDataGeneratorProps) {
  const [description, setDescription] = useState('')
  const [schema, setSchema] = useState('')
  const [generating, setGenerating] = useState(false)

  const exampleDescriptions = [
    "User registration data",
    "Product catalog with prices",
    "Blog post with author info",
    "Payment transaction details",
    "Customer order with items"
  ]

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description')
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/ai/generate-mock-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          schema: schema.trim() || undefined
        })
      })

      const result = await response.json()

      if (result.success && result.mockData) {
        toast.success('Mock data generated successfully!')
        onGenerate(result.mockData)
        onOpenChange(false)
        setDescription('')
        setSchema('')
      } else {
        toast.error(result.error || 'Failed to generate mock data')
      }
    } catch (error) {
      toast.error('An error occurred while generating mock data')
      console.error(error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            AI Mock Data Generator
          </DialogTitle>
          <DialogDescription>
            Describe the data you need, and AI will generate realistic test data for your API requests
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data-description">What kind of data do you need?</Label>
            <Textarea
              id="data-description"
              placeholder="Example: User profile with name, email, age, and address..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-schema">Expected Schema (Optional)</Label>
            <Textarea
              id="data-schema"
              placeholder={`Example:\n{\n  "name": "string",\n  "email": "string",\n  "age": "number"\n}`}
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              rows={6}
              className="font-mono text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Provide a JSON schema to guide the generation (optional)
            </p>
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Quick examples:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {exampleDescriptions.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setDescription(example)}
                  className="text-xs px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-300 rounded-full border border-green-500/20 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>Tip:</strong> The AI will generate realistic, varied test data that matches common patterns.
              You can specify formats (emails, phone numbers, dates) in your description.
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
            disabled={generating || !description.trim()}
          >
            {generating ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              <div className="flex flex-row items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Generate Data</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
