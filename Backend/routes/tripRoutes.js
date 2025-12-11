import express from 'express';
import tripController from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/trips/route
router.post('/route', tripController.getRoute);

// Create/persist trip (protected)
router.post('/', protect, tripController.createTrip);

export default router;
