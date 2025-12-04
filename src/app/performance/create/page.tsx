'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPerformanceTest } from '@/actions/performance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function CreatePerformanceTest() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setLoading(true)
        try {
            const name = formData.get('name') as string
            const targetUrl = formData.get('targetUrl') as string
            const vus = parseInt(formData.get('vus') as string)
            const duration = formData.get('duration') as string

            await createPerformanceTest({
                name,
                targetUrl,
                vus,
                duration
            })

            toast.success('Test created successfully')
            router.push('/performance')
        } catch (error) {
            toast.error('Failed to create test')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Create Performance Test</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Test Name</Label>
                            <Input id="name" name="name" placeholder="e.g., Homepage Load Test" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="targetUrl">Target URL</Label>
                            <Input id="targetUrl" name="targetUrl" placeholder="https://example.com" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="vus">Virtual Users (VUs)</Label>
                                <Input id="vus" name="vus" type="number" defaultValue={10} min={1} max={100} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration</Label>
                                <Input id="duration" name="duration" placeholder="e.g., 30s, 1m" defaultValue="30s" required />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Test'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
