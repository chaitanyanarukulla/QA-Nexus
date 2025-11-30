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
          'fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-r border-slate-200 dark:border-slate-800',
          'transition-all duration-300 ease-in-out z-40',
          'flex flex-col shadow-xl',
          isCollapsed ? 'w-20' : 'w-64',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-2 flex-1">
              <img
                src="/icon.png"
                alt="QA Nexus"
                className="h-[72px] w-auto max-w-[310px] object-contain flex-shrink-0"
              />
            </Link>
          )}
          {isCollapsed && (
            <Link href="/" className="flex items-center justify-center w-full">
              <img
                src="/favIcon.png"
                alt="QA Nexus"
                className="h-8 w-8 object-contain"
              />
            </Link>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium relative overflow-hidden group',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50 dark:shadow-blue-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:shadow-md hover:scale-[1.02]'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive && "drop-shadow-sm"
                )} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <div className="absolute right-2 w-1.5 h-8 bg-white/30 rounded-full"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Button */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
          <Button
            onClick={toggleCollapse}
            variant="secondary"
            size="sm"
            className="w-full transition-all duration-200 justify-center lg:justify-start bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900 dark:hover:to-indigo-900 border-0 shadow-sm hover:shadow-md"
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
