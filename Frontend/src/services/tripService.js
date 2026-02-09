import api from './api';
import { mapService } from './mapService';

// Helper to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get route options for all transport modes (Client-side implementation)
export async function getRouteOptions(startLocation, endLocation) {
  try {
    // Parallel fetch for different modes
    const [drivingRoute, cyclingRoute, walkingRoute] = await Promise.allSettled([
      mapService.getRoute(startLocation, endLocation, 'driving'),
      mapService.getRoute(startLocation, endLocation, 'cycling'),
      mapService.getRoute(startLocation, endLocation, 'walking')
    ]);

    const options = [];

    // Mock Weather Data (since we want free implementation without keys)
    const weather = {
      condition: 'clear',
      temp: 24,
      description: 'Sunny'
    };

    // 1. CAR
    if (drivingRoute.status === 'fulfilled') {
      const route = drivingRoute.value;
      const distKm = route.distance / 1000;
      const durationMin = route.duration / 60;

      options.push({
        mode: 'CAR',
        distanceKm: distKm,
        durationMinutes: durationMin,
        ecoLabel: 'Drive Smart',
        estimatedEcoScore: 65,
        icon: '🚗',
        speedSuggestion: {
          min: 40,
          optimal: 60,
          max: 80,
          ecoTip: 'Maintain steady speed to save fuel'
        },
        geometry: route.geometry,
        color: '#FF9800'
      });
    }

    // 2. CYCLE
    if (cyclingRoute.status === 'fulfilled') {
      const route = cyclingRoute.value;
      const distKm = route.distance / 1000;
      if (distKm < 20) { // Limit cycling suggestions to 20km
        options.push({
          mode: 'CYCLE',
          distanceKm: distKm,
          durationMinutes: route.duration / 60,
          ecoLabel: 'Zero Emission',
          estimatedEcoScore: 90,
          icon: '🚴',
          geometry: route.geometry,
          color: '#2196F3'
        });
      }
    }

    // 3. WALK
    if (walkingRoute.status === 'fulfilled') {
      const route = walkingRoute.value;
      const distKm = route.distance / 1000;
      if (distKm < 7) { // Limit walking to 7km
        options.push({
          mode: 'WALK',
          distanceKm: distKm,
          durationMinutes: route.duration / 60,
          ecoLabel: 'Carbon Neutral',
          estimatedEcoScore: 95,
          icon: '🚶',
          geometry: route.geometry,
          color: '#4CAF50'
        });
      }
    }

    // 4. PUBLIC TRANSPORT (Estimated)
    // We don't have a free global transit routing API easily available without keys.
    // So we estimate based on driving distance.
    if (drivingRoute.status === 'fulfilled') {
      const driveDist = drivingRoute.value.distance / 1000;
      options.push({
        mode: 'PUBLIC',
        distanceKm: driveDist * 1.1, // slightly longer route usually
        durationMinutes: (driveDist / 20) * 60 + 10, // assumes 20km/h avg speed + wait time
        ecoLabel: 'Eco-Friendly',
        estimatedEcoScore: 85,
        icon: '🚌',
        // Create a straight line geometry or reuse driving geometry with different style
        // Reusing driving geometry is better than nothing for viz
        geometry: drivingRoute.value.geometry,
        color: '#9C27B0'
      });
    }

    return {
      success: true,
      options,
      weather,
      startLocation,
      endLocation
    };

  } catch (error) {
    console.error("Error calculating routes locally:", error);
    throw error;
  }
}

// Create a new trip (planning phase)
export async function createTrip(tripData) {
  const res = await api.post('/trips', tripData);
  return res.data;
}

// Start a trip
export async function startTrip(tripId, enableTracking = true) {
  const res = await api.post(`/trips/${tripId}/start`, { enableTracking });
  return res.data;
}

// Update trip location (real-time tracking)
export async function updateTripLocation(tripId, locationData) {
  const res = await api.post(`/trips/${tripId}/location`, locationData);
  return res.data;
}

// Complete a trip with verification data
export async function completeTrip(tripId, completionData) {
  const res = await api.post(`/trips/${tripId}/complete`, completionData);
  return res.data;
}

// Get user's trip history
export async function getUserTrips(params = {}) {
  const res = await api.get('/trips', { params });
  return res.data;
}

// Get trip details
export async function getTripDetails(tripId) {
  const res = await api.get(`/trips/${tripId}`);
  return res.data;
}

export const tripService = {
  getRouteOptions,
  createTrip,
  startTrip,
  updateTripLocation,
  completeTrip,
  getUserTrips,
  getTripDetails
};

export default tripService;
