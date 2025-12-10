import express from 'express';
import tripController from '../controllers/tripController.js';

const router = express.Router();

// POST /api/trips/route
router.post('/route', tripController.getRoute);

export default router;
