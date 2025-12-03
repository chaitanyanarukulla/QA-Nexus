'use client'

import { useState, useEffect } from 'react'
import { Activity, FileText, MessageSquare, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getActivityLog } from '@/app/actions/activity'

interface ActivityLogEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  entityTitle: string | null
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
  }
  changes?: any
}

interface ActivityTimelineProps {
  entityType?: string
  entityId?: string
  userId?: string
  limit?: number
}

export function ActivityTimeline({ entityType, entityId, userId, limit = 20 }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [entityType, entityId, userId])

  const loadActivities = async () => {
    setLoading(true)
    const result = await getActivityLog({ entityType, entityId, userId, limit })
    if (result.success && result.activities) {
      setActivities(result.activities)
    }
    setLoading(false)
  }

  const getActivityIcon = (action: string) => {
    if (action.includes('created')) return <FileText className="h-4 w-4" />
    if (action.includes('comment')) return <MessageSquare className="h-4 w-4" />
    if (action.includes('approved')) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (action.includes('rejected')) return <XCircle className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4" />
  }

  const getActivityColor = (action: string) => {
    if (action.includes('created')) return 'bg-blue-500'
    if (action.includes('updated')) return 'bg-yellow-500'
    if (action.includes('deleted')) return 'bg-red-500'
    if (action.includes('comment')) return 'bg-purple-500'
    if (action.includes('approved')) return 'bg-green-500'
    if (action.includes('rejected')) return 'bg-red-500'
    return 'bg-gray-500'
  }

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ')
  }

  const formatEntityType = (type: string) => {
    return type.replace(/_/g, ' ')
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map((n: any) => n[0]).join('').toUpperCase()
    }
    return email[0].toUpperCase()
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diff = now.getTime() - activityDate.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return activityDate.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No activity yet
          </p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-border" />

            {/* Activities */}
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex items-center justify-center h-10 w-10 rounded-full ${getActivityColor(activity.action)}`}>
                    {getActivityIcon(activity.action)}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(activity.user.name, activity.user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm">
                          <span className="font-semibold">
                            {activity.user.name || activity.user.email}
                          </span>
                          {' '}
                          <span className="text-muted-foreground">
                            {formatAction(activity.action)}
                          </span>
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(activity.createdAt)}
                      </span>
                    </div>

                    {activity.entityTitle && (
                      <p className="text-sm mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {formatEntityType(activity.entityType)}
                        </Badge>
                        {' '}
                        <span className="font-medium">{activity.entityTitle}</span>
                      </p>
                    )}

                    {activity.changes && (
                      <div className="mt-2 text-xs bg-muted/50 p-2 rounded">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(activity.changes, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
