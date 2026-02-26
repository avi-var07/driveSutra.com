import express from 'express';
import partnerMerchantController from '../controllers/partnerMerchantController.js';
import { protect, protectAdmin, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (with optional auth for eligibility check)
router.get('/', optionalAuth, partnerMerchantController.getPartnerOffers);
router.get('/:id', optionalAuth, partnerMerchantController.getPartnerOffer);

// Protected user routes
router.post('/:id/redeem', protect, partnerMerchantController.redeemPartnerOffer);
router.get('/user/my-offers', protect, partnerMerchantController.getUserPartnerOffers);

// Admin routes
router.post('/admin/create', protectAdmin, partnerMerchantController.createPartnerOffer);
router.put('/admin/:id', protectAdmin, partnerMerchantController.updatePartnerOffer);

export default router;
