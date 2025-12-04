'use client'

import * as React from 'react'
import { Globe, Settings } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Environment {
  id: string
  name: string
  description?: string | null
  variables: Record<string, string>
}

interface EnvironmentSelectorProps {
  environments: Environment[]
  selectedEnvironmentId?: string | null
  onSelectEnvironment: (environmentId: string | null) => void
  onManageEnvironments?: () => void
}

export function EnvironmentSelector({
  environments,
  selectedEnvironmentId,
  onSelectEnvironment,
  onManageEnvironments
}: EnvironmentSelectorProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const selectedEnv = environments.find(e => e.id === selectedEnvironmentId)

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 min-w-[200px]">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select
          value={selectedEnvironmentId || 'none'}
          onValueChange={(value) => onSelectEnvironment(value === 'none' ? null : value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="No environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Environments</SelectLabel>
              <SelectItem value="none">
                <span className="text-muted-foreground">No environment</span>
              </SelectItem>
              {environments.map((env) => (
                <SelectItem key={env.id} value={env.id}>
                  <div className="flex items-center justify-between w-full gap-3">
                    <span>{env.name}</span>
                    {env.description && (
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {env.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {selectedEnv && (
        <Badge variant="secondary" className="text-xs">
          {Object.keys(selectedEnv.variables).length} vars
        </Badge>
      )}

      {onManageEnvironments && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onManageEnvironments}
          title="Manage Environments"
        >
          <div className="flex flex-row items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="text-xs">Manage</span>
          </div>
        </Button>
      )}
    </div>
  )
}
