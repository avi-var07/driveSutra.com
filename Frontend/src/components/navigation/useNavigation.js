import {useEffect, useRef} from 'react';
import L from 'leaflet';
import {fetchRoute} from '../../services/osrmService';

// Haversine distance in meters
function haversine([lat1, lon1], [lat2, lon2]) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Find nearest point index on polyline and distance to it (meters)
function nearestPointIndex(coords, point) {
  let minDist = Infinity;
  let minIdx = 0;
  for (let i = 0; i < coords.length; i++) {
    const c = coords[i];
    const d = haversine([c[1], c[0]], [point.lat, point.lng]);
    if (d < minDist) {
      minDist = d;
      minIdx = i;
    }
  }
  return {index: minIdx, distance: minDist};
}

export default function useNavigation({mapRef, containerRef, start, end, profile = 'driving', following = true, onStartChange, onEndChange, onStateChange}) {
  const markerRef = useRef(null);
  const watchIdRef = useRef(null);
  const routeRef = useRef(null);
  const altRoutesRef = useRef([]);
  const lastPosRef = useRef(null);
  const speedsRef = useRef([]); // [{t, speed_m_s}]
  const etaSmoothedRef = useRef(null);

  useEffect(() => {
    let map = mapRef.current;
    // Initialize map here if not already created
    if (!map && containerRef.current) {
      map = L.map(containerRef.current, { center: [0,0], zoom: 15 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      mapRef.current = map;
    }
    if (!map) return;

    // click to set destination
    function onMapClick(e) {
      const latlng = e.latlng;
      onEndChange({lat: latlng.lat, lng: latlng.lng});
    }

    containerRef.current && map && map.on('click', onMapClick);

    return () => {
      containerRef.current && map && map.off('click', onMapClick);
    };
  }, [mapRef.current, containerRef.current]);

  // Initialize geolocation watch
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    // start watching with slightly more forgiving options to reduce timeouts
    const options = { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 };
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(onPosition, onPositionError, options);
    } catch (e) {
      console.warn('watchPosition failed to start', e);
    }

    function onPositionError(err) {
      console.warn('Geolocation error', err);
    }

    function onPosition(pos) {
      const {latitude, longitude, speed} = pos.coords;
      const cur = {lat: latitude, lng: longitude, timestamp: pos.timestamp};
      handlePosition(cur);
    }

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // react to start/end changes -> fetch route
  useEffect(() => {
    if (!start && !end) return;
    // prefer explicit start; otherwise use last known position
    const s = start;
    const e = end;
    if (!s || !e) return;

    (async () => {
      const route = await fetchRoute(s, e, profile);
      if (!route) return;
      drawRoute(route);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end]);

  function drawRoute(route) {
    const map = mapRef.current;
    if (!map) return;
    // clear previous
    if (routeRef.current) {
      map.removeLayer(routeRef.current);
      routeRef.current = null;
    }
    altRoutesRef.current.forEach(r => map.removeLayer(r));
    altRoutesRef.current = [];

    const best = route.routes[0];
    const coords = best.geometry.coordinates; // [lon, lat]
    const latlngs = coords.map(c => [c[1], c[0]]);

    routeRef.current = L.polyline(latlngs, {color: 'blue', weight: 6, opacity: 0.9}).addTo(map);

    // draw alternatives
    for (let i = 1; i < route.routes.length; i++) {
      const r = route.routes[i];
      const ll = r.geometry.coordinates.map(c => [c[1], c[0]]);
      const p = L.polyline(ll, {color: 'gray', weight: 5, opacity: 0.6}).addTo(map);
      altRoutesRef.current.push(p);
    }

    // zoom to route
    map.fitBounds(routeRef.current.getBounds(), {padding: [50, 50]});

    // store route on object for calculations
    routeRef.current.routeData = {
      coords,
      distance: best.distance, // meters
      duration: best.duration,
      steps: best.legs.flatMap(leg => leg.steps.map(s => ({maneuver: s.maneuver, name: s.name, distance: s.distance, geometry: s.geometry})))
    };

    if (onStateChange) onStateChange({totalDistance: best.distance, steps: routeRef.current.routeData.steps});
  }

  function handlePosition(cur) {
    const map = mapRef.current;
    if (!map) return;

    // set start if not set
    if (!start) {
      onStartChange && onStartChange({lat: cur.lat, lng: cur.lng});
    }

    // create marker if needed
    if (!markerRef.current) {
      markerRef.current = L.circleMarker([cur.lat, cur.lng], {radius: 8, color: '#0b84ff', fillColor: '#0b84ff', fillOpacity: 1}).addTo(map);
      // gentle shadow/accuracy
      L.circle([cur.lat, cur.lng], {radius: 8, color: 'rgba(11,132,255,0.2)', fillOpacity: 0}).addTo(map);
      map.setView([cur.lat, cur.lng], 16);
    } else {
      // smooth move
      markerRef.current.setLatLng([cur.lat, cur.lng]);
      // auto-pan while navigation active
      map.panTo([cur.lat, cur.lng], {animate: true});
    }

    // speed calculation (m/s)
    if (lastPosRef.current) {
      const last = lastPosRef.current;
      const dt = (cur.timestamp - last.timestamp) / 1000; // seconds
      if (dt > 0) {
        const d = haversine([last.lat, last.lng], [cur.lat, cur.lng]);
        const speed_m_s = d / dt;
        const now = Date.now();
        speedsRef.current.push({t: now, speed_m_s});
        // keep only last 120s
        const cutoff = now - 120000;
        speedsRef.current = speedsRef.current.filter(s => s.t >= cutoff);
      }
    }

    // compute stats
    const speeds = speedsRef.current.map(s => s.speed_m_s);
    const avg_m_s = speeds.length ? speeds.reduce((a,b)=>a+b,0)/speeds.length : 0;
    const currentSpeedKph = (speeds.length ? speeds[speeds.length-1] : 0) * 3.6;
    const avgSpeedKph = avg_m_s * 3.6;

    // route progress
    let total = 0, covered = 0, remaining = 0, steps = [];
    if (routeRef.current && routeRef.current.routeData) {
      const coords = routeRef.current.routeData.coords; // [lon, lat]
      total = routeRef.current.routeData.distance;
      const nearest = nearestPointIndex(coords, {lat: cur.lat, lng: cur.lng});
      // approximate covered by summing consecutive distances up to nearest.index
      let cov = 0;
      for (let i = 1; i <= nearest.index; i++) {
        const a = coords[i-1];
        const b = coords[i];
        cov += haversine([a[1], a[0]], [b[1], b[0]]);
      }
      // add partial from nearest coord to current
      cov += nearest.distance;
      covered = cov;
      remaining = Math.max(0, total - covered);

      // off-route detection
      if (nearest.distance > 30) {
        // re-route from current position if deviated significantly
        if (start && end) {
          fetchRoute({lat: cur.lat, lng: cur.lng}, end).then(route => {
            if (route) drawRoute(route);
          }).catch(()=>{});
        }
      }

      steps = routeRef.current.routeData.steps || [];
    }

    // ETA smoothing
    let etaMin = null;
    if (avg_m_s > 0) {
      const etaSec = remaining / avg_m_s;
      const eta = etaSec / 60;
      // exponential smoothing
      if (etaSmoothedRef.current == null) etaSmoothedRef.current = eta;
      else etaSmoothedRef.current = 0.85 * etaSmoothedRef.current + 0.15 * eta;
      etaMin = etaSmoothedRef.current;
    }

    // compute current step index (nearest step maneuver)
    let currentStepIndex = 0;
    if (steps.length) {
      let bestIdx = 0, bestD = Infinity;
      steps.forEach((s, i) => {
        // steps store geometry as polyline coords (if available)
        // approximate by step geometry start
        const g = s.geometry;
        if (g && g.coordinates && g.coordinates.length) {
          const c = g.coordinates[0];
          const d = haversine([c[1], c[0]], [cur.lat, cur.lng]);
          if (d < bestD) {bestD = d; bestIdx = i;}
        }
      });
      currentStepIndex = bestIdx;
    }

    // update covered/remaining polylines visual: draw covered in green, remaining in blue
    if (routeRef.current && routeRef.current.routeData) {
      const coords = routeRef.current.routeData.coords.map(c => [c[1], c[0]]);
      const nearest = nearestPointIndex(routeRef.current.routeData.coords, {lat: cur.lat, lng: cur.lng});
      const splitIdx = nearest.index;
      // remove existing layers if present
      if (routeRef.current.coveredLayer) map.removeLayer(routeRef.current.coveredLayer);
      if (routeRef.current.remainingLayer) map.removeLayer(routeRef.current.remainingLayer);

      const coveredCoords = coords.slice(0, splitIdx+1).concat([[cur.lat, cur.lng]]);
      const remainingCoords = [[cur.lat, cur.lng]].concat(coords.slice(splitIdx+1));
      routeRef.current.coveredLayer = L.polyline(coveredCoords, {color: 'green', weight: 6, opacity: 0.9}).addTo(map);
      routeRef.current.remainingLayer = L.polyline(remainingCoords, {color: 'blue', weight: 6, opacity: 0.6}).addTo(map);
    }

    // callback state
    const state = {
      currentPos: cur,
      currentSpeedKph: Number(currentSpeedKph.toFixed(2)),
      avgSpeedKph: Number(avgSpeedKph.toFixed(2)),
      totalDistance: Number(total.toFixed(1)),
      coveredDistance: Number(covered.toFixed(1)),
      remainingDistance: Number(remaining.toFixed(1)),
      etaMinutes: etaMin ? Number(etaMin.toFixed(1)) : null,
      steps,
      currentStepIndex,
    };

    onStateChange && onStateChange(state);

    lastPosRef.current = cur;
  }

  return {}; // no UI return; hook controls map
}
