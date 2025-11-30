'use client'

import { useState, useEffect } from 'react'
import { Network } from 'lucide-react'
import { CollectionsSidebar } from '@/components/api-testing/collections-sidebar'
import { RequestBuilder } from '@/components/api-testing/request-builder'
import { OpenAPIImportDialog } from '@/components/api-testing/openapi-import-dialog'
import { getCollections, getApiRequest } from '@/app/actions/api-testing'

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

  useEffect(() => {
    if (selectedRequestId) {
      loadRequest(selectedRequestId)
    } else {
      setSelectedRequest(null)
    }
  }, [selectedRequestId])

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
  }

  return (
    <div className="flex flex-1 overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-900">
      <CollectionsSidebar
        collections={collections}
        selectedRequestId={selectedRequestId}
        userId={userId}
        onRequestSelect={setSelectedRequestId}
        onRefresh={handleRefresh}
      />

      <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-950">
        {selectedRequestId && selectedRequest ? (
          <div className="p-6">
            <RequestBuilder
              requestId={selectedRequestId}
              collectionId={selectedRequest.collectionId}
              userId={userId}
              initialData={selectedRequest}
              onSave={handleRefresh}
            />
          </div>
        ) : selectedCollectionId ? (
          <div className="p-6">
            <RequestBuilder
              collectionId={selectedCollectionId}
              userId={userId}
              onSave={handleRefresh}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-6">
            <div className="space-y-6 max-w-md">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <Network className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">No Collection Selected</h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Create a collection or import an OpenAPI specification to start testing your APIs
                </p>
                <OpenAPIImportDialog userId={userId} onImportComplete={handleRefresh} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
