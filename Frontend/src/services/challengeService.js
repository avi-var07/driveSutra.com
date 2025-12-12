import api from './api';

// Get all active challenges
export async function getActiveChallenges() {
  const res = await api.get('/challenges');
  return res.data;
}

// Join a challenge
export async function joinChallenge(challengeId) {
  const res = await api.post(`/challenges/${challengeId}/join`);
  return res.data;
}

// Get user's challenge progress
export async function getUserChallengeProgress() {
  const res = await api.get('/challenges/my-progress');
  return res.data;
}

// Create a new challenge (admin function)
export async function createChallenge(challengeData) {
  const res = await api.post('/challenges/create', challengeData);
  return res.data;
}

export default {
  getActiveChallenges,
  joinChallenge,
  getUserChallengeProgress,
  createChallenge
};