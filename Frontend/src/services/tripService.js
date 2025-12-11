import api from './api';

export async function getRoute({ start, end, mode }) {
  // Map frontend mode to backend expected mode
  // frontend: PUBLIC, CYCLE, CAR
  let backendMode = 'DRIVE';
  if (mode === 'CYCLE') backendMode = 'CYCLE';
  else if (mode === 'PUBLIC') backendMode = 'WALK';
  else backendMode = 'DRIVE';
  const res = await api.post('/trips/route', { start, end, mode: backendMode });
  return res.data;
}

export async function createTrip(payload) {
  const res = await api.post('/trips', payload);
  return res.data;
}

export default { getRoute };
