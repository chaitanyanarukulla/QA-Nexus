import {
    createTestCaseSchema,
    createTestSuiteSchema,
    createTestRunSchema,
    createDefectSchema,
    jiraIntegrationSchema
} from './validation';

describe('Validation Schemas', () => {
    describe('createTestCaseSchema', () => {
        it('should validate a valid test case', () => {
            const validData = {
                title: 'Valid Test Case',
                description: 'A valid description',
                steps: [{ action: 'Do this', result: 'Expect that' }],
                expectedResult: 'Success',
                priority: 'HIGH',
                status: 'ACTIVE'
            };
            const result = createTestCaseSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail with short title', () => {
            const invalidData = {
                title: 'Hi',
                priority: 'LOW',
                status: 'DRAFT'
            };
            const result = createTestCaseSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('at least 3 characters');
            }
        });

        it('should fail with invalid priority', () => {
            const invalidData = {
                title: 'Valid Title',
                priority: 'INVALID_PRIORITY',
                status: 'ACTIVE'
            };
            const result = createTestCaseSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('createTestSuiteSchema', () => {
        it('should validate a valid test suite', () => {
            const validData = {
                title: 'Regression Suite',
                description: 'Full regression',
                jiraEpicKey: 'PROJ-123'
            };
            const result = createTestSuiteSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });

    describe('createTestRunSchema', () => {
        it('should validate a valid test run', () => {
            const validData = {
                title: 'Nightly Run',
                testCaseIds: ['clq1234567890abcdefghijkl', 'clq1234567890abcdefghijkm'],
                userId: 'clq1234567890abcdefghijkz'
            };
            const result = createTestRunSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail if testCaseIds is empty', () => {
            const invalidData = {
                title: 'Empty Run',
                testCaseIds: [],
                userId: 'clq1234567890abcdefghijkz'
            };
            const result = createTestRunSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('createDefectSchema', () => {
        it('should validate a valid defect', () => {
            const validData = {
                title: 'Login Failure',
                description: 'User cannot login',
                priority: 'CRITICAL',
                testResultId: 'clq1234567890abcdefghijkz'
            };
            const result = createDefectSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });

    describe('jiraIntegrationSchema', () => {
        it('should validate valid Jira config', () => {
            const validData = {
                instanceUrl: 'https://mycompany.atlassian.net',
                email: 'user@example.com',
                apiToken: '1234567890'
            };
            const result = jiraIntegrationSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail with invalid email', () => {
            const invalidData = {
                instanceUrl: 'https://mycompany.atlassian.net',
                email: 'not-an-email',
                apiToken: '1234567890'
            };
            const result = jiraIntegrationSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should fail with short api token', () => {
            const invalidData = {
                instanceUrl: 'https://mycompany.atlassian.net',
                email: 'user@example.com',
                apiToken: 'short'
            };
            const result = jiraIntegrationSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});
