/**
 * CampusBus AI - Main Application Controller
 * Handles live polling, bus card list rendering, timeline view, and event binding.
 */

const state = {
  campus: null,
  buses: [],
  routes: [],
  selectedBusId: null,
  searchQuery: ''
};

// DOM References
const busListContainer = document.getElementById('busListContainer');
const busSearchInput = document.getElementById('busSearchInput');
const busCountBadge = document.getElementById('busCountBadge');
const routeDetailsPanel = document.getElementById('routeDetailsPanel');
const panelRouteTitle = document.getElementById('panelRouteTitle');
const stopsTimelineContainer = document.getElementById('stopsTimelineContainer');
const btnClosePanel = document.getElementById('btnClosePanel');
const btnCenterCampus = document.getElementById('btnCenterCampus');
const btnFitAllBuses = document.getElementById('btnFitAllBuses');
const btnRefresh = document.getElementById('btnRefresh');
const liveClock = document.getElementById('liveClock');

/**
 * App Initialization
 */
async function initApp() {
  startClock();

  try {
    // 1. Fetch campus destination and initialize map
    const campusRes = await fetch('/api/campus');
    state.campus = await campusRes.json();
    window.MapEngine.initMap(state.campus);

    // 2. Fetch routes and draw lines/stops
    const routesRes = await fetch('/api/routes');
    state.routes = await routesRes.json();
    window.MapEngine.renderRoutesOnMap(state.routes);

    // 3. Fetch buses and render cards + live markers
    await refreshBuses();

    // Set initial map bounds to show all buses
    window.MapEngine.fitAllBuses(state.buses);

    // Setup polling every 10 seconds
    setInterval(refreshBuses, 10000);

  } catch (err) {
    console.error('Initialization error:', err);
    busListContainer.innerHTML = `
      <div style="padding:20px; color:#dc2626; text-align:center;">
        Failed to connect to backend server. Make sure FastAPI is running at http://127.0.0.1:8000.
      </div>
    `;
  }

  setupEventListeners();
}

/**
 * Fetch and refresh live bus fleet status
 */
async function refreshBuses() {
  try {
    const res = await fetch('/api/buses');
    state.buses = await res.json();

    // Update markers on Leaflet
    window.MapEngine.updateBusMarkers(state.buses);

    // Update sidebar cards
    renderBusList();

    // Update count badge
    busCountBadge.textContent = `${state.buses.length} Active`;

  } catch (err) {
    console.warn('Could not refresh bus data:', err);
  }
}

/**
 * Render bus list cards in left sidebar
 */
function renderBusList() {
  const query = state.searchQuery.toLowerCase();
  const filtered = state.buses.filter(bus => {
    return (
      bus.bus_number.toLowerCase().includes(query) ||
      bus.route_name.toLowerCase().includes(query) ||
      bus.driver_name.toLowerCase().includes(query) ||
      bus.next_stop_name.toLowerCase().includes(query)
    );
  });

  if (filtered.length === 0) {
    busListContainer.innerHTML = `<div class="loading-state">No buses found matching "${query}".</div>`;
    return;
  }

  busListContainer.innerHTML = filtered.map(bus => {
    const isSelected = bus.id === state.selectedBusId;
    return `
      <div class="bus-card ${isSelected ? 'active' : ''}" onclick="selectBus('${bus.id}')">
        <div class="bus-card-header">
          <div class="bus-title">
            <span class="bus-number-badge">Bus ${bus.bus_number}</span>
            <span class="route-tag">${bus.route_name.split(' ')[0]} ${bus.route_name.split(' ')[1] || ''}</span>
          </div>
          <span class="status-badge ${bus.status}">${bus.status_label}</span>
        </div>

        <div class="bus-card-body">
          <div class="location-row">
            <span>📍</span>
            <span>${bus.current_location_desc}</span>
          </div>
          <div style="font-size:0.75rem; color:#64748b; margin-top:2px;">
            Driver: <b>${bus.driver_name}</b> • Next: <b style="color:#2563eb;">${bus.next_stop_name}</b>
          </div>
          <div class="meta-row">
            <span>Speed: <b>${bus.speed_kmh} km/h</b></span>
            <span>Next Stop ETA: <span class="meta-pill">~${bus.eta_next_stop_mins}m</span></span>
            <span>Campus: <span class="meta-pill">~${bus.eta_campus_mins}m</span></span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Select a bus: highlight card, zoom on map, and display stops timeline
 */
window.selectBus = function(busId) {
  state.selectedBusId = busId;
  const bus = state.buses.find(b => b.id === busId);
  if (!bus) return;

  // Highlight card
  renderBusList();

  // Focus on map
  window.MapEngine.focusOnBus(busId);

  // Show route timeline in bottom panel
  const route = state.routes.find(r => r.id === bus.route_id);
  if (route) {
    displayRouteTimeline(route, bus);
  }
};

/**
 * Render Route Timeline in Sidebar
 */
function displayRouteTimeline(route, bus) {
  panelRouteTitle.textContent = `${route.route_number} Stops`;
  routeDetailsPanel.style.display = 'block';

  stopsTimelineContainer.innerHTML = route.stops.map(stop => {
    const isNext = stop.name.toLowerCase() === bus.next_stop_name.toLowerCase();
    const itemClass = isNext ? 'next-up' : '';

    return `
      <div class="timeline-stop ${itemClass}">
        <div>
          <span style="font-weight:600; color:${isNext ? '#d97706' : '#1e293b'};">${stop.name}</span>
          ${isNext ? '<span style="font-size:0.7rem; color:#d97706; margin-left:6px; font-weight:700;">[NEXT STOP]</span>' : ''}
        </div>
        <span class="timeline-stop-time">${stop.scheduled_time}</span>
      </div>
    `;
  }).join('');
}

/**
 * Event Listeners Setup
 */
function setupEventListeners() {
  // Search filter input
  busSearchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    renderBusList();
  });

  // Close timeline panel
  btnClosePanel.addEventListener('click', () => {
    routeDetailsPanel.style.display = 'none';
    state.selectedBusId = null;
    renderBusList();
  });

  // Center campus button
  btnCenterCampus.addEventListener('click', () => {
    window.MapEngine.centerCampus(state.campus);
  });

  // Fit all buses button
  btnFitAllBuses.addEventListener('click', () => {
    window.MapEngine.fitAllBuses(state.buses);
  });

  // Manual refresh button
  btnRefresh.addEventListener('click', async () => {
    btnRefresh.textContent = '⏳ Refreshing...';
    await refreshBuses();
    setTimeout(() => {
      btnRefresh.textContent = '🔄 Refresh';
    }, 400);
  });
}

/**
 * Real-time clock in header
 */
function startClock() {
  function tick() {
    const now = new Date();
    liveClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick();
  setInterval(tick, 1000);
}

// Start app on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
