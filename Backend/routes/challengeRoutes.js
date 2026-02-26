import express from 'express';
import challengeController from '../controllers/challengeController.js';
import { protect, protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get active challenges (public, but shows progress if authenticated)
router.get('/', challengeController.getActiveChallenges);

// Challenge participation (protected)
router.post('/:challengeId/join', protect, challengeController.joinChallenge);
router.get('/my-progress', protect, challengeController.getUserChallengeProgress);

// Admin routes (protected with admin middleware)
router.post('/create', protectAdmin, challengeController.createChallenge);

export default router;