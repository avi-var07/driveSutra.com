export async function fetchRoute(start, end, profile = 'driving') {
  try {
    const sLon = start.lng;
    const sLat = start.lat;
    const eLon = end.lng;
    const eLat = end.lat;
    const url = `https://router.project-osrm.org/route/v1/${profile}/${sLon},${sLat};${eLon},${eLat}?overview=full&geometries=geojson&steps=true&alternatives=true`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('OSRM fetch error', err);
    return null;
  }
}
