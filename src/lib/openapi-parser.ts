/**
 * OpenAPI/Swagger Parser
 * Converts OpenAPI specifications into API request configurations
 */

import SwaggerParser from '@apidevtools/swagger-parser';

export interface OpenAPISpec {
  openapi?: string;
  swagger?: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, Record<string, any>>;
  components?: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
}

export interface ParsedAPIRequest {
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
  folderPath?: string;
}

export interface ParseResult {
  success: boolean;
  spec?: OpenAPISpec;
  requests?: ParsedAPIRequest[];
  collectionTitle?: string;
  collectionDescription?: string;
  error?: string;
}

/**
 * Parse and validate OpenAPI spec from URL or JSON string
 */
export async function parseOpenAPISpec(source: string): Promise<ParseResult> {
  try {
    let spec: OpenAPISpec;

    // Try to parse as URL first
    if (source.startsWith('http://') || source.startsWith('https://')) {
      spec = (await SwaggerParser.parse(source)) as OpenAPISpec;
    } else {
      // Parse as JSON string
      const jsonSpec = JSON.parse(source);
      spec = (await SwaggerParser.validate(jsonSpec)) as OpenAPISpec;
    }

    // Extract requests from spec
    const requests = extractRequestsFromSpec(spec);

    return {
      success: true,
      spec,
      requests,
      collectionTitle: spec.info.title,
      collectionDescription: spec.info.description,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to parse OpenAPI specification',
    };
  }
}

/**
 * Extract API requests from OpenAPI spec
 */
function extractRequestsFromSpec(spec: OpenAPISpec): ParsedAPIRequest[] {
  const requests: ParsedAPIRequest[] = [];
  const baseUrl = spec.servers?.[0]?.url || '';

  // Iterate through paths
  for (const [path, pathItem] of Object.entries(spec.paths)) {
    // Iterate through methods (get, post, put, etc.)
    for (const [method, operation] of Object.entries(pathItem)) {
      // Skip non-HTTP methods
      if (!['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method.toLowerCase())) {
        continue;
      }

      const request = extractRequest(path, method, operation, baseUrl, spec);
      if (request) {
        requests.push(request);
      }
    }
  }

  return requests;
}

/**
 * Extract single request from operation
 */
function extractRequest(
  path: string,
  method: string,
  operation: any,
  baseUrl: string,
  spec: OpenAPISpec
): ParsedAPIRequest | null {
  try {
    const request: ParsedAPIRequest = {
      title: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
      description: operation.description,
      method: method.toUpperCase(),
      url: `${baseUrl}${path}`,
      headers: {},
      queryParams: {},
    };

    // Extract parameters
    if (operation.parameters) {
      for (const param of operation.parameters) {
        if (param.in === 'query') {
          // Query parameters
          const example = param.example || param.schema?.example || '';
          request.queryParams![param.name] = String(example);
        } else if (param.in === 'header') {
          // Headers
          const example = param.example || param.schema?.example || '';
          request.headers![param.name] = String(example);
        } else if (param.in === 'path') {
          // Path parameters - replace in URL
          const example = param.example || param.schema?.example || `{${param.name}}`;
          request.url = request.url.replace(`{${param.name}}`, String(example));
        }
      }
    }

    // Extract request body
    if (operation.requestBody) {
      const content = operation.requestBody.content;
      if (content) {
        // Check for JSON
        if (content['application/json']) {
          request.bodyType = 'JSON';
          request.body = generateExampleFromSchema(content['application/json'].schema, spec);
        }
        // Check for form data
        else if (content['multipart/form-data']) {
          request.bodyType = 'FORM_DATA';
          request.body = generateExampleFromSchema(content['multipart/form-data'].schema, spec);
        }
        // Check for URL encoded
        else if (content['application/x-www-form-urlencoded']) {
          request.bodyType = 'FORM_URLENCODED';
          request.body = generateExampleFromSchema(content['application/x-www-form-urlencoded'].schema, spec);
        }
        // Default to raw
        else {
          request.bodyType = 'RAW';
          request.body = '';
        }
      }
    }

    // Extract authentication
    if (operation.security && operation.security.length > 0) {
      const securityScheme = operation.security[0];
      const schemeName = Object.keys(securityScheme)[0];
      const scheme = spec.components?.securitySchemes?.[schemeName];

      if (scheme) {
        request.authType = mapAuthType(scheme.type, scheme);
        request.authConfig = extractAuthConfig(scheme);
      }
    }

    // Extract tags for folder organization
    if (operation.tags && operation.tags.length > 0) {
      request.folderPath = operation.tags[0];
    }

    return request;
  } catch (error) {
    console.error(`Failed to extract request for ${method} ${path}:`, error);
    return null;
  }
}

/**
 * Map OpenAPI auth type to our AuthType enum
 */
function mapAuthType(type: string, scheme: any): string {
  switch (type) {
    case 'http':
      if (scheme.scheme === 'bearer') {
        return 'BEARER_TOKEN';
      } else if (scheme.scheme === 'basic') {
        return 'BASIC_AUTH';
      }
      return 'NONE';
    case 'apiKey':
      return 'API_KEY';
    case 'oauth2':
      return 'OAUTH2';
    default:
      return 'NONE';
  }
}

/**
 * Extract auth configuration
 */
function extractAuthConfig(scheme: any): any {
  const config: any = {};

  if (scheme.type === 'apiKey') {
    config.keyName = scheme.name || 'X-API-Key';
    config.location = scheme.in === 'header' ? 'header' : 'query';
    config.keyValue = ''; // User will need to fill this
  } else if (scheme.type === 'oauth2') {
    config.accessToken = ''; // User will need to fill this
  }

  return config;
}

/**
 * Generate example body from JSON schema
 */
function generateExampleFromSchema(schema: any, spec: OpenAPISpec): any {
  if (!schema) return {};

  // If there's an explicit example, use it
  if (schema.example) {
    return schema.example;
  }

  // Handle $ref
  if (schema.$ref) {
    const refPath = schema.$ref.replace('#/components/schemas/', '');
    const refSchema = spec.components?.schemas?.[refPath];
    if (refSchema) {
      return generateExampleFromSchema(refSchema, spec);
    }
  }

  // Handle object type
  if (schema.type === 'object' || schema.properties) {
    const example: any = {};
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties as Record<string, any>)) {
        example[propName] = generateExampleFromSchema(propSchema, spec);
      }
    }
    return example;
  }

  // Handle array type
  if (schema.type === 'array') {
    if (schema.items) {
      return [generateExampleFromSchema(schema.items, spec)];
    }
    return [];
  }

  // Handle primitive types
  switch (schema.type) {
    case 'string':
      return schema.enum ? schema.enum[0] : 'string';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return false;
    default:
      return null;
  }
}

/**
 * Group requests by folder/tag
 */
export function groupRequestsByFolder(requests: ParsedAPIRequest[]): Map<string, ParsedAPIRequest[]> {
  const folders = new Map<string, ParsedAPIRequest[]>();

  for (const request of requests) {
    const folder = request.folderPath || 'Default';
    if (!folders.has(folder)) {
      folders.set(folder, []);
    }
    folders.get(folder)!.push(request);
  }

  return folders;
}

/**
 * Validate OpenAPI spec format
 */
export function validateOpenAPIFormat(spec: string): { valid: boolean; error?: string } {
  try {
    const parsed = JSON.parse(spec);

    // Check for OpenAPI 3.x or Swagger 2.x
    if (!parsed.openapi && !parsed.swagger) {
      return {
        valid: false,
        error: 'Not a valid OpenAPI/Swagger specification. Missing "openapi" or "swagger" field.',
      };
    }

    // Check for required fields
    if (!parsed.info || !parsed.info.title || !parsed.info.version) {
      return {
        valid: false,
        error: 'Missing required "info" object with "title" and "version" fields.',
      };
    }

    if (!parsed.paths || Object.keys(parsed.paths).length === 0) {
      return {
        valid: false,
        error: 'No paths defined in the specification.',
      };
    }

    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: 'Invalid JSON format: ' + error.message,
    };
  }
}
