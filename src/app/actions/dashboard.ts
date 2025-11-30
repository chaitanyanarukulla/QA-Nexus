'use server'

import { prisma } from '@/lib/prisma'

export async function getRecentActivity() {
    const recentRuns = await prisma.testRun.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    })

    const recentDefects = await prisma.defect.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    })

    return { recentRuns, recentDefects }
}
