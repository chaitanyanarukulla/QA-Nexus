'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, FileText, Folder, Play, Bug, Home, Settings, BarChart2, FileSearch, Sparkles, Network, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/test-cases', label: 'Test Cases', icon: FileText },
  { href: '/test-suites', label: 'Test Suites', icon: Folder },
  { href: '/test-runs', label: 'Test Runs', icon: Play },
  { href: '/api-testing', label: 'API Testing', icon: Network },
  { href: '/defects', label: 'Defects', icon: Bug },
  { href: '/document-analysis', label: 'Analysis', icon: FileSearch },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/ai-insights', label: 'AI Insights', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          variant="secondary"
          size="icon"
          className="transition-smooth"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800',
          'transition-all duration-300 ease-in-out z-40',
          'flex flex-col',
          isCollapsed ? 'w-20' : 'w-64',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-2 flex-1">
              <img
                src="/icon.png"
                alt="QA Nexus"
                className="h-8 w-8 flex-shrink-0"
              />
              <span className="font-bold text-neutral-900 dark:text-neutral-50 truncate">
                QA Nexus
              </span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/" className="flex items-center justify-center w-full">
              <img
                src="/icon.png"
                alt="QA Nexus"
                className="h-8 w-8"
              />
            </Link>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-smooth text-sm font-medium',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Button */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-3">
          <Button
            onClick={toggleCollapse}
            variant="secondary"
            size="sm"
            className="w-full transition-smooth justify-center lg:justify-start"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {/* Spacer for mobile */}
        <div className="h-16 lg:hidden" />
      </div>
    </>
  )
}
