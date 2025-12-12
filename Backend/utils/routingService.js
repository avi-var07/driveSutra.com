// OpenRouteService routing helper (ESM)
// Uses ORS API with fallback to OSRM for reliability

const ORS_BASE = 'https://api.openrouteservice.org/v2/directions';

// Profile speeds (km/h) for calculating different durations per mode
const SPEED_PROFILES = {
  'foot-walking': 5,      // Walking: 5 km/h
  'cycling-regular': 15,  // Cycling: 15 km/h
  'driving-car': 50       // Driving: 50 km/h average
};

// OSRM fallback routing
async function getRouteOSRM(startLngLat, endLngLat, profile = 'driving-car') {
  const osrmProfile = profile.includes('cycling') ? 'cycling' : profile.includes('foot') ? 'foot' : 'driving';
  
  try {
    console.log(`[OSRM] Fallback routing for profile: ${profile}`);
    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${startLngLat[0]},${startLngLat[1]};${endLngLat[0]},${endLngLat[1]}?overview=false`;
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`OSRM error ${res.status}`);
    }
    
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route) throw new Error('No route returned from OSRM');
    
    const distance = (route.distance || 0) / 1000; // convert to km
    const profileSpeed = SPEED_PROFILES[profile] || 50;
    const durationMinutes = (distance / profileSpeed) * 60;
    
    console.log(`[OSRM] Success: Distance=${distance}km, Duration=${durationMinutes}min`);
    
    return {
      distanceKm: distance,
      durationMinutes: durationMinutes,
      geometry: route.geometry || null,
      raw: data,
      source: 'OSRM'
    };
  } catch (err) {
    console.error(`[OSRM] Fallback failed:`, err.message);
    throw err;
  }
}

export async function getRouteORS(startLngLat, endLngLat, profile = 'driving-car') {
  const apiKey = process.env.ORS_API_KEY;

  // Try ORS first if key is available
  if (apiKey && apiKey.trim().length > 0) {
    try {
      console.log(`[ORS] Requesting route for profile: ${profile}`);
      console.log(`[ORS] Start: ${startLngLat.join(',')}, End: ${endLngLat.join(',')}`);

      const url = `${ORS_BASE}/${profile}`;
      
      const body = {
        coordinates: [
          [startLngLat[0], startLngLat[1]],
          [endLngLat[0], endLngLat[1]]
        ],
        units: 'km',
        format: 'json'
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey
        },
        body: JSON.stringify(body)
      });

      console.log(`[ORS] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[ORS] API error ${response.status}: ${errorText.substring(0, 200)}`);
        console.log(`[ORS] Falling back to OSRM...`);
        throw new Error(`ORS API error ${response.status}`);
      }

      const data = await response.json();

      const route = data?.routes?.[0];
      if (!route) {
        throw new Error('No route in ORS response');
      }

      const summary = route?.summary || {};
      const distance = summary.distance || 0; // in km
      const profileSpeed = SPEED_PROFILES[profile] || 50;
      const durationMinutes = (distance / profileSpeed) * 60;

      console.log(`[ORS] Success: Distance=${distance}km, Duration=${durationMinutes}min for ${profile}`);

      return {
        distanceKm: distance,
        durationMinutes: durationMinutes,
        geometry: route.geometry || null,
        raw: data,
        source: 'ORS'
      };

    } catch (err) {
      console.warn(`[ORS] Route failed: ${err.message}, trying OSRM fallback...`);
      // Fall through to OSRM
    }
  } else {
    console.log(`[ORS] No API key configured, using OSRM fallback`);
  }

  // Use OSRM as fallback
  return getRouteOSRM(startLngLat, endLngLat, profile);
}
