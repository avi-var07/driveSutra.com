import api from './api';

// Plant trees for a completed trip
export async function plantTreesForTrip(tripId) {
  const res = await api.post('/trees/plant', { tripId });
  return res.data;
}

// Get user's planted trees
export async function getUserTrees(params = {}) {
  const res = await api.get('/trees/user', { params });
  return res.data;
}

// Get tree certificate
export async function getTreeCertificate(treeId) {
  const res = await api.get(`/trees/certificate/${treeId}`);
  return res.data;
}

export const treePlantingService = {
  plantTreesForTrip,
  getUserTrees,
  getTreeCertificate
};

export default treePlantingService;
