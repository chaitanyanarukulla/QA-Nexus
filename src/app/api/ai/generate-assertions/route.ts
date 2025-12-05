import { NextRequest, NextResponse } from 'next/server'
import { generateApiAssertions } from '@/lib/ai/ai'

export async function POST(request: NextRequest) {
  try {
    const { responseBody, statusCode } = await request.json()

    if (!responseBody || !statusCode) {
      return NextResponse.json(
        { success: false, error: 'Response body and status code are required' },
        { status: 400 }
      )
    }

    const assertions = await generateApiAssertions(responseBody, statusCode)

    return NextResponse.json({
      success: true,
      assertions
    })
  } catch (error) {
    console.error('Error generating assertions:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate assertions'
      },
      { status: 500 }
    )
  }
}
