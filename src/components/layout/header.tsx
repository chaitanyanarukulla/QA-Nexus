import { NotificationsBell } from '@/components/collaboration/notifications-bell'
import { prisma } from '@/lib/prisma'

export async function Header() {
    // Get the first user (in a real app, you'd get from session/auth)
    const user = await prisma.user.findFirst()
    const userId = user?.id || ''

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800">
            <div className="flex h-14 items-center justify-between px-4 lg:px-6 lg:ml-64">
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                    <NotificationsBell userId={userId} />
                </div>
            </div>
        </header>
    )
}
