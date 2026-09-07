/* FlightOps Executive - offline demo application.
   Recreates the Razor Pages routes (Dashboard, Flights, Track, Admin) client-side.
   Authentication is removed: the demo always runs as an Admin operator. */

(() => {
    'use strict';

    const D = FlightOpsData;
    const app = document.getElementById('app');
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const icon = (name, cls = '') => `<svg class="ico ${cls}"><use href="#i-${name}"></use></svg>`;
    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const dtf = { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' };
    const fmtDateTime = (value) => value ? new Intl.DateTimeFormat('en-GB', dtf).format(new Date(value)) : '-';
    const fmtTime = (value) => value ? new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }).format(new Date(value)) : '-';
    const fmtFull = (value) => value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }).format(new Date(value)) : '-';

    const statusBadge = (status) => {
        const map = {
            Arrived: 'badge-success',
            Departed: 'badge-info',
            Enroute: 'badge-info',
            Boarding: 'badge-primary',
            Delayed: 'badge-warning',
            Cancelled: 'badge-danger'
        };
        return `<span class="badge ${map[status] || 'badge-secondary'}">${esc(status)}</span>`;
    };

    // ================= THEME =================
    const themeToggle = $('#darkModeToggle');
    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        themeToggle.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon', 'ico-md');
        document.dispatchEvent(new CustomEvent('themeChanged'));
    }
    applyTheme(localStorage.getItem('flightops-theme') || 'light');
    themeToggle.addEventListener('click', () => {
        const theme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        localStorage.setItem('flightops-theme', theme);
        applyTheme(theme);
    });

    $('#footerYear').textContent = '\u00a9 ' + new Date().getFullYear();

    // ================= MODAL HELPERS =================
    const openModal = (id) => $('#' + id).classList.add('open');
    const closeModals = () => $$('.modal').forEach(m => m.classList.remove('open'));
    document.addEventListener('click', (event) => {
        if (event.target.closest('[data-close-modal]')) closeModals();
    });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModals(); });

    let toastTimer;
    function toast(message) {
        const element = $('#toast');
        element.textContent = message;
        element.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => element.classList.remove('show'), 2800);
    }

    // ================= GLOBAL ALERT BAR =================
    function refreshAlerts() {
        const active = D.activeDisruptions();
        const bar = $('#alertsContainer');
        if (!active.length) {
            bar.style.display = 'none';
            return;
        }
        bar.style.display = 'block';
        $('#alertsMessage').innerHTML = `${icon('alert')} ${active.length} active disruption${active.length > 1 ? 's' : ''} across the network`;
        bar.onclick = () => {
            $('#alertsDetails').innerHTML = active.slice(0, 25).map(a => `
                <div class="alert alert-warning">
                    <strong>${esc(a.flightNumber)} &ndash; ${esc(a.type)}</strong><br/>
                    <small>${esc(a.description)}</small><br/>
                    <strong>Severity:</strong> ${esc(a.severity)}<br/>
                    <strong>Reported:</strong> ${fmtFull(a.reportedAt)} UTC
                </div>`).join('');
            openModal('alertsModal');
        };
    }

    // ================= MAP =================
    const MAP_VIEW = { x: 264, y: 30, w: 589, h: 430 };
    const project = (lat, lng) => ({ x: (lng + 180) * (1000 / 360), y: (90 - lat) * (500 / 180) });

    function worldPaths() {
        return D.world.map(poly => {
            const d = poly.map((p, i) => {
                const { x, y } = project(p[1], p[0]);
                return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ') + ' Z';
            return `<path d="${d}" fill="var(--map-land)" stroke="rgba(148,163,184,0.35)" stroke-width="0.6"/>`;
        }).join('');
    }

    function graticule() {
        const lines = [];
        for (let lon = -180; lon <= 180; lon += 15) {
            const { x } = project(0, lon);
            lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="500" stroke="var(--map-grid)" stroke-width="0.4"/>`);
        }
        for (let lat = -75; lat <= 75; lat += 15) {
            const { y } = project(lat, 0);
            lines.push(`<line x1="0" y1="${y}" x2="1000" y2="${y}" stroke="var(--map-grid)" stroke-width="0.4"/>`);
        }
        return lines.join('');
    }

    const PLANE_PATH = 'M0,-9 L2.2,-2 L9,2.5 L9,4.5 L2.2,2.8 L1.6,7.5 L4,9.5 L4,10.8 L0,9.6 L-4,10.8 L-4,9.5 L-1.6,7.5 L-2.2,2.8 L-9,4.5 L-9,2.5 L-2.2,-2 Z';

    function renderMap() {
        const svg = $('#mapSvg');
        if (!svg) return;

        const flights = D.airborne();
        const parts = [];

        D.airports.forEach(a => {
            const { x, y } = project(a.lat, a.lng);
            parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.6" fill="#64748b"/>`);
        });

        ['BAH', 'LHR', 'DXB', 'JFK', 'DEL', 'BKK', 'SIN', 'CAI', 'FRA', 'PVG'].forEach(code => {
            const a = D.airportByCode[code];
            const { x, y } = project(a.lat, a.lng);
            parts.push(`<text x="${(x + 3).toFixed(1)}" y="${(y - 2.5).toFixed(1)}" fill="#94a3b8" font-size="6" font-family="Inter, sans-serif">${code}</text>`);
        });

        flights.forEach(f => {
            const from = project(f.depLat, f.depLng);
            const to = project(f.arrLat, f.arrLng);
            parts.push(`<line x1="${from.x.toFixed(1)}" y1="${from.y.toFixed(1)}" x2="${to.x.toFixed(1)}" y2="${to.y.toFixed(1)}" stroke="rgba(56,189,248,0.28)" stroke-width="0.6" stroke-dasharray="3 3"/>`);
        });

        flights.forEach(f => {
            const p = project(f.latitude, f.longitude);
            const from = project(f.depLat, f.depLng);
            const to = project(f.arrLat, f.arrLng);
            const angle = Math.atan2(to.x - from.x, -(to.y - from.y)) * 180 / Math.PI;
            const color = f.delayMinutes > 60 ? 'var(--danger)' : f.delayMinutes > 15 ? 'var(--warning)' : 'var(--info)';
            parts.push(`<g class="plane-marker" data-flight="${esc(f.flightNumber)}" transform="translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${angle.toFixed(1)}) scale(0.42)">
                <path d="${PLANE_PATH}" fill="${color}"/>
                <circle cx="0" cy="0" r="16" fill="transparent"/>
            </g>`);
        });

        svg.innerHTML = `<rect x="0" y="0" width="1000" height="500" fill="var(--map-bg)"/>${graticule()}${worldPaths()}${parts.join('')}`;

        const list = $('#airborneList');
        if (list) {
            list.innerHTML = flights.length
                ? flights.slice(0, 40).map(f => `<div class="movement-row" data-flight="${esc(f.flightNumber)}">
                        <span><strong>${esc(f.flightNumber)}</strong> <span class="text-info">${esc(f.arrivalAirport)}</span></span>
                        <strong>${f.progress}%</strong>
                    </div>`).join('')
                : '<div class="text-muted small">Scanning airspace...</div>';
        }
    }

    function showFlightPopup(flightNumber, clientX, clientY) {
        const panel = $('#mapPanel');
        if (!panel) return;
        const f = D.airborne().find(item => item.flightNumber === flightNumber);
        if (!f) return;

        $('#mapPopup')?.remove();
        const rect = panel.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = 'map-popup';
        popup.id = 'mapPopup';
        popup.innerHTML = `
            <div class="popup-head"><strong>${esc(f.flightNumber)}</strong><span class="badge badge-primary">${esc(f.status)}</span></div>
            <div>${icon('plane')} ${esc(f.departureAirport)} &rarr; ${esc(f.arrivalAirport)}</div>
            <div class="progress"><div class="progress-bar" style="width:${f.progress}%"></div></div>
            <div style="display:flex;justify-content:space-between" class="text-muted">
                <span>Elapsed: ${f.elapsedMinutes}m</span><span>Rem: ${f.remainingMinutes}m</span>
            </div>
            <a class="btn btn-sm btn-outline-info" style="margin-top:10px" href="#/track?flightNumber=${encodeURIComponent(f.flightNumber)}">Open tracking</a>`;

        const left = Math.min(Math.max(12, clientX - rect.left - 115), rect.width - 250);
        const top = Math.min(Math.max(60, clientY - rect.top - 150), rect.height - 190);
        popup.style.left = left + 'px';
        popup.style.top = top + 'px';
        panel.appendChild(popup);
    }

    // ================= CHARTS =================
    const donutColors = ['#38bdf8', '#fbbf24', '#f87171', '#a78bfa', '#94a3b8', '#34d399'];

    function renderDonut(container, data) {
        const total = data.reduce((sum, item) => sum + item.count, 0) || 1;
        const radius = 42;
        const circumference = 2 * Math.PI * radius;
        let offset = 0;

        const segments = data.map((item, index) => {
            const length = (item.count / total) * circumference;
            const circle = `<circle cx="60" cy="60" r="${radius}" fill="none"
                stroke="${donutColors[index % donutColors.length]}" stroke-width="21"
                stroke-dasharray="${length.toFixed(2)} ${(circumference - length).toFixed(2)}"
                stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 60 60)"><title>${esc(item.status)}: ${item.count}</title></circle>`;
            offset += length;
            return circle;
        }).join('');

        container.innerHTML = `
            <div class="chart-box">
                <svg viewBox="0 0 120 120" preserveAspectRatio="xMidYMid meet">${segments}</svg>
                <div class="donut-center"><strong>${total}</strong><small>Movements</small></div>
            </div>
            <div class="chart-legend">${data.map((item, index) =>
                `<span><i class="legend-dot" style="background:${donutColors[index % donutColors.length]}"></i>${esc(item.status)} ${item.count}</span>`).join('')}
            </div>`;
    }

    function renderBars(container, data) {
        if (!data.length) {
            container.innerHTML = '<div class="text-muted small">No delay reasons recorded today.</div>';
            return;
        }
        const max = Math.max(...data.map(item => item.count));
        const bars = data.map(item => `
            <div class="bar-col" title="${esc(item.reason)}: ${item.count}">
                <strong>${item.count}</strong>
                <div class="bar-track"><div class="bar-fill" style="height:${Math.max(6, (item.count / max) * 100)}%"></div></div>
                <small>${esc(item.reason.split(' ')[0])}</small>
            </div>`).join('');
        container.innerHTML = `<div class="bar-chart">${bars}</div>`;
    }

    // ================= VIEWS =================
    function dashboardView() {
        const s = D.summary();
        return `
        <div class="fade-in">
            <div class="page-head">
                <div>
                    <h1 class="display-title">NETWORK <span class="text-info">OPERATIONS</span></h1>
                    <p class="page-sub">${icon('clock')} Live Network Status | <span id="clockLabel"></span> UTC</p>
                </div>
                <div class="row-actions">
                    <button class="btn btn-dark" id="refreshBtn">${icon('refresh', 'text-info')} Refresh Intelligence</button>
                    <button class="btn btn-info" id="opsConsoleBtn">${icon('tower')} Ops Console</button>
                </div>
            </div>

            <div class="kpi-grid">
                <article class="glass-card kpi">
                    <div class="kpi-top"><span class="kpi-label">Total Movements</span><span class="icon-box info">${icon('plane', 'ico-md')}</span></div>
                    <div class="kpi-value">${s.totalFlights}</div>
                    <div class="kpi-foot text-success">4% vs yesterday</div>
                </article>
                <article class="glass-card kpi warning">
                    <div class="kpi-top"><span class="kpi-label">Ops Disruptions</span><span class="icon-box warning">${icon('alert', 'ico-md')}</span></div>
                    <div class="kpi-value">${s.delayedFlights}</div>
                    <div class="kpi-foot text-warning">Needs Attention</div>
                </article>
                <article class="glass-card kpi primary">
                    <div class="kpi-top"><span class="kpi-label">Active In-Air</span><span class="icon-box primary">${icon('globe', 'ico-md')}</span></div>
                    <div class="kpi-value">${s.activeAircrafts}</div>
                    <div class="kpi-foot" style="color:#3b82f6">Live Tracking</div>
                </article>
                <article class="glass-card kpi danger">
                    <div class="kpi-top"><span class="kpi-label">Network OTP</span><span class="icon-box danger">${icon('gauge', 'ico-md')}</span></div>
                    <div class="kpi-value">${s.onTimePerformance}%</div>
                    <div class="kpi-foot text-muted">Target: <strong>85.0%</strong></div>
                </article>
            </div>

            <div class="dash-grid">
                <div class="glass-card map-panel" id="mapPanel">
                    <div class="map-header">
                        <h5>${icon('radar', 'pulse ico-md')} GLOBAL NETWORK SURVEILLANCE</h5>
                    </div>
                    <div id="flightMap"><svg id="mapSvg" viewBox="${MAP_VIEW.x} ${MAP_VIEW.y} ${MAP_VIEW.w} ${MAP_VIEW.h}" preserveAspectRatio="xMidYMid slice"></svg></div>
                    <div class="map-foot">
                        <div class="map-legend">
                            <span>${icon('plane', 'text-info')} En-Route</span>
                            <span>${icon('plane', 'text-warning')} Delayed</span>
                            <span>${icon('plane', 'text-danger')} Emergency</span>
                        </div>
                        <div class="movements">
                            <h6>Live Movements</h6>
                            <div id="airborneList"><div class="text-muted small">Scanning airspace...</div></div>
                        </div>
                    </div>
                </div>

                <div class="glass-card p-4 side-panel">
                    <h5>NETWORK ANALYTICS</h5>
                    <p class="chart-label">Status Breakdown</p>
                    <div id="chartStatus"></div>
                    <hr class="divider"/>
                    <p class="chart-label">Disruption Intelligence</p>
                    <div id="chartDelayReasons"></div>
                </div>
            </div>

            <div class="bottom-grid">
                <div class="glass-card p-4">
                    <div class="page-head" style="margin-bottom:18px">
                        <h5>CRITICAL OPS ALERTS</h5>
                        <span class="badge badge-danger">LIVE</span>
                    </div>
                    <div id="criticalOpsList" class="ops-list"></div>
                </div>

                <div class="glass-card p-4">
                    <h5 class="mb-4">SYSTEM INTEGRITY</h5>
                    <div class="integrity-grid">
                        <div class="integrity-tile"><p>Telemetry Link</p><h6 class="text-success">${icon('link')} STABLE</h6></div>
                        <div class="integrity-tile"><p>Database Hash</p><h6 class="text-info">${icon('database')} SYNCED</h6></div>
                        <div class="integrity-tile"><p>AI Ops Engine</p><h6 class="text-purple">${icon('chip')} ACTIVE</h6></div>
                        <div class="integrity-tile"><p>Network Latency</p><h6 class="text-success">${icon('wifi')} 42ms</h6></div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function mountDashboard() {
        const setClock = () => {
            const label = $('#clockLabel');
            if (label) label.textContent = fmtFull(new Date());
        };
        setClock();

        renderDonut($('#chartStatus'), D.statusCounts());
        renderBars($('#chartDelayReasons'), D.delayReasons());
        renderMap();
        renderCriticalOps();

        $('#refreshBtn').addEventListener('click', () => {
            setClock();
            renderDonut($('#chartStatus'), D.statusCounts());
            renderBars($('#chartDelayReasons'), D.delayReasons());
            renderMap();
            renderCriticalOps();
            refreshAlerts();
            toast('Network intelligence refreshed.');
        });

        $('#opsConsoleBtn').addEventListener('click', () => openModal('opsModal'));

        $('#mapPanel').addEventListener('click', (event) => {
            const marker = event.target.closest('.plane-marker');
            if (marker) {
                showFlightPopup(marker.dataset.flight, event.clientX, event.clientY);
                return;
            }
            if (!event.target.closest('.map-popup')) $('#mapPopup')?.remove();
        });

        $('#airborneList').addEventListener('click', (event) => {
            const row = event.target.closest('.movement-row');
            if (row) location.hash = `#/track?flightNumber=${encodeURIComponent(row.dataset.flight)}`;
        });

        document.addEventListener('themeChanged', renderMap);

        registerTimer(() => {
            renderMap();
            setClock();
        }, 5000);
        registerTimer(renderCriticalOps, 10000);
    }

    function renderCriticalOps() {
        const list = $('#criticalOpsList');
        if (!list) return;
        const alerts = D.activeDisruptions().slice(0, 20);
        list.innerHTML = alerts.length
            ? alerts.map(a => `
                <div class="ops-item">
                    <div class="ops-item-top"><span>${esc(a.type.toUpperCase())}</span><span>${fmtTime(a.reportedAt)}</span></div>
                    <div class="small"><strong>${esc(a.flightNumber)}</strong> (${esc(a.from)} &rarr; ${esc(a.to)}): ${esc(a.description)}</div>
                </div>`).join('')
            : `<div class="ops-empty">${icon('check')}<br/>All systems operational. No critical disruptions.</div>`;
    }

    // ================= FLIGHTS =================
    const airportOptions = () => D.airports.map(a => `<option>${a.code}</option>`).join('');

    function flightsView() {
        return `
        <div class="fade-in">
            <h2 class="mb-4">All Flights - Live Operations View</h2>
            <div class="filter-row">
                <input id="searchFlight" class="form-control" placeholder="Search Flight Number..."/>
                <select id="departureFilter" class="form-select"><option value="">All Departure Airports</option>${airportOptions()}</select>
                <select id="arrivalFilter" class="form-select"><option value="">All Arrival Airports</option>${airportOptions()}</select>
                <select id="statusFilter" class="form-select">
                    <option value="">All Statuses</option>
                    <option>Scheduled</option><option>Boarding</option><option>Departed</option>
                    <option>Enroute</option><option>Arrived</option><option>Delayed</option><option>Cancelled</option>
                </select>
                <button id="btnFilter" class="btn btn-primary">${icon('filter')}</button>
            </div>
            <div class="glass-card table-wrap">
                <table id="flightsTable">
                    <thead><tr>
                        <th>Flight</th><th>Route</th><th>Aircraft</th><th>Sched. Departure</th>
                        <th>Sched. Arrival</th><th>Delay</th><th>Status</th>
                    </tr></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>`;
    }

    function mountFlights() {
        const tbody = $('#flightsTable tbody');

        const render = () => {
            const search = $('#searchFlight').value.trim().toLowerCase();
            const dep = $('#departureFilter').value;
            const arr = $('#arrivalFilter').value;
            const status = $('#statusFilter').value;

            let rows = D.todaysFlights().sort((a, b) => a.scheduledDeparture - b.scheduledDeparture);
            if (dep) rows = rows.filter(f => f.departureAirport === dep);
            if (arr) rows = rows.filter(f => f.arrivalAirport === arr);
            if (status) rows = rows.filter(f => f.status === status);
            if (search) rows = rows.filter(f => f.flightNumber.toLowerCase().includes(search));

            tbody.innerHTML = rows.length
                ? rows.map(f => `
                    <tr class="clickable" data-flight="${esc(f.flightNumber)}">
                        <td><strong>${esc(f.flightNumber)}</strong></td>
                        <td>${esc(f.departureAirport)} &rarr; ${esc(f.arrivalAirport)}</td>
                        <td class="small text-muted">${esc(f.aircraft.registration)} &middot; ${esc(f.aircraft.type)}</td>
                        <td class="mono">${fmtDateTime(f.scheduledDeparture)}</td>
                        <td class="mono">${fmtDateTime(f.scheduledArrival)}</td>
                        <td class="mono">${f.delayMinutes || 0} min</td>
                        <td>${statusBadge(f.status)}</td>
                    </tr>`).join('')
                : '<tr><td colspan="7" class="text-muted" style="text-align:center;padding:34px">No flights found.</td></tr>';
        };

        render();
        $('#btnFilter').addEventListener('click', render);
        $('#searchFlight').addEventListener('input', render);
        ['departureFilter', 'arrivalFilter', 'statusFilter'].forEach(id => $('#' + id).addEventListener('change', render));
        tbody.addEventListener('click', (event) => {
            const row = event.target.closest('tr[data-flight]');
            if (row) location.hash = `#/track?flightNumber=${encodeURIComponent(row.dataset.flight)}`;
        });
        registerTimer(render, 30000);
    }

    // ================= TRACK =================
    function matchFlights(input) {
        const query = (input || '').trim().toLowerCase();
        if (!query) return [];
        const digits = query.replace(/\D/g, '');
        return D.todaysFlights().filter(f => {
            const number = f.flightNumber.toLowerCase();
            if (number.includes(query)) return true;
            if (!digits) return false;
            return parseInt(number.replace(/\D/g, ''), 10) === parseInt(digits, 10);
        }).sort((a, b) => a.scheduledDeparture - b.scheduledDeparture);
    }

    function trackView(params) {
        const input = params.get('flightNumber') || '';
        const matches = matchFlights(input);

        let body = '';
        if (!input.trim()) {
            body = '<div class="alert alert-info">Enter a flight number to begin tracking.</div>';
        } else if (!matches.length) {
            body = `<div class="alert alert-warning">No flights found matching <strong>${esc(input)}</strong>.</div>`;
        } else {
            body = `<h4 class="mb-3">Matching Flights</h4>
                <div class="list-group">${matches.map(f => `
                    <a class="list-group-item" href="#/track?flightNumber=${encodeURIComponent(f.flightNumber)}">
                        <strong>${esc(f.flightNumber)}</strong> &mdash; ${esc(f.departureAirport)} &rarr; ${esc(f.arrivalAirport)}
                        <div class="small text-muted">Dep: ${fmtDateTime(f.scheduledDeparture)} UTC &middot; ${esc(f.status)}</div>
                    </a>`).join('')}
                </div>`;

            if (matches.length === 1) body += flightDetailCard(matches[0]);
        }

        return `
        <div class="fade-in">
            <h2 class="mb-4">Track Flight</h2>
            <form id="trackForm" class="row-actions mb-4">
                <input name="flightNumber" id="trackInput" class="form-control" style="max-width:340px"
                       value="${esc(input)}" placeholder="Enter Flight Number (GF007, 007, 7...)"/>
                <button type="submit" class="btn btn-primary">${icon('search')} Search</button>
            </form>
            ${body}
        </div>`;
    }

    function flightDetailCard(f) {
        const related = D.disruptions().filter(d => d.flightNumber === f.flightNumber && d.flightId === f.id);
        const disruptionBlock = related.length
            ? related.map(d => `
                <div class="alert alert-warning">
                    <strong>${esc(d.type)}</strong> (${esc(d.severity)})<br/>
                    ${esc(d.description)}<br/>
                    <small>Reported: ${fmtFull(d.reportedAt)} UTC</small>
                    ${d.resolvedAt ? `<div><small>Resolved: ${fmtFull(d.resolvedAt)} UTC (${esc(d.resolvedBy)})</small></div>` : ''}
                </div>`).join('')
            : '<div class="alert alert-success">No disruptions for this flight.</div>';

        return `
        <div class="glass-card p-4 mb-4">
            <h4 class="mb-3">${esc(f.flightNumber)} &mdash; ${esc(f.departureAirport)} &rarr; ${esc(f.arrivalAirport)}</h4>
            <div class="detail-list">
                <div><span>Status</span>${statusBadge(f.status)}</div>
                <div><span>Aircraft</span><b>${esc(f.aircraft.registration)} &middot; ${esc(f.aircraft.type)}</b></div>
                <div><span>Scheduled Departure</span><b class="mono">${fmtFull(f.scheduledDeparture)}</b></div>
                <div><span>Scheduled Arrival</span><b class="mono">${fmtFull(f.scheduledArrival)}</b></div>
                <div><span>Actual Departure</span><b class="mono">${fmtFull(f.actualDeparture)}</b></div>
                <div><span>Actual Arrival</span><b class="mono">${fmtFull(f.actualArrival)}</b></div>
                <div><span>Delay</span><b>${f.delayMinutes || 0} min${f.delayReason ? ' &middot; ' + esc(f.delayReason) : ''}</b></div>
                <div><span>Remarks</span><b>${esc(f.remarks || 'N/A')}</b></div>
            </div>
        </div>
        <h4 class="mb-3">Disruptions</h4>
        ${disruptionBlock}`;
    }

    function mountTrack() {
        $('#trackForm').addEventListener('submit', (event) => {
            event.preventDefault();
            const value = $('#trackInput').value.trim();
            location.hash = `#/track?flightNumber=${encodeURIComponent(value)}`;
        });
    }

    // ================= ADMIN =================
    function adminView() {
        const logRows = [
            [-5, 'system_auto', 'DailyFlightGenerator.GenerateAsync', 'Success', 'text-success'],
            [-12, 'admin', 'Sim.TriggerCancellation(GF771)', 'Logged', 'text-warning'],
            [-45, 'system_auto', 'Database.CleanOldFlights', 'Success', 'text-success'],
            [-96, 'network.manager', 'FixedRoute.Dispatch(GF090)', 'Success', 'text-success']
        ];

        return `
        <div class="fade-in">
            <div class="mb-4">
                <h1 class="display-title text-info">ADMIN <span style="color:var(--text-main)">OPS CONTROL</span></h1>
                <p class="page-sub">Direct interface to global network disruption management and fleet status.</p>
            </div>

            <div class="admin-cards mb-4">
                <div class="glass-card admin-card">
                    <div class="admin-card-head">${icon('route', 'ico-lg text-warning')}<h5>Route Management</h5></div>
                    <p class="small text-muted mb-3">Update fixed schedules and fleet allocations across the network.</p>
                    <a href="#/admin/routes" class="btn btn-outline-warning" style="width:100%">Manage Routes</a>
                </div>
                <div class="glass-card admin-card info">
                    <div class="admin-card-head">${icon('users', 'ico-lg text-info')}<h5>User Access</h5></div>
                    <p class="small text-muted mb-3">Create, manage, and remove system users and set their access roles.</p>
                    <a href="#/admin/users" class="btn btn-outline-info" style="width:100%">Manage Users</a>
                </div>
            </div>

            <div class="glass-card p-4">
                <div class="page-head" style="margin-bottom:18px">
                    <h5>INTERNAL OPS LOG</h5>
                    <span class="badge badge-secondary">INTERNAL ONLY</span>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Status</th></tr></thead>
                        <tbody>${logRows.map(([offset, user, action, status, cls]) => `
                            <tr>
                                <td class="text-muted mono">${fmtTime(new Date(Date.now() + offset * 60000))}</td>
                                <td>${esc(user)}</td>
                                <td class="mono">${esc(action)}</td>
                                <td><span class="${cls}">${esc(status)}</span></td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
    }

    function adminRoutesView() {
        return `
        <div class="fade-in">
            <div class="page-head">
                <div>
                    <h2 class="display-title">ROUTE &amp; <span class="text-info">FLIGHT CONTROL</span></h2>
                    <p class="page-sub">Configure fixed schedules or inject live flights directly into the network.</p>
                </div>
                <div class="row-actions">
                    <button class="btn btn-info" id="instantFlightBtn">${icon('plane')} ADD INSTANT FLIGHT</button>
                    <a class="btn btn-outline-secondary" href="#/admin">${icon('back')} BACK TO ADMIN</a>
                </div>
            </div>

            <div class="glass-card p-4 mb-4">
                <h4 class="mb-3">${icon('plus', 'text-info')} ADD NEW STRATEGIC ROUTE</h4>
                <form id="routeForm" class="field-grid">
                    <div><label class="form-label">Flight Code</label><input name="flightNumber" class="form-control" placeholder="e.g. GF007" required/></div>
                    <div><label class="form-label">Origin Airport</label><input name="origin" class="form-control" placeholder="e.g. BAH" required/></div>
                    <div><label class="form-label">Destination Airport</label><input name="destination" class="form-control" placeholder="e.g. LHR" required/></div>
                    <div><button type="submit" class="btn btn-info" style="width:100%">${icon('plane')} ADD ROUTE</button></div>
                </form>
            </div>

            <h4 class="mb-3">${icon('list', 'text-info')} EXISTING NETWORK BASELINE</h4>
            <div class="glass-card table-wrap">
                <table id="routesTable">
                    <thead><tr><th>Flight ID</th><th>Origin</th><th>Destination</th><th>STD</th><th>STA</th><th>Status</th><th class="text-end">Actions</th></tr></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>`;
    }

    const minutesToClock = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

    function mountAdminRoutes() {
        const tbody = $('#routesTable tbody');

        const render = () => {
            tbody.innerHTML = D.fixedRoutes.map(r => `
                <tr>
                    <td><strong>${esc(r.flightNumber)}</strong></td>
                    <td><span class="badge badge-outline info">${esc(r.origin)}</span></td>
                    <td><span class="badge badge-outline success">${esc(r.destination)}</span></td>
                    <td class="mono">${minutesToClock(r.stdDepartureMinutes)}</td>
                    <td class="mono">${minutesToClock(r.stdArrivalMinutes)}</td>
                    <td class="small text-muted">${icon('check', 'text-success')} ACTIVE</td>
                    <td class="text-end">
                        <button class="btn-icon" data-dispatch="${r.id}" title="Dispatch live flight">${icon('broadcast')} DISPATCH</button>
                        <button class="btn-icon danger" data-delete="${r.id}" title="Decommission route">${icon('trash')}</button>
                    </td>
                </tr>`).join('');
        };
        render();

        $('#routeForm').addEventListener('submit', (event) => {
            event.preventDefault();
            const form = new FormData(event.target);
            const flightNumber = String(form.get('flightNumber')).trim().toUpperCase();
            const origin = String(form.get('origin')).trim().toUpperCase();
            const destination = String(form.get('destination')).trim().toUpperCase();
            if (!flightNumber || !origin || !destination) return;
            if (origin === destination) { toast('Origin and destination must differ.'); return; }
            D.addRoute({ flightNumber, origin, destination });
            event.target.reset();
            render();
            toast(`${flightNumber} added to the network baseline.`);
        });

        tbody.addEventListener('click', (event) => {
            const dispatch = event.target.closest('[data-dispatch]');
            if (dispatch) {
                const route = D.fixedRoutes.find(r => r.id === Number(dispatch.dataset.dispatch));
                toast(`${route.flightNumber} dispatched into the live network.`);
                return;
            }
            const remove = event.target.closest('[data-delete]');
            if (remove) {
                const route = D.fixedRoutes.find(r => r.id === Number(remove.dataset.delete));
                if (confirm(`Decommission route ${route.flightNumber}?`)) {
                    D.removeRoute(route.id);
                    render();
                    toast(`${route.flightNumber} decommissioned.`);
                }
            }
        });

        $('#instantFlightBtn').addEventListener('click', () => {
            $('#formModalTitle').innerHTML = `${icon('plane', 'text-info')} INJECT INSTANT FLIGHT`;
            const now = new Date();
            const local = (offsetMinutes) => new Date(now.getTime() + offsetMinutes * 60000).toISOString().slice(0, 16);
            $('#formModalBody').innerHTML = `
                <form id="instantFlightForm">
                    <div class="mb-3"><label class="form-label">Flight Code</label><input name="flightNumber" class="form-control" placeholder="e.g. GF999" required/></div>
                    <div class="field-grid two mb-3">
                        <div><label class="form-label">Departure</label><input name="departureAirport" class="form-control" placeholder="BAH" required/></div>
                        <div><label class="form-label">Arrival</label><input name="arrivalAirport" class="form-control" placeholder="LHR" required/></div>
                    </div>
                    <div class="field-grid two mb-4">
                        <div><label class="form-label">ETD (UTC)</label><input name="scheduledDeparture" type="datetime-local" class="form-control" value="${local(60)}"/></div>
                        <div><label class="form-label">ETA (UTC)</label><input name="scheduledArrival" type="datetime-local" class="form-control" value="${local(360)}"/></div>
                    </div>
                    <div class="modal-footer" style="padding:0">
                        <button type="button" class="btn btn-outline-secondary" data-close-modal>CANCEL</button>
                        <button type="submit" class="btn btn-info">INJECT FLIGHT</button>
                    </div>
                </form>`;
            openModal('formModal');

            $('#instantFlightForm').addEventListener('submit', (event) => {
                event.preventDefault();
                const form = new FormData(event.target);
                const flightNumber = String(form.get('flightNumber')).trim().toUpperCase();
                D.addFlight({
                    flightNumber,
                    departureAirport: String(form.get('departureAirport')).trim().toUpperCase(),
                    arrivalAirport: String(form.get('arrivalAirport')).trim().toUpperCase(),
                    scheduledDeparture: new Date(String(form.get('scheduledDeparture')) + 'Z'),
                    scheduledArrival: new Date(String(form.get('scheduledArrival')) + 'Z')
                });
                closeModals();
                toast(`${flightNumber} injected into today's operation.`);
            });
        });
    }

    function adminUsersView() {
        return `
        <div class="fade-in">
            <div class="page-head">
                <h2>${icon('users', 'ico-lg text-info')} USER MANAGEMENT</h2>
                <div class="row-actions">
                    <button class="btn btn-info" id="createUserBtn">${icon('plus')} CREATE NEW USER</button>
                    <a class="btn btn-outline-secondary" href="#/admin">${icon('back')} BACK TO ADMIN</a>
                </div>
            </div>
            <div class="glass-card table-wrap">
                <table id="usersTable">
                    <thead><tr><th>Username</th><th>Role</th><th>Created At</th><th class="text-end">Actions</th></tr></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>`;
    }

    function mountAdminUsers() {
        const tbody = $('#usersTable tbody');
        const render = () => {
            tbody.innerHTML = D.users.map(u => `
                <tr>
                    <td><strong>${esc(u.username)}</strong></td>
                    <td>${u.role === 'Admin' ? '<span class="badge badge-danger">ADMIN</span>' : '<span class="badge badge-primary">USER</span>'}</td>
                    <td class="small text-muted mono">${fmtFull(u.createdAt)}</td>
                    <td class="text-end">${u.username.toLowerCase() === 'admin'
                        ? '<span class="text-muted small">System Default</span>'
                        : `<button class="btn-icon danger" data-user="${esc(u.username)}">${icon('trash')}</button>`}</td>
                </tr>`).join('');
        };
        render();

        tbody.addEventListener('click', (event) => {
            const button = event.target.closest('[data-user]');
            if (!button) return;
            const username = button.dataset.user;
            if (confirm(`Delete user ${username}?`)) {
                D.removeUser(username);
                render();
                toast(`${username} removed.`);
            }
        });

        $('#createUserBtn').addEventListener('click', () => {
            $('#formModalTitle').textContent = 'CREATE NEW USER';
            $('#formModalBody').innerHTML = `
                <form id="userForm">
                    <div class="mb-3"><label class="form-label">Username</label><input name="username" class="form-control" placeholder="User identifier" required/></div>
                    <div class="mb-3"><label class="form-label">Password</label><input name="password" type="password" class="form-control" placeholder="Security key" required/></div>
                    <div class="mb-4"><label class="form-label">Assign Role</label>
                        <select name="role" class="form-select"><option value="User">Standard User</option><option value="Admin">System Administrator</option></select>
                    </div>
                    <div class="modal-footer" style="padding:0">
                        <button type="button" class="btn btn-outline-secondary" data-close-modal>CANCEL</button>
                        <button type="submit" class="btn btn-info">CREATE USER</button>
                    </div>
                </form>`;
            openModal('formModal');

            $('#userForm').addEventListener('submit', (event) => {
                event.preventDefault();
                const form = new FormData(event.target);
                const username = String(form.get('username')).trim();
                if (D.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                    toast('That username already exists.');
                    return;
                }
                D.addUser({ username, role: String(form.get('role')) });
                closeModals();
                render();
                toast(`${username} created.`);
            });
        });
    }

    // ================= OPS CONSOLE =================
    $$('#opsModal [data-sim]').forEach(button => {
        button.addEventListener('click', () => {
            const log = $('#opsLog');
            const action = button.dataset.sim;
            log.textContent += `\n[CMD] Executing ${action} request...`;
            log.scrollTop = log.scrollHeight;
            setTimeout(() => {
                log.textContent += '\n[SYS] Action completed. Global network updated.';
                log.scrollTop = log.scrollHeight;
            }, 1200);
        });
    });

    // ================= ROUTER =================
    let timers = [];
    function registerTimer(callback, interval) { timers.push(setInterval(callback, interval)); }
    function clearTimers() { timers.forEach(clearInterval); timers = []; }

    const routes = {
        dashboard: { nav: 'dashboard', title: 'Executive Dashboard', view: dashboardView, mount: mountDashboard },
        flights: { nav: 'flights', title: 'Flights', view: flightsView, mount: mountFlights },
        track: { nav: 'track', title: 'Track Flight', view: trackView, mount: mountTrack },
        admin: { nav: 'admin', title: 'Admin Control Center', view: adminView },
        'admin/routes': { nav: 'admin', title: 'Route Management', view: adminRoutesView, mount: mountAdminRoutes },
        'admin/users': { nav: 'admin', title: 'User Management', view: adminUsersView, mount: mountAdminUsers }
    };

    function router() {
        clearTimers();
        const raw = location.hash.replace(/^#\/?/, '') || 'dashboard';
        const [path, queryString] = raw.split('?');
        const params = new URLSearchParams(queryString || '');
        const route = routes[path] || routes.dashboard;

        document.title = `${route.title} - FlightOps`;
        app.innerHTML = route.view(params);
        $$('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.route === route.nav));
        if (route.mount) route.mount(params);
        refreshAlerts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.addEventListener('hashchange', router);
    router();
    setInterval(refreshAlerts, 60000);
})();
