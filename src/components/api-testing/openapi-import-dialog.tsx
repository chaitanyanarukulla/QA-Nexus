'use client'

import { useState } from 'react'
import { Upload, FileJson, Link as LinkIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { importOpenAPISpec } from '@/app/actions/api-testing'
import { validateOpenAPIFormat } from '@/lib/automation/openapi-parser'

interface OpenAPIImportDialogProps {
  userId: string;
  onImportComplete: () => void;
}

export function OpenAPIImportDialog({ userId, onImportComplete }: OpenAPIImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState('')
  const [sourceType, setSourceType] = useState<'json' | 'url'>('json')
  const [createSeparateCollections, setCreateSeparateCollections] = useState(false)
  const [validationError, setValidationError] = useState<string>('')

  const handleValidate = () => {
    if (sourceType === 'json') {
      const result = validateOpenAPIFormat(source)
      if (result.valid) {
        setValidationError('')
        toast.success('Valid OpenAPI specification!')
      } else {
        setValidationError(result.error || 'Invalid specification')
        toast.error(result.error)
      }
    } else {
      // For URLs, just check format
      try {
        new URL(source)
        setValidationError('')
        toast.success('Valid URL format')
      } catch {
        setValidationError('Invalid URL format')
        toast.error('Invalid URL format')
      }
    }
  }

  const handleImport = async () => {
    if (!source.trim()) {
      toast.error('Please provide an OpenAPI specification')
      return
    }

    setLoading(true)

    try {
      const result = await importOpenAPISpec({
        source,
        userId,
        createSeparateCollections,
      })

      if (result.success) {
        toast.success(result.message || 'OpenAPI spec imported successfully', {
          description: `Created ${result.totalRequests} API requests in ${result.collections?.length} collection(s)`,
          duration: 5000,
        })
        setOpen(false)
        setSource('')
        setValidationError('')
        onImportComplete()
      } else {
        toast.error('Import failed', {
          description: result.error,
        })
      }
    } catch (error: any) {
      toast.error('Import failed', {
        description: error.message || 'An unexpected error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  const sampleOpenAPIUrl = 'https://petstore3.swagger.io/api/v3/openapi.json'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <div className="flex flex-row items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Import OpenAPI/Swagger</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Import OpenAPI/Swagger Specification
          </DialogTitle>
          <DialogDescription>
            Import API requests from an OpenAPI 3.x or Swagger 2.x specification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Source Type Tabs */}
          <Tabs value={sourceType} onValueChange={(v) => setSourceType(v as 'json' | 'url')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json" className="gap-2">
                <FileJson className="h-4 w-4" />
                JSON Content
              </TabsTrigger>
              <TabsTrigger value="url" className="gap-2">
                <LinkIcon className="h-4 w-4" />
                URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="json" className="space-y-3">
              <div className="space-y-2">
                <Label>OpenAPI/Swagger JSON</Label>
                <Textarea
                  placeholder={`Paste your OpenAPI specification here...\n\n{\n  "openapi": "3.0.0",\n  "info": {\n    "title": "My API",\n    "version": "1.0.0"\n  },\n  "paths": {\n    ...\n  }\n}`}
                  value={source}
                  onChange={(e) => {
                    setSource(e.target.value)
                    setValidationError('')
                  }}
                  className="min-h-[300px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Paste the complete OpenAPI or Swagger JSON specification
                </p>
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-3">
              <div className="space-y-2">
                <Label>Specification URL</Label>
                <Input
                  type="url"
                  placeholder="https://api.example.com/openapi.json"
                  value={source}
                  onChange={(e) => {
                    setSource(e.target.value)
                    setValidationError('')
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the URL to your OpenAPI/Swagger specification file
                </p>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium mb-2">Try with sample:</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => setSource(sampleOpenAPIUrl)}
                  >
                    {sampleOpenAPIUrl}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">Swagger Petstore API (Demo)</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Validation Error */}
          {validationError && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Validation Error</p>
                    <p className="text-xs text-destructive/80 mt-1">{validationError}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Options */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Create separate collections by tag</Label>
                <p className="text-xs text-muted-foreground">
                  Groups endpoints into multiple collections based on OpenAPI tags
                </p>
              </div>
              <Switch checked={createSeparateCollections} onCheckedChange={setCreateSeparateCollections} />
            </div>
          </div>

          {/* Info Card */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">What gets imported:</p>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• All API endpoints with their HTTP methods</li>
                    <li>• Request parameters (query, path, header)</li>
                    <li>• Request bodies with example data</li>
                    <li>• Authentication schemes (Bearer, API Key, OAuth2, etc.)</li>
                    <li>• Response schemas for validation</li>
                    <li>• Organized by tags/folders</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4">
            <Button variant="outline" onClick={handleValidate} disabled={!source.trim() || loading}>
              Validate
            </Button>
            <Button onClick={handleImport} disabled={!source.trim() || loading} className="flex-1">
              {loading ? (
                <div className="flex flex-row items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Importing...</span>
                </div>
              ) : (
                <div className="flex flex-row items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Import Specification</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
