const TESLA_API_BASE = 'https://fleet-api.prd.na.vn.cloud.tesla.com/api/1';
const TESLA_TOKEN_URL = 'https://auth.tesla.com/oauth2/v3/token';
const ALLOWED_ORIGIN = 'https://makes971-hash.github.io';

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Token exchange (user login)
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

    // Partner registration
    if (path === '/register' && request.method === 'POST') {
      const body = await request.json();
      const clientId = body.client_id;
      const clientSecret = env.TESLA_CLIENT_SECRET;

      const tokenResp = await fetch(TESLA_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          scope: 'openid offline_access energy_device_data energy_cmds',
          audience: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
        }).toString(),
      });

      const tokenData = await tokenResp.json();

      if (!tokenData.access_token) {
        return new Response(JSON.stringify({ error: 'Failed to get partner token', detail: tokenData }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const regResp = await fetch(`${TESLA_API_BASE}/partner_accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: 'makes971-hash.github.io' }),
      });

      const regData = await regResp.json();
      return new Response(JSON.stringify({ success: true, status: regResp.status, data: regData }), {
        status: regResp.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Proxy Tesla API calls
    if (path.startsWith('/api/1/')) {
      const teslaPath = path.replace('/api/1', '');
      const teslaUrl = `${TESLA_API_BASE}${teslaPath}${url.search}`;
      const authHeader = request.headers.get('Authorization') || '';
      const resp = await fetch(teslaUrl, {
        method: request.method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
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
