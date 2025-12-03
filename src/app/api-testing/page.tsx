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
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <Network className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md">
              API Testing
            </h1>
          </div>
          <p className="text-blue-100 mt-2 text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-300" />
            Playwright-powered API testing with visual request builder and OpenAPI support
          </p>
        </div>
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
