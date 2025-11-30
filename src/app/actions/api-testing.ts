'use server';

import { prisma } from '@/lib/prisma';
import { generatePlaywrightTest } from '@/lib/playwright-generator';
import { executePlaywrightTest } from '@/lib/playwright-executor';
import { revalidatePath } from 'next/cache';

// ==================== Collections ====================

export async function createCollection(data: {
  title: string;
  description?: string;
  parentId?: string;
  userId: string;
}) {
  try {
    const collection = await prisma.apiCollection.create({
      data: {
        title: data.title,
        description: data.description,
        parentId: data.parentId,
        createdBy: data.userId,
      },
      include: {
        requests: true,
        children: true,
      }
    });

    revalidatePath('/api-testing');
    return { success: true, collection };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCollections(userId?: string) {
  try {
    const collections = await prisma.apiCollection.findMany({
      where: userId ? { createdBy: userId } : undefined,
      include: {
        requests: {
          orderBy: { order: 'asc' }
        },
        children: true,
        _count: {
          select: { requests: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, collections };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCollection(id: string) {
  try {
    await prisma.apiCollection.delete({
      where: { id }
    });

    revalidatePath('/api-testing');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==================== API Requests ====================

export async function createApiRequest(data: {
  title: string;
  description?: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: any;
  bodyType?: string;
  authType?: string;
  authConfig?: any;
  assertions?: any[];
  preRequestScript?: string;
  collectionId: string;
  userId: string;
  environmentId?: string;
}) {
  try {
    const request = await prisma.apiRequest.create({
      data: {
        title: data.title,
        description: data.description,
        method: data.method as any,
        url: data.url,
        headers: JSON.stringify(data.headers || {}),
        queryParams: JSON.stringify(data.queryParams || {}),
        body: data.body ? JSON.stringify(data.body) : null,
        bodyType: (data.bodyType as any) || 'JSON',
        authType: (data.authType as any) || 'NONE',
        authConfig: JSON.stringify(data.authConfig || {}),
        testScript: data.assertions && data.assertions.length > 0 ? JSON.stringify(data.assertions) : undefined,
        preRequestScript: data.preRequestScript || '',
        collectionId: data.collectionId,
        createdBy: data.userId,
        environmentId: data.environmentId,
      },
      include: {
        collection: true,
        executions: {
          take: 5,
          orderBy: { executedAt: 'desc' }
        }
      }
    });

    revalidatePath('/api-testing');
    return { success: true, request };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateApiRequest(id: string, data: {
  title?: string;
  description?: string;
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: any;
  bodyType?: string;
  authType?: string;
  authConfig?: any;
  assertions?: any[];
  preRequestScript?: string;
}) {
  try {
    const request = await prisma.apiRequest.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.method && { method: data.method as any }),
        ...(data.url && { url: data.url }),
        ...(data.headers && { headers: JSON.stringify(data.headers) }),
        ...(data.queryParams && { queryParams: JSON.stringify(data.queryParams) }),
        ...(data.body !== undefined && { body: data.body ? JSON.stringify(data.body) : null }),
        ...(data.bodyType && { bodyType: data.bodyType as any }),
        ...(data.authType && { authType: data.authType as any }),
        ...(data.authConfig !== undefined && { authConfig: JSON.stringify(data.authConfig) }),
        ...(data.assertions !== undefined && { testScript: data.assertions && data.assertions.length > 0 ? JSON.stringify(data.assertions) : undefined }),
        ...(data.preRequestScript !== undefined && { preRequestScript: data.preRequestScript }),
      },
      include: {
        collection: true,
        executions: {
          take: 5,
          orderBy: { executedAt: 'desc' }
        }
      }
    });

    revalidatePath('/api-testing');
    return { success: true, request };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getApiRequest(id: string) {
  try {
    const request = await prisma.apiRequest.findUnique({
      where: { id },
      include: {
        collection: true,
        environment: true,
        executions: {
          take: 10,
          orderBy: { executedAt: 'desc' }
        },
        assertions: true,
      }
    });

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    return { success: true, request };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteApiRequest(id: string) {
  try {
    await prisma.apiRequest.delete({
      where: { id }
    });

    revalidatePath('/api-testing');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==================== Execution ====================

export async function executeApiRequest(
  requestId: string,
  userId: string,
  environmentId?: string
) {
  try {
    // 1. Fetch request configuration
    const request = await prisma.apiRequest.findUnique({
      where: { id: requestId },
      include: {
        assertions: true,
        environment: true
      }
    });

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    // 2. Fetch environment variables if specified
    let envVars: Record<string, string> = {};
    if (environmentId) {
      const environment = await prisma.environment.findUnique({
        where: { id: environmentId }
      });
      envVars = (environment?.variables as any) || {};
    } else if (request.environment) {
      envVars = (request.environment.variables as any) || {};
    }

    // 3. Generate Playwright test code
    const testCode = generatePlaywrightTest({
      method: request.method,
      url: request.url,
      headers: request.headers as any,
      queryParams: request.queryParams as any,
      body: request.body as any,
      bodyType: request.bodyType,
      assertions: request.assertions as any,
      preRequestScript: request.preRequestScript || undefined,
      environmentVariables: envVars
    });

    // 4. Execute test
    const executionResult = await executePlaywrightTest(testCode, requestId);

    // 5. Store execution results
    const execution = await prisma.apiExecution.create({
      data: {
        requestId,
        status: executionResult.status,
        statusCode: executionResult.statusCode,
        responseTime: executionResult.responseTime,
        responseBody: executionResult.responseBody,
        responseHeaders: executionResult.responseHeaders as any,
        errorMessage: executionResult.errorMessage,
        stackTrace: executionResult.stackTrace,
        assertionsPassed: executionResult.assertionsPassed,
        assertionsFailed: executionResult.assertionsFailed,
        artifacts: executionResult.artifacts as any,
        environmentId,
        executedBy: userId
      }
    });

    revalidatePath(`/api-testing/requests/${requestId}`);

    return {
      success: true,
      execution,
      testCode,
      logs: executionResult.logs
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function executeCollection(
  collectionId: string,
  userId: string,
  environmentId?: string
) {
  try {
    // Fetch all requests in collection
    const requests = await prisma.apiRequest.findMany({
      where: { collectionId },
      orderBy: { order: 'asc' }
    });

    if (requests.length === 0) {
      return { success: false, error: 'No requests in collection' };
    }

    const results = [];

    // Execute sequentially
    for (const request of requests) {
      const result = await executeApiRequest(
        request.id,
        userId,
        environmentId
      );
      results.push(result);
    }

    const passed = results.filter(r => r.execution?.status === 'PASSED').length;
    const failed = results.filter(r => r.execution?.status === 'FAILED').length;
    const errors = results.filter(r => r.execution?.status === 'ERROR').length;

    revalidatePath('/api-testing');

    return {
      success: true,
      results,
      summary: {
        total: results.length,
        passed,
        failed,
        errors,
        passRate: (passed / results.length) * 100
      }
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getExecutionHistory(requestId: string, limit: number = 10) {
  try {
    const executions = await prisma.apiExecution.findMany({
      where: { requestId },
      include: {
        user: {
          select: { name: true, email: true }
        },
        environment: {
          select: { name: true }
        }
      },
      orderBy: { executedAt: 'desc' },
      take: limit
    });

    return { success: true, executions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==================== Environments ====================

export async function createEnvironment(data: {
  name: string;
  description?: string;
  variables: Record<string, string>;
  userId: string;
}) {
  try {
    const environment = await prisma.environment.create({
      data: {
        name: data.name,
        description: data.description,
        variables: JSON.stringify(data.variables),
        createdBy: data.userId,
      }
    });

    revalidatePath('/api-testing');
    return { success: true, environment };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getEnvironments(userId?: string) {
  try {
    const environments = await prisma.environment.findMany({
      where: userId ? { createdBy: userId } : undefined,
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, environments };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateEnvironment(id: string, data: {
  name?: string;
  description?: string;
  variables?: Record<string, string>;
}) {
  try {
    const environment = await prisma.environment.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.variables && { variables: JSON.stringify(data.variables) }),
      }
    });

    revalidatePath('/api-testing');
    return { success: true, environment };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteEnvironment(id: string) {
  try {
    await prisma.environment.delete({
      where: { id }
    });

    revalidatePath('/api-testing');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==================== Statistics ====================

export async function getApiTestingStats(userId?: string) {
  try {
    const collections = await prisma.apiCollection.count({
      where: userId ? { createdBy: userId } : undefined
    });

    const requests = await prisma.apiRequest.count({
      where: userId ? { createdBy: userId } : undefined
    });

    const executions = await prisma.apiExecution.groupBy({
      by: ['status'],
      _count: true,
      where: userId ? { executedBy: userId } : undefined
    });

    const executionStats = {
      total: executions.reduce((sum, e) => sum + e._count, 0),
      passed: executions.find(e => e.status === 'PASSED')?._count || 0,
      failed: executions.find(e => e.status === 'FAILED')?._count || 0,
      errors: executions.find(e => e.status === 'ERROR')?._count || 0,
    };

    const avgResponseTime = await prisma.apiExecution.aggregate({
      _avg: { responseTime: true },
      where: userId ? { executedBy: userId } : undefined
    });

    return {
      success: true,
      stats: {
        collections,
        requests,
        executions: executionStats,
        avgResponseTime: avgResponseTime._avg.responseTime || 0
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==================== OpenAPI Import ====================

import { parseOpenAPISpec, groupRequestsByFolder } from '@/lib/openapi-parser';

export async function importOpenAPISpec(data: {
  source: string; // URL or JSON string
  userId: string;
  createSeparateCollections?: boolean;
}) {
  try {
    // Parse the OpenAPI spec
    const parseResult = await parseOpenAPISpec(data.source);

    if (!parseResult.success || !parseResult.spec || !parseResult.requests) {
      return { success: false, error: parseResult.error || 'Failed to parse OpenAPI specification' };
    }

    const { spec, requests } = parseResult;

    // Save OpenAPI spec to database
    const openApiSpec = await prisma.openApiSpec.create({
      data: {
        title: spec.info.title,
        version: spec.info.version,
        description: spec.info.description,
        specContent: JSON.stringify(spec),
        sourceUrl: data.source.startsWith('http') ? data.source : undefined,
        importedBy: data.userId,
      },
    });

    // Group requests by folder/tag if requested
    const groupedRequests = data.createSeparateCollections
      ? groupRequestsByFolder(requests)
      : new Map([['All Requests', requests]]);

    const collections: any[] = [];
    let totalRequestsCreated = 0;

    // Create collections and requests
    for (const [folderName, folderRequests] of groupedRequests.entries()) {
      // Create collection
      const collection = await prisma.apiCollection.create({
        data: {
          title: data.createSeparateCollections ? `${spec.info.title} - ${folderName}` : spec.info.title,
          description: data.createSeparateCollections
            ? `${folderName} endpoints from ${spec.info.title}`
            : spec.info.description,
          createdBy: data.userId,
        },
      });

      // Create API requests
      for (let i = 0; i < folderRequests.length; i++) {
        const req = folderRequests[i];
        await prisma.apiRequest.create({
          data: {
            title: req.title,
            description: req.description,
            method: req.method as any,
            url: req.url,
            headers: JSON.stringify(req.headers || {}),
            queryParams: JSON.stringify(req.queryParams || {}),
            body: req.body ? JSON.stringify(req.body) : null,
            bodyType: (req.bodyType as any) || 'NONE',
            authType: (req.authType as any) || 'NONE',
            authConfig: JSON.stringify(req.authConfig || {}),
            collectionId: collection.id,
            createdBy: data.userId,
            order: i,
          },
        });
        totalRequestsCreated++;
      }

      collections.push(collection);
    }

    // Link the first collection to the OpenAPI spec
    if (collections.length > 0) {
      await prisma.openApiSpec.update({
        where: { id: openApiSpec.id },
        data: { collectionId: collections[0].id },
      });
    }

    revalidatePath('/api-testing');

    return {
      success: true,
      openApiSpecId: openApiSpec.id,
      collections: collections.map((c) => ({ id: c.id, title: c.title })),
      totalRequests: totalRequestsCreated,
      message: `Successfully imported ${totalRequestsCreated} API requests from ${spec.info.title}`,
    };
  } catch (error: any) {
    console.error('OpenAPI import error:', error);
    return { success: false, error: error.message || 'Failed to import OpenAPI specification' };
  }
}

export async function getOpenApiSpecs(userId?: string) {
  try {
    const specs = await prisma.openApiSpec.findMany({
      where: userId ? { importedBy: userId } : undefined,
      include: {
        collection: {
          include: {
            _count: {
              select: { requests: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { importedAt: 'desc' },
    });

    return { success: true, specs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteOpenApiSpec(id: string) {
  try {
    // Get the spec to find linked collection
    const spec = await prisma.openApiSpec.findUnique({
      where: { id },
      include: { collection: true },
    });

    // Delete the spec (collection will remain but unlinked)
    await prisma.openApiSpec.delete({
      where: { id },
    });

    revalidatePath('/api-testing');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
