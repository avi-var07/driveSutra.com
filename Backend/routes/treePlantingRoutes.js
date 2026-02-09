import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  plantTreesForTrip,
  getUserTrees,
  getTreeCertificate,
  updateTreeGrowth
} from '../controllers/treePlantingController.js';

const router = express.Router();

// Plant trees for a completed trip
router.post('/plant', protect, plantTreesForTrip);

// Get user's planted trees
router.get('/user', protect, getUserTrees);

// Get tree certificate
router.get('/certificate/:treeId', protect, getTreeCertificate);

// Update tree growth (admin)
router.put('/growth/:treeId', protect, updateTreeGrowth);

export default router;
