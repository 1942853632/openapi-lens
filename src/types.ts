export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';
export type Endpoint = { path: string; method: HttpMethod; operationId?: string; summary?: string; parameters: number; hasRequestSchema: boolean; hasResponseExample: boolean; responseCodes: string[]; warnings: string[] };
export type ApiReport = { schemaVersion: 1; sourceUrl: string; title: string; format: 'openapi' | 'swagger'; version: string; endpointCount: number; endpoints: Endpoint[]; score: number; warnings: string[] };
