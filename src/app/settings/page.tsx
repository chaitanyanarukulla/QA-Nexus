import { JiraSettingsForm } from '@/components/settings/jira-settings-form'
import { AISettingsForm } from '@/components/settings/ai-settings-form'
import { DarkModeToggle } from '@/components/settings/dark-mode-toggle'
import { WebhookSettingsForm } from '@/components/settings/webhook-settings-form'
import { Separator } from '@/components/ui/separator'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    // Get the first user (in a real app, you'd get from session/auth)
    const user = await prisma.user.findFirst()
    const userId = user?.id || ''

    // Check if Jira is configured
    const jiraIntegration = userId ? await prisma.jiraIntegration.findUnique({
        where: { userId }
    }) : null
    const jiraConfigured = !!(jiraIntegration?.isActive)

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your application preferences and integrations.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <DarkModeToggle />
                    <AISettingsForm />
                    <JiraSettingsForm />
                </div>
                <div className="space-y-6">
                    <WebhookSettingsForm userId={userId} jiraConfigured={jiraConfigured} />
                </div>
            </div>
        </div>
    )
}
