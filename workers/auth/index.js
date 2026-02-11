/**
 * BlackRoad Auth Worker
 * Authentication and API key management
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      let response;

      switch (path) {
        case '/':
        case '/auth':
          response = jsonResponse({
            service: 'BlackRoad Auth',
            version: '1.0.0',
            endpoints: [
              { path: '/verify', method: 'POST', description: 'Verify API key' },
              { path: '/token', method: 'POST', description: 'Generate token' },
              { path: '/status', method: 'GET', description: 'Auth service status' },
            ],
          });
          break;

        case '/verify':
          const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');
          if (!apiKey) {
            response = jsonResponse({ valid: false, error: 'No API key provided' }, 401);
          } else {
            // In production, verify against KV store or database
            const isValid = apiKey.startsWith('br_') && apiKey.length > 10;
            response = jsonResponse({
              valid: isValid,
              keyPrefix: apiKey.substring(0, 6) + '...',
              timestamp: new Date().toISOString(),
            }, isValid ? 200 : 401);
          }
          break;

        case '/token':
          if (request.method !== 'POST') {
            response = jsonResponse({ error: 'Method not allowed' }, 405);
            break;
          }
          // Generate a demo token
          const token = 'br_' + crypto.randomUUID().replace(/-/g, '');
          response = jsonResponse({
            token: token,
            type: 'api_key',
            expiresIn: '30d',
            createdAt: new Date().toISOString(),
            note: 'Demo token - for production, implement proper auth flow',
          });
          break;

        case '/status':
          response = jsonResponse({
            service: 'auth',
            status: 'operational',
            region: request.cf?.colo || 'unknown',
            timestamp: new Date().toISOString(),
          });
          break;

        default:
          response = jsonResponse({ error: 'Not found' }, 404);
      }

      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;

    } catch (error) {
      return jsonResponse({ error: 'Internal Server Error' }, 500);
    }
  },
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
