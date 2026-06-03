const VIEWS = {
    overview: `
<!-- Executive Header -->
<div class="page-header reveal" style="margin-bottom: 2.5rem;">
    <div style="flex: 1;">
        <div class="badge badge-green" style="margin-bottom: 1rem;">
             <span class="live-dot"></span> SECURE NATIONAL NEXUS
        </div>
        <h2 class="page-title" id="dashTitle">
            National Downstream<br>
            <em>Intel Command Center.</em>
            <i class="fas fa-info-circle info-btn" title="Quick System Overview" onclick="showPageInfo('overview')"></i>
        </h2>
        <p class="page-subtitle" id="dashSubtitle" style="max-width: 500px; margin-top: 0.75rem; color: #64748b;">
            Unified analytical substrate for verified petroleum distribution, fiscal settlements, and IoT telemetry across the 36 states.
        </p>
    </div>
    <div style="text-align: right; background: #fff; padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-card);">
        <div style="font-size: 0.65rem; font-weight: 700; color: var(--text-dark-secondary); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem;">
            Network Heartbeat</div>
        <div style="font-family: var(--mono); font-size: 1.1rem; color: var(--text-dark); font-weight: 700;" id="lastUpdated">—</div>
        <div style="font-size: 0.65rem; color: var(--green); font-weight: 600; margin-top: 4px;">SYNCED VIA NEDB MESH</div>
    </div>
</div>

<!-- High-Impact Metrics -->
<div class="metrics-grid reveal" style="gap: 1.25rem;">
    <div class="metric-card " style="position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; height: 100%; width: 4px; background: var(--green);"></div>
        <div class="metric-label" style="display: flex; justify-content: space-between;">PMS Volume (L) <i class="fas fa-gas-pump" style="opacity: 0.2;"></i></div>
        <div class="metric-value" id="pmsMetric" style="letter-spacing: -0.03em;">—</div>
        <div class="metric-trend up"><i class="fas fa-arrow-up-right"></i> +2.1% <span style="font-size: 0.65rem; opacity: 0.7; margin-left: 4px;">Velocity</span></div>
    </div>
    <div class="metric-card ">
        <div class="metric-label" style="display: flex; justify-content: space-between;">AGO Equivalence <i class="fas fa-truck-fade" style="opacity: 0.2;"></i></div>
        <div class="metric-value" id="agoMetric" style="letter-spacing: -0.03em;">—</div>
        <div class="metric-trend down"><i class="fas fa-arrow-down-right"></i> -0.8% <span style="font-size: 0.65rem; opacity: 0.7; margin-left: 4px;">Demand Shift</span></div>
    </div>
    <div class="metric-card " style="background: var(--ink); color: var(--surface-raised);">
        <div class="metric-label" style="color: rgba(251,250,246,0.8); display: flex; justify-content: space-between;">Settled Revenue (₦) <i class="fas fa-university" style="opacity: 0.4;"></i></div>
        <div class="metric-value" id="revMetric" style="color: var(--surface-raised); letter-spacing: -0.03em;">—</div>
        <div class="metric-trend up" style="color: var(--green);"><i class="fas fa-shield-check"></i> Verified via CBN</div>
    </div>
    <div class="metric-card ">
        <div class="metric-label" style="display: flex; justify-content: space-between;">Active IoT Nodes <i class="fas fa-microchip" style="opacity: 0.2;"></i></div>
        <div class="metric-value" id="iotMetric" style="letter-spacing: -0.03em;">—</div>
        <div class="metric-trend neutral"><i class="fas fa-circle-nodes"></i> Real-time Mesh</div>
    </div>
</div>

<!-- Multi-Model Intelligence Chart -->
<div class="chart-block  reveal" style="margin-top: 1.5rem; padding: 2rem;">
    <div class="chart-header" style="margin-bottom: 2rem;">
        <div>
            <h3 style="font-size: 1.1rem; font-weight: 700;">Throughput Intelligence Projections</h3>
            <div class="chart-desc" style="font-size: 0.75rem;">Aggregated PMS & AGO distribution cycles — Temporal Projection Mode</div>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center;">
            <div class="pill-tabs" style="background: rgba(0,0,0,0.04); padding: 4px; border-radius: 10px;">
                <button class="pill-tab active" data-range="daily">24H</button>
                <button class="pill-tab" data-range="weekly">7D</button>
                <button class="pill-tab" data-range="monthly">30D</button>
            </div>
            <button class="topbar-action" id="filterBtn" style="border-radius: 10px; padding: 0.5rem 1rem;">
                <i class="fas fa-sliders-h"></i> <span>Parameters</span>
            </button>
        </div>
    </div>
    <div class="chart-canvas-wrap" style="height: 380px;">
        <canvas id="mixChart"></canvas>
    </div>
</div>

`,

    nodemap: `
<div class="page-header reveal">
    <div style="flex: 1;">
        <h2 class="page-title">Live Node Map<br><em>& National Asset Tracker.</em></h2>
        <p class="page-subtitle">Standardized 2D tactical visualization of downstream infrastructure pins.</p>
    </div>
    <div style="background: #fff; padding: 1rem 1.5rem; border-radius: 12px; border: 1px solid var(--border); box-shadow: var(--shadow-card); display: flex; gap: 2rem;">
        <div style="text-align: center;">
            <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Active Nodes</div>
            <div style="font-family: var(--mono); color: var(--green); font-size: 1.25rem; font-weight: 700;" id="activeNodesCount">—</div>
        </div>
        <div style="border-left: 1px solid #f1f5f9;"></div>
        <div style="text-align: center;">
            <div style="font-size: 0.6rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Node Alerts</div>
            <div style="font-family: var(--mono); color: var(--red); font-size: 1.25rem; font-weight: 700;" id="alertNodesCount">—</div>
        </div>
    </div>
</div>

<!-- Map Filter Bar -->
<div class="chart-block reveal" style="padding: 0.8rem 1.5rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
    <div style="display: flex; align-items: center; gap: 1.5rem;">
        <span style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Map Filters:</span>
        <div style="display: flex; gap: 1.2rem;">
            <label style="display: flex; align-items: center; gap: 8px; color: var(--text-dark); font-size: 0.85rem; font-weight: 600; cursor: pointer;">
                <input type="checkbox" checked class="map-filter" value="truck" onchange="updateFilteredMap()"> <i class="fas fa-truck" style="font-size: 0.75rem; color: #94a3b8;"></i> Trucks
            </label>
            <label style="display: flex; align-items: center; gap: 8px; color: var(--text-dark); font-size: 0.85rem; font-weight: 600; cursor: pointer;">
                <input type="checkbox" checked class="map-filter" value="pump" onchange="updateFilteredMap()"> <i class="fas fa-gas-pump" style="font-size: 0.75rem; color: #94a3b8;"></i> Pumps
            </label>
            <label style="display: flex; align-items: center; gap: 8px; color: var(--text-dark); font-size: 0.85rem; font-weight: 600; cursor: pointer;">
                <input type="checkbox" checked class="map-filter" value="refinery" onchange="updateFilteredMap()"> <i class="fas fa-industry" style="font-size: 0.75rem; color: #94a3b8;"></i> Refineries
            </label>
            <label style="display: flex; align-items: center; gap: 8px; color: var(--text-dark); font-size: 0.85rem; font-weight: 600; cursor: pointer;">
                <input type="checkbox" checked class="map-filter" value="well" onchange="updateFilteredMap()"> <i class="fas fa-oil-well" style="font-size: 0.75rem; color: #94a3b8;"></i> Wells
            </label>
        </div>
    </div>
    <div style="font-size: 0.7rem; color: #94a3b8; font-family: var(--mono);">SYSTEM_MAPPING_V4.2</div>
</div>

<div class="chart-block reveal" style="padding: 0; overflow: hidden; height: 620px; position: relative;">
    <div id="iotMap" style="height: 100%; width: 100%; z-index: 1;"></div>
</div>
`,

    revenue: `
<div class="page-header reveal">
    <div>
        <h2 class="page-title">Revenue <em>Portal.</em></h2>
        <p class="page-subtitle">Consolidated tracking of energy company sales, taxes, and national revenue accruals.</p>
    </div>
</div>

<div class="metrics-grid reveal">
    <div class="metric-card">
        <div class="metric-label">National Sales (FY 2026)</div>
        <div class="metric-value">₦1.48T</div>
        <div class="metric-trend up"><i class="fas fa-arrow-up"></i> 8.2% YoY</div>
    </div>
    <div class="metric-card">
        <div class="metric-label">Taxes Accrued (EduTax/VAT)</div>
        <div class="metric-value">₦12.4B</div>
        <div class="metric-trend up"><i class="fas fa-arrow-up"></i> 4.1% YoY</div>
    </div>
    <div class="metric-card">
        <div class="metric-label">Avg. Margin / Liter</div>
        <div class="metric-value">₦12.40</div>
        <div class="metric-trend neutral"><i class="fas fa-minus"></i> Stable</div>
    </div>
</div>

<div class="chart-block reveal">
    <div class="chart-header">
        <div>
            <h3>Company Revenue Registry</h3>
            <div class="chart-desc" style="color: var(--text-secondary);">All verified downstream operators and their financial standing.</div>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
            <div class="search-wrap" style="background: rgba(0,0,0,0.03); padding: 5px 12px; border-radius: var(--r-sm); border: 1px solid var(--border);">
                <i class="fas fa-magnifying-glass" style="font-size: 0.8rem; color: var(--text-muted);"></i>
                <input type="text" id="revenueSearch" placeholder="Filter company..." style="background: none; border: none; color: var(--text-dark); font-size: 0.85rem; outline: none;">
            </div>
        </div>
    </div>

    <!-- Revenue List UI -->
    <div class="revenue-list" id="revenueList">
        <!-- Rendered via JS -->
    </div>
</div>

<!-- Detailed Revenue Modal -->
<div id="revDetailOverlay" class="sidebar-overlay" style="z-index: 2000;"></div>
<div id="revDetailPanel" class="rev-detail-panel" style="background: #fff; border-radius: 20px;">
    <div class="rev-close" id="closeRevDetail" style="color: var(--text-dark);">
        <i class="fas fa-xmark"></i>
    </div>
    <div id="revDetailContent"></div>
</div>
`,

    settlements: `
<div class="page-header reveal">
    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <div style="display: flex; align-items: center; gap: 1.5rem;">
             <img src="../assets/cbn.webp" style="height: 50px; border-radius: 8px;" alt="CBN Logo">
             <div>
                <h2 class="page-title">Transaction <em>Ledger.</em></h2>
                <p class="page-subtitle">Recent CBN-Nexus Bridge activity — secured financial settlements.</p>
             </div>
        </div>
        <div class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--green); border: 1px solid rgba(16, 185, 129, 0.2); height: fit-content; padding: 8px 16px; border-radius: 100px; font-weight: 700; font-size: 0.75rem;">
             <i class="fas fa-shield-halved"></i> CBN-SECURED
        </div>
    </div>
</div>

<div class="chart-block reveal" style="padding: 0; overflow: hidden; border-radius: 16px;">
    <div class="table-responsive">
        <div class="ledger-table-wrap">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <thead>
                    <tr style="text-align: left; background: #f8fafc; color: var(--text-secondary); border-bottom: 1px solid #eee;">
                        <th style="padding: 1.25rem 1.5rem; text-transform: uppercase; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;">Reference</th>
                        <th style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;">Entity</th>
                        <th style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;">Type</th>
                        <th style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;">Amount</th>
                        <th style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;">Status</th>
                        <th style="padding-right: 1.5rem; text-transform: uppercase; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-align: right;">Date</th>
                    </tr>
                </thead>
                <tbody id="ledgerTableBody">
                    <!-- Data populated via main.js -->
                </tbody>
            </table>
        </div>
    </div>
</div>
`,

    iot: `
<div class="page-header reveal" style="margin-bottom: 2rem;">
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <div>
            <h2 class="page-title">IoT Node <em>Network.</em></h2>
            <p class="page-subtitle">12,402 hardware nodes streaming tamper-proof consumption data across all regions.</p>
        </div>
        <div style="text-align: right;">
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 4px;">Last Updated</div>
            <div style="font-family: var(--mono); font-size: 1.1rem; color: var(--text-dark); font-weight: 600;" id="iotTimestamp">18:52:25</div>
        </div>
    </div>
</div>

<div class="metrics-grid reveal" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 2.5rem;">
    <div class="metric-card">
        <div class="metric-label">Total Nodes Deployed</div>
        <div class="metric-value">12,402</div>
        <div class="metric-trend up"><i class="fas fa-arrow-up"></i> 64 added this week</div>
    </div>
    <div class="metric-card">
        <div class="metric-label">Currently Online</div>
        <div class="metric-value" style="color: var(--green);">12,362</div>
        <div class="metric-trend up" style="color: var(--green);"><i class="fas fa-check-circle"></i> 99.68% uptime</div>
    </div>
    <div class="metric-card">
        <div class="metric-label">Active Alerts</div>
        <div class="metric-value" style="color: var(--amber);">40</div>
        <div class="metric-trend" style="color: var(--red);"><i class="fas fa-triangle-exclamation"></i> Across 7 zones</div>
    </div>
    <div class="metric-card">
        <div class="metric-label">Avg Data Latency</div>
        <div class="metric-value">1.2s</div>
        <div class="metric-trend" style="color: var(--text-muted);"><i class="fas fa-signal"></i> Within SLA</div>
    </div>
</div>

<div class="chart-block reveal" style="padding: 2.5rem; border-radius: 20px;">
    <div class="chart-header" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 2.5rem;">
        <div>
            <h3 style="font-size: 1.25rem; font-weight: 700;">Node Health by Region</h3>
            <div class="chart-desc" style="color: var(--text-secondary);">Online status, alert count, and uptime for all deployment zones.</div>
        </div>
    </div>
    
    <div id="regionHealthGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <!-- Population handled via main.js render function -->
    </div>
</div>
`,

    comingsoon: `
<div class="page-header reveal">
    <div>
        <h2 class="page-title" id="sectorTitle">Sector Intelligence<br><em>Expansion Link.</em></h2>
        <p class="page-subtitle" style="color: var(--text-secondary);">National technical architecture expansion in progress — Node onboarding phase.</p>
    </div>
</div>

<div class="log-block  reveal" style="padding: 4.5rem !important; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--surface-raised); border: 1px solid var(--border); box-shadow: var(--shadow-elevated);">
    <div style="width: 90px; height: 90px; background: rgba(5, 150, 105, 0.1); border: 1px solid rgba(5, 150, 105, 0.2); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-bottom: 2.5rem; position: relative;">
        <i class="fas fa-satellite-dish" id="sectorIcon" style="font-size: 2.5rem; color: var(--green);"></i>
        <div style="position: absolute; inset: -15px; border: 2px solid rgba(5, 150, 105, 0.1); border-radius: 30px; animation: marker-pulse-inner 3s linear infinite;"></div>
    </div>
    
    <h3 style="color: var(--ink); font-size: 1.8rem; margin-bottom: 1.25rem; font-weight: 700; letter-spacing: -0.02em;">Telemetry Link Pending</h3>
    <p style="max-width: 500px; margin: 0 auto 3rem; color: var(--text-muted); font-size: 1rem; line-height: 1.6;">
        The <b id="sectorLabel" style="color: var(--ink);">Sector</b> data pipeline is currently being integrated into the National Energy Data Bank framework. 
        <br>
        <span style="display: inline-block; margin-top: 15px; padding: 4px 10px; background: var(--border-light); border-radius: 6px; font-family: var(--mono); font-size: 0.8rem; color: #64748b;">MAPPING STATUS: ONBOARDING_ACTIVE</span>
    </p>

    <div style="display: inline-flex; gap: 0.75rem; background: rgba(5, 150, 105, 0.1); color: var(--green); border: 1px solid rgba(5, 150, 105, 0.2); padding: 0.8rem 1.75rem; border-radius: var(--r-pill); font-weight: 700; font-size: 0.8rem; letter-spacing: 0.05em; text-transform: uppercase;">
        <span class="live-dot" style="background: var(--green);"></span>
        Phase 2 Integration Phase
    </div>
</div>
`
};
