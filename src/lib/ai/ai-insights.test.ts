import { detectFlakyTests, predictTestFailures, detectSlowTests, generateAIRecommendations } from './ai-insights';
import { prisma } from './prisma';
import { chatCompletion } from './ai';

jest.mock('./prisma', () => ({
    prisma: {
        testCase: {
            findMany: jest.fn(),
            update: jest.fn()
        },
        aIInsight: {
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn()
        }
    }
}));

jest.mock('./ai');

describe('AI Insights', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('detectFlakyTests', () => {
        it('should detect flaky tests', async () => {
            const mockTestCases = [{
                id: '1',
                title: 'Flaky Test',
                testResults: [
                    { status: 'PASS', createdAt: new Date() },
                    { status: 'FAIL', createdAt: new Date() },
                    { status: 'PASS', createdAt: new Date() },
                    { status: 'FAIL', createdAt: new Date() },
                    { status: 'PASS', createdAt: new Date() }
                ]
            }];
            (prisma.testCase.findMany as jest.Mock).mockResolvedValue(mockTestCases);

            const insights = await detectFlakyTests();
            expect(insights).toHaveLength(1);
            expect(insights[0].type).toBe('FLAKY_TEST');
            expect(prisma.testCase.update).toHaveBeenCalled();
        });

        it('should ignore stable tests', async () => {
            const mockTestCases = [{
                id: '1',
                title: 'Stable Test',
                testResults: [
                    { status: 'PASS', createdAt: new Date() },
                    { status: 'PASS', createdAt: new Date() },
                    { status: 'PASS', createdAt: new Date() },
                    { status: 'PASS', createdAt: new Date() },
                    { status: 'PASS', createdAt: new Date() }
                ]
            }];
            (prisma.testCase.findMany as jest.Mock).mockResolvedValue(mockTestCases);

            const insights = await detectFlakyTests();
            expect(insights).toHaveLength(0);
        });
    });

    describe('predictTestFailures', () => {
        it('should predict failures', async () => {
            const mockTestCases = [{
                id: '1',
                title: 'Risky Test',
                testResults: [
                    { status: 'FAIL', createdAt: new Date() },
                    { status: 'FAIL', createdAt: new Date() },
                    { status: 'PASS', createdAt: new Date() },
                    { status: 'FAIL', createdAt: new Date() },
                    { status: 'PASS', createdAt: new Date() }
                ]
            }];
            (prisma.testCase.findMany as jest.Mock).mockResolvedValue(mockTestCases);

            const insights = await predictTestFailures();
            expect(insights).toHaveLength(1);
            expect(insights[0].type).toBe('HIGH_FAILURE_RISK');
        });
    });

    describe('detectSlowTests', () => {
        it('should detect slow tests', async () => {
            const mockTestCases = [{
                id: '1',
                title: 'Slow Test',
                executionTime: 40000 // 40s
            }];
            (prisma.testCase.findMany as jest.Mock).mockResolvedValue(mockTestCases);

            const insights = await detectSlowTests();
            expect(insights).toHaveLength(1);
            expect(insights[0].type).toBe('SLOW_EXECUTION');
        });
    });

    describe('generateAIRecommendations', () => {
        it('should generate recommendations', async () => {
            (prisma.testCase.findMany as jest.Mock).mockResolvedValue([{ id: '1', isAutomated: true }]);
            (chatCompletion as jest.Mock).mockResolvedValue(JSON.stringify([{
                title: 'Rec 1',
                description: 'Desc',
                priority: 'high'
            }]));

            const insights = await generateAIRecommendations();
            expect(insights).toHaveLength(1);
            expect(insights[0].type).toBe('OPTIMIZATION_OPPORTUNITY');
        });
    });
});
