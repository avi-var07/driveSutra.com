import express from 'express';
import tripController from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get route options for all transport modes
router.post('/route-options', tripController.getRouteOptions);

// Trip management (all protected)
router.post('/', protect, tripController.createTrip);
router.post('/:tripId/start', protect, tripController.startTrip);
router.post('/:tripId/location', protect, tripController.updateTripLocation);
router.post('/:tripId/pause', protect, tripController.pauseTrip);
router.post('/:tripId/resume', protect, tripController.resumeTrip);
router.post('/:tripId/cancel', protect, tripController.cancelTrip);
router.post('/:tripId/complete', protect, tripController.completeTrip);

// Selfie verification for CAR/BIKE trips
router.post('/:tripId/selfie', protect, async (req, res) => {
    try {
        const { tripId } = req.params;
        const { selfieImage } = req.body; // base64 image

        if (!selfieImage) {
            return res.status(400).json({ message: 'Selfie image required' });
        }

        const Trip = (await import('../models/Trip.js')).default;
        const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        if (trip.verification.selfieAttempts >= 2) {
            return res.status(400).json({ message: 'Maximum selfie attempts (2) reached' });
        }

        trip.verification.selfieUrls.push(selfieImage.substring(0, 500)); // Store truncated for demo
        trip.verification.selfieAttempts += 1;
        trip.verification.selfieRequired = false;
        await trip.save();

        return res.json({
            success: true,
            message: 'Selfie uploaded for verification',
            attemptsRemaining: 2 - trip.verification.selfieAttempts
        });
    } catch (err) {
        console.error('Selfie upload error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});

router.get('/', protect, tripController.getUserTrips);
router.get('/:tripId', protect, tripController.getTripDetails);

export default router;

