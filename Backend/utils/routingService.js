// Enhanced routing service with OSRM and fallback
// Includes route colors, speed suggestions, and better geometry

// Profile speeds (km/h) for calculating different durations per mode
const SPEED_PROFILES = {
  'walking': 5,      // Walking: 5 km/h
  'biking': 15,      // Cycling: 15 km/h
  'driving': 50      // Driving: 50 km/h average
};

// Route colors for different transport modes
const ROUTE_COLORS = {
  'walking': '#4CAF50',    // Green for walking
  'biking': '#2196F3',     // Blue for cycling
  'driving': '#FF9800'     // Orange for driving
};

// Speed suggestions based on route and conditions
function calculateSpeedSuggestion(distanceKm, profile, weather = null) {
  const baseSpeed = SPEED_PROFILES[profile] || 50;
  
  if (profile === 'driving') {
    // Suggest optimal speed range for eco-driving
    const minSpeed = Math.max(30, baseSpeed - 15);
    const maxSpeed = Math.min(80, baseSpeed + 15);
    
    // Adjust for weather conditions
    let weatherAdjustment = 0;
    if (weather?.condition) {
      const weatherFactors = {
        'rain': -10,
        'snow': -15,
        'fog': -10,
        'storm': -20,
        'clear': 0,
        'cloudy': -5
      };
      weatherAdjustment = weatherFactors[weather.condition] || 0;
    }
    
    return {
      min: Math.max(25, minSpeed + weatherAdjustment),
      max: Math.max(35, maxSpeed + weatherAdjustment),
      optimal: Math.round((minSpeed + maxSpeed) / 2 + weatherAdjustment),
      ecoTip: weatherAdjustment < 0 ? 'Drive slower due to weather conditions' : 'Maintain steady speed for best fuel efficiency'
    };
  }
  
  return null; // No speed suggestions for walking/biking
}

// Calculate straight-line distance and estimate route
function calculateStraightLineRoute(startLngLat, endLngLat, profile = 'driving') {
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
      'walking': 1.2,    // 20% longer for pedestrian paths
      'biking': 1.3,     // 30% longer for bike routes
      'driving': 1.4     // 40% longer for road routes
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
      color: ROUTE_COLORS[profile] || '#666666',
      speedSuggestion: calculateSpeedSuggestion(distance, profile),
      raw: { fallback: true, straightDistance, routeFactor },
      source: 'FALLBACK'
    };
  } catch (err) {
    console.error(`[FALLBACK] Calculation failed:`, err.message);
    throw err;
  }
}

// Enhanced OSRM routing with geometry and colors
async function getRouteOSRM(startLngLat, endLngLat, profile = 'driving', weather = null) {
  const osrmProfile = profile.includes('biking') ? 'cycling' : profile.includes('walking') ? 'foot' : 'driving';
  
  try {
    console.log(`[OSRM] Enhanced routing for profile: ${profile}`);
    // Request full geometry for map display
    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${startLngLat[0]},${startLngLat[1]};${endLngLat[0]},${endLngLat[1]}?overview=full&geometries=geojson&steps=true`;
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
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
    const duration = (route.duration || 0) / 60; // convert to minutes
    
    console.log(`[OSRM] Success: Distance=${distance.toFixed(2)}km, Duration=${duration.toFixed(1)}min`);
    
    return {
      distanceKm: distance,
      durationMinutes: duration,
      geometry: route.geometry || null,
      color: ROUTE_COLORS[profile] || '#666666',
      speedSuggestion: calculateSpeedSuggestion(distance, profile, weather),
      steps: route.legs?.[0]?.steps || [],
      raw: data,
      source: 'OSRM'
    };
  } catch (err) {
    console.error(`[OSRM] Enhanced routing failed:`, err.message);
    // If OSRM fails, use straight-line calculation
    return calculateStraightLineRoute(startLngLat, endLngLat, profile);
  }
}

// Try Mappls first, then fallback to OSRM
export async function getRouteORS(startLngLat, endLngLat, profile = 'driving-car', weather = null) {
  const mapplsProfile = profile.replace('foot-', '').replace('-regular', '').replace('-car', '');
  const apiKey = process.env.MAPPLS_API_KEY;

  // Try Mappls first if key is available and valid
  if (apiKey && apiKey.trim().length > 10 && !apiKey.includes('your_') && !apiKey.includes('expired')) {
    try {
      console.log(`[MAPPLS] Attempting route for profile: ${mapplsProfile}`);
      
      // Mappls API call (keeping original structure for when key is renewed)
      const coordinates = `${startLngLat[0]},${startLngLat[1]};${endLngLat[0]},${endLngLat[1]}`;
      const url = `https://apis.mappls.com/advancedmaps/v1/${apiKey}/route_adv/driving/${coordinates}?rtype=0&region=ind&geometries=polyline`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'EcoDrive-App/1.0',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const route = data?.routes?.[0];
        
        if (route) {
          const distance = (route.distance || 0) / 1000;
          const duration = (route.duration || 0) / 60;
          
          console.log(`[MAPPLS] Success: Distance=${distance}km, Duration=${duration}min`);
          
          return {
            distanceKm: distance,
            durationMinutes: duration,
            geometry: route.geometry || null,
            color: ROUTE_COLORS[mapplsProfile] || '#666666',
            speedSuggestion: calculateSpeedSuggestion(distance, mapplsProfile, weather),
            raw: data,
            source: 'MAPPLS'
          };
        }
      }
      
      throw new Error(`Mappls API error ${response.status}`);
      
    } catch (err) {
      console.warn(`[MAPPLS] Failed (${err.message}), using OSRM...`);
    }
  }

  // Use enhanced OSRM as primary routing service
  return getRouteOSRM(startLngLat, endLngLat, mapplsProfile, weather);
}