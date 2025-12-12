import express from 'express';
import userController from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Dashboard and profile routes (protected)
router.get('/dashboard', protect, userController.getDashboardStats);
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);
router.get('/stats', protect, userController.getUserStats);

// Leaderboard (public, but shows more info if authenticated)
router.get('/leaderboard', userController.getLeaderboard);

// Achievement check (protected)
router.post('/check-achievements', protect, userController.triggerAchievementCheck);

export default router;