'use server'

import { prisma } from '@/lib/prisma'
import { generateK6Script } from '@/lib/automation/k6-generator'
import { readdir, writeFile, readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { auth, currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

const execAsync = promisify(exec)

export async function createPerformanceTest(data: {
    name: string
    targetUrl: string
    vus: number
    duration: string
}) {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    // Ensure user exists in local DB (Lazy Sync)
    let user = await prisma.user.findUnique({
        where: { clerkId: userId }
    })

    if (!user) {
        const clerkUser = await currentUser()
        if (!clerkUser) throw new Error('User not found in Clerk')

        const email = clerkUser.emailAddresses[0]?.emailAddress
        if (!email) throw new Error('User has no email')

        user = await prisma.user.create({
            data: {
                clerkId: userId,
                email: email,
                name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || 'Unknown User',
                role: 'TESTER'
            }
        })
    }

    const test = await prisma.performanceTest.create({
        data: {
            ...data,
            createdBy: user.id // Use local DB ID
        }
    })

    revalidatePath('/performance')
    return test
}

export async function runPerformanceTest(testId: string) {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    // Ensure user exists in local DB (Lazy Sync)
    let user = await prisma.user.findUnique({
        where: { clerkId: userId }
    })

    if (!user) {
        const clerkUser = await currentUser()
        if (!clerkUser) throw new Error('User not found in Clerk')

        const email = clerkUser.emailAddresses[0]?.emailAddress
        if (!email) throw new Error('User has no email')

        user = await prisma.user.create({
            data: {
                clerkId: userId,
                email: email,
                name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || 'Unknown User',
                role: 'TESTER'
            }
        })
    }

    // 1. Fetch test config
    const test = await prisma.performanceTest.findUnique({
        where: { id: testId }
    })
    if (!test) throw new Error('Test not found')

    // 2. Create execution record
    const execution = await prisma.performanceExecution.create({
        data: {
            testId,
            status: 'RUNNING',
            executedBy: user.id // Use local DB ID
        }
    })

    // 3. Generate script
    const script = generateK6Script({
        targetUrl: test.targetUrl,
        vus: test.vus,
        duration: test.duration,
        thresholds: test.thresholds
    })

    // 4. Execute k6 (in background)
    // We don't await this so the UI returns immediately
    executeK6(execution.id, script).catch(console.error)

    revalidatePath(`/performance/${testId}`)
    return execution
}

async function executeK6(executionId: string, scriptContent: string) {
    const tmpDir = join(process.cwd(), 'tmp')
    // Ensure tmp dir exists (mkdir -p)
    await execAsync(`mkdir -p ${tmpDir}`)

    const scriptPath = join(tmpDir, `test-${executionId}.js`)
    const resultsPath = join(tmpDir, `results-${executionId}.json`)

    try {
        await writeFile(scriptPath, scriptContent)

        // Run k6
        // Note: k6 must be in PATH
        let status = 'COMPLETED'
        try {
            await execAsync(`k6 run --summary-export=${resultsPath} ${scriptPath}`)
        } catch (err: any) {
            // If thresholds are crossed, k6 exits with non-zero code but still generates report
            if (err.message && err.message.includes('thresholds on metrics')) {
                status = 'FAILED'
                console.log('k6 thresholds crossed, proceeding to save results.')
            } else {
                throw err // Rethrow other errors to be caught by outer block
            }
        }

        // Read results
        // k6 JSON output is one JSON object per line (streaming), or a single array if configured?
        // Actually --out json produces a file with one JSON object per line for each metric point.
        // This is too large to store. We should use --summary-export for the summary.

        // We already ran with --summary-export above
        const summaryData = await readFile(resultsPath, 'utf-8')
        const metrics = JSON.parse(summaryData)

        await prisma.performanceExecution.update({
            where: { id: executionId },
            data: {
                status,
                metrics,
                completedAt: new Date()
            }
        })

    } catch (error: any) {
        console.error('k6 execution failed:', error)

        // Check if error is "k6: command not found"
        let errorMessage = error.message
        if (errorMessage.includes('command not found') || errorMessage.includes('is not recognized')) {
            errorMessage = 'k6 is not installed on the server. Please install k6 to run performance tests.'
        }

        await prisma.performanceExecution.update({
            where: { id: executionId },
            data: {
                status: 'FAILED',
                metrics: { error: errorMessage },
                completedAt: new Date()
            }
        })
    } finally {
        // Cleanup
        try {
            await unlink(scriptPath)
            await unlink(resultsPath)
        } catch { }
    }
}
