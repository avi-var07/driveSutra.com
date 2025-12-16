import api from './api';

// Get dashboard stats
export async function getDashboardStats() {
  const res = await api.get('/users/dashboard');
  return res.data;
}

// Get user profile
export async function getUserProfile() {
  const res = await api.get('/users/profile');
  return res.data;
}

// Update user profile
export async function updateUserProfile(profileData) {
  const res = await api.put('/users/profile', profileData);
  return res.data;
}

// Get user statistics
export async function getUserStats() {
  const res = await api.get('/users/stats');
  return res.data;
}

// Get leaderboard
export async function getLeaderboard(type = 'xp', limit = 10) {
  const res = await api.get('/users/leaderboard', {
    params: { type, limit }
  });
  return res.data;
}

// Trigger achievement check
export async function checkAchievements() {
  const res = await api.post('/users/check-achievements');
  return res.data;
}

export const userService = {
  getDashboardStats,
  getUserProfile,
  updateUserProfile,
  getUserStats,
  getLeaderboard,
  checkAchievements
};

export default userService;