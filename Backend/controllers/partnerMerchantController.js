import PartnerMerchant from '../models/PartnerMerchant.js';
import UserReward from '../models/UserReward.js';
import User from '../models/User.js';

// Get all active partner offers
export async function getPartnerOffers(req, res) {
  try {
    const { category, maxCost, minLevel, featured } = req.query;
    
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (maxCost) query.carbonCreditsCost = { $lte: parseInt(maxCost) };
    if (minLevel) query.minLevelRequired = { $lte: parseInt(minLevel) };
    if (featured === 'true') query.isFeatured = true;
    
    // Check stock availability
    query.$or = [
      { stockAvailable: -1 }, // Unlimited stock
      { stockAvailable: { $gt: 0 } } // Has stock
    ];
    
    // Check validity period
    const now = new Date();
    query.$and = [
      { validFrom: { $lte: now } },
      { $or: [
        { validUntil: { $exists: false } },
        { validUntil: null },
        { validUntil: { $gte: now } }
      ]}
    ];
    
    const offers = await PartnerMerchant.find(query)
      .sort({ isFeatured: -1, priority: -1, carbonCreditsCost: 1 })
      .lean();
    
    // If user is authenticated, check redemption eligibility
    if (req.user) {
      const user = await User.findById(req.user._id);
      const userRedemptions = await UserReward.find({ 
        user: req.user._id,
        rewardType: 'partner_offer'
      });
      
      for (const offer of offers) {
        const userRedemptionCount = userRedemptions.filter(
          r => r.rewardId === offer._id.toString()
        ).length;
        
        offer.canRedeem = (
          user.carbonCredits >= offer.carbonCreditsCost &&
          user.ecoScore >= offer.minEcoScoreRequired &&
          user.level >= offer.minLevelRequired &&
          userRedemptionCount < offer.maxRedemptionsPerUser
        );
        offer.userRedemptions = userRedemptionCount;
        offer.remainingRedemptions = offer.maxRedemptionsPerUser - userRedemptionCount;
      }
    }
    
    return res.json({
      success: true,
      offers,
      total: offers.length
    });
    
  } catch (error) {
    console.error('getPartnerOffers error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Get single partner offer
export async function getPartnerOffer(req, res) {
  try {
    const { id } = req.params;
    
    const offer = await PartnerMerchant.findById(id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    // Increment view count
    offer.views += 1;
    await offer.save();
    
    // Check user eligibility
    if (req.user) {
      const user = await User.findById(req.user._id);
      const userRedemptions = await UserReward.countDocuments({
        user: req.user._id,
        rewardId: id,
        rewardType: 'partner_offer'
      });
      
      offer._doc.canRedeem = (
        user.carbonCredits >= offer.carbonCreditsCost &&
        user.ecoScore >= offer.minEcoScoreRequired &&
        user.level >= offer.minLevelRequired &&
        userRedemptions < offer.maxRedemptionsPerUser
      );
      offer._doc.userRedemptions = userRedemptions;
    }
    
    return res.json({
      success: true,
      offer
    });
    
  } catch (error) {
    console.error('getPartnerOffer error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Redeem partner offer
export async function redeemPartnerOffer(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { id } = req.params;
    
    const offer = await PartnerMerchant.findById(id);
    if (!offer || !offer.isActive) {
      return res.status(404).json({ message: 'Offer not available' });
    }
    
    const user = await User.findById(req.user._id);
    
    // Check eligibility
    if (user.carbonCredits < offer.carbonCreditsCost) {
      return res.status(400).json({ 
        message: `Insufficient carbon credits. Need ${offer.carbonCreditsCost}, have ${user.carbonCredits}` 
      });
    }
    
    if (user.ecoScore < offer.minEcoScoreRequired) {
      return res.status(400).json({ 
        message: `EcoScore too low. Need ${offer.minEcoScoreRequired}, have ${user.ecoScore}` 
      });
    }
    
    if (user.level < offer.minLevelRequired) {
      return res.status(400).json({ 
        message: `Level too low. Need level ${offer.minLevelRequired}, you are level ${user.level}` 
      });
    }
    
    // Check redemption limit
    const userRedemptions = await UserReward.countDocuments({
      user: req.user._id,
      rewardId: id,
      rewardType: 'partner_offer'
    });
    
    if (userRedemptions >= offer.maxRedemptionsPerUser) {
      return res.status(400).json({ 
        message: `You have reached the maximum redemption limit for this offer` 
      });
    }
    
    // Check stock
    if (offer.stockAvailable !== -1 && offer.stockAvailable <= 0) {
      return res.status(400).json({ message: 'Offer out of stock' });
    }
    
    // Generate unique coupon code
    const couponCode = generateCouponCode(offer.name);
    
    // Create user reward
    const userReward = new UserReward({
      user: req.user._id,
      rewardId: id,
      rewardType: 'partner_offer',
      rewardName: offer.name,
      rewardDescription: offer.offerDescription,
      carbonCreditsSpent: offer.carbonCreditsCost,
      couponCode,
      expiresAt: offer.validUntil,
      partnerInfo: {
        name: offer.name,
        website: offer.partnerWebsite,
        howToRedeem: offer.howToRedeem,
        termsAndConditions: offer.termsAndConditions
      }
    });
    
    await userReward.save();
    
    // Deduct carbon credits
    user.carbonCredits -= offer.carbonCreditsCost;
    await user.save();
    
    // Update offer stats
    offer.totalRedemptions += 1;
    if (offer.stockAvailable !== -1) {
      offer.stockAvailable -= 1;
    }
    await offer.save();
    
    return res.json({
      success: true,
      message: 'Offer redeemed successfully!',
      userReward: {
        id: userReward._id,
        couponCode: userReward.couponCode,
        expiresAt: userReward.expiresAt,
        howToRedeem: offer.howToRedeem
      },
      remainingCredits: user.carbonCredits
    });
    
  } catch (error) {
    console.error('redeemPartnerOffer error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Get user's redeemed partner offers
export async function getUserPartnerOffers(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userOffers = await UserReward.find({
      user: req.user._id,
      rewardType: 'partner_offer'
    }).sort({ redeemedAt: -1 });
    
    return res.json({
      success: true,
      offers: userOffers
    });
    
  } catch (error) {
    console.error('getUserPartnerOffers error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Admin: Create partner offer
export async function createPartnerOffer(req, res) {
  try {
    const offer = new PartnerMerchant(req.body);
    await offer.save();
    
    return res.status(201).json({
      success: true,
      message: 'Partner offer created successfully',
      offer
    });
    
  } catch (error) {
    console.error('createPartnerOffer error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Admin: Update partner offer
export async function updatePartnerOffer(req, res) {
  try {
    const { id } = req.params;
    
    const offer = await PartnerMerchant.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    return res.json({
      success: true,
      message: 'Partner offer updated successfully',
      offer
    });
    
  } catch (error) {
    console.error('updatePartnerOffer error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Helper function to generate unique coupon code
function generateCouponCode(offerName) {
  const prefix = offerName.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export default {
  getPartnerOffers,
  getPartnerOffer,
  redeemPartnerOffer,
  getUserPartnerOffers,
  createPartnerOffer,
  updatePartnerOffer
};
