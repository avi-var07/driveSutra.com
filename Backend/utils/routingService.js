// OpenRouteService routing helper (ESM)
// Uses global fetch (Node 18+) and expects ORS API key in process.env.ORS_API_KEY

const ORS_BASE = 'https://api.openrouteservice.org/v2/directions';

// If ORS_API_KEY is not configured, fall back to OSRM public demo for simple routing (no API key).
async function getRouteOSRM(startLngLat, endLngLat, profile = 'driving', retries = 3) {
  const profiles = { 'driving-car': 'driving', 'cycling-regular': 'bike', 'foot-walking': 'foot' };
  // OSRM expects: profile/driving or cycling etc. we'll map driving-car -> driving, cycling-regular -> cycling, foot-walking -> foot
  const osrmProfile = profile.includes('cycling') ? 'cycling' : profile.includes('foot') ? 'foot' : 'driving';
  
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${startLngLat[0]},${startLngLat[1]};${endLngLat[0]},${endLngLat[1]}?overview=false`;
      const res = await fetch(url, { timeout: 10000 });
      
      if (!res.ok) {
        lastError = new Error(`OSRM error ${res.status}: ${res.statusText}`);
        if (attempt < retries) {
          console.warn(`OSRM attempt ${attempt} failed, retrying...`);
          await new Promise(r => setTimeout(r, 1000 * attempt)); // exponential backoff
          continue;
        }
        throw lastError;
      }
      
      const data = await res.json();
      const route = data?.routes?.[0];
      if (!route) throw new Error('No route returned from OSRM');
      
      return {
        distanceKm: (route.distance || 0) / 1000,
        durationMinutes: (route.duration || 0) / 60,
        geometry: route.geometry || null,
        raw: data
      };
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        console.warn(`OSRM attempt ${attempt}/${retries} failed: ${err.message}`);
        await new Promise(r => setTimeout(r, 1000 * attempt)); // exponential backoff
      }
    }
  }
  
  throw lastError || new Error('OSRM routing failed after multiple retries');
}

export async function getRouteORS(startLngLat, endLngLat, profile = 'driving-car') {
  // prefer ORS if key provided
  if (process.env.ORS_API_KEY) {
    try {
      const url = `${ORS_BASE}/${profile}`;
      const body = {
        coordinates: [
          [startLngLat[0], startLngLat[1]],
          [endLngLat[0], endLngLat[1]]
        ],
        units: 'km'
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.ORS_API_KEY
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const txt = await res.text();
        console.warn(`ORS API error ${res.status}, falling back to OSRM:`, txt);
        // Fall through to OSRM below
      } else {
        const data = await res.json();
        const feat = data?.features?.[0];
        if (!feat) throw new Error('No route returned from ORS');

        const summary = feat.properties?.summary || {};
        // ORS returns distance in km when units:'km', duration in seconds
        const distanceKm = typeof summary.distance === 'number' ? summary.distance : (summary.distance || 0);
        const durationMinutes = typeof summary.duration === 'number' ? summary.duration / 60 : (summary.duration || 0) / 60;

        return {
          distanceKm,
          durationMinutes,
          geometry: feat.geometry,
          raw: data
        };
      }
    } catch (err) {
      console.warn(`ORS API failed (${err.message}), falling back to OSRM...`);
      // Continue to OSRM fallback
    }
  }

  // fallback to OSRM public demo for development if ORS key missing or fails
  return getRouteOSRM(startLngLat, endLngLat, profile);
}
