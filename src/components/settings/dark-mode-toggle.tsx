'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from "next-themes"

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === 'dark'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          Theme
        </CardTitle>
        <CardDescription>
          Switch between light and dark mode
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Current theme preference
            </p>
          </div>
        </div>
        <Button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          variant={isDark ? 'primary' : 'secondary'}
          size="sm"
        >
          {isDark ? (
            <div className="flex flex-row items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </div>
          ) : (
            <div className="flex flex-row items-center gap-2">
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
