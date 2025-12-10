import api from './api';

export async function getRoute({ start, end, mode }) {
  // start/end can be { lat, lng } or [lat, lng]
  const res = await api.post('/trips/route', { start, end, mode });
  return res.data;
}

export default { getRoute };
