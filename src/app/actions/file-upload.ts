'use server'

import { prisma } from '@/lib/prisma'
import { analyzeDocument } from '@/lib/ai'
import { revalidatePath } from 'next/cache'
// Polyfills for pdf-parse/pdfjs-dist in Node.js environment
if (typeof Promise.withResolvers === 'undefined') {
    // @ts-ignore
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

// Mock browser APIs required by pdfjs-dist
const globalAny = global as any
if (!globalAny.DOMMatrix) globalAny.DOMMatrix = class DOMMatrix { }
if (!globalAny.ImageData) globalAny.ImageData = class ImageData { }
if (!globalAny.Path2D) globalAny.Path2D = class Path2D { }
if (!globalAny.requestAnimationFrame) globalAny.requestAnimationFrame = (callback: any) => setTimeout(callback, 0)
if (!globalAny.cancelAnimationFrame) globalAny.cancelAnimationFrame = (id: any) => clearTimeout(id)

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse')

/**
 * Analyze an uploaded file (PDF or Text)
 */
export async function analyzeUploadedFile(formData: FormData) {
    try {
        const file = formData.get('file') as File
        if (!file) {
            return { success: false, error: 'No file provided' }
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        let content = ''

        if (file.type === 'application/pdf') {
            const data = await pdf(buffer)
            content = data.text
        } else {
            // Assume text/plain or markdown
            content = buffer.toString('utf-8')
        }

        if (!content.trim()) {
            return { success: false, error: 'File is empty or could not be parsed' }
        }

        // Analyze the document using AI
        const analysis = await analyzeDocument(
            content,
            file.name,
            'LOCAL_FILE' as any // Casting to any to bypass strict typing if it exists in lib/ai, though it seemed to be a string in schema
        )

        // Save the analysis to database
        const documentAnalysis = await prisma.documentAnalysis.create({
            data: {
                sourceType: 'LOCAL_FILE',
                sourceId: file.name, // Use filename as ID for local files
                sourceTitle: file.name,
                sourceContent: content,
                risks: JSON.stringify(analysis.risks),
                gaps: JSON.stringify(analysis.gaps),
                missedRequirements: JSON.stringify(analysis.missedRequirements),
                recommendations: JSON.stringify(analysis.recommendations),
                summary: analysis.summary,
            }
        })

        revalidatePath('/analytics')
        return { success: true, analysisId: documentAnalysis.id, analysis }
    } catch (error) {
        console.error('Failed to analyze file:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to analyze file'
        }
    }
}
