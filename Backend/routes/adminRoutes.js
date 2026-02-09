import express from 'express';
import { protectAdmin } from '../middleware/authMiddleware.js';
import {
  adminLogin,
  getPendingVerifications,
  getPendingTrips,
  approveTripVerification,
  rejectTripVerification,
  getAdminDashboard
} from '../controllers/adminController.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected admin routes
router.get('/dashboard', protectAdmin, getAdminDashboard);
router.get('/verifications/pending', protectAdmin, getPendingVerifications);
router.get('/trips/pending', protectAdmin, getPendingTrips);
router.post('/trips/:tripId/approve', protectAdmin, approveTripVerification);
router.post('/trips/:tripId/reject', protectAdmin, rejectTripVerification);

export default router;
