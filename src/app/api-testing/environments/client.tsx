'use client'

import { useState, useEffect } from 'react'
import { EnvironmentManager } from '@/components/api-testing/environment-manager'
import { getEnvironments } from '@/app/actions/api-testing'

interface Environment {
  id: string;
  name: string;
  description?: string | null;
  variables: Record<string, string>;
}

interface EnvironmentsClientProps {
  initialEnvironments: Environment[];
  userId: string;
}

export function EnvironmentsClient({ initialEnvironments, userId }: EnvironmentsClientProps) {
  const [environments, setEnvironments] = useState<Environment[]>(initialEnvironments)

  const handleUpdate = async () => {
    const result = await getEnvironments(userId)
    if (result.success && result.environments) {
      setEnvironments(result.environments as any)
    }
  }

  return (
    <EnvironmentManager
      environments={environments}
      userId={userId}
      onUpdate={handleUpdate}
    />
  )
}
