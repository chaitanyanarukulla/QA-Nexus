'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Code, FileJson, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

interface CICDExportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  collectionName: string
  environmentId?: string | null
}

type ExportFormat = 'playwright' | 'newman' | 'github-actions' | 'gitlab-ci' | 'jenkins'

export function CICDExport({
  open,
  onOpenChange,
  collectionId,
  collectionName,
  environmentId
}: CICDExportProps) {
  const [format, setFormat] = useState<ExportFormat>('playwright')
  const [includeEnv, setIncludeEnv] = useState(true)
  const [generatedCode, setGeneratedCode] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    try {
      const response = await fetch('/api/export/cicd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId,
          environmentId: includeEnv ? environmentId : null,
          format
        })
      })

      const result = await response.json()

      if (result.success && result.code) {
        setGeneratedCode(result.code)
        toast.success('Export generated successfully')
      } else {
        toast.error(result.error || 'Failed to generate export')
      }
    } catch (error) {
      toast.error('An error occurred while generating export')
      console.error(error)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const extensions = {
      playwright: '.spec.ts',
      newman: '.json',
      'github-actions': '.yml',
      'gitlab-ci': '.gitlab-ci.yml',
      jenkins: 'Jenkinsfile'
    }

    const filename = `${collectionName.toLowerCase().replace(/\s+/g, '-')}${extensions[format]}`
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            CI/CD Export: {collectionName}
          </DialogTitle>
          <DialogDescription>
            Export your API tests for continuous integration and deployment pipelines
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
                <SelectTrigger id="export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="playwright">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      <span>Playwright Test (.spec.ts)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="newman">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      <span>Postman/Newman Collection (.json)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="github-actions">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      <span>GitHub Actions Workflow (.yml)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="gitlab-ci">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      <span>GitLab CI Pipeline (.gitlab-ci.yml)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="jenkins">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      <span>Jenkins Pipeline (Jenkinsfile)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="include-env"
                  checked={includeEnv}
                  onCheckedChange={(checked) => setIncludeEnv(checked as boolean)}
                />
                <label
                  htmlFor="include-env"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include environment variables
                </label>
              </div>
            </div>
          </div>

          {!generatedCode ? (
            <div className="flex justify-center py-8">
              <Button onClick={handleGenerate}>
                <div className="flex flex-row items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span>Generate Export</span>
                </div>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated Code</Label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    <div className="flex flex-row items-center gap-2">
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </div>
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <div className="flex flex-row items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </div>
                  </Button>
                </div>
              </div>
              <Textarea
                value={generatedCode}
                readOnly
                className="font-mono text-xs h-96 resize-none"
              />
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Usage:</strong> {' '}
              {format === 'playwright' && 'Add this test file to your Playwright project and run with `npx playwright test`'}
              {format === 'newman' && 'Use with Newman CLI: `newman run collection.json`'}
              {format === 'github-actions' && 'Add this workflow to `.github/workflows/` in your repository'}
              {format === 'gitlab-ci' && 'Add this to your repository root as `.gitlab-ci.yml`'}
              {format === 'jenkins' && 'Add this as a Jenkinsfile to your repository or Jenkins job'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {generatedCode && (
            <Button onClick={() => setGeneratedCode('')}>
              Generate Another
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
