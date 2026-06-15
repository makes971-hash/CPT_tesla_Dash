const TESLA_TOKEN_URL = 'https://auth.tesla.com/oauth2/v3/token';
const ALLOWED_ORIGIN = 'https://makes971-hash.github.io';

const REGIONS = [
  'https://fleet-api.prd.na.vn.cloud.tesla.com/api/1',
  'https://fleet-api.prd.eu.vn.cloud.tesla.com/api/1',
];

async function tryRegions(path, options) {
  for (const base of REGIONS) {
    const resp = await fetch(`${base}${path}`, options);
    if (resp.status !== 421) return resp;
  }
  return await fetch(`${REGIONS[1]}${path}`, options);
}

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

    if (path === '/register' && request.method === 'POST') {
      const body = await request.json();
      const clientId = body.client_id;
      const clientSecret = body.client_secret || env.TESLA_CLIENT_SECRET;

      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('scope', 'openid offline_access energy_device_data energy_cmds');
      params.append('audience', 'https://fleet-api.prd.eu.vn.cloud.tesla.com');

      const tokenResp = await fetch(TESLA_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });

      const tokenData = await tokenResp.json();

      if (!tokenData.access_token) {
        return new Response(JSON.stringify({ error: 'Failed to get partner token', detail: tokenData }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Register in both regions
      const results = [];
      for (const base of REGIONS) {
        const regResp = await fetch(`${base}/partner_accounts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ domain: 'makes971-hash.github.io' }),
        });
        const regData = await regResp.json();
        results.push({ region: base, status: regResp.status, data: regData });
      }

      return new Response(JSON.stringify({ success: true, results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (path.startsWith('/api/1/')) {
      const teslaPath = path.replace('/api/1', '');
      const authHeader = request.headers.get('Authorization') || '';
      const options = {
        method: request.method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: request.method !== 'GET' ? request.body : undefined,
      };

      const resp = await tryRegions(`${teslaPath}${url.search}`, options);
      const data = await resp.text();
      return new Response(data, {
        status: resp.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
};
