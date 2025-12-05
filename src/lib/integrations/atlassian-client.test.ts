import { createAtlassianClient } from './atlassian-client';
import axios from 'axios';

jest.mock('axios');

describe('createAtlassianClient', () => {
    const mockConfig = {
        instanceUrl: 'https://test.atlassian.net',
        email: 'user@example.com',
        apiToken: 'token'
    };

    it('should create axios instance with correct headers', () => {
        const mockCreate = jest.fn();
        (axios.create as jest.Mock).mockImplementation(mockCreate);

        createAtlassianClient(mockConfig, '/api/v3');

        const expectedAuth = Buffer.from(`${mockConfig.email}:${mockConfig.apiToken}`).toString('base64');
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            baseURL: 'https://test.atlassian.net/api/v3',
            headers: expect.objectContaining({
                'Authorization': `Basic ${expectedAuth}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            })
        }));
    });

    it('should handle URLs with paths correctly', () => {
        const mockCreate = jest.fn();
        (axios.create as jest.Mock).mockImplementation(mockCreate);

        createAtlassianClient({
            ...mockConfig,
            instanceUrl: 'https://test.atlassian.net/jira/software/c/projects/TEST/boards/1'
        }, '/api/v3');

        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            baseURL: 'https://test.atlassian.net/api/v3'
        }));
    });

    it('should handle URLs without protocol', () => {
        const mockCreate = jest.fn();
        (axios.create as jest.Mock).mockImplementation(mockCreate);

        createAtlassianClient({
            ...mockConfig,
            instanceUrl: 'test.atlassian.net'
        }, '/api/v3');

        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            baseURL: 'https://test.atlassian.net/api/v3'
        }));
    });
});
