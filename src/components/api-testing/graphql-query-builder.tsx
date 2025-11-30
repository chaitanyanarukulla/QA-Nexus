'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code2, Play, BookOpen } from 'lucide-react'

interface GraphQLQueryBuilderProps {
  query: string
  variables: string
  onQueryChange: (query: string) => void
  onVariablesChange: (variables: string) => void
}

export function GraphQLQueryBuilder({
  query,
  variables,
  onQueryChange,
  onVariablesChange,
}: GraphQLQueryBuilderProps) {
  const [activeTab, setActiveTab] = useState<'query' | 'variables' | 'examples'>('query')

  const sampleQueries = {
    query: `query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      id
      title
      content
    }
  }
}`,
    mutation: `mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    content
    author {
      id
      name
    }
  }
}`,
    subscription: `subscription OnPostCreated {
  postCreated {
    id
    title
    content
    author {
      id
      name
    }
  }
}`,
  }

  const sampleVariables = `{
  "id": "1",
  "input": {
    "title": "My Post",
    "content": "Hello World"
  }
}`

  const handleInsertExample = (type: 'query' | 'mutation' | 'subscription') => {
    onQueryChange(sampleQueries[type])
    onVariablesChange(sampleVariables)
    setActiveTab('query')
  }

  const validateJSON = (value: string) => {
    if (!value.trim()) return true
    try {
      JSON.parse(value)
      return true
    } catch {
      return false
    }
  }

  const isValidVariables = validateJSON(variables)

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="query" className="gap-2">
            <Code2 className="h-4 w-4" />
            Query
          </TabsTrigger>
          <TabsTrigger value="variables" className="gap-2">
            <Play className="h-4 w-4" />
            Variables
          </TabsTrigger>
          <TabsTrigger value="examples" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Examples
          </TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-2 mt-4">
          <Label>GraphQL Query/Mutation/Subscription</Label>
          <Textarea
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={`query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}`}
            className="font-mono text-sm min-h-[300px]"
          />
          <p className="text-xs text-muted-foreground">
            Enter your GraphQL query, mutation, or subscription
          </p>
        </TabsContent>

        <TabsContent value="variables" className="space-y-2 mt-4">
          <Label>Query Variables (JSON)</Label>
          <Textarea
            value={variables}
            onChange={(e) => onVariablesChange(e.target.value)}
            placeholder={`{
  "id": "1",
  "input": {
    "key": "value"
  }
}`}
            className={`font-mono text-sm min-h-[300px] ${
              !isValidVariables ? 'border-destructive' : ''
            }`}
          />
          {!isValidVariables && (
            <p className="text-xs text-destructive">Invalid JSON format</p>
          )}
          <p className="text-xs text-muted-foreground">
            Variables to pass to your GraphQL query (must be valid JSON)
          </p>
        </TabsContent>

        <TabsContent value="examples" className="space-y-3 mt-4">
          <div className="space-y-2">
            <Label>Quick Start Examples</Label>
            <p className="text-xs text-muted-foreground">
              Click an example to insert it into the query editor
            </p>
          </div>

          <Card>
            <CardContent className="pt-4 space-y-3">
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInsertExample('query')}
                  className="w-full justify-start"
                >
                  <Code2 className="h-4 w-4 mr-2" />
                  Query Example (Get User)
                </Button>
                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                  {sampleQueries.query}
                </pre>
              </div>

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInsertExample('mutation')}
                  className="w-full justify-start"
                >
                  <Code2 className="h-4 w-4 mr-2" />
                  Mutation Example (Create Post)
                </Button>
                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                  {sampleQueries.mutation}
                </pre>
              </div>

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInsertExample('subscription')}
                  className="w-full justify-start"
                >
                  <Code2 className="h-4 w-4 mr-2" />
                  Subscription Example (Real-time Updates)
                </Button>
                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                  {sampleQueries.subscription}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="pt-4">
              <div className="text-sm space-y-2">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  GraphQL Query Tips:
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>Use variables for dynamic values: <code className="text-xs">$id: ID!</code></li>
                  <li>Query for only the fields you need</li>
                  <li>Use fragments for reusable field selections</li>
                  <li>Aliases let you rename fields in the response</li>
                  <li>Directives like @include and @skip add conditional logic</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
