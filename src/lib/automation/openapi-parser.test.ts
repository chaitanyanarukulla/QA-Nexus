import { parseOpenAPISpec, validateOpenAPIFormat, groupRequestsByFolder } from './openapi-parser';
import SwaggerParser from '@apidevtools/swagger-parser';

jest.mock('@apidevtools/swagger-parser');

describe('OpenAPI Parser', () => {
    const mockSpec = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        servers: [{ url: 'https://api.example.com' }],
        paths: {
            '/users': {
                get: {
                    summary: 'Get Users',
                    tags: ['Users'],
                    responses: { '200': { description: 'OK' } }
                }
            }
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('parseOpenAPISpec', () => {
        it('should parse valid JSON string', async () => {
            (SwaggerParser.validate as jest.Mock).mockResolvedValue(mockSpec);

            const result = await parseOpenAPISpec(JSON.stringify(mockSpec));
            expect(result.success).toBe(true);
            expect(result.collectionTitle).toBe('Test API');
            expect(result.requests).toHaveLength(1);
            expect(result.requests![0].url).toBe('https://api.example.com/users');
        });

        it('should parse URL', async () => {
            (SwaggerParser.parse as jest.Mock).mockResolvedValue(mockSpec);

            const result = await parseOpenAPISpec('https://api.example.com/openapi.json');
            expect(result.success).toBe(true);
            expect(result.collectionTitle).toBe('Test API');
        });

        it('should handle validation errors', async () => {
            (SwaggerParser.validate as jest.Mock).mockRejectedValue(new Error('Invalid spec'));

            const result = await parseOpenAPISpec('{}');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid spec');
        });
    });

    describe('validateOpenAPIFormat', () => {
        it('should validate correct format', () => {
            const result = validateOpenAPIFormat(JSON.stringify(mockSpec));
            expect(result.valid).toBe(true);
        });

        it('should fail on invalid JSON', () => {
            const result = validateOpenAPIFormat('invalid');
            expect(result.valid).toBe(false);
        });

        it('should fail on missing fields', () => {
            const result = validateOpenAPIFormat(JSON.stringify({ openapi: '3.0.0' }));
            expect(result.valid).toBe(false);
        });
    });

    describe('groupRequestsByFolder', () => {
        it('should group requests by tags', () => {
            const requests = [
                { title: 'Req 1', method: 'GET', url: '/1', folderPath: 'Users' },
                { title: 'Req 2', method: 'GET', url: '/2', folderPath: 'Users' },
                { title: 'Req 3', method: 'GET', url: '/3', folderPath: 'Products' }
            ];

            // @ts-ignore
            const result = groupRequestsByFolder(requests);
            expect(result.get('Users')).toHaveLength(2);
            expect(result.get('Products')).toHaveLength(1);
        });
    });

    describe('complex schemas', () => {
        it('should generate examples from schema', async () => {
            const complexSpec = {
                openapi: '3.0.0',
                info: { title: 'Complex', version: '1' },
                paths: {
                    '/complex': {
                        post: {
                            requestBody: {
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                name: { type: 'string', example: 'Name' },
                                                age: { type: 'integer', example: 25 },
                                                tags: { type: 'array', items: { type: 'string' } }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            (SwaggerParser.validate as jest.Mock).mockResolvedValue(complexSpec);
            const result = await parseOpenAPISpec(JSON.stringify(complexSpec));
            const body = result.requests![0].body;
            expect(body).toEqual({ name: 'Name', age: 25, tags: ['string'] });
        });
    });
});
