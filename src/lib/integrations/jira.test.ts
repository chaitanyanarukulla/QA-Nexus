import { JiraClient, createJiraClient } from './jira';
import { createAtlassianClient } from './atlassian-client';

// Mock dependencies
jest.mock('./atlassian-client');

describe('JiraClient', () => {
    let mockAxios: any;
    let client: JiraClient;

    beforeEach(() => {
        mockAxios = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn()
        };
        (createAtlassianClient as jest.Mock).mockReturnValue(mockAxios);

        client = createJiraClient({
            instanceUrl: 'https://test.atlassian.net',
            email: 'test@example.com',
            apiToken: 'token'
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getIssue', () => {
        it('should fetch issue by key', async () => {
            const mockIssue = { key: 'TEST-1', fields: { summary: 'Test Issue' } };
            mockAxios.get.mockResolvedValue({ data: mockIssue });

            const result = await client.getIssue('TEST-1');
            expect(result).toEqual(mockIssue);
            expect(mockAxios.get).toHaveBeenCalledWith('/issue/TEST-1');
        });

        it('should return null on error', async () => {
            mockAxios.get.mockRejectedValue(new Error('Not found'));

            const result = await client.getIssue('TEST-1');
            expect(result).toBeNull();
        });
    });

    describe('searchIssues', () => {
        it('should search issues using JQL', async () => {
            const mockIssues = [{ key: 'TEST-1' }, { key: 'TEST-2' }];
            mockAxios.post.mockResolvedValue({ data: { issues: mockIssues } });

            const result = await client.searchIssues('project = TEST');
            expect(result).toEqual(mockIssues);
            expect(mockAxios.post).toHaveBeenCalledWith('/search/jql', expect.objectContaining({
                jql: 'project = TEST'
            }));
        });
    });

    describe('createIssue', () => {
        it('should create an issue', async () => {
            const issueData = {
                projectKey: 'TEST',
                summary: 'New Issue',
                description: 'Desc',
                issueType: 'Bug'
            };
            const mockCreatedIssue = { key: 'TEST-3', fields: { summary: 'New Issue' } };

            mockAxios.post.mockResolvedValue({ data: { key: 'TEST-3' } });
            mockAxios.get.mockResolvedValue({ data: mockCreatedIssue });

            const result = await client.createIssue(issueData);
            expect(result).toEqual(mockCreatedIssue);
            expect(mockAxios.post).toHaveBeenCalledWith('/issue', expect.objectContaining({
                fields: expect.objectContaining({
                    project: { key: 'TEST' },
                    summary: 'New Issue'
                })
            }));
        });
    });

    describe('testConnection', () => {
        it('should return true on success', async () => {
            mockAxios.get.mockResolvedValue({});
            const result = await client.testConnection();
            expect(result).toBe(true);
        });

        it('should return false on failure', async () => {
            mockAxios.get.mockRejectedValue(new Error('Failed'));
            const result = await client.testConnection();
            expect(result).toBe(false);
        });
    });
    describe('updateIssue', () => {
        it('should update issue', async () => {
            mockAxios.put.mockResolvedValue({});
            const result = await client.updateIssue('TEST-1', { summary: 'Updated' });
            expect(result).toBe(true);
            expect(mockAxios.put).toHaveBeenCalledWith('/issue/TEST-1', expect.any(Object));
        });
    });

    describe('addComment', () => {
        it('should add comment', async () => {
            mockAxios.post.mockResolvedValue({});
            const result = await client.addComment('TEST-1', 'Comment');
            expect(result).toBe(true);
        });
    });

    describe('getProjects', () => {
        it('should get projects', async () => {
            mockAxios.get.mockResolvedValue({ data: [{ key: 'P', name: 'Project' }] });
            const result = await client.getProjects();
            expect(result).toHaveLength(1);
        });
    });

    describe('getIssueTypes', () => {
        it('should get issue types', async () => {
            mockAxios.get.mockResolvedValue({ data: { issueTypes: [{ name: 'Bug' }] } });
            const result = await client.getIssueTypes('P');
            expect(result).toHaveLength(1);
        });
    });

    describe('webhooks', () => {
        it('should get webhooks', async () => {
            mockAxios.get.mockResolvedValue({ data: [] });
            const result = await client.getWebhooks();
            expect(result).toEqual([]);
        });

        it('should register webhook', async () => {
            mockAxios.post.mockResolvedValue({ data: { id: '1' } });
            const result = await client.registerWebhook({ name: 'W', url: 'U', events: [] });
            expect(result).toEqual({ id: '1' });
        });

        it('should delete webhook', async () => {
            mockAxios.delete.mockResolvedValue({});
            const result = await client.deleteWebhook('1');
            expect(result).toBe(true);
        });

        it('should refresh webhook', async () => {
            mockAxios.put.mockResolvedValue({});
            const result = await client.refreshWebhook('1');
            expect(result).toBe(true);
        });
    });
});
