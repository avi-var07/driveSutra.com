import api from './api';

// Get route options for all transport modes
export async function getRouteOptions(startLocation, endLocation) {
  const res = await api.post('/trips/route-options', {
    startLocation,
    endLocation
  });
  return res.data;
}

// Create a new trip (planning phase)
export async function createTrip(tripData) {
  const res = await api.post('/trips', tripData);
  return res.data;
}

// Start a trip
export async function startTrip(tripId) {
  const res = await api.post(`/trips/${tripId}/start`);
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

export default {
  getRouteOptions,
  createTrip,
  startTrip,
  completeTrip,
  getUserTrips,
  getTripDetails
};
