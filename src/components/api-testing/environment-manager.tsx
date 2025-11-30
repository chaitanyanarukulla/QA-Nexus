'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, Globe } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createEnvironment, updateEnvironment, deleteEnvironment } from '@/app/actions/api-testing'

interface Environment {
  id: string;
  name: string;
  description?: string | null;
  variables: Record<string, string>;
}

interface EnvironmentManagerProps {
  environments: Environment[];
  userId: string;
  onUpdate: () => void;
}

export function EnvironmentManager({ environments, userId, onUpdate }: EnvironmentManagerProps) {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [variablesText, setVariablesText] = useState('{}')

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter an environment name')
      return
    }

    let variables: Record<string, string>
    try {
      variables = JSON.parse(variablesText)
    } catch (e) {
      toast.error('Invalid JSON for variables')
      return
    }

    const result = await createEnvironment({
      name,
      description: description || undefined,
      variables,
      userId
    })

    if (result.success) {
      toast.success('Environment created')
      setCreating(false)
      setName('')
      setDescription('')
      setVariablesText('{}')
      onUpdate()
    } else {
      toast.error('Failed to create environment: ' + result.error)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!name.trim()) {
      toast.error('Please enter an environment name')
      return
    }

    let variables: Record<string, string>
    try {
      variables = JSON.parse(variablesText)
    } catch (e) {
      toast.error('Invalid JSON for variables')
      return
    }

    const result = await updateEnvironment(id, {
      name,
      description: description || undefined,
      variables
    })

    if (result.success) {
      toast.success('Environment updated')
      setEditing(null)
      setName('')
      setDescription('')
      setVariablesText('{}')
      onUpdate()
    } else {
      toast.error('Failed to update environment: ' + result.error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this environment?')) {
      return
    }

    const result = await deleteEnvironment(id)

    if (result.success) {
      toast.success('Environment deleted')
      onUpdate()
    } else {
      toast.error('Failed to delete environment: ' + result.error)
    }
  }

  const handleEdit = (env: Environment) => {
    setEditing(env.id)
    setName(env.name)
    setDescription(env.description || '')
    setVariablesText(JSON.stringify(env.variables, null, 2))
  }

  const handleCancel = () => {
    setCreating(false)
    setEditing(null)
    setName('')
    setDescription('')
    setVariablesText('{}')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Environments</h2>
          <p className="text-sm text-muted-foreground">
            Manage environment variables for different deployment stages
          </p>
        </div>
        <Button onClick={() => setCreating(true)} disabled={creating || editing !== null}>
          <Plus className="h-4 w-4 mr-2" />
          New Environment
        </Button>
      </div>

      {/* Create Form */}
      {creating && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Create New Environment</CardTitle>
            <CardDescription>
              Define environment variables like API_KEY, BASE_URL, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name *</Label>
              <Input
                id="create-name"
                placeholder="e.g., Development, Staging, Production"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Input
                id="create-description"
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-variables">Variables (JSON) *</Label>
              <Textarea
                id="create-variables"
                placeholder='{\n  "BASE_URL": "https://api.example.com",\n  "API_KEY": "your-key-here"\n}'
                value={variablesText}
                onChange={(e) => setVariablesText(e.target.value)}
                className="font-mono text-sm min-h-[150px]"
              />
              <p className="text-xs text-muted-foreground">
                Use these variables in requests with <code>{'{{VARIABLE_NAME}}'}</code>
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate}>
                <Save className="h-4 w-4 mr-2" />
                Create
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environments List */}
      <div className="space-y-4">
        {environments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Environments Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create an environment to manage variables like API keys and base URLs
              </p>
              <Button onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Environment
              </Button>
            </CardContent>
          </Card>
        ) : (
          environments.map((env) => (
            <Card key={env.id}>
              {editing === env.id ? (
                // Edit Mode
                <>
                  <CardHeader>
                    <CardTitle>Edit Environment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-name-${env.id}`}>Name *</Label>
                      <Input
                        id={`edit-name-${env.id}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-description-${env.id}`}>Description</Label>
                      <Input
                        id={`edit-description-${env.id}`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-variables-${env.id}`}>Variables (JSON) *</Label>
                      <Textarea
                        id={`edit-variables-${env.id}`}
                        value={variablesText}
                        onChange={(e) => setVariablesText(e.target.value)}
                        className="font-mono text-sm min-h-[150px]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdate(env.id)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                // View Mode
                <>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          {env.name}
                        </CardTitle>
                        {env.description && (
                          <CardDescription>{env.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(env)}
                          disabled={creating || editing !== null}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(env.id)}
                          disabled={creating || editing !== null}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Variables</Label>
                        <Badge variant="secondary">
                          {Object.keys(env.variables).length} variable(s)
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(env.variables).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center gap-2 p-2 bg-muted rounded text-sm font-mono"
                          >
                            <span className="font-medium text-primary">{key}:</span>
                            <span className="text-muted-foreground truncate flex-1">
                              {value.length > 30 ? value.substring(0, 30) + '...' : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
