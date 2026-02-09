import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  verifyTicket,
  verifyTransaction,
  getNearbyMetroStations
} from '../controllers/publicTransportController.js';

const router = express.Router();

// Verify ticket image
router.post('/verify-ticket', protect, verifyTicket);

// Verify transaction
router.post('/verify-transaction', protect, verifyTransaction);

// Get nearby metro stations
router.get('/metro-stations', getNearbyMetroStations);

export default router;
