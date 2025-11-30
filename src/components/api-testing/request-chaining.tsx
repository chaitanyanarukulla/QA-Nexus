'use client'

import { useState } from 'react'
import { Plus, Trash2, Link, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

interface ExtractionRule {
  id: string
  variableName: string
  jsonPath: string
  defaultValue?: string
  enabled: boolean
}

interface RequestChainingProps {
  extractionRules: ExtractionRule[]
  onExtractionRulesChange: (rules: ExtractionRule[]) => void
  responseBody?: string
}

export function RequestChaining({
  extractionRules,
  onExtractionRulesChange,
  responseBody,
}: RequestChainingProps) {
  const handleAddRule = () => {
    const newRule: ExtractionRule = {
      id: `rule-${Date.now()}`,
      variableName: '',
      jsonPath: '',
      defaultValue: '',
      enabled: true,
    }
    onExtractionRulesChange([...extractionRules, newRule])
  }

  const handleRemoveRule = (id: string) => {
    onExtractionRulesChange(extractionRules.filter((rule) => rule.id !== id))
  }

  const handleRuleChange = (id: string, field: keyof ExtractionRule, value: any) => {
    onExtractionRulesChange(
      extractionRules.map((rule) =>
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    )
  }

  const testExtraction = (jsonPath: string): { success: boolean; value?: any; error?: string } => {
    if (!responseBody) {
      return { success: false, error: 'No response available' }
    }

    try {
      const data = JSON.parse(responseBody)
      const value = getValueByPath(data, jsonPath)
      if (value === undefined) {
        return { success: false, error: 'Path not found' }
      }
      return { success: true, value }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const getValueByPath = (obj: any, path: string): any => {
    if (!path) return undefined

    // Handle array syntax: data.users[0].id
    const parts = path.split('.').flatMap(part => {
      const match = part.match(/([^[]+)(\[(\d+)\])?/)
      if (match) {
        const [, key, , index] = match
        return index !== undefined ? [key, index] : [key]
      }
      return [part]
    })

    let current = obj
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined
      }
      current = current[part]
    }
    return current
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-semibold">Response Data Extraction</Label>
        <p className="text-sm text-muted-foreground">
          Extract values from this response to use as variables in subsequent requests
        </p>
      </div>

      {extractionRules.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <Link className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              No extraction rules defined. Add a rule to extract data from the response.
            </p>
            <Button variant="outline" size="sm" onClick={handleAddRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Extraction Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {extractionRules.map((rule) => {
            const testResult = rule.jsonPath ? testExtraction(rule.jsonPath) : null

            return (
              <Card key={rule.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) =>
                          handleRuleChange(rule.id, 'enabled', checked)
                        }
                      />
                      <Label className="text-sm font-medium">
                        {rule.variableName || 'Unnamed Variable'}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Variable Name</Label>
                      <Input
                        value={rule.variableName}
                        onChange={(e) =>
                          handleRuleChange(rule.id, 'variableName', e.target.value)
                        }
                        placeholder="authToken"
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use as: {'{{' + rule.variableName + '}}'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">JSON Path</Label>
                      <Input
                        value={rule.jsonPath}
                        onChange={(e) =>
                          handleRuleChange(rule.id, 'jsonPath', e.target.value)
                        }
                        placeholder="data.user.token"
                        className="text-sm font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Path to value in response
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Default Value (Optional)</Label>
                    <Input
                      value={rule.defaultValue || ''}
                      onChange={(e) =>
                        handleRuleChange(rule.id, 'defaultValue', e.target.value)
                      }
                      placeholder="fallback-value"
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Used if extraction fails
                    </p>
                  </div>

                  {responseBody && testResult && (
                    <div
                      className={`flex items-start gap-2 p-2 rounded text-xs ${
                        testResult.success
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200'
                          : 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="h-4 w-4 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                      )}
                      <div className="flex-1">
                        {testResult.success ? (
                          <>
                            <p className="font-medium">Extraction Preview:</p>
                            <code className="block mt-1 p-1 bg-green-100 dark:bg-green-900/30 rounded">
                              {JSON.stringify(testResult.value)}
                            </code>
                          </>
                        ) : (
                          <p>
                            <span className="font-medium">Error:</span> {testResult.error}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          <Button variant="outline" size="sm" onClick={handleAddRule} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Rule
          </Button>
        </div>
      )}

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-4">
          <div className="text-sm space-y-2">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              How Request Chaining Works:
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Execute this request first to get a response</li>
              <li>Define extraction rules to pull values from the response</li>
              <li>
                Use extracted variables in other requests: {'{{variableName}}'}
              </li>
              <li>Variables work in URLs, headers, query params, and body</li>
              <li>Example: Extract auth token → Use in Authorization header</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
        <CardContent className="pt-4">
          <div className="text-sm space-y-2">
            <p className="font-medium text-amber-900 dark:text-amber-100">
              JSON Path Examples:
            </p>
            <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1 font-mono">
              <div className="flex justify-between">
                <code>data.user.id</code>
                <span className="text-muted-foreground">→ Simple path</span>
              </div>
              <div className="flex justify-between">
                <code>users[0].email</code>
                <span className="text-muted-foreground">→ Array access</span>
              </div>
              <div className="flex justify-between">
                <code>response.token</code>
                <span className="text-muted-foreground">→ Nested object</span>
              </div>
              <div className="flex justify-between">
                <code>items[0].id</code>
                <span className="text-muted-foreground">→ First array item</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
