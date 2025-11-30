'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const aiSettingsSchema = z.object({
  provider: z.enum(['OPENAI', 'FOUNDRY']),
  openaiApiKey: z.string().optional(),
  openaiModel: z.string().optional(),
  foundryUrl: z.string().url().optional().or(z.literal('')),
  foundryModel: z.string().optional(),
})

export async function getAISettings() {
  // Get the first (and should be only) AI settings record
  const settings = await prisma.aIProviderSettings.findFirst({
    orderBy: { createdAt: 'desc' }
  })

  // Return settings or defaults
  if (!settings) {
    return {
      id: '',
      provider: 'OPENAI' as const,
      openaiApiKey: null,
      openaiModel: 'gpt-4o-mini',
      foundryUrl: 'http://localhost:8000',
      foundryModel: 'llama2',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  return settings
}

export async function updateAISettings(rawData: unknown) {
  try {
    const data = aiSettingsSchema.parse(rawData)

    // Validate that required fields are present based on provider
    if (data.provider === 'OPENAI' && !data.openaiApiKey) {
      return { success: false, error: 'OpenAI API key is required when using ChatGPT' }
    }

    if (data.provider === 'FOUNDRY' && !data.foundryUrl) {
      return { success: false, error: 'Foundry URL is required when using local LLM' }
    }

    // Get existing settings or create new
    const existingSettings = await prisma.aIProviderSettings.findFirst()

    let settings
    if (existingSettings) {
      settings = await prisma.aIProviderSettings.update({
        where: { id: existingSettings.id },
        data: {
          provider: data.provider,
          openaiApiKey: data.openaiApiKey || existingSettings.openaiApiKey,
          openaiModel: data.openaiModel || 'gpt-4o-mini',
          foundryUrl: data.foundryUrl || existingSettings.foundryUrl,
          foundryModel: data.foundryModel || 'llama2',
        },
      })
    } else {
      settings = await prisma.aIProviderSettings.create({
        data: {
          provider: data.provider,
          openaiApiKey: data.openaiApiKey,
          openaiModel: data.openaiModel || 'gpt-4o-mini',
          foundryUrl: data.foundryUrl,
          foundryModel: data.foundryModel || 'llama2',
        },
      })
    }

    revalidatePath('/settings')
    return { success: true, data: settings }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation error' }
    }
    return { success: false, error: 'Failed to update AI settings' }
  }
}

export async function testAIConnection(provider: 'OPENAI' | 'FOUNDRY') {
  try {
    const settings = await getAISettings()

    if (provider === 'OPENAI') {
      if (!settings.openaiApiKey) {
        return { success: false, error: 'OpenAI API key not configured' }
      }
      // Test OpenAI connection with a simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${settings.openaiApiKey}`,
        },
      })
      if (response.ok) {
        return { success: true, message: 'ChatGPT (OpenAI) connection successful' }
      } else {
        return { success: false, error: 'Invalid OpenAI API key' }
      }
    } else if (provider === 'FOUNDRY') {
      if (!settings.foundryUrl) {
        return { success: false, error: 'Foundry URL not configured' }
      }
      // Test Foundry connection - adjust endpoint based on your Foundry implementation
      const response = await fetch(`${settings.foundryUrl}/api/models`, {
        method: 'GET',
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          message: 'Local LLM (Foundry) connection successful',
          models: data.models || []
        }
      } else {
        // Try alternative health check endpoint
        const healthResponse = await fetch(`${settings.foundryUrl}/health`)
        if (healthResponse.ok) {
          return { success: true, message: 'Local LLM (Foundry) connection successful' }
        }
        return { success: false, error: 'Cannot connect to Foundry. Make sure Foundry is running.' }
      }
    }

    return { success: false, error: 'Invalid provider' }
  } catch (error) {
    console.error('Connection test failed:', error)
    return { success: false, error: 'Connection test failed. Please check if the service is running.' }
  }
}
