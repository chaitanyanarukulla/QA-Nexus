'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function importOpenApiSpec(
    specContent: string,
    userId: string
) {
    try {
        let spec;
        try {
            spec = JSON.parse(specContent);
        } catch (e) {
            return { success: false, error: 'Invalid JSON format. Please provide a valid JSON OpenAPI spec.' };
        }

        // Basic validation
        if (!spec.openapi && !spec.swagger) {
            return { success: false, error: 'Invalid OpenAPI spec. Missing "openapi" or "swagger" version.' };
        }

        const title = spec.info?.title || 'Imported API';
        const description = spec.info?.description;
        const version = spec.info?.version || '1.0.0';

        // Create Collection
        const collection = await prisma.apiCollection.create({
            data: {
                title: `${title} (${version})`,
                description: description,
                createdBy: userId,
                openApiSpec: {
                    create: {
                        title: title,
                        version: version,
                        description: description,
                        specContent: spec,
                        importedBy: userId
                    }
                }
            }
        });

        // Parse paths
        const paths = spec.paths || {};
        let order = 0;

        for (const [path, methods] of Object.entries(paths)) {
            for (const [method, operation] of Object.entries(methods as any)) {
                if (['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method.toLowerCase())) {
                    const op = operation as any;
                    const requestTitle = op.summary || op.operationId || `${method.toUpperCase()} ${path}`;

                    // Extract parameters
                    const queryParams: Record<string, string> = {};
                    const headers: Record<string, string> = {};

                    if (op.parameters) {
                        for (const param of op.parameters) {
                            if (param.in === 'query') {
                                queryParams[param.name] = param.schema?.default || param.example || '';
                            } else if (param.in === 'header') {
                                headers[param.name] = param.schema?.default || param.example || '';
                            }
                        }
                    }

                    // Extract body
                    let body = null;
                    let bodyType = 'JSON';

                    if (op.requestBody?.content?.['application/json']) {
                        const schema = op.requestBody.content['application/json'].schema;
                        if (schema) {
                            body = generateExampleFromSchema(schema);
                        }
                    }

                    await prisma.apiRequest.create({
                        data: {
                            title: requestTitle,
                            description: op.description,
                            method: method.toUpperCase() as any,
                            url: path, // Note: Base URL handling might be needed later
                            headers,
                            queryParams,
                            body,
                            bodyType: bodyType as any,
                            collectionId: collection.id,
                            createdBy: userId,
                            order: order++
                        }
                    });
                }
            }
        }

        revalidatePath('/api-testing');
        return { success: true, collectionId: collection.id };

    } catch (error: any) {
        console.error('Import error:', error);
        return { success: false, error: error.message };
    }
}

function generateExampleFromSchema(schema: any): any {
    if (!schema) return null;
    if (schema.example) return schema.example;
    if (schema.default) return schema.default;

    if (schema.type === 'object' && schema.properties) {
        const obj: any = {};
        for (const [key, prop] of Object.entries(schema.properties)) {
            obj[key] = generateExampleFromSchema(prop);
        }
        return obj;
    }

    if (schema.type === 'array' && schema.items) {
        return [generateExampleFromSchema(schema.items)];
    }

    if (schema.type === 'string') return 'string';
    if (schema.type === 'integer' || schema.type === 'number') return 0;
    if (schema.type === 'boolean') return false;

    return null;
}
