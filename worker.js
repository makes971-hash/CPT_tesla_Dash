const TESLA_TOKEN_URL = 'https://auth.tesla.com/oauth2/v3/token';
const ALLOWED_ORIGIN = 'https://makes971-hash.github.io';
const CACHE_TTL = 60; // seconds

const REGIONS = [
  'https://fleet-api.prd.na.vn.cloud.tesla.com/api/1',
  'https://fleet-api.prd.eu.vn.cloud.tesla.com/api/1',
];

// In-memory cache
const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.time > CACHE_TTL * 1000) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
  // Limit cache size
  if (cache.size > 200) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
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

    try {
      // Token exchange
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

      // Token refresh
      if (path === '/refresh' && request.method === 'POST') {
        const body = await request.json();
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', body.client_id);
        params.append('refresh_token', body.refresh_token);
        params.append('scope', 'openid offline_access energy_device_data energy_cmds');

        const resp = await fetch(TESLA_TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params,
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
        const results = [];
        for (const base of REGIONS) {
          const regResp = await fetch(`${base}/partner_accounts`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: 'makes971-hash.github.io' }),
          });
          results.push({ region: base, status: regResp.status, data: await regResp.json() });
        }
        return new Response(JSON.stringify({ success: true, results }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          cache_size: cache.size,
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Proxy Tesla API calls with caching and retry
      if (path.startsWith('/api/1/')) {
        const teslaPath = path.replace('/api/1', '');
        const authHeader = request.headers.get('Authorization') || '';

        // Only cache GET requests
        if (request.method === 'GET') {
          const cacheKey = teslaPath + url.search;
          const cached = getCached(cacheKey);
          if (cached) {
            return new Response(JSON.stringify(cached), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT', ...corsHeaders },
            });
          }
        }

        let bodyText = null;
        if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
          bodyText = await request.text();
        }

        // Try regions with retry
        let lastResp = null;
        let lastError = null;
        const maxRetries = 2;

        for (const base of REGIONS) {
          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
              const teslaUrl = `${base}${teslaPath}${url.search}`;
              const fetchOpts = {
                method: request.method,
                headers: {
                  'Authorization': authHeader,
                  'Content-Type': 'application/json',
                },
              };
              if (bodyText) fetchOpts.body = bodyText;

              lastResp = await fetch(teslaUrl, fetchOpts);

              // If rate limited, wait and retry
              if (lastResp.status === 429 && attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                continue;
              }

              // If region mismatch, try next region
              if (lastResp.status === 421) break;

              // Success or non-retryable error
              if (lastResp.ok || (lastResp.status !== 429 && lastResp.status !== 500 && lastResp.status !== 502 && lastResp.status !== 503)) {
                // Cache successful GET responses
                if (request.method === 'GET' && lastResp.ok) {
                  const data = await lastResp.json();
                  const cacheKey = teslaPath + url.search;
                  setCache(cacheKey, data);
                  return new Response(JSON.stringify(data), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS', ...corsHeaders },
                  });
                }

                const data = await lastResp.text();
                return new Response(data, {
                  status: lastResp.status,
                  headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
              }

              // Server error, retry
              if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
              }
            } catch (e) {
              lastError = e;
              if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
              }
            }
          }

          // If not 421, don't try next region
          if (lastResp && lastResp.status !== 421) break;
        }

        // Return whatever we got
        if (lastResp) {
          const data = await lastResp.text();
          return new Response(data, {
            status: lastResp.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        return new Response(JSON.stringify({ error: lastError?.message || 'All retries failed' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response('Not found', { status: 404, headers: corsHeaders });

    } catch(e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};
