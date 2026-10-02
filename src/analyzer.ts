import type { ApiReport, Endpoint, HttpMethod } from './types';
const methods: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
const isObject = (value: unknown): value is Record<string, any> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
export function parseSpec(text: string, sourceUrl: string, title: string): ApiReport {
  let document: any;
  try { document = JSON.parse(text); } catch { throw new Error('Page is not valid JSON. Open the raw OpenAPI JSON document.'); }
  if (!isObject(document) || (!document.openapi && !document.swagger) || !isObject(document.paths)) throw new Error('No OpenAPI 3 or Swagger 2 paths found.');
  const format = document.openapi ? 'openapi' : 'swagger'; const endpoints: Endpoint[] = [];
  for (const [path, pathItem] of Object.entries(document.paths)) {
    if (!isObject(pathItem)) continue;
    for (const method of methods) {
      const operation = pathItem[method]; if (!isObject(operation)) continue;
      const responses = isObject(operation.responses) ? operation.responses : {};
      const responseCodes = Object.keys(responses); const responseExample = Object.values(responses).some((response: any) => isObject(response) && (response.example !== undefined || isObject(response.content)));
      const requestBody = operation.requestBody; const hasRequestSchema = isObject(requestBody) && isObject(requestBody.content);
      const warnings: string[] = []; if (!operation.operationId) warnings.push('missing-operation-id'); if (!responseCodes.length) warnings.push('missing-responses'); if (!responseCodes.some(code => /^2\d\d$/.test(code) || code === 'default')) warnings.push('missing-success-response'); if (['post', 'put', 'patch'].includes(method) && !hasRequestSchema) warnings.push('missing-request-schema'); if (!responseExample) warnings.push('missing-response-example');
      endpoints.push({ path, method, operationId: operation.operationId, summary: operation.summary, parameters: Array.isArray(operation.parameters) ? operation.parameters.length : 0, hasRequestSchema, hasResponseExample: responseExample, responseCodes, warnings });
    }
  }
  const warningCount = endpoints.reduce((sum, endpoint) => sum + endpoint.warnings.length, 0); const score = Math.min(100, warningCount * 5);
  return { schemaVersion: 1, sourceUrl, title: title || 'OpenAPI document', format, version: String(document.openapi ?? document.swagger), endpointCount: endpoints.length, endpoints, score, warnings: endpoints.length ? [] : ['no-endpoints'] };
}
export function toMarkdown(report: ApiReport): string { const lines = [`# OpenAPI Lens report`, `Source: ${report.sourceUrl}`, `Format: ${report.format} ${report.version}`, `Endpoints: ${report.endpointCount}`, `Contract debt score: ${report.score}/100`, '']; for (const endpoint of report.endpoints) lines.push(`- **${endpoint.method.toUpperCase()} ${endpoint.path}**${endpoint.operationId ? ` (${endpoint.operationId})` : ''} · responses: ${endpoint.responseCodes.join(', ') || 'none'}${endpoint.warnings.length ? `\n  Warnings: ${endpoint.warnings.join(', ')}` : ''}`); return lines.join('\n'); }
