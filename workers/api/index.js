/**
 * BlackRoad API Gateway Worker
 * Central API for the BlackRoad ecosystem
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

const API_INFO = {
  name: 'BlackRoad API',
  version: '1.0.0',
  description: 'Sovereign AI Infrastructure API',
  docs: 'https://docs.blackroad.io/api',
  endpoints: [
    { path: '/', method: 'GET', description: 'API info' },
    { path: '/health', method: 'GET', description: 'Health check' },
    { path: '/agents', method: 'GET', description: 'List AI agents' },
    { path: '/agents/:id', method: 'GET', description: 'Get agent details' },
    { path: '/status', method: 'GET', description: 'System status' },
    { path: '/metrics', method: 'GET', description: 'Metrics overview' },
  ],
};

const AGENTS = [
  { id: 'cecilia', name: 'Cecilia', type: 'primary', status: 'active', capabilities: ['reasoning', 'code', 'orchestration'], device: 'Pi 5 + Hailo-8' },
  { id: 'lucidia', name: 'Lucidia', type: 'consciousness', status: 'active', capabilities: ['deep-reasoning', 'mathematics', 'philosophy'], device: 'Pi 4 + Hailo-8' },
  { id: 'alice', name: 'Alice', type: 'worker', status: 'active', capabilities: ['tasks', 'automation', 'monitoring'], device: 'Pi 4' },
  { id: 'aria', name: 'Aria', type: 'harmony', status: 'active', capabilities: ['orchestration', 'harmony', 'protocols'], device: 'Pi 5' },
  { id: 'octavia', name: 'Octavia', type: 'multi-arm', status: 'active', capabilities: ['parallel-processing', 'multi-task'], device: 'Pi 5' },
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      let response;

      switch (true) {
        case path === '/' || path === '/api':
          response = jsonResponse(API_INFO);
          break;

        case path === '/health':
          response = jsonResponse({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime?.() || 'N/A',
            region: request.cf?.colo || 'unknown',
          });
          break;

        case path === '/agents':
          response = jsonResponse({
            count: AGENTS.length,
            agents: AGENTS,
          });
          break;

        case path.startsWith('/agents/'):
          const agentId = path.split('/')[2];
          const agent = AGENTS.find(a => a.id === agentId);
          if (agent) {
            response = jsonResponse(agent);
          } else {
            response = jsonResponse({ error: 'Agent not found' }, 404);
          }
          break;

        case path === '/status':
          response = jsonResponse({
            operational: true,
            services: {
              api: 'operational',
              agents: 'operational',
              dashboard: 'operational',
              console: 'operational',
              monitoring: 'operational',
            },
            lastUpdated: new Date().toISOString(),
          });
          break;

        case path === '/metrics':
          response = jsonResponse({
            agents: {
              total: 30000,
              active: AGENTS.length,
              pending: 29995,
            },
            repositories: 200,
            services: 100,
            compute: '52 TOPS',
            uptime: '99.99%',
          });
          break;

        default:
          response = jsonResponse({
            error: 'Not Found',
            path: path,
            availableEndpoints: API_INFO.endpoints.map(e => e.path),
          }, 404);
      }

      // Add CORS headers to response
      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;

    } catch (error) {
      return jsonResponse({ error: 'Internal Server Error', message: error.message }, 500);
    }
  },
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}
