'use client'

import { Zap, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AITestGeneratorDialog } from '@/components/ai/ai-test-generator-dialog'

export function DashboardHeader() {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        QA Dashboard
                    </h1>
                </div>
                <p className="text-muted-foreground text-lg">
                    Real-time insights into your quality assurance metrics and test execution trends
                </p>
            </div>

            <div className="flex items-center gap-3">
                <AITestGeneratorDialog />

                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Report
                </Button>
            </div>
        </div>
    )
}
