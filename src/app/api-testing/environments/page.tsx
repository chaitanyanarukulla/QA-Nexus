import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { EnvironmentsClient } from './client'

export const metadata = {
  title: 'Environments | API Testing | QA Nexus',
  description: 'Manage API testing environments and variables'
}

async function getEnvironments() {
  // For now, get environments for the first user (in production, use auth)
  const user = await prisma.user.findFirst()

  if (!user) {
    return { environments: [], userId: '' }
  }

  const environments = await prisma.environment.findMany({
    where: { createdBy: user.id },
    orderBy: { createdAt: 'desc' }
  })

  return { environments, userId: user.id }
}

export default async function EnvironmentsPage() {
  const { environments, userId } = await getEnvironments()

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <EnvironmentsClient
          initialEnvironments={environments as any}
          userId={userId}
        />
      </Suspense>
    </div>
  )
}
