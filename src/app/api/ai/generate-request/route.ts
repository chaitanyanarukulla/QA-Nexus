import { NextRequest, NextResponse } from 'next/server'
import { generateApiRequest } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const generatedRequest = await generateApiRequest(prompt)

    return NextResponse.json({
      success: true,
      request: generatedRequest
    })
  } catch (error) {
    console.error('Error generating request:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate request'
      },
      { status: 500 }
    )
  }
}
