import { chatCompletion } from './ai'
import { DocumentAnalysisResult } from './ai'

export interface EnhancedTestCase {
    title: string
    description: string
    steps: string
    expectedResult: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    coversRisks: string[]     // Risk titles this test addresses
    coversGaps: string[]      // Gap titles this test covers
    coversRequirements: string[] // Requirement titles this validates
}

/**
 * Generate test cases with requirements traceability from analysis
 */
export async function generateTestCasesWithCoverage(
    analysis: DocumentAnalysisResult,
    documentContent: string,
    count: number = 30
): Promise<EnhancedTestCase[]> {
    const prompt = `You are a QA expert. Generate comprehensive, detailed test cases with requirements traceability.

Document Content:
${documentContent.substring(0, 10000)}

Analysis Results:

IDENTIFIED RISKS:
${analysis.risks.map((r, i) => `${i + 1}. [${r.severity}] ${r.title}: ${r.description}`).join('\n')}

IDENTIFIED GAPS:
${analysis.gaps.map((g, i) => `${i + 1}. ${g.title}: ${g.description}`).join('\n')}

MISSED REQUIREMENTS:
${analysis.missedRequirements.map((m, i) => `${i + 1}. ${m.title}: ${m.description}`).join('\n')}

Generate ${count} comprehensive test cases that specifically address the above risks, gaps, and missed requirements.

For EACH test case, you MUST specify:
1. title: Concise, descriptive test case title
2. description: Detailed context about what this test validates and why it is important
3. steps: Detailed, numbered list of clear, actionable steps. Be specific about inputs and actions.
4. expectedResult: Clear, verifiable outcome. Describe the expected system state or UI feedback.
5. priority: LOW, MEDIUM, HIGH, or CRITICAL
6. coversRisks: Array of risk titles (from above list) that this test case addresses
7. coversGaps: Array of gap titles (from above list) that this test case covers
8. coversRequirements: Array of missed requirement titles (from above list) that this test validates

IMPORTANT INSTRUCTIONS:
- Each test case should address at least ONE risk, gap, or requirement
- Use the EXACT titles from the lists above when specifying coverage
- Ensure comprehensive coverage - all risks/gaps/requirements should be covered by at least one test
- Include edge cases, negative scenarios, and validation tests
- Prioritize based on risk severity and requirement importance
- **Be extremely detailed in "steps" and "expectedResult"**

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "Test case title",
    "description": "Detailed description",
    "steps": "1. Step one\\n2. Step two\\n3. Step three",
    "expectedResult": "Expected outcome",
    "priority": "HIGH",
    "coversRisks": ["Risk title 1", "Risk title 2"],
    "coversGaps": ["Gap title 1"],
    "coversRequirements": ["Requirement title 1"]
  }
]

Important: Return ONLY the JSON array, no markdown formatting, no explanations.`

    try {
        const content = await chatCompletion([
            {
                role: 'system',
                content: 'You are a QA expert who generates comprehensive test cases with full requirements traceability. Always return valid JSON with proper coverage tagging.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ], { temperature: 0.6, maxTokens: 4000 })

        if (!content) {
            throw new Error('No content generated')
        }

        // Clean up the response
        let cleanContent = content.trim()
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '')
        } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '')
        }

        // Parse the JSON response
        const testCases = JSON.parse(cleanContent) as EnhancedTestCase[]

        // Validate the response
        if (!Array.isArray(testCases)) {
            throw new Error('Invalid response format')
        }

        // Ensure coverage arrays exist
        return testCases.map(tc => ({
            ...tc,
            coversRisks: tc.coversRisks || [],
            coversGaps: tc.coversGaps || [],
            coversRequirements: tc.coversRequirements || []
        }))
    } catch (error) {
        console.error('Error generating test cases with coverage:', error)
        throw new Error('Failed to generate test cases with coverage. Please try again.')
    }
}
