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
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Token exchange
      if (path === '/token' && request.method === 'POST') {
        const body = await request.text();

        const resp = await fetch(TESLA_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        });

        const data = await resp.json();

        return new Response(JSON.stringify(data), {
          status: resp.status,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
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
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        });

        const data = await resp.json();

        return new Response(JSON.stringify(data), {
          status: resp.status,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
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
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        });

        const tokenData = await tokenResp.json();

        if (!tokenData.access_token) {
          return new Response(JSON.stringify({
            error: 'Failed to get partner token',
            detail: tokenData,
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        const results = [];

        for (const base of REGIONS) {
          const regResp = await fetch(`${base}/partner_accounts`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              domain: 'makes971-hash.github.io',
            }),
          });

          let regData = null;

          try {
            regData = await regResp.json();
          } catch (e) {
            regData = {
              error: 'Could not parse registration response',
            };
          }

          results.push({
            region: base,
            status: regResp.status,
            data: regData,
          });
        }

        return new Response(JSON.stringify({
          success: true,
          results,
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // Health check with full secret diagnostics
      if (path === '/health') {
        const visibleEnvKeys = Object.keys(env || {}).sort();

        return new Response(JSON.stringify({
          status: 'ok',
          cache_size: cache.size,

          env_keys_visible_to_worker: visibleEnvKeys,

          powerbi_key_loaded: !!env.POWERBI_KEY,
          powerbi_key_type: typeof env.POWERBI_KEY,
          powerbi_key_length: env.POWERBI_KEY ? String(env.POWERBI_KEY).trim().length : 0,

          tesla_client_id_loaded: !!env.TESLA_CLIENT_ID,
          tesla_client_id_type: typeof env.TESLA_CLIENT_ID,
          tesla_client_id_length: env.TESLA_CLIENT_ID ? String(env.TESLA_CLIENT_ID).trim().length : 0,

          tesla_refresh_token_loaded: !!env.TESLA_REFRESH_TOKEN,
          tesla_refresh_token_type: typeof env.TESLA_REFRESH_TOKEN,
          tesla_refresh_token_length: env.TESLA_REFRESH_TOKEN ? String(env.TESLA_REFRESH_TOKEN).trim().length : 0,

          tesla_client_secret_loaded: !!env.TESLA_CLIENT_SECRET,
          tesla_client_secret_type: typeof env.TESLA_CLIENT_SECRET,

          timestamp: new Date().toISOString(),
        }, null, 2), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...corsHeaders,
          },
        });
      }

      // Power BI endpoint - secured by API key
      if (path === '/powerbi' || path.startsWith('/powerbi/')) {
        const key = (url.searchParams.get('key') || '').trim();
        const expectedKey = (env.POWERBI_KEY || '').trim();

        if (!expectedKey) {
          return new Response(JSON.stringify({
            error: 'POWERBI_KEY secret is missing',
            debug: {
              supplied_key_length: key.length,
              expected_key_length: 0,
              env_keys_visible_to_worker: Object.keys(env || {}).sort(),
            },
          }, null, 2), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store',
              ...corsHeaders,
            },
          });
        }

        if (!key || key !== expectedKey) {
          return new Response(JSON.stringify({
            error: 'Invalid API key',
            debug: {
              supplied_key_length: key.length,
              expected_key_length: expectedKey.length,
            },
          }, null, 2), {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store',
              ...corsHeaders,
            },
          });
        }

        if (!env.TESLA_CLIENT_ID) {
          return new Response(JSON.stringify({
            error: 'TESLA_CLIENT_ID secret is missing',
            debug: {
              env_keys_visible_to_worker: Object.keys(env || {}).sort(),
            },
          }, null, 2), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        if (!env.TESLA_REFRESH_TOKEN) {
          return new Response(JSON.stringify({
            error: 'TESLA_REFRESH_TOKEN secret is missing',
            debug: {
              env_keys_visible_to_worker: Object.keys(env || {}).sort(),
            },
          }, null, 2), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // Get or refresh token
        let pbiToken = getCached('pbi_token');

        if (!pbiToken) {
          const params = new URLSearchParams();
          params.append('grant_type', 'refresh_token');
          params.append('client_id', env.TESLA_CLIENT_ID);
          params.append('refresh_token', env.TESLA_REFRESH_TOKEN);
          params.append('scope', 'openid offline_access energy_device_data energy_cmds');

          const tokenResp = await fetch(TESLA_TOKEN_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
          });

          let tokenData = null;

          try {
            tokenData = await tokenResp.json();
          } catch (e) {
            tokenData = {
              error: 'Could not parse Tesla token response',
            };
          }

          if (!tokenData.access_token) {
            return new Response(JSON.stringify({
              error: 'Token refresh failed',
              status: tokenResp.status,
              detail: tokenData,
            }, null, 2), {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            });
          }

          pbiToken = tokenData.access_token;
          setCache('pbi_token', pbiToken);
        }

        const pbiHeaders = {
          'Authorization': `Bearer ${pbiToken}`,
          'Content-Type': 'application/json',
        };

        // Helper to fetch from Tesla with region fallback
        async function teslaPbiGet(apiPath) {
          for (const base of REGIONS) {
            const resp = await fetch(`${base}${apiPath}`, {
              headers: pbiHeaders,
            });

            if (resp.status !== 421) {
              return resp;
            }
          }

          return await fetch(`${REGIONS[1]}${apiPath}`, {
            headers: pbiHeaders,
          });
        }

        const subPath = path.replace('/powerbi', '') || '/';

        // /powerbi or /powerbi/sites - flat table of all sites with live data
        if (subPath === '/' || subPath === '/sites') {
          const cached = getCached('pbi_sites');

          if (cached) {
            return new Response(JSON.stringify(cached, null, 2), {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'X-Cache': 'HIT',
                ...corsHeaders,
              },
            });
          }

          const productsResp = await teslaPbiGet('/products');

          if (!productsResp.ok) {
            const detail = await productsResp.text();

            return new Response(JSON.stringify({
              error: 'Failed to fetch products',
              status: productsResp.status,
              detail,
            }, null, 2), {
              status: 502,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            });
          }

          const products = await productsResp.json();
          const energySites = (products.response || []).filter(
            p => p.resource_type === 'battery' || p.energy_site_id
          );

          const rows = [];
          const CPT_RATE = 3.50;
          const now = new Date().toISOString();

          for (const site of energySites) {
            const row = {
              site_id: site.energy_site_id,
              site_name: site.site_name || 'Unknown',
              gateway_id: site.gateway_id || null,
              has_solar: site.components?.solar || false,
              has_battery: site.components?.battery || false,
              battery_type: site.battery_type || null,
              solar_power_kw: 0,
              load_power_kw: 0,
              grid_power_kw: 0,
              battery_power_kw: 0,
              battery_pct: 0,
              grid_status: 'Unknown',
              island_status: 'Unknown',
              grid_importing: false,
              grid_exporting: false,
              is_online: !!site.gateway_id,
              estimated_savings_rand: 0,
              rate_per_kwh: CPT_RATE,
              timestamp: now,
            };

            try {
              const liveResp = await teslaPbiGet(`/energy_sites/${site.energy_site_id}/live_status`);

              if (liveResp.ok) {
                const liveData = await liveResp.json();
                const live = liveData.response;

                if (live) {
                  row.solar_power_kw = +((live.solar_power || 0) / 1000).toFixed(3);
                  row.load_power_kw = +((live.load_power || 0) / 1000).toFixed(3);
                  row.grid_power_kw = +((live.grid_power || 0) / 1000).toFixed(3);
                  row.battery_power_kw = +((live.battery_power || 0) / 1000).toFixed(3);
                  row.battery_pct = live.percentage_charged != null
                    ? +Number(live.percentage_charged).toFixed(1)
                    : 0;
                  row.grid_status = live.grid_status || 'Unknown';
                  row.island_status = live.island_status || 'Unknown';
                  row.grid_importing = (live.grid_power || 0) > 0;
                  row.grid_exporting = (live.grid_power || 0) < 0;
                  row.estimated_savings_rand = +(row.solar_power_kw * CPT_RATE).toFixed(2);
                }
              } else {
                row.live_error = `Live status failed with ${liveResp.status}`;
              }
            } catch (e) {
              row.live_error = e.message;
            }

            rows.push(row);
          }

          const result = {
            fleet_size: rows.length,
            timestamp: now,
            rate_per_kwh: CPT_RATE,
            sites: rows,
          };

          setCache('pbi_sites', result);

          return new Response(JSON.stringify(result, null, 2), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Cache': 'MISS',
              ...corsHeaders,
            },
          });
        }

        // /powerbi/history?site_id=XXX&period=day|week|month
        if (subPath === '/history') {
          const siteId = url.searchParams.get('site_id');
          const period = url.searchParams.get('period') || 'day';

          if (!siteId) {
            return new Response(JSON.stringify({
              error: 'site_id required',
            }, null, 2), {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            });
          }

          const cacheKey = `pbi_hist_${siteId}_${period}`;
          const cached2 = getCached(cacheKey);

          if (cached2) {
            return new Response(JSON.stringify(cached2, null, 2), {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'X-Cache': 'HIT',
                ...corsHeaders,
              },
            });
          }

          const histResp = await teslaPbiGet(
            `/energy_sites/${siteId}/calendar_history?kind=power&period=${period}`
          );

          if (!histResp.ok) {
            const detail = await histResp.text();

            return new Response(JSON.stringify({
              error: 'Failed to fetch history',
              status: histResp.status,
              detail,
            }, null, 2), {
              status: 502,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            });
          }

          const histData = await histResp.json();
          const series = histData.response?.time_series || [];

          const rows = series.map(d => ({
            timestamp: d.timestamp,
            solar_power_kw: +((d.solar_power || 0) / 1000).toFixed(3),
            load_power_kw: +((d.load_power || 0) / 1000).toFixed(3),
            grid_power_kw: +((d.grid_power || 0) / 1000).toFixed(3),
            battery_power_kw: +((d.battery_power || 0) / 1000).toFixed(3),
          }));

          const result = {
            site_id: siteId,
            period,
            data_points: rows.length,
            history: rows,
          };

          setCache(cacheKey, result);

          return new Response(JSON.stringify(result, null, 2), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Cache': 'MISS',
              ...corsHeaders,
            },
          });
        }

        // /powerbi/summary - fleet totals
        if (subPath === '/summary') {
          const cached3 = getCached('pbi_summary');

          if (cached3) {
            return new Response(JSON.stringify(cached3, null, 2), {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'X-Cache': 'HIT',
                ...corsHeaders,
              },
            });
          }

          // Reuse sites data
          const sitesResp = await fetch(`${url.origin}/powerbi/sites?key=${encodeURIComponent(key)}`);
          const sitesData = await sitesResp.json();
          const sites = sitesData.sites || [];

          let totalSolar = 0;
          let totalLoad = 0;
          let totalGridImport = 0;
          let totalGridExport = 0;
          let totalBatt = 0;
          let battCount = 0;
          let onlineCount = 0;

          sites.forEach(s => {
            totalSolar += Number(s.solar_power_kw) || 0;
            totalLoad += Number(s.load_power_kw) || 0;

            if ((Number(s.grid_power_kw) || 0) > 0) {
              totalGridImport += Number(s.grid_power_kw) || 0;
            } else {
              totalGridExport += Math.abs(Number(s.grid_power_kw) || 0);
            }

            totalBatt += Number(s.battery_pct) || 0;
            battCount++;

            if (s.is_online) {
              onlineCount++;
            }
          });

          const CPT_RATE = 3.50;

          const result = {
            fleet_size: sites.length,
            online_count: onlineCount,
            offline_count: sites.length - onlineCount,
            total_solar_kw: +totalSolar.toFixed(2),
            total_load_kw: +totalLoad.toFixed(2),
            total_grid_import_kw: +totalGridImport.toFixed(2),
            total_grid_export_kw: +totalGridExport.toFixed(2),
            avg_battery_pct: battCount ? +(totalBatt / battCount).toFixed(1) : 0,
            grid_dependence_pct: totalLoad > 0 ? +(totalGridImport / totalLoad * 100).toFixed(1) : 0,
            solar_contribution_pct: totalLoad > 0 ? +(totalSolar / totalLoad * 100).toFixed(1) : 0,
            estimated_hourly_savings_rand: +(totalSolar * CPT_RATE).toFixed(2),
            rate_per_kwh: CPT_RATE,
            timestamp: new Date().toISOString(),
          };

          setCache('pbi_summary', result);

          return new Response(JSON.stringify(result, null, 2), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Cache': 'MISS',
              ...corsHeaders,
            },
          });
        }

        return new Response(JSON.stringify({
          error: 'Unknown powerbi endpoint',
          available: [
            '/powerbi/sites',
            '/powerbi/summary',
            '/powerbi/history?site_id=X&period=day',
          ],
        }, null, 2), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
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
              headers: {
                'Content-Type': 'application/json',
                'X-Cache': 'HIT',
                ...corsHeaders,
              },
            });
          }
        }

        let bodyText = null;

        if (
          request.method === 'POST' ||
          request.method === 'PUT' ||
          request.method === 'PATCH'
        ) {
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

              if (bodyText) {
                fetchOpts.body = bodyText;
              }

              lastResp = await fetch(teslaUrl, fetchOpts);

              // If rate limited, wait and retry
              if (lastResp.status === 429 && attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                continue;
              }

              // If region mismatch, try next region
              if (lastResp.status === 421) {
                break;
              }

              // Success or non-retryable error
              if (
                lastResp.ok ||
                (
                  lastResp.status !== 429 &&
                  lastResp.status !== 500 &&
                  lastResp.status !== 502 &&
                  lastResp.status !== 503
                )
              ) {
                // Cache successful GET responses
                if (request.method === 'GET' && lastResp.ok) {
                  const data = await lastResp.json();
                  const cacheKey = teslaPath + url.search;

                  setCache(cacheKey, data);

                  return new Response(JSON.stringify(data), {
                    status: 200,
                    headers: {
                      'Content-Type': 'application/json',
                      'X-Cache': 'MISS',
                      ...corsHeaders,
                    },
                  });
                }

                const data = await lastResp.text();

                return new Response(data, {
                  status: lastResp.status,
                  headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                  },
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
          if (lastResp && lastResp.status !== 421) {
            break;
          }
        }

        // Return whatever we got
        if (lastResp) {
          const data = await lastResp.text();

          return new Response(data, {
            status: lastResp.status,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        return new Response(JSON.stringify({
          error: lastError?.message || 'All retries failed',
        }, null, 2), {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      return new Response('Not found', {
        status: 404,
        headers: corsHeaders,
      });

    } catch (e) {
      return new Response(JSON.stringify({
        error: e.message,
        stack: e.stack,
      }, null, 2), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};
