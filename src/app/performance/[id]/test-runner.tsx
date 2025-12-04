'use client'

import { useState } from 'react'
import { runPerformanceTest } from '@/actions/performance'
import { Button } from '@/components/ui/button'
import { Play, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function TestRunner({ testId }: { testId: string }) {
    const [running, setRunning] = useState(false)
    const router = useRouter()

    async function handleRun() {
        setRunning(true)
        try {
            toast.info('Starting performance test...')
            await runPerformanceTest(testId)
            toast.success('Test started successfully')
            router.refresh()
        } catch (error: any) {
            toast.error('Failed to start test')
            console.error(error)
        } finally {
            setRunning(false)
        }
    }

    return (
        <Button onClick={handleRun} disabled={running}>
            {running ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                </>
            ) : (
                <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Test
                </>
            )}
        </Button>
    )
}
