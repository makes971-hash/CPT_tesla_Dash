<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>CPT Tesla Dash</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f8f9fa; --surface: #ffffff; --border: #e2e8f0;
    --text: #1a202c; --muted: #64748b; --accent: #e31937; --accent-light: #fff0f2;
    --solar: #f59e0b; --solar-light: #fffbeb;
    --grid: #3b82f6; --grid-light: #eff6ff;
    --home: #8b5cf6; --home-light: #f5f3ff;
    --battery: #10b981; --battery-light: #ecfdf5; --battery-low: #ef4444;
    --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
    --radius: 12px; --radius-sm: 8px;
  }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
  header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 60px; position: sticky; top: 0; z-index: 100; }
  .logo { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 16px; color: var(--text); }
  .logo-icon { width: 28px; height: 28px; background: var(--accent); border-radius: 6px; display: flex; align-items: center; justify-content: center; }
  .logo-icon svg { width: 18px; height: 18px; fill: none; stroke: white; stroke-width: 2; stroke-linecap: round; }
  .header-right { display: flex; align-items: center; gap: 12px; }
  .btn { padding: 7px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); color: var(--text); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }
  .btn:hover { background: var(--bg); }
  .btn-primary { background: var(--accent); color: white; border-color: var(--accent); }
  .btn-primary:hover { background: #c41230; border-color: #c41230; }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  main { padding: 24px; max-width: 1280px; margin: 0 auto; }
  .page { display: none; }
  .page.active { display: block; }
  #auth-page { display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 60px); }
  #auth-page.active { display: flex; }
  .auth-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 40px; width: 100%; max-width: 440px; box-shadow: var(--shadow); }
  .auth-card h2 { font-size: 22px; font-weight: 600; margin-bottom: 8px; }
  .auth-card p { color: var(--muted); font-size: 14px; margin-bottom: 28px; }
  .field { margin-bottom: 16px; }
  .field label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: var(--muted); }
  .field input { width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; color: var(--text); background: var(--surface); outline: none; transition: border-color 0.15s; }
  .field input:focus { border-color: var(--accent); }
  .auth-note { background: var(--accent-light); border: 1px solid #fecdd3; border-radius: var(--radius-sm); padding: 12px; font-size: 13px; color: #9f1239; margin-bottom: 20px; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .section-header h2 { font-size: 18px; font-weight: 600; }
  .section-header span { font-size: 13px; color: var(--muted); }
  .fleet-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .site-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; cursor: pointer; transition: all 0.15s; box-shadow: var(--shadow); }
  .site-card:hover { border-color: var(--accent); transform: translateY(-1px); }
  .site-card.selected { border: 2px solid var(--accent); }
  .site-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
  .site-name { font-size: 15px; font-weight: 600; }
  .site-address { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .site-status { font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 20px; }
  .status-online { background: #dcfce7; color: #15803d; }
  .status-offline { background: #fee2e2; color: #dc2626; }
  .site-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .metric-mini { background: var(--bg); border-radius: var(--radius-sm); padding: 10px 12px; }
  .metric-mini .label { font-size: 11px; color: var(--muted); margin-bottom: 2px; }
  .metric-mini .value { font-size: 16px; font-weight: 600; }
  .solar-val { color: var(--solar); } .battery-val { color: var(--battery); } .grid-val { color: var(--grid); } .home-val { color: var(--home); }
  .battery-bar-label { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); margin-bottom: 4px; }
  .battery-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .battery-bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
  .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 28px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow); }
  .stat-card .icon { width: 36px; height: 36px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; margin-bottom: 10px; font-size: 18px; }
  .stat-card .stat-label { font-size: 12px; color: var(--muted); margin-bottom: 4px; }
  .stat-card .stat-value { font-size: 22px; font-weight: 600; }
  .stat-card .stat-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .detail-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 24px; box-shadow: var(--shadow); }
  .detail-panel h3 { font-size: 16px; font-weight: 600; margin-bottom: 20px; }
  .energy-flow { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 24px 0; flex-wrap: wrap; }
  .flow-node { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 80px; }
  .flow-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .flow-label { font-size: 11px; color: var(--muted); text-align: center; }
  .flow-value { font-size: 14px; font-weight: 600; text-align: center; }
  .flow-arrow { color: var(--muted); font-size: 18px; }
  .history-chart { width: 100%; height: 160px; margin-top: 8px; }
  .alert-list { display: flex; flex-direction: column; gap: 8px; }
  .alert-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px; border-radius: var(--radius-sm); font-size: 13px; border: 1px solid; }
  .alert-error { background: #fff1f2; border-color: #fecdd3; color: #881337; }
  .alert-warning { background: #fefce8; border-color: #fef08a; color: #854d0e; }
  .alert-title { font-weight: 500; margin-bottom: 2px; }
  .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; color: var(--muted); gap: 12px; }
  .spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .nav-tabs { display: flex; gap: 4px; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 3px; margin-bottom: 20px; width: fit-content; }
  .nav-tab { padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; background: transparent; color: var(--muted); transition: all 0.15s; }
  .nav-tab.active { background: var(--surface); color: var(--text); box-shadow: var(--shadow); }
  .error-msg { background: #fff1f2; border: 1px solid #fecdd3; color: #881337; border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; margin-top: 12px; }
  #callback-page.active { display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 60px); }
  @media (max-width: 600px) { main { padding: 12px; } .fleet-grid { grid-template-columns: 1fr; } .summary-grid { grid-template-columns: 1fr 1fr; } }
</style>
</head>
<body>

<header>
  <div class="logo">
    <div class="logo-icon">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    </div>
    CPT Tesla Dash
  </div>
  <div class="header-right">
    <div id="live-indicator" style="display:none;align-items:center;gap:6px;font-size:13px;color:var(--muted);">
      <div class="status-dot"></div>Live
    </div>
    <button class="btn" id="refresh-btn" style="display:none;" onclick="refreshData()">⟳ Refresh</button>
    <button class="btn" id="logout-btn" style="display:none;" onclick="logout()">Sign out</button>
  </div>
</header>

<main>

  <div id="auth-page" class="page active">
    <div class="auth-card">
      <h2>Connect your fleet</h2>
      <p>Sign in with your Tesla Fleet API credentials to monitor all your Powerwall sites.</p>
      <div class="auth-note">🔒 Your credentials are used only to obtain an access token and are never stored beyond your browser session.</div>
      <div class="field">
        <label>Client ID</label>
        <input type="text" id="client-id" placeholder="your-client-id" autocomplete="off" />
      </div>
      <div class="field">
        <label>Redirect URI (pre-filled)</label>
        <input type="text" id="redirect-uri" value="https://makes971-hash.github.io/CPT_tesla_Dash/" readonly style="background:#f8f9fa;color:var(--muted);" />
      </div>
      <div class="field">
        <label>Scope</label>
        <input type="text" id="scope" value="openid offline_access energy_device_data" />
      </div>
      <div id="auth-error" class="error-msg" style="display:none;"></div>
      <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:8px;" onclick="startAuth()">
        Connect with Tesla →
      </button>
      <p style="font-size:12px;color:var(--muted);text-align:center;margin-top:16px;">You'll be redirected to Tesla to authorize access.</p>
    </div>
  </div>

  <div id="callback-page" class="page">
    <div class="loading"><div class="spinner"></div><span>Completing sign in…</span></div>
  </div>

  <div id="dashboard-page" class="page">
    <div class="nav-tabs">
      <button class="nav-tab active" onclick="switchTab('fleet')">Fleet overview</button>
      <button class="nav-tab" onclick="switchTab('alerts')">Alerts</button>
    </div>
    <div id="tab-fleet">
      <div class="summary-grid" id="summary-grid"></div>
      <div class="section-header">
        <h2>Sites</h2>
        <span id="sites-count"></span>
      </div>
      <div class="fleet-grid" id="fleet-grid">
        <div class="loading"><div class="spinner"></div><span>Loading sites…</span></div>
      </div>
      <div class="detail-panel" id="site-detail" style="display:none;">
        <h3 id="detail-title">⚡ Site detail</h3>
        <div class="energy-flow" id="energy-flow"></div>
        <div style="border-top:1px solid var(--border);padding-top:20px;margin-top:8px;">
          <div style="font-size:13px;font-weight:500;margin-bottom:12px;color:var(--muted);">Power over last 24 h</div>
          <canvas class="history-chart" id="history-chart"></canvas>
        </div>
      </div>
    </div>
    <div id="tab-alerts" style="display:none;">
      <div class="alert-list" id="alert-list"></div>
    </div>
  </div>

</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<script>
const PROXY = 'https://cptdash.makes971.workers.dev';
const TESLA_AUTH_URL = 'https://auth.tesla.com/oauth2/v3/authorize';
const REDIRECT_URI = 'https://makes971-hash.github.io/CPT_tesla_Dash/';

let accessToken = null, sites = [], histChart = null, activeTab = 'fleet';

async function generatePKCE() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  const verifier = btoa(String.fromCharCode(...arr)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  return { verifier, challenge };
}

async function startAuth() {
  const clientId = document.getElementById('client-id').value.trim();
  const scope = document.getElementById('scope').value.trim();
  const errEl = document.getElementById('auth-error');
  if (!clientId) { errEl.textContent = 'Please enter your Client ID.'; errEl.style.display = 'block'; return; }
  errEl.style.display = 'none';
  const { verifier, challenge } = await generatePKCE();
  const state = crypto.randomUUID();
  sessionStorage.setItem('pkce_verifier', verifier);
  sessionStorage.setItem('oauth_state', state);
  sessionStorage.setItem('client_id', clientId);
  const params = new URLSearchParams({ response_type:'code', client_id:clientId, redirect_uri:REDIRECT_URI, scope, state, code_challenge:challenge, code_challenge_method:'S256' });
  window.location.href = `${TESLA_AUTH_URL}?${params}`;
}

async function handleCallback(code, state) {
  const savedState = sessionStorage.getItem('oauth_state');
  const verifier = sessionStorage.getItem('pkce_verifier');
  const clientId = sessionStorage.getItem('client_id');
  if (state !== savedState) { showPage('auth-page'); return; }
  try {
    const res = await fetch(`${PROXY}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type:'authorization_code', client_id:clientId, code, redirect_uri:REDIRECT_URI, code_verifier:verifier })
    });
    if (!res.ok) throw new Error('Token exchange failed');
    const data = await res.json();
    accessToken = data.access_token;
    sessionStorage.setItem('access_token', accessToken);
    if (data.refresh_token) sessionStorage.setItem('refresh_token', data.refresh_token);
    history.replaceState({}, '', REDIRECT_URI);
    showDashboard();
  } catch(e) {
    showPage('auth-page');
    const el = document.getElementById('auth-error');
    el.textContent = 'Authentication failed: ' + e.message;
    el.style.display = 'block';
  }
}

async function apiGet(path) {
  const res = await fetch(`${PROXY}/api/1${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function showDashboard() {
  showPage('dashboard-page');
  document.getElementById('logout-btn').style.display = '';
  document.getElementById('refresh-btn').style.display = '';
  document.getElementById('live-indicator').style.display = 'flex';
  await loadFleet();
}

async function loadFleet() {
  document.getElementById('fleet-grid').innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading sites…</span></div>';
  try {
    const data = await apiGet('/energy_sites');
    sites = data.response || [];
    renderFleet(sites);
  } catch(e) {
    document.getElementById('fleet-grid').innerHTML = `<div class="error-msg">Failed to load sites: ${e.message}</div>`;
  }
}

function renderFleet(sites) {
  const grid = document.getElementById('fleet-grid');
  const summaryGrid = document.getElementById('summary-grid');
  if (!sites.length) { grid.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:24px;">No energy sites found on this account.</p>'; return; }
  document.getElementById('sites-count').textContent = `${sites.length} site${sites.length !== 1 ? 's' : ''}`;
  let totalSolar=0, totalBattery=0, totalHome=0, onlineCount=0;
  const cards = sites.map((site, i) => {
    const name = site.site_name || `Site ${i+1}`;
    const addr = site.address?.address_line1 || '';
    const solarPower = (site.solar_power || 0) / 1000;
    const batteryPct = site.percentage_charged || 0;
    const gridPower = (site.grid_power || 0) / 1000;
    const homePower = (site.load_power || 0) / 1000;
    const isOnline = !!site.gateway_id;
    totalSolar += solarPower; totalBattery += batteryPct; totalHome += homePower;
    if (isOnline) onlineCount++;
    const battColor = batteryPct < 20 ? 'var(--battery-low)' : 'var(--battery)';
    const gridLabel = gridPower >= 0 ? `+${gridPower.toFixed(1)} kW import` : `${Math.abs(gridPower).toFixed(1)} kW export`;
    return `
    <div class="site-card" onclick="selectSite(${i})" id="site-card-${i}">
      <div class="site-header">
        <div><div class="site-name">${name}</div>${addr ? `<div class="site-address">${addr}</div>` : ''}</div>
        <span class="site-status ${isOnline?'status-online':'status-offline'}">${isOnline?'Online':'Offline'}</span>
      </div>
      <div class="site-metrics">
        <div class="metric-mini"><div class="label">☀️ Solar</div><div class="value solar-val">${solarPower.toFixed(1)} kW</div></div>
        <div class="metric-mini"><div class="label">🏠 Home</div><div class="value home-val">${homePower.toFixed(1)} kW</div></div>
        <div class="metric-mini"><div class="label">⚡ Grid</div><div class="value grid-val" style="font-size:13px;">${gridLabel}</div></div>
        <div class="metric-mini"><div class="label">🔋 Battery</div><div class="value battery-val">${batteryPct.toFixed(0)}%</div></div>
      </div>
      <div class="battery-bar-label"><span>Battery charge</span><span>${batteryPct.toFixed(0)}%</span></div>
      <div class="battery-bar"><div class="battery-bar-fill" style="width:${batteryPct}%;background:${battColor};"></div></div>
    </div>`;
  });
  grid.innerHTML = cards.join('');
  const avgBattery = sites.length ? (totalBattery / sites.length).toFixed(0) : 0;
  summaryGrid.innerHTML = `
    <div class="stat-card"><div class="icon" style="background:var(--solar-light);">☀️</div><div class="stat-label">Total solar</div><div class="stat-value solar-val">${totalSolar.toFixed(1)} kW</div><div class="stat-sub">All sites</div></div>
    <div class="stat-card"><div class="icon" style="background:var(--battery-light);">🔋</div><div class="stat-label">Avg battery</div><div class="stat-value battery-val">${avgBattery}%</div><div class="stat-sub">Fleet average</div></div>
    <div class="stat-card"><div class="icon" style="background:var(--home-light);">🏠</div><div class="stat-label">Consumption</div><div class="stat-value home-val">${totalHome.toFixed(1)} kW</div><div class="stat-sub">All sites</div></div>
    <div class="stat-card"><div class="icon" style="background:var(--accent-light);">📡</div><div class="stat-label">Sites online</div><div class="stat-value" style="color:var(--accent);">${onlineCount} / ${sites.length}</div><div class="stat-sub">Fleet status</div></div>
  `;
}

async function selectSite(idx) {
  document.querySelectorAll('.site-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`site-card-${idx}`).classList.add('selected');
  const site = sites[idx];
  const panel = document.getElementById('site-detail');
  panel.style.display = 'block';
  document.getElementById('detail-title').textContent = `⚡ ${site.site_name || 'Site '+(idx+1)}`;
  renderEnergyFlow(site);
  try {
    const hist = await apiGet(`/energy_sites/${site.energy_site_id}/calendar_history?kind=power&period=day`);
    renderHistoryChart(hist.response?.time_series || []);
  } catch(_) { renderHistoryChart([]); }
  panel.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function renderEnergyFlow(site) {
  const solar = ((site.solar_power||0)/1000).toFixed(1);
  const battery = ((site.battery_power||0)/1000).toFixed(1);
  const grid = ((site.grid_power||0)/1000).toFixed(1);
  const home = ((site.load_power||0)/1000).toFixed(1);
  const battPct = (site.percentage_charged||0).toFixed(0);
  document.getElementById('energy-flow').innerHTML = `
    <div class="flow-node"><div class="flow-icon" style="background:var(--solar-light);">☀️</div><div class="flow-label">Solar</div><div class="flow-value solar-val">${solar} kW</div></div>
    <div class="flow-arrow">→</div>
    <div class="flow-node"><div class="flow-icon" style="background:var(--battery-light);">🔋</div><div class="flow-label">Battery</div><div class="flow-value battery-val">${battPct}%</div><div style="font-size:11px;color:var(--muted);">${battery} kW</div></div>
    <div class="flow-arrow">→</div>
    <div class="flow-node"><div class="flow-icon" style="background:var(--home-light);">🏠</div><div class="flow-label">Home</div><div class="flow-value home-val">${home} kW</div></div>
    <div class="flow-arrow" style="color:var(--grid);">⇄</div>
    <div class="flow-node"><div class="flow-icon" style="background:var(--grid-light);">🔌</div><div class="flow-label">Grid</div><div class="flow-value grid-val">${parseFloat(grid)>=0?'+':''}${grid} kW</div></div>
  `;
}

function renderHistoryChart(series) {
  const ctx = document.getElementById('history-chart').getContext('2d');
  if (histChart) histChart.destroy();
  const labels = series.map(d => { const t=new Date(d.timestamp); return t.getHours()+':'+String(t.getMinutes()).padStart(2,'0'); });
  const toKW = key => series.map(d => ((d[key]||0)/1000).toFixed(2));
  histChart = new Chart(ctx, {
    type:'line',
    data: { labels, datasets: [
      { label:'Solar', data:toKW('solar_power'), borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,0.08)', tension:0.4, borderWidth:2, pointRadius:0 },
      { label:'Home', data:toKW('load_power'), borderColor:'#8b5cf6', backgroundColor:'rgba(139,92,246,0.08)', tension:0.4, borderWidth:2, pointRadius:0 },
      { label:'Grid', data:toKW('grid_power'), borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.08)', tension:0.4, borderWidth:2, pointRadius:0 },
    ]},
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ font:{size:12}, usePointStyle:true, boxWidth:8 }}}, scales:{ x:{ ticks:{maxTicksLimit:8,font:{size:11}}, grid:{color:'#e2e8f0'}}, y:{ ticks:{font:{size:11},callback:v=>v+' kW'}, grid:{color:'#e2e8f0'}} }}
  });
}

async function loadAlerts() {
  const list = document.getElementById('alert-list');
  list.innerHTML = '<div class="loading"><div class="spinner"></div><span>Checking sites…</span></div>';
  const alerts = [];
  for (const site of sites) {
    try {
      const data = await apiGet(`/energy_sites/${site.energy_site_id}/live_status`);
      const live = data.response;
      if (live?.percentage_charged < 10) alerts.push({ type:'error', site:site.site_name, msg:`Battery critically low at ${live.percentage_charged.toFixed(0)}%` });
      else if (live?.percentage_charged < 20) alerts.push({ type:'warning', site:site.site_name, msg:`Battery low at ${live.percentage_charged.toFixed(0)}%` });
      if (live?.grid_status === 'Inactive') alerts.push({ type:'warning', site:site.site_name, msg:'Grid inactive — running on battery/solar' });
    } catch(_) {}
  }
  if (!alerts.length) { list.innerHTML = '<div style="padding:32px;text-align:center;color:var(--muted);font-size:14px;">✅ No active alerts across your fleet.</div>'; return; }
  list.innerHTML = alerts.map(a => `<div class="alert-item alert-${a.type}"><span style="font-size:16px;">${a.type==='error'?'🔴':'🟡'}</span><div><div class="alert-title">${a.site}</div><div>${a.msg}</div></div></div>`).join('');
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.nav-tab').forEach((t,i) => t.classList.toggle('active', ['fleet','alerts'][i]===tab));
  document.getElementById('tab-fleet').style.display = tab==='fleet' ? '' : 'none';
  document.getElementById('tab-alerts').style.display = tab==='alerts' ? '' : 'none';
  if (tab==='alerts') loadAlerts();
}

function refreshData() { if (activeTab==='fleet') loadFleet(); else loadAlerts(); }

function logout() {
  sessionStorage.clear(); accessToken=null; sites=[];
  ['logout-btn','refresh-btn'].forEach(id => document.getElementById(id).style.display='none');
  document.getElementById('live-indicator').style.display='none';
  showPage('auth-page');
}

function showPage(id) { document.querySelectorAll('.page').forEach(p=>p.classList.remove('active')); document.getElementById(id).classList.add('active'); }

(async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code'), state = params.get('state');
  const savedToken = sessionStorage.getItem('access_token');
  if (code && state) { showPage('callback-page'); await handleCallback(code, state); }
  else if (savedToken) { accessToken=savedToken; showDashboard(); }
  else { showPage('auth-page'); }
})();
</script>
</body>
</html>
