'use server'

import { prisma } from '@/lib/prisma'
import type { NotificationType } from '@prisma/client'

export async function createNotification({
  userId,
  type,
  title,
  message,
  entityType,
  entityId,
}: {
  userId: string
  type: NotificationType
  title: string
  message: string
  entityType?: string
  entityId?: string
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        entityType,
        entityId,
      },
    })

    return { success: true, notification }
  } catch (error) {
    console.error('Failed to create notification:', error)
    return { success: false, error: 'Failed to create notification' }
  }
}

export async function getNotifications({ userId, unreadOnly = false }: { userId: string; unreadOnly?: boolean }) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return { success: true, notifications }
  } catch (error) {
    console.error('Failed to get notifications:', error)
    return { success: false, error: 'Failed to get notifications' }
  }
}

export async function markNotificationAsRead({ notificationId }: { notificationId: string }) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return { success: true, notification }
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return { success: false, error: 'Failed to mark notification as read' }
  }
}

export async function markAllNotificationsAsRead({ userId }: { userId: string }) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    return { success: false, error: 'Failed to mark all notifications as read' }
  }
}

export async function getUnreadNotificationCount({ userId }: { userId: string }) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })

    return { success: true, count }
  } catch (error) {
    console.error('Failed to get unread notification count:', error)
    return { success: false, count: 0 }
  }
}
