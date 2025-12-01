'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Activity, FileText, PlayCircle, Bug, FolderOpen, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  id: string
  action: string
  entityType: string
  entityId: string
  entityTitle: string | null
  userName: string
  createdAt: Date
  changes: any | null
}

interface RecentActivityFeedProps {
  activities: ActivityItem[]
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const getActionIcon = (action: string, entityType: string) => {
    if (action === 'created') {
      return <FileText className="h-4 w-4 text-green-600" />
    } else if (action === 'updated') {
      return <Activity className="h-4 w-4 text-blue-600" />
    } else if (action === 'deleted') {
      return <FileText className="h-4 w-4 text-red-600" />
    } else if (action === 'commented') {
      return <Activity className="h-4 w-4 text-purple-600" />
    } else if (action === 'reviewed') {
      return <User className="h-4 w-4 text-indigo-600" />
    } else if (entityType === 'test_run') {
      return <PlayCircle className="h-4 w-4 text-blue-600" />
    } else if (entityType === 'defect') {
      return <Bug className="h-4 w-4 text-red-600" />
    } else {
      return <FolderOpen className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'success'
      case 'updated':
        return 'info'
      case 'deleted':
        return 'danger'
      case 'commented':
        return 'secondary'
      case 'reviewed':
        return 'primary'
      default:
        return 'default'
    }
  }

  const getEntityTypeLabel = (entityType: string) => {
    return entityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getActivityDescription = (activity: ActivityItem) => {
    const entityLabel = getEntityTypeLabel(activity.entityType)
    const title = activity.entityTitle || 'Unknown'

    return (
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {getActionIcon(activity.action, activity.entityType)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-medium text-foreground">{activity.userName}</span>
            {' '}
            <span className="text-muted-foreground">{activity.action}</span>
            {' '}
            <Badge variant={getActionColor(activity.action) as any} className="mx-1 text-xs">
              {entityLabel}
            </Badge>
            {activity.entityTitle && (
              <>
                {' '}
                <span className="font-medium text-foreground truncate inline-block max-w-xs align-bottom">
                  "{title}"
                </span>
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest actions and changes in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No recent activity to display
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest actions and changes in the system ({activities.length} recent items)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="pb-4 border-b last:border-0 last:pb-0"
              >
                {getActivityDescription(activity)}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
