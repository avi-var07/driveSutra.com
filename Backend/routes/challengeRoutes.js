import express from 'express';
import challengeController from '../controllers/challengeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get active challenges (public, but shows progress if authenticated)
router.get('/', challengeController.getActiveChallenges);

// Challenge participation (protected)
router.post('/:challengeId/join', protect, challengeController.joinChallenge);
router.get('/my-progress', protect, challengeController.getUserChallengeProgress);

// Admin routes (TODO: Add admin middleware)
router.post('/create', challengeController.createChallenge);

export default router;