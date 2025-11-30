'use client'

import { useState } from 'react'
import { Plus, X, GripVertical, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { generateAssertionsForRequest } from '@/app/actions/ai-test-generator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Assertion {
  id: string;
  type: string;
  field?: string;
  operator: string;
  expectedValue?: string;
  enabled: boolean;
}

interface AssertionsBuilderProps {
  assertions: Assertion[];
  onAssertionsChange: (assertions: Assertion[]) => void;
  responseBody?: string;
  statusCode?: number;
}

export function AssertionsBuilder({ assertions, onAssertionsChange, responseBody, statusCode }: AssertionsBuilderProps) {
  const [newAssertionType, setNewAssertionType] = useState('STATUS_CODE')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateAssertions = async () => {
    if (!responseBody) {
      toast.error('No response body available. Please execute the request first.')
      return
    }

    setIsGenerating(true)
    const result = await generateAssertionsForRequest(responseBody, statusCode || 200)
    setIsGenerating(false)

    if (result.success && result.assertions) {
      const newAssertions = result.assertions.map((a: any) => ({
        id: Date.now().toString() + Math.random().toString(),
        type: a.type,
        field: a.field || '',
        operator: a.operator,
        expectedValue: a.expectedValue || '',
        enabled: true
      }))
      onAssertionsChange([...assertions, ...newAssertions])
      toast.success(`Generated ${newAssertions.length} assertions`)
    } else {
      toast.error('Failed to generate assertions: ' + result.error)
    }
  }

  const handleAddAssertion = () => {
    const newAssertion: Assertion = {
      id: Date.now().toString(),
      type: newAssertionType,
      field: '',
      operator: 'EQUALS',
      expectedValue: '',
      enabled: true
    }
    onAssertionsChange([...assertions, newAssertion])
  }

  const handleRemoveAssertion = (id: string) => {
    onAssertionsChange(assertions.filter((a) => a.id !== id))
  }

  const handleUpdateAssertion = (id: string, updates: Partial<Assertion>) => {
    onAssertionsChange(
      assertions.map((a) => (a.id === id ? { ...a, ...updates } : a))
    )
  }

  const handleToggleAssertion = (id: string) => {
    onAssertionsChange(
      assertions.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    )
  }

  const getAssertionLabel = (type: string) => {
    const labels: Record<string, string> = {
      STATUS_CODE: 'Status Code',
      RESPONSE_TIME: 'Response Time',
      HEADER_VALUE: 'Header Value',
      JSON_PATH: 'JSON Path',
      SCHEMA_VALIDATION: 'Schema Validation',
      CUSTOM: 'Custom Code'
    }
    return labels[type] || type
  }

  const getOperatorOptions = (type: string) => {
    switch (type) {
      case 'STATUS_CODE':
        return ['EQUALS', 'NOT_EQUALS']
      case 'RESPONSE_TIME':
        return ['LESS_THAN', 'GREATER_THAN']
      case 'JSON_PATH':
      case 'HEADER_VALUE':
        return ['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS', 'MATCHES_REGEX', 'EXISTS', 'NOT_EXISTS']
      case 'CUSTOM':
        return ['CUSTOM']
      default:
        return ['EQUALS']
    }
  }

  const getOperatorLabel = (operator: string) => {
    const labels: Record<string, string> = {
      EQUALS: 'equals',
      NOT_EQUALS: 'not equals',
      CONTAINS: 'contains',
      NOT_CONTAINS: 'not contains',
      GREATER_THAN: 'greater than',
      LESS_THAN: 'less than',
      MATCHES_REGEX: 'matches regex',
      EXISTS: 'exists',
      NOT_EXISTS: 'does not exist',
      CUSTOM: 'custom'
    }
    return labels[operator] || operator
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Add Assertion</Label>
        <div className="flex gap-2">
          <Select value={newAssertionType} onValueChange={setNewAssertionType}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STATUS_CODE">Status Code</SelectItem>
              <SelectItem value="RESPONSE_TIME">Response Time</SelectItem>
              <SelectItem value="HEADER_VALUE">Header Value</SelectItem>
              <SelectItem value="JSON_PATH">JSON Path</SelectItem>
              <SelectItem value="SCHEMA_VALIDATION">Schema Validation</SelectItem>
              <SelectItem value="CUSTOM">Custom Code</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddAssertion} className="gap-2">
            <Plus className="h-4 w-4" />
            Add
          </Button>
          <Button onClick={handleGenerateAssertions} variant="outline" className="gap-2" disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate with AI
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Add assertions to automatically validate response. All enabled assertions must pass for the test to succeed.
        </p>
      </div>

      {assertions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No assertions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add assertions to validate your API response</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {assertions.map((assertion) => (
            <Card key={assertion.id} className={assertion.enabled ? '' : 'opacity-50'}>
              <CardContent className="py-4">
                <div className="space-y-3">
                  {/* Type and Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <Badge variant={assertion.enabled ? 'default' : 'secondary'}>
                        {getAssertionLabel(assertion.type)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleAssertion(assertion.id)}
                      >
                        {assertion.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveAssertion(assertion.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Status Code */}
                  {assertion.type === 'STATUS_CODE' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Operator</Label>
                        <Select
                          value={assertion.operator}
                          onValueChange={(op) => handleUpdateAssertion(assertion.id, { operator: op })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getOperatorOptions(assertion.type).map((op) => (
                              <SelectItem key={op} value={op}>
                                {getOperatorLabel(op)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Status Code</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 200"
                          value={assertion.expectedValue || ''}
                          onChange={(e) => handleUpdateAssertion(assertion.id, { expectedValue: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Response Time */}
                  {assertion.type === 'RESPONSE_TIME' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Operator</Label>
                        <Select
                          value={assertion.operator}
                          onValueChange={(op) => handleUpdateAssertion(assertion.id, { operator: op })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getOperatorOptions(assertion.type).map((op) => (
                              <SelectItem key={op} value={op}>
                                {getOperatorLabel(op)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Milliseconds</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 500"
                          value={assertion.expectedValue || ''}
                          onChange={(e) => handleUpdateAssertion(assertion.id, { expectedValue: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Header Value */}
                  {assertion.type === 'HEADER_VALUE' && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Header Name</Label>
                        <Input
                          placeholder="e.g., Content-Type"
                          value={assertion.field || ''}
                          onChange={(e) => handleUpdateAssertion(assertion.id, { field: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Operator</Label>
                          <Select
                            value={assertion.operator}
                            onValueChange={(op) => handleUpdateAssertion(assertion.id, { operator: op })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getOperatorOptions(assertion.type).map((op) => (
                                <SelectItem key={op} value={op}>
                                  {getOperatorLabel(op)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Value</Label>
                          <Input
                            placeholder="e.g., application/json"
                            value={assertion.expectedValue || ''}
                            onChange={(e) => handleUpdateAssertion(assertion.id, { expectedValue: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* JSON Path */}
                  {assertion.type === 'JSON_PATH' && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">JSON Path</Label>
                        <Input
                          placeholder="e.g., data.user.id or users[0].name"
                          value={assertion.field || ''}
                          onChange={(e) => handleUpdateAssertion(assertion.id, { field: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Operator</Label>
                          <Select
                            value={assertion.operator}
                            onValueChange={(op) => handleUpdateAssertion(assertion.id, { operator: op })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getOperatorOptions(assertion.type).map((op) => (
                                <SelectItem key={op} value={op}>
                                  {getOperatorLabel(op)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Expected Value</Label>
                          <Input
                            placeholder="e.g., 123"
                            value={assertion.expectedValue || ''}
                            onChange={(e) => handleUpdateAssertion(assertion.id, { expectedValue: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Custom */}
                  {assertion.type === 'CUSTOM' && (
                    <div>
                      <Label className="text-xs">Custom Assertion Code</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Enter Playwright assertion code (e.g., expect(data.id).toBeDefined())
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
