const TESLA_API_BASE = 'https://fleet-api.prd.na.vn.cloud.tesla.com/api/1';
const TESLA_TOKEN_URL = 'https://auth.tesla.com/oauth2/v3/token';
const ALLOWED_ORIGIN = 'https://makes971-hash.github.io';

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }});
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (path === '/token' && request.method === 'POST') {
      const body = await request.text();
      const resp = await fetch(TESLA_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        status: resp.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (path.startsWith('/api/1/')) {
      const teslaPath = path.replace('/api/1', '');
      const teslaUrl = `${TESLA_API_BASE}${teslaPath}${url.search}`;
      const authHeader = request.headers.get('Authorization') || '';
      const resp = await fetch(teslaUrl, {
        method: request.method,
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        body: request.method !== 'GET' ? request.body : undefined,
      });
      const data = await resp.text();
      return new Response(data, {
        status: resp.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
};
