import express from 'express';
import achievementController from '../controllers/achievementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all achievements with unlock status (public, but shows unlock status if authenticated)
router.get('/', achievementController.getAchievements);

export default router;