import { JiraSettingsForm } from '@/components/settings/jira-settings-form'
import { AISettingsForm } from '@/components/settings/ai-settings-form'
import { DarkModeToggle } from '@/components/settings/dark-mode-toggle'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-10 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your application preferences and integrations.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <DarkModeToggle />
                    <AISettingsForm />
                    <JiraSettingsForm />
                </div>
            </div>
        </div>
    )
}
