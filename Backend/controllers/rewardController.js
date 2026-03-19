import Reward from '../models/Reward.js';
import UserReward from '../models/UserReward.js';

/**
 * Initialize default rewards
 */
export async function initializeRewards() {
  try {
    const existingCount = await Reward.countDocuments();
    if (existingCount > 0) return; // Already initialized
    
    const defaultRewards = [
      // Food & Beverage
      {
        title: 'Starbucks Gift Card',
        description: 'Get 50% off your next coffee purchase at Starbucks',
        type: 'discount',
        brand: 'Starbucks',
        value: 500,
        currency: 'INR',
        discountPercentage: 50,
        carbonCreditsCost: 100,
        ecoScoreRequired: 50,
        levelRequired: 1,
        icon: '☕',
        color: '#00704A',
        featured: true,
        category: 'food',
        isActive: true,
        expiryDays: 60,
        instructions: 'Show coupon code at any Starbucks outlet',
        termsAndConditions: 'Valid at participating locations only'
      },
      {
        title: 'Dominoz Pizza Voucher',
        description: 'Buy 1 Get 1 Free on any large pizza',
        type: 'voucher',
        brand: 'Dominos',
        value: 800,
        currency: 'INR',
        carbonCreditsCost: 120,
        ecoScoreRequired: 40,
        levelRequired: 1,
        icon: '🍕',
        color: '#E31937',
        featured: false,
        category: 'food',
        isActive: true,
        expiryDays: 45,
        instructions: 'Apply coupon code at checkout on Dominos app/website'
      },
      {
        title: 'Zomato Credit',
        description: 'Get ₹300 credits for food delivery',
        type: 'gift_card',
        brand: 'Zomato',
        value: 300,
        currency: 'INR',
        carbonCreditsCost: 80,
        ecoScoreRequired: 30,
        levelRequired: 1,
        icon: '🍴',
        color: '#EF4F5F',
        featured: false,
        category: 'food',
        isActive: true,
        expiryDays: 90
      },

      // Transport & Mobility
      {
        title: 'Uber Ride Credit',
        description: 'Free ₹500 ride credit on Uber',
        type: 'gift_card',
        brand: 'Uber',
        value: 500,
        currency: 'INR',
        carbonCreditsCost: 150,
        ecoScoreRequired: 60,
        levelRequired: 2,
        icon: '🚗',
        color: '#000000',
        featured: true,
        category: 'transport',
        isActive: true,
        expiryDays: 60
      },
      {
        title: 'Ola Ride Discount',
        description: 'Get 40% off on next 5 Ola rides',
        type: 'discount',
        brand: 'Ola',
        value: 600,
        currency: 'INR',
        discountPercentage: 40,
        carbonCreditsCost: 140,
        ecoScoreRequired: 50,
        levelRequired: 2,
        icon: '🛵',
        color: '#FDB913',
        featured: false,
        category: 'transport',
        isActive: true,
        expiryDays: 45
      },

      // Shopping
      {
        title: 'Amazon Shopping Voucher',
        description: '₹1000 Amazon gift card for eco-friendly purchases',
        type: 'gift_card',
        brand: 'Amazon',
        value: 1000,
        currency: 'INR',
        carbonCreditsCost: 250,
        ecoScoreRequired: 100,
        levelRequired: 3,
        icon: '🛍️',
        color: '#FF9900',
        featured: true,
        category: 'shopping',
        isActive: true,
        expiryDays: 90,
        instructions: 'Claim and use code during Amazon checkout'
      },
      {
        title: 'Flipkart Gift Card',
        description: '₹750 Flipkart credit for sustainable shopping',
        type: 'gift_card',
        brand: 'Flipkart',
        value: 750,
        currency: 'INR',
        carbonCreditsCost: 200,
        ecoScoreRequired: 80,
        levelRequired: 2,
        icon: '🎁',
        color: '#1B66CA',
        featured: false,
        category: 'shopping',
        isActive: true,
        expiryDays: 90
      },

      // Entertainment
      {
        title: 'Netflix Premium 1 Month',
        description: '1 month free Netflix Premium subscription',
        type: 'experience',
        brand: 'Netflix',
        value: 499,
        currency: 'INR',
        carbonCreditsCost: 120,
        ecoScoreRequired: 70,
        levelRequired: 2,
        icon: '🎬',
        color: '#E50914',
        featured: true,
        category: 'entertainment',
        isActive: true,
        expiryDays: 30
      },
      {
        title: 'BookMyShow Movie Voucher',
        description: 'Get 2 movie tickets at 50% off',
        type: 'discount',
        brand: 'BookMyShow',
        value: 600,
        currency: 'INR',
        discountPercentage: 50,
        carbonCreditsCost: 110,
        ecoScoreRequired: 50,
        levelRequired: 1,
        icon: '🎭',
        color: '#000000',
        featured: false,
        category: 'entertainment',
        isActive: true,
        expiryDays: 60
      },

      // Eco Products
      {
        title: 'Eco-Friendly Water Bottle',
        description: 'Premium bamboo water bottle - eco-friendly merchandise',
        type: 'merchandise',
        brand: 'driveSutraGo',
        value: 800,
        currency: 'INR',
        carbonCreditsCost: 180,
        ecoScoreRequired: 80,
        levelRequired: 2,
        icon: '🌱',
        color: '#10B981',
        featured: true,
        category: 'eco',
        isActive: true,
        expiryDays: 365,
        instructions: 'Merchandise will be shipped directly to your registered address'
      },
      {
        title: 'Eco Tote Bag by driveSutraGo',
        description: 'Sustainable cotton tote bag with driveSutraGo branding',
        type: 'merchandise',
        brand: 'driveSutraGo',
        value: 400,
        currency: 'INR',
        carbonCreditsCost: 100,
        ecoScoreRequired: 50,
        levelRequired: 1,
        icon: '👜',
        color: '#10B981',
        featured: false,
        category: 'eco',
        isActive: true,
        expiryDays: 365
      },
      {
        title: 'Tree Planting Bundle (10 Trees)',
        description: 'Official donation: 10 trees will be planted in your name',
        type: 'experience',
        brand: 'driveSutraGo',
        value: 5000,
        currency: 'INR',
        carbonCreditsCost: 100,
        ecoScoreRequired: 40,
        levelRequired: 1,
        icon: '🌳',
        color: '#10B981',
        featured: true,
        category: 'eco',
        isActive: true,
        expiryDays: 365,
        instructions: 'Your donation will be processed and 10 trees will be planted'
      },

      // Travel & Experiences
      {
        title: 'MakeMyTrip Holiday Voucher',
        description: '₹5000 discount on next holiday booking',
        type: 'discount',
        brand: 'MakeMyTrip',
        value: 5000,
        currency: 'INR',
        discountPercentage: 30,
        carbonCreditsCost: 400,
        ecoScoreRequired: 150,
        levelRequired: 5,
        icon: '✈️',
        color: '#003580',
        featured: true,
        category: 'travel',
        isActive: true,
        expiryDays: 120
      }
    ];

    await Reward.insertMany(defaultRewards);
    console.log('✅ Rewards initialized:', defaultRewards.length);
  } catch (error) {
    console.error('❌ Error initializing rewards:', error.message);
  }
}

/**
 * Get all available rewards
 */
export async function getAvailableRewards(req, res) {
  try {
    const User = (await import('../models/User.js')).default;
    const userId = req.user?.id;
    const user = userId ? await User.findById(userId) : null;

    const rewards = await Reward.find({ isActive: true })
      .sort({ featured: -1, createdAt: -1 });

    const rewardsWithEligibility = rewards.map(reward => ({
      ...reward.toObject(),
      canRedeem: user ? (
        user.carbonCredits >= reward.carbonCreditsCost &&
        user.ecoScore >= reward.ecoScoreRequired &&
        user.level >= reward.levelRequired
      ) : false
    }));

    res.json({ success: true, rewards: rewardsWithEligibility });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get user's redeemed rewards
 */
export async function getUserRewards(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const userRewards = await UserReward.find({ userId })
      .populate('rewardId')
      .sort({ createdAt: -1 });

    res.json({ success: true, userRewards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Redeem a reward
 */
export async function redeemReward(req, res) {
  try {
    const userId = req.user?.id;
    const { rewardId } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);
    const reward = await Reward.findById(rewardId);

    if (!reward) return res.status(404).json({ success: false, message: 'Reward not found' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check eligibility
    if (user.carbonCredits < reward.carbonCreditsCost) {
      return res.status(400).json({ success: false, message: 'Insufficient carbon credits' });
    }
    if (user.ecoScore < reward.ecoScoreRequired) {
      return res.status(400).json({ success: false, message: 'Insufficient eco score' });
    }
    if (user.level < reward.levelRequired) {
      return res.status(400).json({ success: false, message: 'Insufficient level' });
    }

    // Check stock if limited
    if (reward.totalStock !== -1 && reward.remainingStock <= 0) {
      return res.status(400).json({ success: false, message: 'Reward out of stock' });
    }

    // Generate coupon code
    const couponCode = `${reward._id.toString().substr(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // Create user reward
    const userReward = new UserReward({
      userId,
      rewardId: reward._id,
      couponCode,
      status: 'redeemed',
      redeemedAt: new Date(),
      expiresAt: new Date(Date.now() + reward.expiryDays * 24 * 60 * 60 * 1000)
    });

    await userReward.save();

    // Deduct credits from user
    user.carbonCredits -= reward.carbonCreditsCost;
    await user.save();

    // Update reward redemptions
    reward.totalRedemptions += 1;
    if (reward.totalStock !== -1) {
      reward.remainingStock -= 1;
    }
    await reward.save();

    res.json({ 
      success: true, 
      message: 'Reward redeemed successfully',
      userReward 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(req, res) {
  try {
    const { type = 'ecoScore', limit = 20 } = req.query;
    const User = (await import('../models/User.js')).default;

    let sortField = {};
    let displayField = 'ecoScore';

    switch (type) {
      case 'xp':
        sortField = { xp: -1 };
        displayField = 'xp';
        break;
      case 'co2Saved':
        sortField = { co2Saved: -1 };
        displayField = 'co2Saved';
        break;
      case 'streak':
        sortField = { currentStreak: -1 };
        displayField = 'currentStreak';
        break;
      case 'trees':
        sortField = { treesGrown: -1 };
        displayField = 'treesGrown';
        break;
      case 'carbonCredits':
        sortField = { carbonCredits: -1 };
        displayField = 'carbonCredits';
        break;
      default:
        sortField = { ecoScore: -1 };
        displayField = 'ecoScore';
    }

    const leaderboard = await User.find()
      .select('firstName lastName email level ecoScore xp co2Saved currentStreak treesGrown carbonCredits avatar')
      .sort(sortField)
      .limit(parseInt(limit));

    const rankedLeaderboard = leaderboard.map((user, index) => ({
      _id: user._id,
      rank: index + 1,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      level: user.level,
      level: user.level,
      displayValue: user[displayField],
      fullData: {
        ecoScore: user.ecoScore,
        xp: user.xp,
        co2Saved: user.co2Saved,
        streak: user.currentStreak,
        trees: user.treesGrown,
        credits: user.carbonCredits
      }
    }));

    res.json({ success: true, leaderboard: rankedLeaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Mark reward as used
 */
export async function markRewardAsUsed(req, res) {
  try {
    const userId = req.user?.id;
    const { userRewardId } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const userReward = await UserReward.findById(userRewardId);

    if (!userReward || userReward.userId.toString() !== userId) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }

    if (userReward.status === 'used') {
      return res.status(400).json({ success: false, message: 'Reward already used' });
    }

    if (userReward.status === 'expired') {
      return res.status(400).json({ success: false, message: 'Reward has expired' });
    }

    userReward.status = 'used';
    userReward.usedAt = new Date();
    await userReward.save();

    res.json({ success: true, message: 'Reward marked as used', userReward });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export default {
  initializeRewards,
  getAvailableRewards,
  getUserRewards,
  redeemReward,
  markRewardAsUsed,
  getLeaderboard
};
