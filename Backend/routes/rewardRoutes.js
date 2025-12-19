import express from 'express';
import rewardController from '../controllers/rewardController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get available rewards (public, but shows eligibility if authenticated)
router.get('/', optionalAuth, rewardController.getAvailableRewards);

// Get leaderboard (public, but shows user rank if authenticated)
router.get('/leaderboard', optionalAuth, rewardController.getLeaderboard);

// Reward redemption and management (protected)
router.post('/:rewardId/redeem', protect, rewardController.redeemReward);
router.get('/my-rewards', protect, rewardController.getUserRewards);
router.post('/my-rewards/:userRewardId/use', protect, rewardController.markRewardAsUsed);

export default router;