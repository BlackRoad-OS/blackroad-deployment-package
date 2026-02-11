/**
 * BlackRoad Analytics Worker
 * Lightweight analytics and event tracking
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// In-memory stats (use KV/D1 in production)
let stats = {
  pageViews: 0,
  apiCalls: 0,
  uniqueVisitors: new Set(),
  events: [],
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
        case '/analytics':
          response = jsonResponse({
            service: 'BlackRoad Analytics',
            version: '1.0.0',
            endpoints: [
              { path: '/track', method: 'POST', description: 'Track event' },
              { path: '/pageview', method: 'POST', description: 'Track page view' },
              { path: '/stats', method: 'GET', description: 'Get statistics' },
              { path: '/pixel.gif', method: 'GET', description: 'Tracking pixel' },
            ],
          });
          break;

        case '/track':
          if (request.method === 'POST') {
            try {
              const body = await request.json();
              stats.events.push({
                ...body,
                timestamp: new Date().toISOString(),
                ip: request.headers.get('CF-Connecting-IP'),
                country: request.cf?.country,
              });
              stats.apiCalls++;
              response = jsonResponse({ success: true, eventsTracked: stats.events.length });
            } catch {
              response = jsonResponse({ error: 'Invalid JSON body' }, 400);
            }
          } else {
            response = jsonResponse({ error: 'Use POST' }, 405);
          }
          break;

        case '/pageview':
          if (request.method === 'POST') {
            stats.pageViews++;
            const visitorId = request.headers.get('CF-Connecting-IP') || 'unknown';
            stats.uniqueVisitors.add(visitorId);
            response = jsonResponse({
              success: true,
              pageViews: stats.pageViews,
              uniqueVisitors: stats.uniqueVisitors.size,
            });
          } else {
            response = jsonResponse({ error: 'Use POST' }, 405);
          }
          break;

        case '/stats':
          response = jsonResponse({
            pageViews: stats.pageViews,
            apiCalls: stats.apiCalls,
            uniqueVisitors: stats.uniqueVisitors.size,
            eventsTracked: stats.events.length,
            recentEvents: stats.events.slice(-10),
            timestamp: new Date().toISOString(),
            note: 'Stats reset on worker restart. Use KV/D1 for persistence.',
          });
          break;

        case '/pixel.gif':
          // 1x1 transparent GIF for tracking
          stats.pageViews++;
          const gif = new Uint8Array([
            0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
            0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21,
            0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
            0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
            0x01, 0x00, 0x3b,
          ]);
          return new Response(gif, {
            headers: {
              'Content-Type': 'image/gif',
              'Cache-Control': 'no-store, no-cache, must-revalidate',
              ...CORS_HEADERS,
            },
          });

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
