'use client'

import { useState } from 'react'
import { Folder, Plus, Trash2, FileText, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { createCollection, deleteCollection, deleteApiRequest, executeApiRequest } from '@/app/actions/api-testing'
import { importOpenApiSpec } from '@/app/actions/api-import'
import { generateRequestFromPrompt } from '@/app/actions/ai-test-generator'
import { CollectionRunner } from './collection-runner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Sparkles } from 'lucide-react'

interface Collection {
  id: string;
  title: string;
  description?: string | null;
  requests: Array<{
    id: string;
    title: string;
    method: string;
    url: string;
  }>;
}

interface CollectionsSidebarProps {
  collections: Collection[];
  selectedRequestId?: string;
  userId: string;
  onRequestSelect: (requestId: string) => void;
  onRefresh: () => void;
}

export function CollectionsSidebar({
  collections,
  selectedRequestId,
  userId,
  onRequestSelect,
  onRefresh
}: CollectionsSidebarProps) {
  const [creatingCollection, setCreatingCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [importingCollection, setImportingCollection] = useState(false)
  const [specContent, setSpecContent] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [generatingRequest, setGeneratingRequest] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error('Please enter a collection name')
      return
    }

    const result = await createCollection({
      title: newCollectionName,
      userId
    })

    if (result.success) {
      toast.success('Collection created')
      setNewCollectionName('')
      setCreatingCollection(false)
      onRefresh()
    } else {
      toast.error('Failed to create collection: ' + result.error)
    }
  }

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) {
      return
    }

    const result = await deleteCollection(id)

    if (result.success) {
      toast.success('Collection deleted')
      onRefresh()
    } else {
      toast.error('Failed to delete collection: ' + result.error)
    }
  }

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) {
      return
    }

    const result = await deleteApiRequest(id)

    if (result.success) {
      toast.success('Request deleted')
      onRefresh()
    } else {
      toast.error('Failed to delete request: ' + result.error)
    }
  }

  const handleExecuteRequest = async (e: React.MouseEvent, requestId: string) => {
    e.stopPropagation()

    toast.info('Executing request...')

    const result = await executeApiRequest(requestId, userId)

    if (result.success) {
      toast.success(`Request completed: ${result.execution?.status}`)
      onRefresh()
    } else {
      toast.error('Execution failed: ' + result.error)
    }
  }

  const handleImport = async () => {
    if (!specContent.trim()) {
      toast.error('Please paste an OpenAPI spec')
      return
    }

    setIsImporting(true)
    const result = await importOpenApiSpec(specContent, userId)
    setIsImporting(false)

    if (result.success) {
      toast.success('Collection imported successfully')
      setImportingCollection(false)
      setSpecContent('')
      onRefresh()
    } else {
      toast.error('Import failed: ' + result.error)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    let targetCollectionId = collections[0]?.id

    if (!targetCollectionId) {
      const res = await createCollection({ title: 'AI Generated', userId })
      if (res.success && res.collection) {
        targetCollectionId = res.collection.id
      } else {
        toast.error('Failed to create collection')
        return
      }
    }

    setIsGenerating(true)
    const result = await generateRequestFromPrompt(prompt, targetCollectionId, userId)
    setIsGenerating(false)

    if (result.success) {
      toast.success('Request generated successfully')
      setGeneratingRequest(false)
      setPrompt('')
      onRefresh()
      if (result.request) {
        onRequestSelect(result.request.id)
      }
    } else {
      toast.error('Generation failed: ' + result.error)
    }
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      'GET': 'text-blue-600',
      'POST': 'text-green-600',
      'PUT': 'text-yellow-600',
      'PATCH': 'text-orange-600',
      'DELETE': 'text-red-600',
    }
    return colors[method] || 'text-gray-600'
  }

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Collections</h2>
          <Button
            size="sm"
            onClick={() => setCreatingCollection(true)}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
          <Button
            size="sm"
            onClick={() => setImportingCollection(true)}
            variant="outline"
            className="ml-2"
          >
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button
            size="sm"
            onClick={() => setGeneratingRequest(true)}
            variant="outline"
            className="ml-2"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Generate
          </Button>
        </div>

        {creatingCollection && (
          <div className="flex gap-2">
            <Input
              placeholder="Collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateCollection()
                } else if (e.key === 'Escape') {
                  setCreatingCollection(false)
                  setNewCollectionName('')
                }
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleCreateCollection}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setCreatingCollection(false)
                setNewCollectionName('')
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Collections List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {collections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No collections yet</p>
              <p className="text-xs mt-1">Create one to get started</p>
            </div>
          ) : (
            collections.map((collection) => (
              <div key={collection.id} className="mb-2">
                <div className="flex items-center justify-between p-2 rounded hover:bg-accent group">
                  <div className="flex items-center gap-2 flex-1">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{collection.title}</span>
                    <span className="text-xs text-muted-foreground">
                      ({collection.requests.length})
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <CollectionRunner
                      collectionId={collection.id}
                      collectionName={collection.title}
                      requestCount={collection.requests.length}
                      userId={userId}
                      onComplete={onRefresh}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDeleteCollection(collection.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Requests in collection */}
                <div className="ml-4 mt-1 space-y-1">
                  {collection.requests.map((request) => (
                    <div
                      key={request.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent group ${selectedRequestId === request.id ? 'bg-accent' : ''
                        }`}
                      onClick={() => onRequestSelect(request.id)}
                    >
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className={`text-xs font-medium ${getMethodColor(request.method)}`}>
                        {request.method}
                      </span>
                      <span className="text-xs flex-1 truncate">{request.title}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0"
                          onClick={(e) => handleExecuteRequest(e, request.id)}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteRequest(request.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <Dialog open={importingCollection} onOpenChange={setImportingCollection}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import OpenAPI Spec</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="spec" className="text-sm font-medium">
                Paste JSON Spec
              </label>
              <Textarea
                id="spec"
                placeholder='{"openapi": "3.0.0", ...}'
                className="h-[300px] font-mono text-xs"
                value={specContent}
                onChange={(e) => setSpecContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportingCollection(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? 'Importing...' : 'Import Collection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={generatingRequest} onOpenChange={setGeneratingRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate API Request with AI</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="prompt" className="text-sm font-medium">
                Describe the request
              </label>
              <Textarea
                id="prompt"
                placeholder="Create a POST request to /api/login with email and password..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGeneratingRequest(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
