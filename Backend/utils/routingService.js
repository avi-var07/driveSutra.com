// OpenRouteService routing helper (ESM)
// Uses ORS API with fallback to OSRM for reliability

const ORS_BASE = 'https://api.openrouteservice.org/v2/directions';

// Profile speeds (km/h) for calculating different durations per mode
const SPEED_PROFILES = {
  'foot-walking': 5,      // Walking: 5 km/h
  'cycling-regular': 15,  // Cycling: 15 km/h
  'driving-car': 50       // Driving: 50 km/h average
};

// Calculate straight-line distance and estimate route
function calculateStraightLineRoute(startLngLat, endLngLat, profile = 'driving-car') {
  try {
    console.log(`[FALLBACK] Using straight-line calculation for profile: ${profile}`);
    
    // Calculate straight-line distance using Haversine formula
    const R = 6371; // Earth's radius in km
    const lat1 = startLngLat[1] * Math.PI / 180;
    const lat2 = endLngLat[1] * Math.PI / 180;
    const deltaLat = (endLngLat[1] - startLngLat[1]) * Math.PI / 180;
    const deltaLng = (endLngLat[0] - startLngLat[0]) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const straightDistance = R * c;
    
    // Apply route factor (roads are not straight lines)
    const routeFactors = {
      'foot-walking': 1.2,    // 20% longer for pedestrian paths
      'cycling-regular': 1.3, // 30% longer for bike routes
      'driving-car': 1.4      // 40% longer for road routes
    };
    
    const routeFactor = routeFactors[profile] || 1.4;
    const distance = straightDistance * routeFactor;
    
    // Calculate duration based on profile speed
    const profileSpeed = SPEED_PROFILES[profile] || 50;
    const durationMinutes = (distance / profileSpeed) * 60;
    
    console.log(`[FALLBACK] Success: Distance=${distance.toFixed(2)}km, Duration=${durationMinutes.toFixed(1)}min`);
    
    return {
      distanceKm: distance,
      durationMinutes: durationMinutes,
      geometry: null, // No geometry for fallback
      raw: { fallback: true, straightDistance, routeFactor },
      source: 'FALLBACK'
    };
  } catch (err) {
    console.error(`[FALLBACK] Calculation failed:`, err.message);
    throw err;
  }
}

// OSRM fallback routing with timeout and retry
async function getRouteOSRM(startLngLat, endLngLat, profile = 'driving-car') {
  const osrmProfile = profile.includes('cycling') ? 'cycling' : profile.includes('foot') ? 'foot' : 'driving';
  
  try {
    console.log(`[OSRM] Fallback routing for profile: ${profile}`);
    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${startLngLat[0]},${startLngLat[1]};${endLngLat[0]},${endLngLat[1]}?overview=false`;
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const res = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'EcoDrive-App/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
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
    // If OSRM fails, use straight-line calculation
    return calculateStraightLineRoute(startLngLat, endLngLat, profile);
  }
}

export async function getRouteORS(startLngLat, endLngLat, profile = 'driving-car') {
  const apiKey = process.env.ORS_API_KEY;

  // Try ORS first if key is available and valid
  if (apiKey && apiKey.trim().length > 10 && !apiKey.includes('your_')) {
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

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
          'User-Agent': 'EcoDrive-App/1.0'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`[ORS] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[ORS] API error ${response.status}: ${errorText.substring(0, 200)}`);
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
      console.warn(`[ORS] Route failed: ${err.message}, trying fallback...`);
      // Fall through to fallback
    }
  } else {
    console.log(`[ORS] No valid API key configured, using fallback routing`);
  }

  // Use OSRM as fallback, with straight-line calculation as final fallback
  return getRouteOSRM(startLngLat, endLngLat, profile);
}
