'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function ExportPdfButton() {
    return (
        <Button variant="outline" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
        </Button>
    )
}
