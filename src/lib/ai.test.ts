import { generateTestCases, chatCompletion, generateApiAssertions, generateApiRequest, generateMockData } from './ai';
import { prisma } from './prisma';

// Mock dependencies
jest.mock('openai', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            chat: {
                completions: {
                    create: jest.fn().mockResolvedValue({
                        choices: [{ message: { content: 'mocked response' } }]
                    })
                }
            }
        }))
    };
});

jest.mock('./prisma', () => ({
    prisma: {
        aIProviderSettings: {
            findFirst: jest.fn().mockResolvedValue(null) // Default to OpenAI
        }
    }
}));

// Helper to mock OpenAI response
const mockOpenAIResponse = (content: string) => {
    const OpenAI = require('openai').default;
    const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content } }]
    });
    OpenAI.mockImplementation(() => ({
        chat: {
            completions: {
                create: mockCreate
            }
        }
    }));
    return mockCreate;
};

describe('AI Library', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (prisma.aIProviderSettings.findFirst as jest.Mock).mockResolvedValue(null); // Default to OpenAI
        global.fetch = jest.fn();
    });

    describe('chatCompletion', () => {
        it('should call OpenAI with correct parameters', async () => {
            const mockCreate = mockOpenAIResponse('Hello world');
            const result = await chatCompletion([{ role: 'user', content: 'Hi' }]);

            expect(result).toBe('Hello world');
            expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
                messages: [{ role: 'user', content: 'Hi' }],
                model: 'gpt-4o-mini'
            }));
        });

        it('should use OpenAI provider by default', async () => {
            mockOpenAIResponse('Test response');
            const response = await chatCompletion([{ role: 'user', content: 'Hello' }]);
            expect(response).toBe('Test response');
        });

        it('should use Foundry provider when configured', async () => {
            (prisma.aIProviderSettings.findFirst as jest.Mock).mockResolvedValue({
                provider: 'FOUNDRY',
                foundryUrl: 'http://localhost:8000',
                foundryModel: 'llama2'
            });

            // Mock fetch for Foundry
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ response: 'Foundry response' })
            });

            const response = await chatCompletion([{ role: 'user', content: 'Hello' }]);
            expect(response).toBe('Foundry response');
        });

        it('should handle Foundry errors', async () => {
            (prisma.aIProviderSettings.findFirst as jest.Mock).mockResolvedValue({
                provider: 'FOUNDRY',
                foundryUrl: 'http://localhost:8000',
                foundryModel: 'llama2'
            });

            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                statusText: 'Error'
            });

            await expect(chatCompletion([{ role: 'user', content: 'Hello' }]))
                .rejects.toThrow('Foundry request failed: Error');
        });

        it('should handle OpenAI errors', async () => {
            const OpenAI = require('openai').default;
            OpenAI.mockImplementation(() => ({
                chat: { completions: { create: jest.fn().mockRejectedValue(new Error('OpenAI Error')) } }
            }));

            await expect(chatCompletion([{ role: 'user', content: 'Hello' }]))
                .rejects.toThrow('OpenAI Error');
        });
    });

    describe('generateTestCases', () => {
        it('should parse valid JSON response', async () => {
            const mockTestCases = [
                {
                    title: 'Test 1',
                    description: 'Desc 1',
                    steps: '1. Step',
                    expectedResult: 'Result',
                    priority: 'HIGH'
                }
            ];
            mockOpenAIResponse(JSON.stringify(mockTestCases));

            const result = await generateTestCases('Test requirement');
            expect(result).toEqual(mockTestCases);
        });

        it('should handle markdown code blocks', async () => {
            const mockTestCases = [
                {
                    title: 'Test 1',
                    description: 'Desc 1',
                    steps: '1. Step',
                    expectedResult: 'Result',
                    priority: 'HIGH'
                }
            ];
            mockOpenAIResponse('```json\n' + JSON.stringify(mockTestCases) + '\n```');

            const result = await generateTestCases('Test requirement');
            expect(result).toEqual(mockTestCases);
        });

        it('should throw error on invalid JSON', async () => {
            mockOpenAIResponse('Invalid JSON');
            await expect(generateTestCases('Test requirement')).rejects.toThrow();
        });
    });

    describe('generateApiAssertions', () => {
        it('should generate assertions from response', async () => {
            const mockAssertions = [
                {
                    type: 'JSON_PATH',
                    field: 'data.id',
                    operator: 'EXISTS',
                    description: 'ID should exist'
                }
            ];
            mockOpenAIResponse(JSON.stringify(mockAssertions));

            const result = await generateApiAssertions('{"data": {"id": 1}}', 200);
            expect(result).toEqual(mockAssertions);
        });
    });

    describe('generateApiRequest', () => {
        it('should generate API request from prompt', async () => {
            const mockRequest = {
                title: 'Get Users',
                method: 'GET',
                url: '/users',
                description: 'Fetch users'
            };
            mockOpenAIResponse(JSON.stringify(mockRequest));

            const result = await generateApiRequest('Get all users');
            expect(result).toEqual(mockRequest);
        });
    });

    describe('improveTestCase', () => {
        it('should improve test case', async () => {
            mockOpenAIResponse('Improved test case');
            const result = await require('./ai').improveTestCase('Original', 'clarity');
            expect(result).toBe('Improved test case');
        });

        it('should return original on error', async () => {
            const OpenAI = require('openai').default;
            OpenAI.mockImplementation(() => ({
                chat: { completions: { create: jest.fn().mockRejectedValue(new Error('Fail')) } }
            }));
            const result = await require('./ai').improveTestCase('Original', 'clarity');
            expect(result).toBe('Original');
        });
    });

    describe('answerQuestion', () => {
        it('should answer question', async () => {
            mockOpenAIResponse('Answer');
            const result = await require('./ai').answerQuestion('Q', {});
            expect(result).toBe('Answer');
        });
    });

    describe('analyzeDocument', () => {
        it('should analyze document', async () => {
            const mockAnalysis = {
                risks: [], gaps: [], missedRequirements: [], recommendations: [], summary: 'Sum'
            };
            mockOpenAIResponse(JSON.stringify(mockAnalysis));
            const result = await require('./ai').analyzeDocument('Content', 'Title', 'JIRA_EPIC');
            expect(result).toEqual(mockAnalysis);
        });
    });
});
