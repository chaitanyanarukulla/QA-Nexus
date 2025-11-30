'use server'

import { prisma } from '@/lib/prisma'

export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  entityTitle,
  changes,
}: {
  userId: string
  action: string
  entityType: string
  entityId: string
  entityTitle?: string
  changes?: any
}) {
  try {
    const activity = await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        entityTitle,
        changes,
      },
    })

    return { success: true, activity }
  } catch (error) {
    console.error('Failed to log activity:', error)
    return { success: false, error: 'Failed to log activity' }
  }
}

export async function getActivityLog({
  entityType,
  entityId,
  userId,
  limit = 50,
}: {
  entityType?: string
  entityId?: string
  userId?: string
  limit?: number
}) {
  try {
    const activities = await prisma.activityLog.findMany({
      where: {
        ...(entityType && { entityType }),
        ...(entityId && { entityId }),
        ...(userId && { userId }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return { success: true, activities }
  } catch (error) {
    console.error('Failed to get activity log:', error)
    return { success: false, error: 'Failed to get activity log' }
  }
}

export async function getRecentActivity({ limit = 20 }: { limit?: number } = {}) {
  try {
    const activities = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return { success: true, activities }
  } catch (error) {
    console.error('Failed to get recent activity:', error)
    return { success: false, error: 'Failed to get recent activity' }
  }
}
