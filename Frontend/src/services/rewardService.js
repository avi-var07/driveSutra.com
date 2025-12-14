import api from './api';

// Get available rewards
export async function getAvailableRewards() {
  const res = await api.get('/rewards');
  return res.data;
}

// Redeem a reward
export async function redeemReward(rewardId) {
  const res = await api.post(`/rewards/${rewardId}/redeem`);
  return res.data;
}

// Get user's redeemed rewards
export async function getUserRewards(params = {}) {
  const res = await api.get('/rewards/my-rewards', { params });
  return res.data;
}

// Mark reward as used
export async function markRewardAsUsed(userRewardId, usageNotes = '') {
  const res = await api.post(`/rewards/my-rewards/${userRewardId}/use`, { usageNotes });
  return res.data;
}

// Get leaderboard
export async function getLeaderboard(type = 'ecoScore', limit = 20) {
  const res = await api.get('/rewards/leaderboard', {
    params: { type, limit }
  });
  return res.data;
}

export default {
  getAvailableRewards,
  redeemReward,
  getUserRewards,
  markRewardAsUsed,
  getLeaderboard
};