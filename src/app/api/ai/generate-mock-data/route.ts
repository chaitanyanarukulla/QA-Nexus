import { NextRequest, NextResponse } from 'next/server'
import { generateMockData } from '@/lib/ai/ai'

export async function POST(request: NextRequest) {
  try {
    const { description, schema } = await request.json()

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      )
    }

    const mockData = await generateMockData(description, schema)

    return NextResponse.json({
      success: true,
      mockData
    })
  } catch (error) {
    console.error('Error generating mock data:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate mock data'
      },
      { status: 500 }
    )
  }
}
