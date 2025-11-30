import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    action?: {
        label: string
        href?: string
        onClick?: () => void
    }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                    <Icon className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    {description}
                </p>
                {action && (
                    action.href ? (
                        <Button asChild>
                            <Link href={action.href}>
                                {action.label}
                            </Link>
                        </Button>
                    ) : (
                        <Button onClick={action.onClick}>
                            {action.label}
                        </Button>
                    )
                )}
            </CardContent>
        </Card>
    )
}
