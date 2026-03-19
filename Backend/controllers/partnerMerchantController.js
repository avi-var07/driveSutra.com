import PartnerMerchant from '../models/PartnerMerchant.js';
import User from '../models/User.js';

/**
 * Get all partner offers
 */
export async function getPartnerOffers(req, res) {
  try {
    const userId = req.user?.id;
    const { category, sort = 'rating' } = req.query;

    let query = { isActive: true };
    if (category) query.category = category;

    const offers = await PartnerMerchant.find(query)
      .sort(sort === 'discount' ? { discountPercentage: -1 } : { rating: -1 });

    if (userId) {
      const user = await User.findById(userId);
      const offersWithEligibility = offers.map(offer => ({
        ...offer.toObject(),
        eligible: user.ecoScore >= (offer.minEcoScoreRequired || 0) && 
                  user.level >= (offer.minLevelRequired || 1)
      }));
      return res.json({ success: true, offers: offersWithEligibility });
    }

    res.json({ success: true, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get single partner offer
 */
export async function getPartnerOffer(req, res) {
  try {
    const { id } = req.params;

    const offer = await PartnerMerchant.findById(id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Increment view count
    offer.views = (offer.views || 0) + 1;
    await offer.save();

    res.json({ success: true, offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Redeem partner offer
 */
export async function redeemPartnerOffer(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId);
    const offer = await PartnerMerchant.findById(id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Check eligibility
    if (user.ecoScore < (offer.minEcoScoreRequired || 0)) {
      return res.status(400).json({ success: false, message: 'Insufficient eco score' });
    }

    if (user.level < (offer.minLevelRequired || 1)) {
      return res.status(400).json({ success: false, message: 'Insufficient level' });
    }

    // Generate discount code
    const discountCode = `${offer._id.toString().substr(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // Add to user's redeemed offers
    if (!user.redeemedOffers) user.redeemedOffers = [];
    user.redeemedOffers.push({
      offerId: offer._id,
      discountCode,
      redeemedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await user.save();

    // Update offer redemption count
    offer.totalRedemptions = (offer.totalRedemptions || 0) + 1;
    await offer.save();

    res.json({
      success: true,
      message: 'Offer redeemed successfully!',
      discountCode,
      offer: {
        name: offer.name,
        discountPercentage: offer.discountPercentage,
        code: discountCode
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get user's redeemed partner offers
 */
export async function getUserPartnerOffers(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId);

    if (!user || !user.redeemedOffers || user.redeemedOffers.length === 0) {
      return res.json({ success: true, offers: [] });
    }

    const offerIds = user.redeemedOffers.map(ro => ro.offerId);
    const offers = await PartnerMerchant.find({ _id: { $in: offerIds } });

    const userOffers = user.redeemedOffers.map(redemption => {
      const offer = offers.find(o => o._id.toString() === redemption.offerId.toString());
      return {
        ...offer.toObject(),
        discountCode: redemption.discountCode,
        redeemedAt: redemption.redeemedAt,
        expiresAt: redemption.expiresAt,
        expired: redemption.expiresAt < new Date()
      };
    }).filter(offer => !offer.expired);

    res.json({ success: true, offers: userOffers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Create partner offer (admin)
 */
export async function createPartnerOffer(req, res) {
  try {
    const {
      name,
      description,
      discountPercentage,
      category,
      location,
      minEcoScoreRequired,
      minLevelRequired,
      contactInfo
    } = req.body;

    if (!name || !discountPercentage) {
      return res.status(400).json({ success: false, message: 'Name and discount required' });
    }

    const offer = new PartnerMerchant({
      name,
      description,
      discountPercentage,
      category,
      location,
      minEcoScoreRequired: minEcoScoreRequired || 0,
      minLevelRequired: minLevelRequired || 1,
      contactInfo,
      isActive: true,
      rating: 4.5,
      views: 0,
      totalRedemptions: 0
    });

    await offer.save();

    res.json({
      success: true,
      message: 'Partner offer created successfully',
      offer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Update partner offer (admin)
 */
export async function updatePartnerOffer(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const offer = await PartnerMerchant.findByIdAndUpdate(id, updates, { new: true });

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({
      success: true,
      message: 'Offer updated successfully',
      offer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export default {
  getPartnerOffers,
  getPartnerOffer,
  redeemPartnerOffer,
  getUserPartnerOffers,
  createPartnerOffer,
  updatePartnerOffer
};
