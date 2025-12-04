'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, FileText, Folder, Play, Bug, Home, Settings, BarChart2, FileSearch, Sparkles, Network, Menu, X, Link2, User, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/test-cases', label: 'Test Cases', icon: FileText },
  { href: '/test-suites', label: 'Test Suites', icon: Folder },
  { href: '/test-runs', label: 'Test Runs', icon: Play },
  { href: '/api-testing', label: 'API Testing', icon: Network },
  { href: '/performance', label: 'Performance', icon: Activity },
  { href: '/defects', label: 'Defects', icon: Bug },
  { href: '/document-analysis', label: 'Analysis', icon: FileSearch },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/traceability', label: 'Traceability', icon: Link2 },
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
          'fixed left-0 top-0 h-screen bg-sidebar/80 backdrop-blur-xl border-r-0', // Removed border, added backdrop blur
          'transition-all duration-300 ease-in-out z-40',
          'flex flex-col shadow-2xl',
          isCollapsed ? 'w-20' : 'w-64',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className="flex h-20 items-center justify-between px-4 bg-transparent">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-2 flex-1">
              <>
                <img
                  src="/logo-new.jpg"
                  alt="QA Nexus"
                  className="h-[72px] w-auto max-w-[310px] object-contain flex-shrink-0 rounded-lg"
                />
              </>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/" className="flex items-center justify-center w-full">
              <img
                src="/FavIcon.png"
                alt="QA Nexus"
                className="h-8 w-8 object-contain"
              />
            </Link>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium relative overflow-hidden group',
                  isActive
                    ? 'text-white bg-indigo-600' // Clean active state
                    : 'text-slate-500 hover:text-foreground hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full shadow-[0_0_10px_#6366f1]" />
                )}

                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-white" : "group-hover:text-indigo-500 dark:group-hover:text-indigo-300"
                )} />

                {!isCollapsed && (
                  <span className={cn(
                    "truncate transition-colors duration-300",
                    isActive && "font-semibold"
                  )}>
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md">
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <Avatar className="h-9 w-9 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.3)]">
              <AvatarImage src="/avatars/01.png" alt="User" />
              <AvatarFallback className="bg-indigo-950 text-indigo-200">QA</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Chaitanya N.</p>
                <p className="text-xs text-slate-400 truncate">Lead QA Engineer</p>
              </div>
            )}
            {!isCollapsed && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10">
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Collapse Button */}
        <div className="p-2 bg-transparent flex justify-center lg:justify-end">
          <Button
            onClick={toggleCollapse}
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
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
