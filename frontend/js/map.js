/**
 * CampusBus AI - Leaflet & OpenStreetMap Layer
 * Zero-cost map engine for rendering campus, routes, stops, and live bus positions.
 */

let mapInstance = null;
let campusMarker = null;
const routePolylines = {};
const stopMarkersGroup = L.layerGroup();
const busMarkers = {}; // busId -> L.marker

/**
 * Initialize Leaflet Map
 */
function initMap(campus) {
  // Center around Chennai / Campus
  const defaultCenter = [campus.lat || 13.0109, campus.lng || 80.2354];
  
  mapInstance = L.map('map', {
    center: defaultCenter,
    zoom: 12,
    zoomControl: true,
  });

  // OpenStreetMap Tile Layer (Free, Open-Source, No API Key needed)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapInstance);

  stopMarkersGroup.addTo(mapInstance);

  // Add Campus Destination Marker
  const campusIcon = L.divIcon({
    className: 'custom-campus-marker',
    html: `<div style="background:#dc2626; color:#fff; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; font-size:18px; border:3px solid #fff; box-shadow:0 2px 10px rgba(0,0,0,0.3);">🏛️</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  campusMarker = L.marker([campus.lat, campus.lng], { icon: campusIcon })
    .addTo(mapInstance)
    .bindPopup(`<b>${campus.name}</b><br>College Main Terminal`);
}

/**
 * Draw route lines and stop circles on the map
 */
function renderRoutesOnMap(routes) {
  stopMarkersGroup.clearLayers();

  routes.forEach(route => {
    const latLngs = route.stops.map(stop => [stop.lat, stop.lng]);

    // Draw route path line
    const polyline = L.polyline(latLngs, {
      color: route.color || '#2563eb',
      weight: 4,
      opacity: 0.75,
      dashArray: '8, 8'
    }).addTo(mapInstance);

    routePolylines[route.id] = polyline;

    // Add Stop markers along the route
    route.stops.forEach((stop, index) => {
      const isFirst = index === 0;
      const isLast = index === route.stops.length - 1;

      const stopCircle = L.circleMarker([stop.lat, stop.lng], {
        radius: isFirst || isLast ? 7 : 5,
        fillColor: isLast ? '#dc2626' : (isFirst ? route.color : '#ffffff'),
        color: route.color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).bindPopup(`
        <div style="font-family:Inter,sans-serif; font-size:12px;">
          <b>${stop.name}</b><br>
          <span style="color:#64748b;">${route.route_number} • Stop #${stop.order}</span><br>
          <span style="color:#16a34a; font-weight:600;">Scheduled: ${stop.scheduled_time}</span>
        </div>
      `);

      stopMarkersGroup.addLayer(stopCircle);
    });
  });
}

/**
 * Create or update live markers for all buses
 */
function updateBusMarkers(buses) {
  buses.forEach(bus => {
    const latLng = [bus.current_lat, bus.current_lng];

    // Status class
    const statusClass = bus.status === 'delayed' ? 'delayed' : (bus.status === 'signal_lost' ? 'signal_lost' : 'on_time');

    // Custom HTML marker for the bus showing its bus number
    const customIcon = L.divIcon({
      className: 'custom-bus-marker',
      html: `
        <div class="bus-pin ${statusClass}">
          <span>🚌</span>
          <span>Bus ${bus.bus_number}</span>
        </div>
      `,
      iconSize: [80, 30],
      iconAnchor: [40, 15]
    });

    if (busMarkers[bus.id]) {
      // Move existing marker smoothly
      busMarkers[bus.id].setLatLng(latLng);
      busMarkers[bus.id].setIcon(customIcon);
    } else {
      // Create new bus marker
      const marker = L.marker(latLng, { icon: customIcon })
        .addTo(mapInstance)
        .bindPopup(buildBusPopupContent(bus));

      // Click marker to focus
      marker.on('click', () => {
        window.selectBus(bus.id);
      });

      busMarkers[bus.id] = marker;
    }

    // Refresh popup content
    busMarkers[bus.id].setPopupContent(buildBusPopupContent(bus));
  });
}

/**
 * Builds clean HTML for bus popup
 */
function buildBusPopupContent(bus) {
  return `
    <div style="font-family:Inter,sans-serif; min-width:200px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <strong style="font-size:14px; color:#0f172a;">Bus #${bus.bus_number}</strong>
        <span style="font-size:11px; padding:2px 6px; border-radius:10px; background:#eff6ff; color:#2563eb; font-weight:600;">
          ${bus.status_label}
        </span>
      </div>
      <p style="font-size:12px; color:#334155; margin:3px 0;"><b>Route:</b> ${bus.route_name}</p>
      <p style="font-size:12px; color:#334155; margin:3px 0;"><b>Location:</b> ${bus.current_location_desc}</p>
      <p style="font-size:12px; color:#334155; margin:3px 0;"><b>Speed:</b> ${bus.speed_kmh} km/h</p>
      <p style="font-size:12px; color:#16a34a; font-weight:600; margin:4px 0;"><b>Next Stop:</b> ${bus.next_stop_name} (~${bus.eta_next_stop_mins}m)</p>
      <p style="font-size:11px; color:#64748b; margin-top:6px; border-top:1px solid #e2e8f0; padding-top:4px;">
        Driver: ${bus.driver_name} (${bus.driver_phone})
      </p>
    </div>
  `;
}

/**
 * Focus and zoom on a specific bus
 */
function focusOnBus(busId) {
  const marker = busMarkers[busId];
  if (marker && mapInstance) {
    mapInstance.flyTo(marker.getLatLng(), 15, { duration: 1.2 });
    marker.openPopup();
  }
}

/**
 * Center map on College Campus
 */
function centerCampus(campus) {
  if (mapInstance && campus) {
    mapInstance.flyTo([campus.lat, campus.lng], 14, { duration: 1.0 });
    if (campusMarker) campusMarker.openPopup();
  }
}

/**
 * Auto-fit bounds of all buses on map
 */
function fitAllBuses(buses) {
  if (!mapInstance || !buses || buses.length === 0) return;
  const latLngs = buses.map(b => [b.current_lat, b.current_lng]);
  const bounds = L.latLngBounds(latLngs);
  mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
}

// Export for app usage
window.MapEngine = {
  initMap,
  renderRoutesOnMap,
  updateBusMarkers,
  focusOnBus,
  centerCampus,
  fitAllBuses
};
