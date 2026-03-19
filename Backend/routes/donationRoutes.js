import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { donateForTrees, getDonationHistory, getTreePlantingWall } from '../controllers/donationController.js';

const router = express.Router();

// Donate credits for tree planting (protected)
router.post('/tree', protect, donateForTrees);

// Get user's donation history (protected)
router.get('/history', protect, getDonationHistory);

// Get public tree planting wall (public)
router.get('/wall', getTreePlantingWall);

export default router;
