'use server'

import { prisma } from '@/lib/prisma'
import { generateK6Script } from '@/lib/k6-generator'
import { readdir, writeFile, readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { auth } from '@clerk/nextjs/server'
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

    const test = await prisma.performanceTest.create({
        data: {
            ...data,
            createdBy: userId
        }
    })

    revalidatePath('/performance')
    return test
}

export async function runPerformanceTest(testId: string) {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

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
            executedBy: userId
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
        await execAsync(`k6 run --out json=${resultsPath} ${scriptPath}`)

        // Read results
        const resultsData = await readFile(resultsPath, 'utf-8')
        // k6 JSON output is one JSON object per line (streaming), or a single array if configured?
        // Actually --out json produces a file with one JSON object per line for each metric point.
        // This is too large to store. We should use --summary-export for the summary.

        // Let's re-run with --summary-export
        await execAsync(`k6 run --summary-export=${resultsPath} ${scriptPath}`)
        const summaryData = await readFile(resultsPath, 'utf-8')
        const metrics = JSON.parse(summaryData)

        await prisma.performanceExecution.update({
            where: { id: executionId },
            data: {
                status: 'COMPLETED',
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
