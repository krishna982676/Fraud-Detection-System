// Fraud Detection System - Enterprise Frontend Client
// Features: Deduplication, Single Source of Truth Counters, Resilient WS, User Profiling, Detail Drawer, Keyboard Shortcuts

let stompClient = null;
let wsReconnectDelay = 1000;
let wsReconnectTimer = null;

let isSimulating = false;
let simulationInterval = null;
let simSpeedMs = 200; // default 5 / sec
let simFraudRatePct = 5; // default 5%

let isStreamPaused = false;
let soundEnabled = false;

// Transaction deduplication & storage (max 200 rows)
const seenTxnIds = new Set();
let transactionsMemory = [];
let focusedAlertId = null;
let lastUndoAction = null;
let undoTimeout = null;

// Charts instances
let chartTps = null;
let chartRisk = null;
let chartCategories = null;
let chartHourly = null;
let chartThresholdSweep = null;
let sparkTxns = null;
let sparkFraud = null;

let currentAlertFilter = 'OPEN';
let thresholdSweepData = [];

// Initialize 50 Diverse User Profiles for Realistic Simulation
const USER_PROFILES = [];
const CITIES = ['NEW_YORK', 'LONDON', 'TOKYO', 'PARIS', 'SYDNEY', 'BERLIN', 'MUMBAI', 'TORONTO', 'DUBAI', 'SINGAPORE'];
const ALL_CATEGORIES = ['GROCERY', 'DINING', 'ENTERTAINMENT', 'ELECTRONICS', 'TRAVEL', 'LUXURY', 'TRANSFER', 'UTILITIES'];

(function generateUserProfiles() {
    const random = (seed) => {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };
    for (let i = 1; i <= 50; i++) {
        const id = `USER-${1000 + i}`;
        const homeCity = CITIES[i % CITIES.length];
        const typicalSpend = Math.round((15 + (random(i) * 180)) * 100) / 100;
        const favCats = [
            ALL_CATEGORIES[i % 4],
            ALL_CATEGORIES[(i + 1) % ALL_CATEGORIES.length]
        ];
        const favDevice = i % 2 === 0 ? 'MOBILE' : (i % 3 === 0 ? 'POS' : 'WEB');
        USER_PROFILES.push({ id, homeCity, typicalSpend, favCats, favDevice });
    }
})();

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    connectWebSocket();
    loadStats();
    loadAlerts();
    loadMetrics();
    loadRecentTransactions();

    // Stats sync ticker every 5 seconds (single source of truth)
    setInterval(loadStats, 5000);

    // Relative timestamp update ticker every 5 seconds
    setInterval(updateRelativeTimestamps, 5000);

    // Setup Keyboard Shortcuts (R = Reviewed, D = Dismiss)
    setupKeyboardShortcuts();

    // Check hash for direct view navigation or drawer
    if (window.location.hash === '#model') {
        switchTab('model');
    } else if (window.location.hash === '#drawer') {
        setTimeout(() => {
            if (transactionsMemory.length > 0) openDetailDrawer(transactionsMemory[0]);
        }, 600);
    }
});

// View Navigation (Live Operations vs Model Lab)
function switchTab(tab) {
    const liveView = document.getElementById('view-live');
    const modelView = document.getElementById('view-model');
    const liveBtn = document.getElementById('tab-live-btn');
    const modelBtn = document.getElementById('tab-model-btn');

    if (tab === 'live') {
        liveView.style.display = 'grid';
        modelView.style.display = 'none';
        liveBtn.classList.add('active');
        modelBtn.classList.remove('active');
    } else {
        liveView.style.display = 'none';
        modelView.style.display = 'flex';
        modelBtn.classList.add('active');
        liveBtn.classList.remove('active');
        loadMetrics();
    }
}

// Chart Initializations
function initCharts() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'JetBrains Mono', monospace";
    Chart.defaults.font.size = 10;

    // 1. TPS Line Chart (24 points = 2 mins at 5s bucket)
    const ctxTps = document.getElementById('chart-tps').getContext('2d');
    chartTps = new Chart(ctxTps, {
        type: 'line',
        data: {
            labels: Array(24).fill(''),
            datasets: [{
                label: 'TPS',
                data: Array(24).fill(0),
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
            }
        }
    });

    // 2. Risk Distribution Donut Chart
    const ctxRisk = document.getElementById('chart-risk').getContext('2d');
    chartRisk = new Chart(ctxRisk, {
        type: 'doughnut',
        data: {
            labels: ['Low', 'Med', 'High'],
            datasets: [{
                data: [1, 0, 0],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderColor: '#151f32',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 8, font: { size: 9 } } }
            }
        }
    });

    // 3. Fraud by Category Bar Chart
    const ctxCats = document.getElementById('chart-categories').getContext('2d');
    chartCategories = new Chart(ctxCats, {
        type: 'bar',
        data: {
            labels: ['LUXURY', 'TRANSFER', 'ELECTRONICS', 'TRAVEL', 'DINING'],
            datasets: [{
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: '#ef4444',
                borderRadius: 3,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
            }
        }
    });

    // 4. Hourly Fraud Distribution
    const ctxHourly = document.getElementById('chart-hourly').getContext('2d');
    chartHourly = new Chart(ctxHourly, {
        type: 'bar',
        data: {
            labels: ['01h', '02h', '03h', '04h', '08h', '12h', '16h', '20h'],
            datasets: [{
                data: [0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                borderColor: '#8b5cf6',
                borderRadius: 3,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
            }
        }
    });

    // 5. Mini Sparklines in Stat Cards
    sparkTxns = initMiniSparkline('spark-txns', '#06b6d4');
    sparkFraud = initMiniSparkline('spark-fraud', '#f59e0b');
}

function initMiniSparkline(canvasId, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(12).fill(''),
            datasets: [{
                data: Array(12).fill(0),
                borderColor: color,
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                tension: 0.3,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });
}

// Resilient WebSocket Connection with Exponential Backoff
function connectWebSocket() {
    const badge = document.getElementById('ws-badge');
    const statusText = document.getElementById('ws-status-text');

    badge.className = 'status-pill disconnected';
    statusText.innerText = 'CONNECTING...';

    try {
        const socket = new SockJS('/ws/alerts');
        stompClient = Stomp.over(socket);
        stompClient.debug = null; // silence console spam

        stompClient.connect({}, function(frame) {
            badge.className = 'status-pill connected';
            statusText.innerText = 'WS CONNECTED';
            wsReconnectDelay = 1000; // reset backoff on success

            // Subscribe to live transactions
            stompClient.subscribe('/topic/transactions', function(message) {
                try {
                    const txn = JSON.parse(message.body);
                    handleNewTransaction(txn);
                } catch (e) {
                    console.error('Error parsing transaction WS msg', e);
                }
            });

            // Subscribe to real-time alerts
            stompClient.subscribe('/topic/alerts', function(message) {
                try {
                    const alert = JSON.parse(message.body);
                    handleNewAlert(alert);
                } catch (e) {
                    console.error('Error parsing alert WS msg', e);
                }
            });
        }, function(error) {
            scheduleReconnect();
        });
    } catch (e) {
        scheduleReconnect();
    }
}

function scheduleReconnect() {
    const badge = document.getElementById('ws-badge');
    const statusText = document.getElementById('ws-status-text');
    badge.className = 'status-pill disconnected';
    statusText.innerText = `RETRY IN ${Math.round(wsReconnectDelay / 1000)}s`;

    if (wsReconnectTimer) clearTimeout(wsReconnectTimer);
    wsReconnectTimer = setTimeout(() => {
        wsReconnectDelay = Math.min(15000, wsReconnectDelay * 2);
        connectWebSocket();
    }, wsReconnectDelay);
}

// Transaction Ingestion with Deduplication (Fixes Bug A1)
function handleNewTransaction(txn) {
    if (!txn || !txn.transactionId) return;

    // Deduplicate by transactionId
    if (seenTxnIds.has(txn.transactionId)) {
        return;
    }
    seenTxnIds.add(txn.transactionId);

    // Keep seen set under 1000 elements
    if (seenTxnIds.size > 1000) {
        const first = seenTxnIds.values().next().value;
        seenTxnIds.delete(first);
    }

    // Add to memory storage (max 200 items)
    transactionsMemory.unshift(txn);
    if (transactionsMemory.length > 200) {
        transactionsMemory.pop();
    }

    // Render row if stream is not paused and matches current filter
    if (!isStreamPaused) {
        renderTransactionRow(txn, true);
    }

    // Throttled stats refresh
    throttledLoadStats();
}

let statsThrottleTimer = null;
function throttledLoadStats() {
    if (statsThrottleTimer) return;
    statsThrottleTimer = setTimeout(() => {
        statsThrottleTimer = null;
        loadStats();
    }, 600);
}

// Render Transaction Row
function renderTransactionRow(txn, isNew = false) {
    const tbody = document.getElementById('transaction-feed-body');

    // Remove placeholder row if present
    if (tbody.children.length === 1 && tbody.children[0].innerText.includes('Awaiting')) {
        tbody.innerHTML = '';
    }

    // Check if matches active filters
    if (!matchesActiveStreamFilters(txn)) {
        return;
    }

    const row = document.createElement('tr');
    row.dataset.txnId = txn.transactionId;
    row.dataset.userId = txn.userId;
    row.dataset.category = txn.merchantCategory;
    row.dataset.risk = txn.riskLevel;

    if (isNew) row.classList.add('row-flash');
    if (txn.isFraud || txn.riskLevel === 'HIGH') row.classList.add('fraud-row');

    const probPct = Math.round((txn.fraudProbability || 0) * 100);
    const riskBadgeClass = txn.riskLevel === 'HIGH' ? 'badge-high' : (txn.riskLevel === 'MEDIUM' ? 'badge-medium' : 'badge-low');
    const probBarColor = txn.riskLevel === 'HIGH' ? '#ef4444' : (txn.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981');

    // Structured Reason Chips (max 2 visible, +N overflow)
    const reasonsHtml = buildReasonChipsHtml(txn);

    const relTime = getRelativeTime(txn.timestamp);

    row.innerHTML = `
        <td class="mono" style="color: var(--text-faint); font-size: 11px;" title="${txn.timestamp}">${relTime}</td>
        <td class="mono" style="font-weight: 700; color: var(--accent-cyan);">${escapeHtml(txn.transactionId)}</td>
        <td class="mono" style="color: var(--text-muted);">${escapeHtml(txn.userId)}</td>
        <td class="mono" style="font-weight: 700;">$${Number(txn.amount).toFixed(2)}</td>
        <td>${escapeHtml(txn.merchantCategory)}</td>
        <td>${escapeHtml(txn.location)}</td>
        <td><span class="badge ${riskBadgeClass}">${txn.riskLevel}</span></td>
        <td>
            <div class="prob-cell">
                <span class="mono" style="font-size: 11px; font-weight: 700; color: ${probBarColor};">${probPct}%</span>
                <div class="prob-track">
                    <div class="prob-bar" style="width: ${probPct}%; background: ${probBarColor};"></div>
                </div>
            </div>
        </td>
        <td>${reasonsHtml}</td>
    `;

    // Row click opens the Detail Drawer
    row.addEventListener('click', () => openDetailDrawer(txn));

    tbody.insertBefore(row, tbody.firstChild);

    // Keep visible rows in table at max 200
    while (tbody.children.length > 200) {
        tbody.removeChild(tbody.lastChild);
    }

    document.getElementById('stream-visible-count').innerText = tbody.children.length;
}

function buildReasonChipsHtml(txn) {
    const list = txn.structuredReasons || [];
    if (list.length === 0) {
        return `<span style="color: var(--text-faint); font-size: 10px;">None (Legitimate)</span>`;
    }

    let chips = '';
    const visibleCount = Math.min(2, list.length);
    for (let i = 0; i < visibleCount; i++) {
        const r = list[i];
        const sevClass = r.severity === 'HIGH' ? 'chip-high' : (r.severity === 'MED' ? 'chip-med' : 'chip-low');
        chips += `<span class="reason-chip ${sevClass}" title="${escapeHtml(r.message)}">${escapeHtml(r.code || r.message)}</span>`;
    }

    if (list.length > 2) {
        const remaining = list.slice(2).map(r => r.message).join(' \n');
        chips += `<span class="reason-chip chip-more" title="${escapeHtml(remaining)}">+${list.length - 2}</span>`;
    }
    return `<div class="reason-chips-cell">${chips}</div>`;
}

// Handle Incoming Alert
function handleNewAlert(alert) {
    if (soundEnabled && alert.riskLevel === 'HIGH') {
        playAlertSound();
    }

    showToast(
        `🚨 ${alert.status} ALERT: ${alert.transactionId}`,
        `User ${alert.userId} • $${Number(alert.amount).toFixed(2)} (${alert.merchantCategory}) • Risk: ${alert.riskLevel} (${Math.round(alert.fraudProbability * 100)}%)`
    );

    loadAlerts();
    loadStats();
}

// Relative Timestamps
function getRelativeTime(timestamp) {
    if (!timestamp) return 'just now';
    const d = new Date(timestamp);
    const now = new Date();
    const sec = Math.max(0, Math.floor((now - d) / 1000));
    if (sec < 5) return 'just now';
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    return `${hrs}h ago`;
}

function updateRelativeTimestamps() {
    // Update stream table time cells
    const rows = document.querySelectorAll('#transaction-feed-body tr');
    rows.forEach(r => {
        const cell = r.children[0];
        if (cell && cell.title) {
            cell.innerText = getRelativeTime(cell.title);
        }
    });

    // Update alerts time labels
    const alertTimes = document.querySelectorAll('.alert-time-label');
    alertTimes.forEach(el => {
        if (el.dataset.time) {
            el.innerText = getRelativeTime(el.dataset.time);
        }
    });
}

// Load Stats from single source of truth (/api/stats) - Fixes Counter Mismatch Bug A2
async function loadStats() {
    try {
        const res = await fetch('/api/stats');
        if (!res.ok) return;
        const stats = await res.json();

        // Total Transactions
        animateNumber('stat-total', stats.totalTransactions);
        document.getElementById('feed-count-badge').innerText = `${stats.totalTransactions.toLocaleString()} total events`;

        // Fraud Rate & Counts
        document.getElementById('stat-fraud-rate').innerText = `${stats.fraudRatePercentage.toFixed(2)}%`;
        document.getElementById('stat-fraud-counts').innerText =
            `${stats.fraudTransactions.toLocaleString()} fraud / ${stats.legitTransactions.toLocaleString()} legit`;

        // Active Dynamic Threshold pill (Fixes Hardcoded Labels Bug A6)
        document.getElementById('stat-threshold-pill').innerText =
            `Threshold: ${Math.round((stats.activeThreshold || 0.70) * 100)}%`;

        // Delta indicator vs previous minute
        const deltaEl = document.getElementById('delta-txns');
        const deltaVal = stats.deltaFraudRate || 0;
        if (deltaVal > 0) {
            deltaEl.className = 'stat-delta up mono';
            deltaEl.innerText = `+${deltaVal}% /min`;
        } else if (deltaVal < 0) {
            deltaEl.className = 'stat-delta down mono';
            deltaEl.innerText = `${deltaVal}% /min`;
        } else {
            deltaEl.className = 'stat-delta neutral mono';
            deltaEl.innerText = `±0% /min`;
        }

        // Alerts Counters
        animateNumber('stat-open-alerts', stats.openAlerts);
        document.getElementById('stat-total-alerts-badge').innerText = `${stats.totalAlerts} TOTAL`;
        document.getElementById('badge-escalated-count').innerText = `${stats.escalatedAlerts || 0} escalated`;
        document.getElementById('stat-alerts-hour').innerText = stats.alertsLastHour || 0;
        document.getElementById('stat-reviewed-sub').innerText =
            `${stats.reviewedAlerts || 0} reviewed / ${stats.dismissedAlerts || 0} dismissed`;

        // Update Charts Incrementally without re-creating instances
        updateChartsData(stats);

    } catch (e) {
        console.warn('Failed to load stats:', e);
    }
}

function animateNumber(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const current = parseInt(el.innerText.replace(/,/g, ''), 10) || 0;
    if (current === targetValue) return;

    const diff = targetValue - current;
    const step = Math.ceil(diff / 5) || (diff > 0 ? 1 : -1);
    const next = current + step;

    if ((diff > 0 && next >= targetValue) || (diff < 0 && next <= targetValue)) {
        el.innerText = targetValue.toLocaleString();
    } else {
        el.innerText = next.toLocaleString();
        setTimeout(() => animateNumber(elementId, targetValue), 40);
    }
}

function updateChartsData(stats) {
    // 1. Risk Donut Chart
    if (chartRisk && stats.riskDistribution) {
        const low = stats.riskDistribution.LOW || 0;
        const med = stats.riskDistribution.MEDIUM || 0;
        const high = stats.riskDistribution.HIGH || 0;
        chartRisk.data.datasets[0].data = [low, med, high];
        chartRisk.update('none');
    }

    // 2. Category Breakdown Chart
    if (chartCategories && stats.categoryBreakdown) {
        const keys = Object.keys(stats.categoryBreakdown);
        if (keys.length > 0) {
            chartCategories.data.labels = keys;
            chartCategories.data.datasets[0].data = Object.values(stats.categoryBreakdown);
            chartCategories.update('none');
        }
    }

    // 3. Hourly Fraud Chart
    if (chartHourly && stats.hourlyFraud) {
        const hours = Object.keys(stats.hourlyFraud).map(h => `${String(h).padStart(2, '0')}h`);
        if (hours.length > 0) {
            chartHourly.data.labels = hours;
            chartHourly.data.datasets[0].data = Object.values(stats.hourlyFraud);
            chartHourly.update('none');
        }
    }

    // 4. TPS Line Chart & Sparklines
    if (stats.sparklineRecent && stats.sparklineRecent.length > 0) {
        if (sparkTxns) {
            sparkTxns.data.datasets[0].data = stats.sparklineRecent;
            sparkTxns.update('none');
        }
        if (chartTps) {
            // Push latest bucket and shift
            const lastVal = stats.sparklineRecent[stats.sparklineRecent.length - 1];
            chartTps.data.datasets[0].data.shift();
            chartTps.data.datasets[0].data.push(lastVal);
            chartTps.update('none');
        }
    }
}

// Load Alerts Feed
async function loadAlerts() {
    const filter = currentAlertFilter;
    const url = filter ? `/api/alerts?status=${filter}` : '/api/alerts';

    try {
        const res = await fetch(url);
        if (!res.ok) return;
        const alerts = await res.json();

        const container = document.getElementById('alerts-list');
        const badge = document.getElementById('alerts-count-badge');
        badge.innerText = `${alerts.length} listed`;

        if (alerts.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 36px; font-size: 12px;">
                    No ${filter || ''} alerts in queue &check;<br>All transactions within security thresholds.
                </div>
            `;
            return;
        }

        container.innerHTML = alerts.map(a => {
            const statusClass = a.status === 'ESCALATED' ? 'escalated' :
                               (a.status === 'REVIEWED' ? 'reviewed' :
                               (a.status === 'DISMISSED' ? 'dismissed' : ''));

            const timeStr = a.lastEventAt || a.createdAt;
            const relTime = getRelativeTime(timeStr);
            const mergedCountBadge = (a.count > 1) ? `<span class="alert-merged-badge">${a.count} EVENTS MERGED</span>` : '';

            // Reasons
            const reasonsText = a.reasons || 'ML model flagged anomalous signature';

            return `
                <div class="alert-item ${statusClass}" tabindex="0" data-alert-id="${a.id}" onfocus="focusedAlertId = ${a.id}">
                    <div class="alert-top">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span class="alert-txn-id">${escapeHtml(a.transactionId)}</span>
                            ${mergedCountBadge}
                        </div>
                        <span class="alert-time alert-time-label" data-time="${timeStr}">${relTime}</span>
                    </div>
                    <div class="alert-mid">
                        <span>User: <strong>${escapeHtml(a.userId)}</strong></span>
                        <span>Total: <strong>$${Number(a.amount).toFixed(2)}</strong></span>
                        <span>Score: <strong style="color: #ef4444;">${Math.round(a.fraudProbability * 100)}%</strong></span>
                    </div>
                    <div class="alert-reasons-preview" title="${escapeHtml(reasonsText)}">
                        ${escapeHtml(reasonsText)}
                    </div>
                    ${(a.status === 'OPEN' || a.status === 'ESCALATED') ? `
                    <div class="alert-actions">
                        <button class="btn btn-outline btn-sm" onclick="updateAlertStatus(${a.id}, 'REVIEWED')">&check; Reviewed [R]</button>
                        <button class="btn btn-danger btn-sm" onclick="updateAlertStatus(${a.id}, 'DISMISSED')">&times; Dismiss [D]</button>
                    </div>` : `
                    <div style="font-size: 10px; color: var(--text-faint); font-family: var(--font-mono); margin-top: 2px;">
                        Status: <strong>${a.status}</strong>
                    </div>`}
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Failed to load alerts:', e);
    }
}

function setAlertFilter(status, btn) {
    currentAlertFilter = status;
    document.querySelectorAll('.alert-tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    loadAlerts();
}

// Update Alert Status with 5-Second Undo Toast
async function updateAlertStatus(id, newStatus) {
    try {
        const res = await fetch(`/api/alerts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            lastUndoAction = { alertId: id, previousStatus: 'OPEN' };
            showUndoToast(`Alert #${id} marked as ${newStatus}`, id);
            loadAlerts();
            loadStats();
        }
    } catch (e) {
        console.error('Error updating alert status:', e);
    }
}

function showUndoToast(msg, alertId) {
    if (undoTimeout) clearTimeout(undoTimeout);

    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast toast-undo';
    toast.id = `toast-undo-${alertId}`;
    toast.innerHTML = `
        <div class="toast-title">
            <span>${escapeHtml(msg)}</span>
            <button class="btn btn-outline btn-sm" onclick="executeUndo(${alertId})">UNDO (5s)</button>
        </div>
    `;
    container.appendChild(toast);

    undoTimeout = setTimeout(() => {
        if (toast.parentElement) toast.remove();
        lastUndoAction = null;
    }, 5000);
}

async function executeUndo(alertId) {
    if (!lastUndoAction || lastUndoAction.alertId !== alertId) return;
    try {
        await fetch(`/api/alerts/${alertId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'OPEN' })
        });
        showToast('Action Reverted', `Alert #${alertId} restored to OPEN`);
        loadAlerts();
        loadStats();
    } catch (e) {
        console.error('Undo failed:', e);
    }
}

// Detail Drawer (Opens on row click)
async function openDetailDrawer(txn) {
    const drawer = document.getElementById('detail-drawer');
    const backdrop = document.getElementById('drawer-backdrop');

    // Populate transaction info
    document.getElementById('drawer-txn-id').innerText = txn.transactionId;
    const badge = document.getElementById('drawer-risk-badge');
    badge.className = `badge ${txn.riskLevel === 'HIGH' ? 'badge-high' : (txn.riskLevel === 'MEDIUM' ? 'badge-medium' : 'badge-low')}`;
    badge.innerText = txn.riskLevel;

    // Score breakdown
    const breakdown = txn.scoreBreakdown || {
        mlScore: txn.fraudProbability,
        ruleScore: txn.fraudProbability,
        finalScore: txn.fraudProbability
    };
    document.getElementById('drawer-ml-score').innerText = `${Math.round(breakdown.mlScore * 100)}%`;
    document.getElementById('drawer-rule-score').innerText = `${Math.round(breakdown.ruleScore * 100)}%`;
    document.getElementById('drawer-final-score').innerText = `${Math.round(breakdown.finalScore * 100)}%`;

    // Attributes
    document.getElementById('drawer-user').innerText = txn.userId;
    document.getElementById('drawer-amount').innerText = `$${Number(txn.amount).toFixed(2)}`;
    document.getElementById('drawer-category').innerText = txn.merchantCategory;
    document.getElementById('drawer-location').innerText = txn.location;
    document.getElementById('drawer-device').innerText = txn.deviceType || 'MOBILE';
    document.getElementById('drawer-hour').innerText = `${txn.hourOfDay || 12}:00`;
    document.getElementById('drawer-dist').innerText = `${txn.distanceFromHome || 0} km`;
    document.getElementById('drawer-intl').innerText = txn.isInternational ? 'YES' : 'NO';

    // Top Factors
    const factorsContainer = document.getElementById('drawer-top-factors');
    const factors = txn.topFactors || [];
    if (factors.length > 0) {
        factorsContainer.innerHTML = factors.map(f => `
            <div class="factor-item">
                <div>
                    <strong style="color: ${f.impact === 'INCREASES_RISK' ? '#ef4444' : '#10b981'};">&bull; ${escapeHtml(f.feature)}</strong>
                    <div style="font-size: 10px; color: var(--text-faint);">${escapeHtml(f.value)}</div>
                </div>
                <span class="badge ${f.impact === 'INCREASES_RISK' ? 'badge-high' : 'badge-low'}">
                    ${f.impact === 'INCREASES_RISK' ? '+Risk' : '-Risk'}
                </span>
            </div>
        `).join('');
    } else {
        factorsContainer.innerHTML = `<span style="font-size: 11px; color: var(--text-faint);">No anomalous deviations</span>`;
    }

    // Fetch user profile from H2 cache
    try {
        const res = await fetch(`/api/transactions/user/${txn.userId}`);
        if (res.ok) {
            const data = await res.json();
            const prof = data.profile || {};
            document.getElementById('drawer-user-avg').innerText = `$${(prof.avgAmount || 0).toFixed(2)}`;
            document.getElementById('drawer-user-std').innerText = `$${(prof.stdDevAmount || 0).toFixed(2)}`;
            document.getElementById('drawer-user-count').innerText = `${prof.txnCount || 0} txns`;
            document.getElementById('drawer-user-cities').innerText = (prof.usualCities || []).join(', ') || 'N/A';

            // Recent history
            const historyBody = document.getElementById('drawer-user-txns-body');
            const recents = data.recentTransactions || [];
            if (recents.length > 0) {
                historyBody.innerHTML = recents.map(h => `
                    <tr>
                        <td class="mono">${escapeHtml(h.transactionId)}</td>
                        <td class="mono">$${Number(h.amount).toFixed(2)}</td>
                        <td>${escapeHtml(h.merchantCategory)}</td>
                        <td>${escapeHtml(h.location)}</td>
                        <td><span class="badge ${h.riskLevel === 'HIGH' ? 'badge-high' : (h.riskLevel === 'MEDIUM' ? 'badge-medium' : 'badge-low')}">${h.riskLevel}</span></td>
                    </tr>
                `).join('');
            } else {
                historyBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-faint);">No prior history</td></tr>`;
            }
        }
    } catch (e) {
        console.warn('Could not load user profile drawer data:', e);
    }

    drawer.classList.add('open');
    backdrop.classList.add('open');
}

function closeDrawer() {
    document.getElementById('detail-drawer').classList.remove('open');
    document.getElementById('drawer-backdrop').classList.remove('open');
}

// Stream Toolbar Filters
function applyStreamFilters() {
    const searchVal = document.getElementById('stream-search').value.trim().toLowerCase();
    const riskVal = document.getElementById('stream-risk-filter').value;
    const catVal = document.getElementById('stream-category-filter').value;

    const rows = document.querySelectorAll('#transaction-feed-body tr');
    let visibleCount = 0;

    rows.forEach(r => {
        if (!r.dataset.txnId) return;
        const matchesSearch = !searchVal ||
            r.dataset.txnId.toLowerCase().includes(searchVal) ||
            r.dataset.userId.toLowerCase().includes(searchVal);
        const matchesRisk = riskVal === 'ALL' || r.dataset.risk === riskVal;
        const matchesCat = catVal === 'ALL' || r.dataset.category === catVal;

        if (matchesSearch && matchesRisk && matchesCat) {
            r.style.display = '';
            visibleCount++;
        } else {
            r.style.display = 'none';
        }
    });

    document.getElementById('stream-visible-count').innerText = visibleCount;
}

function matchesActiveStreamFilters(txn) {
    const searchVal = document.getElementById('stream-search').value.trim().toLowerCase();
    const riskVal = document.getElementById('stream-risk-filter').value;
    const catVal = document.getElementById('stream-category-filter').value;

    if (searchVal && !txn.transactionId.toLowerCase().includes(searchVal) && !txn.userId.toLowerCase().includes(searchVal)) {
        return false;
    }
    if (riskVal !== 'ALL' && txn.riskLevel !== riskVal) return false;
    if (catVal !== 'ALL' && txn.merchantCategory !== catVal) return false;
    return true;
}

function togglePauseStream() {
    isStreamPaused = !isStreamPaused;
    const btn = document.getElementById('btn-pause-stream');
    const text = document.getElementById('pause-text');
    const icon = document.getElementById('pause-icon');

    if (isStreamPaused) {
        btn.classList.add('btn-cyan');
        btn.classList.remove('btn-outline');
        icon.innerHTML = '&#9654;';
        text.innerText = 'Resume Stream';
    } else {
        btn.classList.remove('btn-cyan');
        btn.classList.add('btn-outline');
        icon.innerHTML = '&#10074;&#10074;';
        text.innerText = 'Pause Stream';
        // Re-render recent memory buffer
        const tbody = document.getElementById('transaction-feed-body');
        tbody.innerHTML = '';
        transactionsMemory.slice(0, 50).reverse().forEach(t => renderTransactionRow(t, false));
    }
}

function clearFeed() {
    document.getElementById('transaction-feed-body').innerHTML = `
        <tr>
            <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 36px;">
                Stream cleared. Awaiting new transactions.
            </td>
        </tr>
    `;
    document.getElementById('stream-visible-count').innerText = '0';
}

// Load Recent Transactions on initial load
async function loadRecentTransactions() {
    try {
        const res = await fetch('/api/transactions?size=25');
        if (!res.ok) return;
        const page = await res.json();
        if (page.content && page.content.length > 0) {
            document.getElementById('transaction-feed-body').innerHTML = '';
            page.content.slice().reverse().forEach(t => {
                handleNewTransaction({
                    transactionId: t.transactionId,
                    userId: t.userId,
                    amount: t.amount,
                    merchantCategory: t.merchantCategory,
                    location: t.location,
                    deviceType: t.deviceType,
                    hourOfDay: t.hourOfDay,
                    distanceFromHome: t.distanceFromHome,
                    isInternational: t.isInternational,
                    fraudProbability: t.finalScore || t.fraudProbability,
                    isFraud: t.isFraud,
                    riskLevel: t.riskLevel,
                    reasons: t.reasons ? t.reasons.split(' | ') : [],
                    structuredReasons: parseJsonSafe(t.structuredReasonsJson),
                    timestamp: t.createdAt
                });
            });
        }
    } catch (e) {
        console.warn('Could not load recent transactions:', e);
    }
}

// Load Model Metrics & Threshold Sweep
async function loadMetrics() {
    try {
        const res = await fetch('/api/model/metrics');
        if (!res.ok) return;
        const m = await res.json();

        // RandomForest
        const mAcc = document.getElementById('m-acc');
        if (mAcc) mAcc.innerText = `${(m.accuracy || 0).toFixed(2)}%`;
        const mPrec = document.getElementById('m-prec');
        if (mPrec) mPrec.innerText = (m.precision || 0).toFixed(4);
        const mRec = document.getElementById('m-rec');
        if (mRec) mRec.innerText = (m.recall || 0).toFixed(4);
        const mF1 = document.getElementById('m-f1');
        if (mF1) mF1.innerText = (m.f1 || 0).toFixed(4);
        const mAuc = document.getElementById('m-auc');
        if (mAuc) mAuc.innerText = (m.rocAuc || 0).toFixed(4);

        // Baseline J48
        const bAcc = document.getElementById('b-acc');
        if (bAcc) bAcc.innerText = `${(m.baselineAccuracy || 0).toFixed(2)}%`;
        const bPrec = document.getElementById('b-prec');
        if (bPrec) bPrec.innerText = (m.baselinePrecision || 0).toFixed(4);
        const bRec = document.getElementById('b-rec');
        if (bRec) bRec.innerText = (m.baselineRecall || 0).toFixed(4);
        const bF1 = document.getElementById('b-f1');
        if (bF1) bF1.innerText = (m.baselineF1 || 0).toFixed(4);
        const bAuc = document.getElementById('b-auc');
        if (bAuc) bAuc.innerText = (m.baselineRocAuc || 0).toFixed(4);

        // Baseline Logistic
        const lAcc = document.getElementById('l-acc');
        if (lAcc) lAcc.innerText = `${(m.logisticAccuracy || 0).toFixed(2)}%`;
        const lPrec = document.getElementById('l-prec');
        if (lPrec) lPrec.innerText = (m.logisticPrecision || 0).toFixed(4);
        const lRec = document.getElementById('l-rec');
        if (lRec) lRec.innerText = (m.logisticRecall || 0).toFixed(4);
        const lF1 = document.getElementById('l-f1');
        if (lF1) lF1.innerText = (m.logisticF1 || 0).toFixed(4);
        const lAuc = document.getElementById('l-auc');
        if (lAuc) lAuc.innerText = (m.logisticRocAuc || 0).toFixed(4);

        // Confusion Matrix
        const cmEl = document.getElementById('confusion-matrix-display');
        if (cmEl) cmEl.innerText = m.confusionMatrix || 'Confusion matrix not available';

        const tdEl = document.getElementById('metric-train-date');
        if (tdEl && m.trainedAt) {
            tdEl.innerText = `Trained: ${new Date(m.trainedAt).toLocaleString()}`;
        }

        // Fetch Threshold Sweep
        loadThresholdSweep();
    } catch (e) {
        console.warn('Could not load model metrics:', e);
    }
}

async function loadThresholdSweep() {
    try {
        const res = await fetch('/api/model/threshold-sweep');
        if (!res.ok) return;
        thresholdSweepData = await res.json();
        initThresholdSweepChart(thresholdSweepData);
        handleThresholdSweepSlide(document.getElementById('sweep-slider').value);
    } catch (e) {
        console.warn('Could not load threshold sweep:', e);
    }
}

function initThresholdSweepChart(sweep) {
    const canvas = document.getElementById('chart-threshold-sweep');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (chartThresholdSweep) {
        try { chartThresholdSweep.destroy(); } catch (e) {}
    }

    const labels = sweep.map(s => s.threshold.toFixed(2));
    const precisions = sweep.map(s => s.precision);
    const recalls = sweep.map(s => s.recall);
    const f1s = sweep.map(s => s.f1);

    chartThresholdSweep = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Precision', data: precisions, borderColor: '#10b981', tension: 0.2, borderWidth: 2, pointRadius: 2 },
                { label: 'Recall', data: recalls, borderColor: '#f59e0b', tension: 0.2, borderWidth: 2, pointRadius: 2 },
                { label: 'F1-Score', data: f1s, borderColor: '#06b6d4', tension: 0.2, borderWidth: 2, pointRadius: 2 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { boxWidth: 10 } } },
            scales: {
                x: { title: { display: true, text: 'Threshold' } },
                y: { min: 0, max: 1.0, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

function handleThresholdSweepSlide(val) {
    const cutoff = parseFloat(val);
    document.getElementById('sweep-thresh-val').innerText = cutoff.toFixed(2);

    if (!thresholdSweepData || thresholdSweepData.length === 0) return;

    // Find closest item
    let closest = thresholdSweepData[0];
    let minDiff = 999;
    for (const item of thresholdSweepData) {
        const diff = Math.abs(item.threshold - cutoff);
        if (diff < minDiff) {
            minDiff = diff;
            closest = item;
        }
    }

    document.getElementById('sweep-prec').innerText = (closest.precision || 0).toFixed(4);
    document.getElementById('sweep-rec').innerText = (closest.recall || 0).toFixed(4);
    document.getElementById('sweep-f1').innerText = (closest.f1 || 0).toFixed(4);
}

// Retrain Actions
async function retrainModel() {
    const btn = document.getElementById('btn-retrain');
    btn.disabled = true;
    btn.innerHTML = `<span class="pulse-dot"></span> Training...`;

    try {
        const res = await fetch('/api/model/train', { method: 'POST' });
        const data = await res.json();
        if (res.ok && data.success) {
            showToast('Model Training Complete', 'RandomForest, J48, and Logistic models rebuilt with 10-fold CV.');
            loadMetrics();
        } else {
            showToast('Retrain Error', data.message || 'Error retraining');
        }
    } catch (e) {
        showToast('Network Error', 'Could not reach training endpoint');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<span id="retrain-spinner">&#8635;</span> Retrain`;
    }
}

async function retrainFromFeedback() {
    try {
        const res = await fetch('/api/model/retrain-from-feedback', { method: 'POST' });
        const data = await res.json();
        if (res.ok && data.success) {
            showToast('Feedback Model Retrained', data.message || 'Model updated with analyst corrections');
            loadMetrics();
        } else {
            showToast('Retrain Warning', data.message || 'No feedback labels to incorporate');
        }
    } catch (e) {
        showToast('Error', 'Failed to trigger feedback retraining');
    }
}

// Manual Transaction Evaluation
async function handleManualSubmit(e) {
    e.preventDefault();

    const payload = {
        userId: document.getElementById('inp-user-id').value,
        amount: parseFloat(document.getElementById('inp-amount').value),
        merchantCategory: document.getElementById('inp-category').value,
        location: document.getElementById('inp-location').value,
        deviceType: document.getElementById('inp-device').value,
        hourOfDay: parseInt(document.getElementById('inp-hour').value),
        distanceFromHome: parseFloat(document.getElementById('inp-dist').value),
        txnCountLast24h: parseInt(document.getElementById('inp-txns').value),
        isInternational: document.getElementById('inp-intl').value === 'true',
        timestamp: new Date().toISOString()
    };

    try {
        const res = await fetch('/api/transactions/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            handleNewTransaction(data);
            showToast(`Evaluated: ${data.transactionId}`, `Risk: ${data.riskLevel} (${Math.round(data.fraudProbability * 100)}%)`);
        } else {
            const err = await res.json();
            showToast('Validation Error', err.message || 'Failed to analyze transaction');
        }
    } catch (err) {
        console.error('Submit failed:', err);
    }
}

// Presets
function applyPreset(name) {
    if (name === 'legit_coffee') {
        document.getElementById('inp-user-id').value = 'USER-1002';
        document.getElementById('inp-amount').value = '4.50';
        document.getElementById('inp-category').value = 'DINING';
        document.getElementById('inp-location').value = 'LONDON';
        document.getElementById('inp-device').value = 'POS';
        document.getElementById('inp-hour').value = '8';
        document.getElementById('inp-dist').value = '1.2';
        document.getElementById('inp-txns').value = '1';
        document.getElementById('inp-intl').value = 'false';
    } else if (name === 'legit_grocery') {
        document.getElementById('inp-user-id').value = 'USER-1005';
        document.getElementById('inp-amount').value = '128.00';
        document.getElementById('inp-category').value = 'GROCERY';
        document.getElementById('inp-location').value = 'SYDNEY';
        document.getElementById('inp-device').value = 'MOBILE';
        document.getElementById('inp-hour').value = '17';
        document.getElementById('inp-dist').value = '3.5';
        document.getElementById('inp-txns').value = '2';
        document.getElementById('inp-intl').value = 'false';
    } else if (name === 'midnight_luxury') {
        document.getElementById('inp-user-id').value = 'USER-1012';
        document.getElementById('inp-amount').value = '4200.00';
        document.getElementById('inp-category').value = 'LUXURY';
        document.getElementById('inp-location').value = 'DUBAI';
        document.getElementById('inp-device').value = 'WEB';
        document.getElementById('inp-hour').value = '2';
        document.getElementById('inp-dist').value = '5800.0';
        document.getElementById('inp-txns').value = '14';
        document.getElementById('inp-intl').value = 'true';
    } else if (name === 'impossible_travel') {
        document.getElementById('inp-user-id').value = 'USER-1020';
        document.getElementById('inp-amount').value = '850.00';
        document.getElementById('inp-category').value = 'TRANSFER';
        document.getElementById('inp-location').value = 'TOKYO';
        document.getElementById('inp-device').value = 'ATM';
        document.getElementById('inp-hour').value = '3';
        document.getElementById('inp-dist').value = '7400.0';
        document.getElementById('inp-txns').value = '5';
        document.getElementById('inp-intl').value = 'true';
    } else if (name === 'velocity_surge') {
        document.getElementById('inp-user-id').value = 'USER-1033';
        document.getElementById('inp-amount').value = '1950.00';
        document.getElementById('inp-category').value = 'TRANSFER';
        document.getElementById('inp-location').value = 'SINGAPORE';
        document.getElementById('inp-device').value = 'WEB';
        document.getElementById('inp-hour').value = '14';
        document.getElementById('inp-dist').value = '250.0';
        document.getElementById('inp-txns').value = '28';
        document.getElementById('inp-intl').value = 'true';
    }
}

// Realistic Traffic Simulation (Fixes Simulator Bug A5)
function updateSimSliderLabel(val) {
    simFraudRatePct = parseInt(val, 10);
    document.getElementById('sim-fraud-rate-label').innerText = `${simFraudRatePct}%`;
}

function updateSimSpeed(val) {
    simSpeedMs = parseInt(val, 10);
    if (isSimulating) {
        clearInterval(simulationInterval);
        simulationInterval = setInterval(sendSimulatedTransaction, simSpeedMs);
    }
}

function toggleSimulation() {
    const btn = document.getElementById('btn-toggle-sim');
    const icon = document.getElementById('sim-icon');
    const text = document.getElementById('sim-text');
    const dot = document.getElementById('sim-dot');

    if (isSimulating) {
        clearInterval(simulationInterval);
        isSimulating = false;
        btn.className = 'btn btn-cyan btn-sm';
        icon.style.display = 'inline';
        dot.style.display = 'none';
        icon.innerHTML = '&#9658;';
        text.innerText = 'Simulate';
    } else {
        isSimulating = true;
        btn.className = 'btn btn-danger btn-sm';
        icon.style.display = 'none';
        dot.style.display = 'inline-block';
        text.innerText = 'Stop';

        simulationInterval = setInterval(sendSimulatedTransaction, simSpeedMs);
        sendSimulatedTransaction();
    }
}

function sendSimulatedTransaction() {
    // Pick random user profile from our 50 predefined users
    const user = USER_PROFILES[Math.floor(Math.random() * USER_PROFILES.length)];
    const isFraudAttack = Math.random() < (simFraudRatePct / 100.0);

    let payload;
    if (isFraudAttack) {
        // Diverse fraud attack patterns
        const attackType = Math.random();
        if (attackType < 0.35) {
            // High luxury / transfer attack
            payload = {
                userId: user.id,
                amount: parseFloat((user.typicalSpend * (5 + Math.random() * 12)).toFixed(2)),
                merchantCategory: Math.random() < 0.6 ? 'LUXURY' : 'TRANSFER',
                location: CITIES[Math.floor(Math.random() * CITIES.length)],
                deviceType: 'WEB',
                hourOfDay: Math.random() < 0.5 ? Math.floor(1 + Math.random() * 4) : Math.floor(Math.random() * 24),
                distanceFromHome: parseFloat((1500 + Math.random() * 6500).toFixed(1)),
                txnCountLast24h: Math.floor(10 + Math.random() * 18),
                isInternational: true
            };
        } else if (attackType < 0.70) {
            // Impossible travel speed jump
            payload = {
                userId: user.id,
                amount: parseFloat((user.typicalSpend * (1.5 + Math.random() * 4)).toFixed(2)),
                merchantCategory: 'ELECTRONICS',
                location: CITIES[(CITIES.indexOf(user.homeCity) + 3) % CITIES.length],
                deviceType: 'ATM',
                hourOfDay: Math.floor(Math.random() * 24),
                distanceFromHome: parseFloat((3000 + Math.random() * 5000).toFixed(1)),
                txnCountLast24h: Math.floor(6 + Math.random() * 10),
                isInternational: true
            };
        } else {
            // Velocity burst attack
            payload = {
                userId: user.id,
                amount: parseFloat((user.typicalSpend * 2.5).toFixed(2)),
                merchantCategory: 'TRANSFER',
                location: user.homeCity,
                deviceType: 'WEB',
                hourOfDay: Math.floor(Math.random() * 24),
                distanceFromHome: 15.0,
                txnCountLast24h: Math.floor(18 + Math.random() * 15),
                isInternational: false
            };
        }
    } else {
        // Normal legitimate spend pattern around user's typical profile
        const variance = (Math.random() - 0.5) * 0.4; // -20% to +20%
        const amount = Math.max(3.5, parseFloat((user.typicalSpend * (1 + variance)).toFixed(2)));
        const category = user.favCats[Math.floor(Math.random() * user.favCats.length)];

        payload = {
            userId: user.id,
            amount: amount,
            merchantCategory: category,
            location: user.homeCity,
            deviceType: user.favDevice,
            hourOfDay: Math.floor(7 + Math.random() * 15), // waking hours
            distanceFromHome: parseFloat((0.5 + Math.random() * 20).toFixed(1)),
            txnCountLast24h: Math.floor(1 + Math.random() * 4),
            isInternational: false
        };
    }

    payload.timestamp = new Date().toISOString();

    fetch('/api/transactions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(err => console.warn('Simulation txn network error:', err));
}

// Keyboard Shortcuts: R for Reviewed, D for Dismiss
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }
        if (!focusedAlertId) return;

        if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            updateAlertStatus(focusedAlertId, 'REVIEWED');
        } else if (e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            updateAlertStatus(focusedAlertId, 'DISMISSED');
        }
    });
}

// Sound Beep for Critical High Alerts
function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('sound-state');
    const icon = document.getElementById('sound-icon');
    if (soundEnabled) {
        btn.innerText = 'ON';
        icon.innerHTML = '&#128266;';
        playAlertSound();
    } else {
        btn.innerText = 'OFF';
        icon.innerHTML = '&#128263;';
    }
}

function playAlertSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
        // Web Audio suppressed
    }
}

// Toast Notifications
function showToast(title, message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-title">
            <span>${escapeHtml(title)}</span>
            <span style="cursor: pointer; opacity: 0.7;" onclick="this.parentElement.parentElement.remove()">&times;</span>
        </div>
        <div class="toast-body">${escapeHtml(message)}</div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 4500);
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function parseJsonSafe(jsonStr) {
    try {
        return jsonStr ? JSON.parse(jsonStr) : [];
    } catch (e) {
        return [];
    }
}
