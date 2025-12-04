'use client'

import { useState, useEffect } from 'react'
import { Network } from 'lucide-react'
import { toast } from 'sonner'
import { CollectionsSidebar } from '@/components/api-testing/collections-sidebar'
import { RequestBuilder } from '@/components/api-testing/request-builder'
import { OpenAPIImportDialog } from '@/components/api-testing/openapi-import-dialog'
import { EnvironmentSelector } from '@/components/api-testing/environment-selector'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCollections, getApiRequest, getEnvironments } from '@/app/actions/api-testing'

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

interface ApiTestingClientProps {
  initialCollections: Collection[];
  userId: string;
}

export function ApiTestingClient({ initialCollections, userId }: ApiTestingClientProps) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections)
  const [selectedRequestId, setSelectedRequestId] = useState<string>()
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    initialCollections[0]?.id || ''
  )
  const [environments, setEnvironments] = useState<any[]>([])
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null)

  useEffect(() => {
    loadEnvironments()
  }, [])

  useEffect(() => {
    if (selectedRequestId) {
      loadRequest(selectedRequestId)
    } else {
      setSelectedRequest(null)
    }
  }, [selectedRequestId])

  const loadEnvironments = async () => {
    const result = await getEnvironments(userId)
    if (result.success && result.environments) {
      setEnvironments(result.environments)
    }
  }

  const loadRequest = async (requestId: string) => {
    const result = await getApiRequest(requestId)
    if (result.success && result.request) {
      setSelectedRequest(result.request)
      setSelectedCollectionId(result.request.collectionId)
    }
  }

  const handleRefresh = async () => {
    const result = await getCollections(userId)
    if (result.success && result.collections) {
      setCollections(result.collections as any)
    }
    await loadEnvironments()
  }

  const [isCreating, setIsCreating] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error('Please enter a collection name')
      return
    }

    const { createCollection } = await import('@/app/actions/api-testing')
    const result = await createCollection({
      title: newCollectionName,
      userId
    })

    if (result.success) {
      toast.success('Collection created')
      setNewCollectionName('')
      setIsCreating(false)
      handleRefresh()
      if (result.collection) {
        setSelectedCollectionId(result.collection.id)
      }
    } else {
      toast.error('Failed to create collection: ' + result.error)
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl flex-col md:flex-row ring-1 ring-white/5">
      <div className="hidden md:block h-full border-r border-white/10 bg-black/20">
        <CollectionsSidebar
          collections={collections}
          selectedRequestId={selectedRequestId}
          userId={userId}
          onRequestSelect={setSelectedRequestId}
          onRefresh={handleRefresh}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-900/50 to-slate-950/50 backdrop-blur-sm">
        {/* Environment Toolbar */}
        {(selectedRequestId || selectedCollectionId) && (
          <div className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-6 py-3">
            <EnvironmentSelector
              environments={environments}
              selectedEnvironmentId={selectedEnvironmentId}
              onSelectEnvironment={setSelectedEnvironmentId}
              onManageEnvironments={() => window.location.href = '/api-testing/environments'}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {selectedRequestId && selectedRequest ? (
            <div className="p-6">
              <RequestBuilder
                requestId={selectedRequestId}
                collectionId={selectedRequest.collectionId}
                userId={userId}
                environmentId={selectedEnvironmentId}
                initialData={selectedRequest}
                onSave={handleRefresh}
              />
            </div>
          ) : selectedCollectionId ? (
            <div className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {collections.find(c => c.id === selectedCollectionId)?.title || 'Collection'}
                  </h2>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this collection?')) {
                        const { deleteCollection } = await import('@/app/actions/api-testing')
                        const result = await deleteCollection(selectedCollectionId)
                        if (result.success) {
                          toast.success('Collection deleted')
                          handleRefresh()
                          setSelectedCollectionId('')
                        } else {
                          toast.error('Failed to delete collection: ' + result.error)
                        }
                      }
                    }}
                  >
                    Delete Collection
                  </Button>
                </div>
                <RequestBuilder
                  collectionId={selectedCollectionId}
                  userId={userId}
                  environmentId={selectedEnvironmentId}
                  onSave={handleRefresh}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center p-6">
              <div className="space-y-6 max-w-md w-full">
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                      <Network className="h-12 w-12 text-indigo-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-white">No Collection Selected</h2>
                  <p className="text-slate-400 mb-8 leading-relaxed">
                    Get started by creating a new collection or importing an existing OpenAPI specification.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button
                      size="lg"
                      className="w-full font-semibold shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white border-0"
                      onClick={() => setIsCreating(true)}
                    >
                      Create New Collection
                    </Button>
                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-transparent px-2 text-slate-500 font-medium">Or</span>
                      </div>
                    </div>
                    <OpenAPIImportDialog userId={userId} onImportComplete={handleRefresh} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Collection Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Collection Name</Label>
              <Input
                id="name"
                placeholder="e.g., User API"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateCollection()
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            <Button onClick={handleCreateCollection}>Create Collection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
