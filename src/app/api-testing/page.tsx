import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { ApiTestingClient } from './client'
export const dynamic = 'force-dynamic'
import { Network, Zap } from 'lucide-react'

export const metadata = {
  title: 'API Testing | QA Nexus',
  description: 'Playwright-powered API testing with visual request builder'
}

async function getCollections() {
  // For now, get collections for the first user (in production, use auth)
  const user = await prisma.user.findFirst()

  if (!user) {
    return { collections: [], userId: '' }
  }

  const collections = await prisma.apiCollection.findMany({
    where: { createdBy: user.id },
    include: {
      requests: {
        select: {
          id: true,
          title: true,
          method: true,
          url: true,
          order: true
        },
        orderBy: { order: 'asc' }
      },
      _count: {
        select: { requests: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return { collections, userId: user.id }
}

export default async function ApiTestingPage() {
  const { collections, userId } = await getCollections()

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">API Testing</h1>
        <p className="text-muted-foreground">
          Playwright-powered API testing with visual request builder and OpenAPI support
        </p>
      </div>


      <Suspense fallback={
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading API Testing...</p>
        </div>
      }>
        <ApiTestingClient
          initialCollections={collections as any}
          userId={userId}
        />
      </Suspense>
    </div>
  )
}
