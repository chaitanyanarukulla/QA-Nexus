import { NotificationsBell } from '@/components/collaboration/notifications-bell'
import { prisma } from '@/lib/prisma'

export async function Header() {
    // Get the first user (in a real app, you'd get from session/auth)
    const user = await prisma.user.findFirst()
    const userId = user?.id || ''

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 backdrop-blur-lg supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex h-14 items-center justify-between px-4 lg:px-6 lg:ml-64">
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                    <NotificationsBell userId={userId} />
                </div>
            </div>
        </header>
    )
}
