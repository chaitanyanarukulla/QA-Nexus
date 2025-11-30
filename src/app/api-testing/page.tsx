import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { ApiTestingClient } from './client'

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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b bg-background p-4">
        <h1 className="text-2xl font-bold">API Testing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Playwright-powered API testing with visual request builder
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <ApiTestingClient
          initialCollections={collections as any}
          userId={userId}
        />
      </Suspense>
    </div>
  )
}
