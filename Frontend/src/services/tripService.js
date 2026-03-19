import api from './api';
import { mapService } from './mapService';
import publicTransportService from './publicTransportService';

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
// Modes shown are filtered by distance and city type for practical suggestions
export async function getRouteOptions(startLocation, endLocation) {
  try {
    // Calculate straight-line distance for mode filtering
    const straightDist = calculateDistance(
      startLocation.lat, startLocation.lng,
      endLocation.lat, endLocation.lng
    );

    // Detect metro city for transit sub-modes
    const cityInfo = publicTransportService.detectMetroCity(startLocation.lat, startLocation.lng);

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

    // --- WALK: only for distances ≤ 3 km ---
    if (walkingRoute.status === 'fulfilled') {
      const route = walkingRoute.value;
      const distKm = route.distance / 1000;
      if (distKm <= 3) {
        options.push({
          mode: 'WALK',
          distanceKm: distKm,
          durationMinutes: route.duration / 60,
          ecoLabel: 'Carbon Neutral',
          estimatedEcoScore: 95,
          icon: '🚶',
          geometry: route.geometry,
          color: '#4CAF50',
          bookable: false
        });
      }
    }

    // --- CYCLE: only for distances ≤ 15 km ---
    if (cyclingRoute.status === 'fulfilled') {
      const route = cyclingRoute.value;
      const distKm = route.distance / 1000;
      if (distKm <= 15) {
        options.push({
          mode: 'CYCLE',
          distanceKm: distKm,
          durationMinutes: route.duration / 60,
          ecoLabel: 'Zero Emission',
          estimatedEcoScore: 90,
          icon: '🚴',
          geometry: route.geometry,
          color: '#2196F3',
          bookable: false
        });
      }
    }

    // --- PUBLIC TRANSPORT: always shown ---
    if (drivingRoute.status === 'fulfilled') {
      const driveDist = drivingRoute.value.distance / 1000;

      // If in a metro city + distance is reasonable for metro (<30km), show METRO option
      if (cityInfo.hasMetro && straightDist <= 30) {
        options.push({
          mode: 'PUBLIC',
          subMode: 'METRO',
          distanceKm: driveDist * 1.05,
          durationMinutes: (driveDist / 30) * 60 + 8, // metro average ~30 km/h + wait
          ecoLabel: 'Metro Rail',
          estimatedEcoScore: 92,
          icon: '🚇',
          geometry: drivingRoute.value.geometry,
          color: '#1565C0',
          metroCity: cityInfo.city,
          metroCityKey: cityInfo.key,
          bookable: true
        });
      }

      // BUS option: always available for distances > 2km
      if (straightDist > 2) {
        options.push({
          mode: 'PUBLIC',
          subMode: 'BUS',
          distanceKm: driveDist * 1.15,
          durationMinutes: (driveDist / 15) * 60 + 12, // bus ~15 km/h + wait
          ecoLabel: 'City Bus',
          estimatedEcoScore: 85,
          icon: '🚌',
          geometry: drivingRoute.value.geometry,
          color: '#7B1FA2',
          bookable: true
        });
      }
    }

    // --- TRAIN: for distances > 50 km ---
    if (straightDist > 50 && drivingRoute.status === 'fulfilled') {
      const driveDist = drivingRoute.value.distance / 1000;
      options.push({
        mode: 'PUBLIC',
        subMode: 'TRAIN',
        distanceKm: driveDist * 0.95, // trains often take more direct routes
        durationMinutes: (driveDist / 60) * 60 + 30, // train ~60 km/h avg + boarding
        ecoLabel: 'Railway',
        estimatedEcoScore: 88,
        icon: '🚆',
        geometry: drivingRoute.value.geometry,
        color: '#E65100',
        bookable: true
      });
    }

    // --- CAR: always available ---
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
        color: '#FF9800',
        bookable: false
      });
    }

    return {
      success: true,
      options,
      weather,
      startLocation,
      endLocation,
      cityInfo
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

// Pause an active trip
export async function pauseTrip(tripId) {
  const res = await api.post(`/trips/${tripId}/pause`);
  return res.data;
}

// Resume a paused trip
export async function resumeTrip(tripId) {
  const res = await api.post(`/trips/${tripId}/resume`);
  return res.data;
}

// Cancel a trip
export async function cancelTrip(tripId) {
  const res = await api.post(`/trips/${tripId}/cancel`);
  return res.data;
}

export const tripService = {
  getRouteOptions,
  createTrip,
  startTrip,
  updateTripLocation,
  completeTrip,
  getUserTrips,
  getTripDetails,
  pauseTrip,
  resumeTrip,
  cancelTrip
};

export default tripService;
