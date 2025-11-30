'use client'

import { useState, useEffect } from 'react'
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
    <div className="flex flex-1 overflow-hidden">
      <CollectionsSidebar
        collections={collections}
        selectedRequestId={selectedRequestId}
        userId={userId}
        onRequestSelect={setSelectedRequestId}
        onRefresh={handleRefresh}
      />

      <div className="flex-1 overflow-auto p-6">
        {selectedRequestId && selectedRequest ? (
          <RequestBuilder
            requestId={selectedRequestId}
            collectionId={selectedRequest.collectionId}
            userId={userId}
            initialData={selectedRequest}
            onSave={handleRefresh}
          />
        ) : selectedCollectionId ? (
          <RequestBuilder
            collectionId={selectedCollectionId}
            userId={userId}
            onSave={handleRefresh}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">No Collection Selected</h2>
                <p className="text-muted-foreground mb-4">
                  Create a collection or import an OpenAPI specification to get started
                </p>
              </div>
              <OpenAPIImportDialog userId={userId} onImportComplete={handleRefresh} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
