import OpenAI from 'openai'
import { prisma } from './prisma'

export interface GeneratedTestCase {
    title: string
    description: string
    steps: string
    expectedResult: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

interface AIMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

/**
 * Get the configured AI client based on settings
 */
async function getAIClient() {
    const settings = await prisma.aIProviderSettings.findFirst({
        orderBy: { createdAt: 'desc' }
    })

    if (!settings || settings.provider === 'OPENAI') {
        // Use OpenAI (ChatGPT)
        const apiKey = settings?.openaiApiKey || process.env.OPENAI_API_KEY || ''
        return {
            type: 'openai' as const,
            client: new OpenAI({ apiKey }),
            model: settings?.openaiModel || 'gpt-4o-mini'
        }
    } else {
        // Use Foundry (local LLM)
        return {
            type: 'foundry' as const,
            url: settings.foundryUrl || 'http://localhost:8000',
            model: settings.foundryModel || 'llama2'
        }
    }
}

/**
 * Make a chat completion request to either OpenAI or Foundry
 */
export async function chatCompletion(
    messages: AIMessage[],
    options: {
        temperature?: number
        maxTokens?: number
    } = {}
): Promise<string> {
    const { temperature = 0.7, maxTokens = 2000 } = options
    const aiConfig = await getAIClient()

    if (aiConfig.type === 'openai') {
        const completion = await aiConfig.client.chat.completions.create({
            model: aiConfig.model,
            messages: messages.map(m => ({
                role: m.role,
                content: m.content
            })),
            temperature,
            max_tokens: maxTokens,
        })

        return completion.choices[0]?.message?.content || ''
    } else {
        // Foundry API call
        // Adjust this based on your Foundry's actual API format
        const response = await fetch(`${aiConfig.url}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: aiConfig.model,
                messages: messages.map(m => ({
                    role: m.role,
                    content: m.content
                })),
                temperature,
                max_tokens: maxTokens,
            }),
        })

        if (!response.ok) {
            throw new Error(`Foundry request failed: ${response.statusText}`)
        }

        const data = await response.json()
        // Adjust this based on Foundry's response format
        return data.choices?.[0]?.message?.content || data.response || ''
    }
}

export async function generateTestCases(
    requirement: string,
    options?: {
        includeEdgeCases?: boolean
        includeNegativeCases?: boolean
        count?: number
    }
): Promise<GeneratedTestCase[]> {
    const { includeEdgeCases = true, includeNegativeCases = true, count = 5 } = options || {}

    const prompt = `You are a QA expert. Generate comprehensive test cases for the following requirement:

${requirement}

Generate ${count} test cases that include:
${includeEdgeCases ? '- Edge cases and boundary conditions' : ''}
${includeNegativeCases ? '- Negative test scenarios' : ''}
- Happy path scenarios
- Important validations

For each test case, provide:
1. Title (concise, descriptive)
2. Description (brief context)
3. Steps (numbered list, clear and actionable)
4. Expected Result (what should happen)
5. Priority (LOW, MEDIUM, HIGH, or CRITICAL)

Return ONLY a valid JSON array of test cases with this exact structure:
[
  {
    "title": "Test case title",
    "description": "Brief description",
    "steps": "1. Step one\\n2. Step two\\n3. Step three",
    "expectedResult": "Expected outcome",
    "priority": "MEDIUM"
  }
]

Important: Return ONLY the JSON array, no markdown formatting, no explanations.`

    try {
        const content = await chatCompletion([
            {
                role: 'system',
                content: 'You are a QA expert who generates comprehensive, well-structured test cases. Always return valid JSON.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ], { temperature: 0.7, maxTokens: 2000 })

        if (!content) {
            throw new Error('No content generated')
        }

        // Clean up the response (remove markdown code blocks if present)
        let cleanContent = content.trim()
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '')
        } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '')
        }

        // Parse the JSON response
        const testCases = JSON.parse(cleanContent) as GeneratedTestCase[]

        // Validate the response
        if (!Array.isArray(testCases)) {
            throw new Error('Invalid response format')
        }

        return testCases
    } catch (error) {
        console.error('Error generating test cases:', error)
        throw new Error('Failed to generate test cases. Please try again.')
    }
}

export async function improveTestCase(
    testCase: string,
    improvementType: 'clarity' | 'coverage' | 'detail'
): Promise<string> {
    const prompts = {
        clarity: 'Make this test case clearer and more concise while maintaining all important details.',
        coverage: 'Enhance this test case to improve test coverage by adding more validation steps.',
        detail: 'Add more detailed steps and expected results to this test case.',
    }

    try {
        const content = await chatCompletion([
            {
                role: 'system',
                content: 'You are a QA expert who improves test cases.',
            },
            {
                role: 'user',
                content: `${prompts[improvementType]}\n\nTest Case:\n${testCase}`,
            },
        ], { temperature: 0.5, maxTokens: 1000 })

        return content || testCase
    } catch (error) {
        console.error('Error improving test case:', error)
        return testCase
    }
}

export async function answerQuestion(
    question: string,
    context: {
        testCases?: any[]
        testRuns?: any[]
        defects?: any[]
    }
): Promise<string> {
    const contextString = `
Context Data:
- Test Cases: ${context.testCases?.length || 0}
- Test Runs: ${context.testRuns?.length || 0}
- Defects: ${context.defects?.length || 0}

Recent Data Snippets:
${JSON.stringify(context.testCases?.slice(0, 5) || [], null, 2)}
${JSON.stringify(context.defects?.slice(0, 5) || [], null, 2)}
`

    try {
        const content = await chatCompletion([
            {
                role: 'system',
                content: 'You are a QA Assistant. Answer questions about the testing data provided in the context. Be concise and helpful.',
            },
            {
                role: 'user',
                content: `Context:\n${contextString}\n\nQuestion: ${question}`,
            },
        ], { temperature: 0.5, maxTokens: 500 })

        return content || 'I could not generate an answer.'
    } catch (error) {
        console.error('Error answering question:', error)
        return 'Sorry, I encountered an error while processing your question.'
    }
}

export interface DocumentAnalysisResult {
    risks: Array<{
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
        title: string
        description: string
        impact: string
    }>
    gaps: Array<{
        category: string
        title: string
        description: string
        suggestion: string
    }>
    missedRequirements: Array<{
        title: string
        description: string
        reasoning: string
    }>
    recommendations: Array<{
        priority: 'LOW' | 'MEDIUM' | 'HIGH'
        title: string
        description: string
        actionItems: string[]
    }>
    summary: string
}

export async function analyzeDocument(
    documentContent: string,
    documentTitle: string,
    sourceType: 'JIRA_EPIC' | 'CONFLUENCE_PAGE'
): Promise<DocumentAnalysisResult> {
    const prompt = `You are a QA expert analyzing requirements documentation. Perform a comprehensive analysis of the following ${sourceType === 'JIRA_EPIC' ? 'Jira Epic and its stories' : 'Confluence documentation'}.

Document Title: ${documentTitle}

Document Content:
${documentContent.substring(0, 20000)}

Analyze the document and identify:

1. **Risks**: Potential issues that could affect product quality, user experience, or project success
   - Consider technical risks, usability risks, performance risks, security risks
   - Rate severity as LOW, MEDIUM, HIGH, or CRITICAL

2. **Gaps**: Missing information, unclear requirements, or incomplete specifications
   - Look for missing edge cases, undefined behaviors, incomplete acceptance criteria
   - Identify areas where more detail is needed

3. **Missed Requirements**: Important requirements that should be included but are not mentioned
   - Consider accessibility, security, performance, error handling, data validation
   - Think about user experience, edge cases, and system integration

4. **Recommendations**: Actionable suggestions to improve the requirements and testing approach
   - Prioritize as LOW, MEDIUM, or HIGH
   - Include specific action items

5. **Summary**: A brief executive summary of the analysis (2-3 paragraphs)

Return ONLY valid JSON with this exact structure:
{
  "risks": [
    {
      "severity": "HIGH",
      "title": "Risk title",
      "description": "Detailed description of the risk",
      "impact": "What could go wrong if not addressed"
    }
  ],
  "gaps": [
    {
      "category": "Requirements",
      "title": "Gap title",
      "description": "What information is missing",
      "suggestion": "What should be added or clarified"
    }
  ],
  "missedRequirements": [
    {
      "title": "Requirement title",
      "description": "Description of the missing requirement",
      "reasoning": "Why this requirement is important"
    }
  ],
  "recommendations": [
    {
      "priority": "HIGH",
      "title": "Recommendation title",
      "description": "Detailed recommendation",
      "actionItems": ["Action 1", "Action 2"]
    }
  ],
  "summary": "Overall analysis summary (2-3 paragraphs)"
}

Important: Return ONLY the JSON object, no markdown formatting, no explanations.`

    try {
        const content = await chatCompletion([
            {
                role: 'system',
                content: 'You are a QA expert who performs thorough requirements analysis. Always return valid JSON.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ], { temperature: 0.6, maxTokens: 3000 })

        if (!content) {
            throw new Error('No analysis content generated')
        }

        // Clean up the response (remove markdown code blocks if present)
        let cleanContent = content.trim()
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '')
        } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '')
        }

        // Parse the JSON response
        const analysis = JSON.parse(cleanContent) as DocumentAnalysisResult

        // Validate the response structure
        if (!analysis.risks || !analysis.gaps || !analysis.missedRequirements || !analysis.recommendations || !analysis.summary) {
            throw new Error('Invalid analysis format: missing required fields')
        }

        return analysis
    } catch (error) {
        console.error('Error analyzing document:', error)
        throw new Error('Failed to analyze document. Please try again.')
    }
}

export interface GeneratedAssertion {
    type: string
    field?: string
    operator: string
    expectedValue?: string
    description: string
}

export async function generateApiAssertions(
    responseBody: string,
    statusCode: number
): Promise<GeneratedAssertion[]> {
    const prompt = `Analyze this API response and suggest meaningful assertions:

Status Code: ${statusCode}
Response Body:
${responseBody.substring(0, 5000)}

Generate Playwright-compatible assertions that validate:
1. Critical fields exist and have correct types
2. Business logic constraints (e.g., email format, age > 0)
3. Response structure matches expected schema

Return ONLY a valid JSON array of assertions with this exact structure:
[
  {
    "type": "JSON_PATH", // or STATUS_CODE, HEADER_VALUE, RESPONSE_TIME
    "field": "data.user.email", // JSON path if applicable
    "operator": "MATCHES_REGEX", // EQUALS, CONTAINS, GREATER_THAN, etc.
    "expectedValue": "^[^@]+@[^@]+\\.[^@]+$",
    "description": "Email should be valid format"
  }
]

Supported Operators: EQUALS, NOT_EQUALS, CONTAINS, NOT_CONTAINS, GREATER_THAN, LESS_THAN, MATCHES_REGEX, EXISTS, NOT_EXISTS
`

    try {
        const content = await chatCompletion([
            {
                role: 'system',
                content: 'You are a QA expert who generates API assertions. Always return valid JSON.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ], { temperature: 0.5, maxTokens: 1500 })

        if (!content) {
            throw new Error('No content generated')
        }

        let cleanContent = content.trim()
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '')
        } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '')
        }

        const assertions = JSON.parse(cleanContent) as GeneratedAssertion[]

        if (!Array.isArray(assertions)) {
            throw new Error('Invalid response format')
        }

        return assertions
    } catch (error) {
        console.error('Error generating assertions:', error)
        throw new Error('Failed to generate assertions')
    }
}

export interface GeneratedApiRequest {
    title: string
    method: string
    url: string
    headers?: Record<string, string>
    queryParams?: Record<string, string>
    body?: any
    description: string
}

export async function generateApiRequest(prompt: string): Promise<GeneratedApiRequest> {
    const aiPrompt = `Generate an API request based on this description:

"${prompt}"

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Request Title",
  "method": "GET", // or POST, PUT, DELETE, etc.
  "url": "/users", // Relative URL or full URL
  "headers": { "Content-Type": "application/json" },
  "queryParams": { "page": "1" },
  "body": { "key": "value" }, // or null if none
  "description": "Brief description of what this request does"
}

Important: Return ONLY the JSON object, no markdown formatting.`

    try {
        const content = await chatCompletion([
            {
                role: 'system',
                content: 'You are a QA expert who generates API requests. Always return valid JSON.',
            },
            {
                role: 'user',
                content: aiPrompt,
            },
        ], { temperature: 0.7, maxTokens: 1000 })

        if (!content) {
            throw new Error('No content generated')
        }

        let cleanContent = content.trim()
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '')
        } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '')
        }

        const request = JSON.parse(cleanContent) as GeneratedApiRequest
        return request
    } catch (error) {
        console.error('Error generating API request:', error)
        throw new Error('Failed to generate API request')
    }
}
