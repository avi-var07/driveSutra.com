import api from './api';

// Get all achievements with user's unlock status
export async function getAchievements() {
  const res = await api.get('/achievements');
  return res.data;
}

export default {
  getAchievements
};