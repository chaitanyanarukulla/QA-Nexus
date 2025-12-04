'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationCount } from '@/app/actions/notifications'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  entityType?: string | null
  entityId?: string | null
  isRead: boolean
  createdAt: Date
}

interface NotificationsBellProps {
  userId: string
}

export function NotificationsBell({ userId }: NotificationsBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    loadNotifications()
    loadUnreadCount()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      loadUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [userId])

  const loadNotifications = async () => {
    const result = await getNotifications({ userId })
    if (result.success && result.notifications) {
      setNotifications(result.notifications)
    }
  }

  const loadUnreadCount = async () => {
    const result = await getUnreadNotificationCount({ userId })
    if (result.success) {
      setUnreadCount(result.count)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead({ notificationId })
    await loadNotifications()
    await loadUnreadCount()
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead({ userId })
    await loadNotifications()
    await loadUnreadCount()
  }

  const getEntityLink = (entityType?: string | null, entityId?: string | null) => {
    if (!entityType || !entityId) return null

    switch (entityType) {
      case 'test_case':
        return `/test-cases/${entityId}`
      case 'test_suite':
        return `/test-suites/${entityId}`
      case 'defect':
        return `/defects/${entityId}`
      case 'test_run':
        return `/test-runs/${entityId}`
      default:
        return null
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" suppressHydrationWarning>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="danger"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const link = getEntityLink(notification.entityType, notification.entityId)

                const NotificationContent = (
                  <div
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id)
                      }
                      if (link) {
                        setOpen(false)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notification.id)
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )

                if (link) {
                  return (
                    <Link key={notification.id} href={link}>
                      {NotificationContent}
                    </Link>
                  )
                }

                return <div key={notification.id}>{NotificationContent}</div>
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
