import express from 'express';
import tripController from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get route options for all transport modes
router.post('/route-options', tripController.getRouteOptions);

// Trip management (all protected)
router.post('/', protect, tripController.createTrip);
router.post('/:tripId/start', protect, tripController.startTrip);
router.post('/:tripId/complete', protect, tripController.completeTrip);
router.get('/', protect, tripController.getUserTrips);
router.get('/:tripId', protect, tripController.getTripDetails);

export default router;
