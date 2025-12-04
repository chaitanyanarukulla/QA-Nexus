'use client'

import { useState, useEffect } from 'react'
import { Play, Save, Loader2, Code, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { executeApiRequest, createApiRequest, updateApiRequest } from '@/app/actions/api-testing'
import { AuthConfig } from './auth-config'
import { AssertionsBuilder } from './assertions-builder'
import { PreRequestEditor } from './pre-request-editor'
import { GraphQLQueryBuilder } from './graphql-query-builder'
import { RequestChaining } from './request-chaining'

interface RequestBuilderProps {
  requestId?: string;
  collectionId: string;
  userId: string;
  environmentId?: string | null;
  initialData?: {
    title: string;
    method: string;
    url: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    body?: any;
    bodyType?: string;
    authType?: string;
    authConfig?: any;
    assertions?: any[];
    preRequestScript?: string;
  };
  onSave?: () => void;
}

export function RequestBuilder({ requestId, collectionId, userId, environmentId, initialData, onSave }: RequestBuilderProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [method, setMethod] = useState(initialData?.method || 'GET')
  const [url, setUrl] = useState(initialData?.url || '')
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>(
    initialData?.headers ? Object.entries(initialData.headers).map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }]
  )
  const [queryParams, setQueryParams] = useState<Array<{ key: string; value: string }>>(
    initialData?.queryParams ? Object.entries(initialData.queryParams).map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }]
  )
  const [bodyType, setBodyType] = useState(initialData?.bodyType || 'JSON')
  const [body, setBody] = useState(initialData?.body ? JSON.stringify(initialData.body, null, 2) : '{}')
  const [graphqlVariables, setGraphqlVariables] = useState('{}')

  // Phase 3: Authentication, Assertions, Pre-Request
  const [authType, setAuthType] = useState(initialData?.authType || 'NONE')
  const [authConfig, setAuthConfig] = useState(initialData?.authConfig || {})
  const [assertions, setAssertions] = useState(initialData?.assertions || [])
  const [preRequestScript, setPreRequestScript] = useState(initialData?.preRequestScript || '')
  const [extractionRules, setExtractionRules] = useState<any[]>([])

  const [executing, setExecuting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [execution, setExecution] = useState<any>(null)
  const [generatedCode, setGeneratedCode] = useState<string>('')

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const handleAddQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }])
  }

  const handleRemoveQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index))
  }

  const handleQueryParamChange = (index: number, field: 'key' | 'value', value: string) => {
    const newQueryParams = [...queryParams]
    newQueryParams[index][field] = value
    setQueryParams(newQueryParams)
  }

  const handleExecute = async () => {
    if (!url) {
      toast.error('Please enter a URL')
      return
    }

    setExecuting(true)
    setExecution(null)

    try {
      // First save the request if it doesn't exist
      let currentRequestId = requestId

      if (!currentRequestId) {
        const headersObj = headers.reduce((acc, { key, value }) => {
          if (key) acc[key] = value
          return acc
        }, {} as Record<string, string>)

        const queryParamsObj = queryParams.reduce((acc, { key, value }) => {
          if (key) acc[key] = value
          return acc
        }, {} as Record<string, string>)

        let bodyObj
        try {
          bodyObj = bodyType === 'JSON' && body ? JSON.parse(body) : body
        } catch (e) {
          toast.error('Invalid JSON in body')
          setExecuting(false)
          return
        }

        const result = await createApiRequest({
          title: title || `${method} ${url}`,
          method,
          url,
          headers: headersObj,
          queryParams: queryParamsObj,
          body: bodyObj,
          bodyType,
          authType,
          authConfig,
          assertions,
          preRequestScript,
          collectionId,
          userId
        })

        if (!result.success) {
          toast.error('Failed to save request: ' + result.error)
          setExecuting(false)
          return
        }

        currentRequestId = result.request!.id
      }

      // Execute the request
      const result = await executeApiRequest(currentRequestId!, userId, environmentId || undefined)

      if (result.success) {
        setExecution(result.execution)
        setGeneratedCode(result.testCode || '')
        toast.success('Request executed successfully')
      } else {
        toast.error('Execution failed: ' + result.error)
      }
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    } finally {
      setExecuting(false)
    }
  }

  const handleSave = async () => {
    if (!url) {
      toast.error('Please enter a URL')
      return
    }

    setSaving(true)

    try {
      const headersObj = headers.reduce((acc, { key, value }) => {
        if (key) acc[key] = value
        return acc
      }, {} as Record<string, string>)

      const queryParamsObj = queryParams.reduce((acc, { key, value }) => {
        if (key) acc[key] = value
        return acc
      }, {} as Record<string, string>)

      let bodyObj
      try {
        bodyObj = bodyType === 'JSON' && body ? JSON.parse(body) : body
      } catch (e) {
        toast.error('Invalid JSON in body')
        setSaving(false)
        return
      }

      if (requestId) {
        // Update existing request
        const result = await updateApiRequest(requestId, {
          title: title || `${method} ${url}`,
          method,
          url,
          headers: headersObj,
          queryParams: queryParamsObj,
          body: bodyObj,
          bodyType,
          authType,
          authConfig,
          assertions,
          preRequestScript
        })

        if (result.success) {
          toast.success('Request updated')
          onSave?.()
        } else {
          toast.error('Failed to update: ' + result.error)
        }
      } else {
        // Create new request
        const result = await createApiRequest({
          title: title || `${method} ${url}`,
          method,
          url,
          headers: headersObj,
          queryParams: queryParamsObj,
          body: bodyObj,
          bodyType,
          authType,
          authConfig,
          assertions,
          preRequestScript,
          collectionId,
          userId
        })

        if (result.success) {
          toast.success('Request created')
          onSave?.()
        } else {
          toast.error('Failed to create: ' + result.error)
        }
      }
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Request Configuration */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm shadow-xl">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-lg font-medium text-slate-200">Request Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Get User Details"
            />
          </div>

          {/* Method and URL */}
          <div className="flex gap-2">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="HEAD">HEAD</SelectItem>
                <SelectItem value="OPTIONS">OPTIONS</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/users"
              className="flex-1"
            />
            <Button onClick={handleExecute} disabled={executing}>
              {executing ? (
                <div className="flex flex-row items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Running</span>
                </div>
              ) : (
                <div className="flex flex-row items-center gap-2">
                  <Play className="h-4 w-4" />
                  <span>Send</span>
                </div>
              )}
            </Button>
            <Button onClick={handleSave} disabled={saving} variant="outline">
              {saving ? (
                <div className="flex flex-row items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving</span>
                </div>
              ) : (
                <div className="flex flex-row items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </div>
              )}
            </Button>
          </div>

          {/* Tabs for configuration */}
          <Tabs defaultValue="params">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="params">Query Params</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="auth">Auth</TabsTrigger>
              <TabsTrigger value="assertions">Assertions</TabsTrigger>
              <TabsTrigger value="pre-request">Pre-Request</TabsTrigger>
              <TabsTrigger value="chaining">Chaining</TabsTrigger>
            </TabsList>

            <TabsContent value="params" className="space-y-2 mt-4">
              {queryParams.map((param, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={param.key}
                    onChange={(e) => handleQueryParamChange(index, 'key', e.target.value)}
                  />
                  <Input
                    placeholder="Value"
                    value={param.value}
                    onChange={(e) => handleQueryParamChange(index, 'value', e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveQueryParam(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddQueryParam}>
                + Add Query Param
              </Button>
            </TabsContent>

            <TabsContent value="headers" className="space-y-2 mt-4">
              {headers.map((header, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={header.key}
                    onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                  />
                  <Input
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveHeader(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddHeader}>
                + Add Header
              </Button>
            </TabsContent>

            <TabsContent value="body" className="space-y-2 mt-4">
              <Select value={bodyType} onValueChange={setBodyType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="JSON">JSON</SelectItem>
                  <SelectItem value="FORM_DATA">Form Data</SelectItem>
                  <SelectItem value="FORM_URLENCODED">Form URL Encoded</SelectItem>
                  <SelectItem value="RAW">Raw</SelectItem>
                  <SelectItem value="GRAPHQL">GraphQL</SelectItem>
                </SelectContent>
              </Select>

              {bodyType === 'GRAPHQL' ? (
                <GraphQLQueryBuilder
                  query={body}
                  variables={graphqlVariables}
                  onQueryChange={setBody}
                  onVariablesChange={setGraphqlVariables}
                />
              ) : bodyType !== 'NONE' ? (
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={bodyType === 'JSON' ? '{\n  "key": "value"\n}' : 'Request body'}
                  className="font-mono text-sm min-h-[200px]"
                />
              ) : null}
            </TabsContent>

            <TabsContent value="auth" className="mt-4">
              <AuthConfig
                authType={authType}
                authConfig={authConfig}
                onAuthTypeChange={setAuthType}
                onAuthConfigChange={setAuthConfig}
              />
            </TabsContent>

            <TabsContent value="assertions" className="mt-4">
              <AssertionsBuilder
                assertions={assertions}
                onAssertionsChange={setAssertions}
                responseBody={execution?.responseBody}
                statusCode={execution?.statusCode}
              />
            </TabsContent>

            <TabsContent value="pre-request" className="mt-4">
              <PreRequestEditor
                script={preRequestScript}
                onScriptChange={setPreRequestScript}
              />
            </TabsContent>

            <TabsContent value="chaining" className="mt-4">
              <RequestChaining
                extractionRules={extractionRules}
                onExtractionRulesChange={setExtractionRules}
                responseBody={execution?.responseBody}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Display */}
      {execution && (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-slate-200">Response</CardTitle>
              <div className="flex items-center gap-4">
                <Badge variant={execution.status === 'PASSED' ? 'success' : 'danger'} className="px-3 py-1">
                  {execution.status === 'PASSED' ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {execution.statusCode || execution.status}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {execution.responseTime}ms
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="body">
              <TabsList>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="code">Generated Code</TabsTrigger>
              </TabsList>

              <TabsContent value="body" className="mt-4">
                <pre className="p-4 bg-black/30 rounded-lg overflow-auto text-sm max-h-[400px] border border-white/5 font-mono text-slate-300 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {execution.responseBody || 'No response body'}
                </pre>
              </TabsContent>

              <TabsContent value="headers" className="mt-4">
                <pre className="p-4 bg-black/30 rounded-lg overflow-auto text-sm max-h-[400px] border border-white/5 font-mono text-slate-300 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {execution.responseHeaders
                    ? JSON.stringify(execution.responseHeaders, null, 2)
                    : 'No headers'}
                </pre>
              </TabsContent>

              <TabsContent value="code" className="mt-4">
                <div className="relative">
                  <pre className="p-4 bg-black/30 rounded-lg overflow-auto text-sm max-h-[400px] border border-white/5 font-mono text-slate-300 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {generatedCode || 'No code generated'}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode)
                      toast.success('Code copied to clipboard')
                    }}
                  >
                    <div className="flex flex-row items-center gap-2">
                      <Code className="h-4 w-4" />
                      <span>Copy</span>
                    </div>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {execution.errorMessage && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm font-medium text-destructive">Error:</p>
                <p className="text-sm text-muted-foreground mt-1">{execution.errorMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
