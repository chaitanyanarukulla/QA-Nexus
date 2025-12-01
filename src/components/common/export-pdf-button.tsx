'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function ExportPdfButton() {
    return (
        <Button variant="outline" onClick={() => window.print()}>
            <div className="flex flex-row items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Export PDF</span>
            </div>
        </Button>
    )
}
