import Reward from '../models/Reward.js';
import UserReward from '../models/UserReward.js';
import User from '../models/User.js';
import crypto from 'crypto';
import { sendRewardConfirmationEmail } from '../utils/emailService.js';

// Get all available rewards
export async function getAvailableRewards(req, res) {
  try {
    const user = req.user ? await User.findById(req.user._id) : null;
    
    const rewards = await Reward.find({
      isActive: true,
      $or: [
        { validUntil: { $exists: false } },
        { validUntil: { $gte: new Date() } }
      ],
      $or: [
        { remainingStock: { $gt: 0 } },
        { remainingStock: -1 }
      ]
    }).sort({ featured: -1, popularity: -1, carbonCreditsCost: 1 });

    // Add user eligibility info if authenticated
    const rewardsWithEligibility = rewards.map(reward => {
      const rewardObj = reward.toObject();
      
      if (user) {
        rewardObj.canRedeem = (
          user.carbonCredits >= reward.carbonCreditsCost &&
          user.ecoScore >= reward.ecoScoreRequired &&
          user.level >= reward.levelRequired
        );
        rewardObj.userCarbonCredits = user.carbonCredits;
        rewardObj.userEcoScore = user.ecoScore;
        rewardObj.userLevel = user.level;
      } else {
        rewardObj.canRedeem = false;
      }
      
      return rewardObj;
    });

    return res.json({ 
      success: true, 
      rewards: rewardsWithEligibility 
    });
    
  } catch (err) {
    console.error('getAvailableRewards error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Redeem a reward
export async function redeemReward(req, res) {
  try {
    const { rewardId } = req.params;
    
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const user = await User.findById(req.user._id);
    const reward = await Reward.findById(rewardId);
    
    if (!reward || !reward.isActive) {
      return res.status(404).json({ message: 'Reward not found or inactive' });
    }
    
    // Check eligibility
    if (user.carbonCredits < reward.carbonCreditsCost) {
      return res.status(400).json({ 
        message: `Insufficient carbon credits. You need ${reward.carbonCreditsCost} but have ${user.carbonCredits}` 
      });
    }
    
    if (user.ecoScore < reward.ecoScoreRequired) {
      return res.status(400).json({ 
        message: `EcoScore too low. You need ${reward.ecoScoreRequired} but have ${user.ecoScore}` 
      });
    }
    
    if (user.level < reward.levelRequired) {
      return res.status(400).json({ 
        message: `Level too low. You need level ${reward.levelRequired} but are level ${user.level}` 
      });
    }
    
    // Check stock
    if (reward.remainingStock === 0) {
      return res.status(400).json({ message: 'Reward is out of stock' });
    }
    
    // Generate unique coupon code
    const couponCode = generateCouponCode(reward.brand, reward.type);
    
    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + reward.expiryDays);
    
    // Create user reward record
    const userReward = await UserReward.create({
      user: user._id,
      reward: reward._id,
      couponCode,
      carbonCreditsSpent: reward.carbonCreditsCost,
      userEcoScoreAtRedemption: user.ecoScore,
      userLevelAtRedemption: user.level,
      expiresAt,
      usageInstructions: reward.instructions
    });
    
    // Deduct carbon credits from user
    user.carbonCredits -= reward.carbonCreditsCost;
    await user.save();
    
    // Update reward stock and analytics
    if (reward.remainingStock > 0) {
      reward.remainingStock -= 1;
    }
    reward.totalRedemptions += 1;
    reward.popularity += 1;
    await reward.save();
    
    // Populate reward details for response
    await userReward.populate('reward');
    
    // Send confirmation email
    try {
      await sendRewardConfirmationEmail(user, userReward, reward);
    } catch (emailError) {
      console.error('Failed to send reward confirmation email:', emailError);
      // Don't fail the reward redemption if email fails
    }
    
    return res.json({ 
      success: true, 
      message: 'Reward redeemed successfully! Check your email for confirmation.',
      userReward,
      remainingCredits: user.carbonCredits
    });
    
  } catch (err) {
    console.error('redeemReward error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Get user's redeemed rewards
export async function getUserRewards(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user._id };
    if (status) query.status = status;
    
    const userRewards = await UserReward.find(query)
      .populate('reward')
      .sort({ redeemedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await UserReward.countDocuments(query);
    
    return res.json({
      success: true,
      userRewards,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (err) {
    console.error('getUserRewards error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Mark reward as used
export async function markRewardAsUsed(req, res) {
  try {
    const { userRewardId } = req.params;
    const { usageNotes } = req.body;
    
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const userReward = await UserReward.findOne({
      _id: userRewardId,
      user: req.user._id
    });
    
    if (!userReward) {
      return res.status(404).json({ message: 'Reward not found' });
    }
    
    if (userReward.status === 'used') {
      return res.status(400).json({ message: 'Reward already marked as used' });
    }
    
    if (userReward.status === 'expired') {
      return res.status(400).json({ message: 'Reward has expired' });
    }
    
    userReward.status = 'used';
    userReward.usedAt = new Date();
    if (usageNotes) userReward.usageNotes = usageNotes;
    
    await userReward.save();
    
    return res.json({ 
      success: true, 
      message: 'Reward marked as used successfully',
      userReward 
    });
    
  } catch (err) {
    console.error('markRewardAsUsed error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Get leaderboard
export async function getLeaderboard(req, res) {
  try {
    const { type = 'ecoScore', limit = 20 } = req.query;
    
    let sortField = 'ecoScore';
    let displayField = 'ecoScore';
    
    switch (type) {
      case 'xp':
        sortField = 'xp';
        displayField = 'xp';
        break;
      case 'co2Saved':
        sortField = 'co2Saved';
        displayField = 'co2Saved';
        break;
      case 'streak':
        sortField = 'currentStreak';
        displayField = 'currentStreak';
        break;
      case 'distance':
        sortField = 'totalDistance';
        displayField = 'totalDistance';
        break;
      case 'trees':
        sortField = 'treesGrown';
        displayField = 'treesGrown';
        break;
      case 'carbonCredits':
        sortField = 'carbonCredits';
        displayField = 'carbonCredits';
        break;
      default:
        sortField = 'ecoScore';
        displayField = 'ecoScore';
    }
    
    const users = await User.find({})
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .select('firstName lastName avatar level xp ecoScore co2Saved currentStreak totalDistance treesGrown carbonCredits');
    
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      level: user.level,
      value: user[sortField],
      displayValue: formatLeaderboardValue(user[sortField], type),
      stats: {
        xp: user.xp,
        ecoScore: user.ecoScore,
        co2Saved: user.co2Saved,
        currentStreak: user.currentStreak,
        totalDistance: user.totalDistance,
        treesGrown: user.treesGrown,
        carbonCredits: user.carbonCredits
      }
    }));
    
    // If user is authenticated, include their rank
    let userRank = null;
    if (req.user) {
      const userPosition = await User.countDocuments({
        [sortField]: { $gt: req.user[sortField] }
      });
      userRank = userPosition + 1;
    }
    
    return res.json({ 
      success: true, 
      leaderboard,
      userRank,
      type,
      total: await User.countDocuments({})
    });
    
  } catch (err) {
    console.error('getLeaderboard error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Helper function to generate unique coupon codes
function generateCouponCode(brand, type) {
  const prefix = brand.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Helper function to format leaderboard values
function formatLeaderboardValue(value, type) {
  switch (type) {
    case 'co2Saved':
      return `${value.toFixed(1)} kg`;
    case 'distance':
      return `${value.toFixed(1)} km`;
    case 'carbonCredits':
      return `${value} credits`;
    case 'trees':
      return `${value} trees`;
    case 'streak':
      return `${value} days`;
    default:
      return value.toString();
  }
}

// Helper function to format currency
function formatCurrency(value, currency = 'INR') {
  if (currency === 'INR') {
    return `₹${value}`;
  }
  return `${currency} ${value}`;
}

// Initialize default rewards (admin function)
export async function initializeRewards() {
  try {
    const existingCount = await Reward.countDocuments();
    if (existingCount > 0) return; // Already initialized
    
    const defaultRewards = [
      // Food & Beverage - Indian Brands
      {
        title: "Café Coffee Day ₹400 Voucher",
        description: "Enjoy your favorite coffee and snacks at CCD with this ₹400 voucher",
        type: "gift_card",
        brand: "Café Coffee Day",
        value: 400,
        carbonCreditsCost: 50,
        ecoScoreRequired: 70,
        category: "food",
        icon: "☕",
        color: "#8B4513",
        featured: true,
        instructions: "Present this code at any CCD outlet or use on their app",
        expiryDays: 90
      },
      {
        title: "Domino's 25% Off",
        description: "Get 25% off on your next Domino's pizza order",
        type: "discount",
        brand: "Domino's",
        value: 0,
        discountPercentage: 25,
        carbonCreditsCost: 40,
        ecoScoreRequired: 60,
        category: "food",
        icon: "🍕",
        color: "#E31837",
        instructions: "Use this coupon code while ordering online or show at outlet",
        expiryDays: 30
      },
      {
        title: "Haldiram's ₹300 Voucher",
        description: "Enjoy authentic Indian snacks and sweets with this ₹300 voucher",
        type: "gift_card",
        brand: "Haldiram's",
        value: 300,
        carbonCreditsCost: 35,
        ecoScoreRequired: 65,
        category: "food",
        icon: "🥘",
        color: "#FF6B35",
        instructions: "Valid at all Haldiram's outlets across India",
        expiryDays: 60
      },
      
      // Transport - Indian Services
      {
        title: "Ola ₹200 Credit",
        description: "Get ₹200 off on your next Ola ride",
        type: "voucher",
        brand: "Ola",
        value: 200,
        carbonCreditsCost: 60,
        ecoScoreRequired: 75,
        levelRequired: 2,
        category: "transport",
        icon: "🚗",
        color: "#FFE135",
        featured: true,
        instructions: "Apply this promo code in the Ola app",
        expiryDays: 45
      },
      {
        title: "Metro Card ₹500 Recharge",
        description: "Free ₹500 recharge for Delhi/Mumbai/Bangalore Metro",
        type: "voucher",
        brand: "Metro Rail",
        value: 500,
        carbonCreditsCost: 80,
        ecoScoreRequired: 80,
        levelRequired: 3,
        category: "transport",
        icon: "🚇",
        color: "#0066CC",
        instructions: "Use at metro station recharge counter with this code",
        expiryDays: 90
      },
      {
        title: "BMTC/DTC Bus Pass",
        description: "Free 7-day bus pass for local city transport",
        type: "voucher",
        brand: "City Bus",
        value: 350,
        carbonCreditsCost: 70,
        ecoScoreRequired: 75,
        levelRequired: 2,
        category: "transport",
        icon: "🚌",
        color: "#228B22",
        instructions: "Present at bus depot counter to get your 7-day pass",
        expiryDays: 30
      },
      
      // Shopping - Indian E-commerce
      {
        title: "Amazon India ₹1000 Gift Card",
        description: "Shop anything on Amazon India with this ₹1000 gift card",
        type: "gift_card",
        brand: "Amazon India",
        value: 1000,
        carbonCreditsCost: 150,
        ecoScoreRequired: 85,
        levelRequired: 4,
        category: "shopping",
        icon: "📦",
        color: "#FF9900",
        featured: true,
        instructions: "Redeem on Amazon.in during checkout",
        expiryDays: 365
      },
      {
        title: "Flipkart ₹750 Voucher",
        description: "Shop on India's favorite e-commerce platform",
        type: "gift_card",
        brand: "Flipkart",
        value: 750,
        carbonCreditsCost: 120,
        ecoScoreRequired: 80,
        levelRequired: 3,
        category: "shopping",
        icon: "🛒",
        color: "#047BD6",
        instructions: "Use this gift card code on Flipkart.com",
        expiryDays: 180
      },
      {
        title: "Myntra 30% Off",
        description: "Get 30% off on fashion and lifestyle products",
        type: "discount",
        brand: "Myntra",
        value: 0,
        discountPercentage: 30,
        carbonCreditsCost: 50,
        ecoScoreRequired: 70,
        category: "shopping",
        icon: "👕",
        color: "#FF3F6C",
        instructions: "Apply this coupon code at Myntra checkout",
        expiryDays: 45
      },
      
      // Entertainment - Indian OTT & Services
      {
        title: "Hotstar Premium 3 Months",
        description: "Enjoy 3 months of Disney+ Hotstar Premium subscription",
        type: "voucher",
        brand: "Disney+ Hotstar",
        value: 899,
        carbonCreditsCost: 100,
        ecoScoreRequired: 75,
        levelRequired: 3,
        category: "entertainment",
        icon: "📺",
        color: "#1f2937",
        featured: true,
        instructions: "Apply this code to your Hotstar account",
        expiryDays: 30
      },
      {
        title: "BookMyShow ₹500 Voucher",
        description: "Book movie tickets, events, and shows",
        type: "gift_card",
        brand: "BookMyShow",
        value: 500,
        carbonCreditsCost: 80,
        ecoScoreRequired: 70,
        levelRequired: 2,
        category: "entertainment",
        icon: "🎬",
        color: "#C4242B",
        instructions: "Use this voucher code while booking on BookMyShow",
        expiryDays: 60
      },
      
      // Eco-friendly & Indian Goodies
      {
        title: "Plant a Tree in Sundarbans",
        description: "We'll plant a mangrove tree in Sundarbans in your name",
        type: "experience",
        brand: "EcoDrive India",
        value: 500,
        carbonCreditsCost: 120,
        ecoScoreRequired: 90,
        levelRequired: 4,
        category: "eco",
        icon: "🌳",
        color: "#228B22",
        featured: true,
        instructions: "Tree will be planted within 30 days. You'll receive a certificate with GPS location.",
        expiryDays: 0
      },
      {
        title: "Organic India ₹600 Voucher",
        description: "Shop for organic teas, supplements, and wellness products",
        type: "gift_card",
        brand: "Organic India",
        value: 600,
        carbonCreditsCost: 90,
        ecoScoreRequired: 85,
        levelRequired: 3,
        category: "eco",
        icon: "🌿",
        color: "#4CAF50",
        instructions: "Use at Organic India stores or online",
        expiryDays: 120
      },
      {
        title: "Khadi India ₹400 Voucher",
        description: "Support local artisans with authentic Khadi products",
        type: "gift_card",
        brand: "Khadi India",
        value: 400,
        carbonCreditsCost: 60,
        ecoScoreRequired: 75,
        levelRequired: 2,
        category: "eco",
        icon: "🧵",
        color: "#8B4513",
        instructions: "Valid at all Khadi India outlets",
        expiryDays: 90
      },
      
      // Indian Goodies & Experiences
      {
        title: "Amul Ice Cream Parlour ₹250",
        description: "Enjoy delicious Amul ice creams and desserts",
        type: "gift_card",
        brand: "Amul",
        value: 250,
        carbonCreditsCost: 30,
        ecoScoreRequired: 60,
        category: "food",
        icon: "🍦",
        color: "#0066CC",
        instructions: "Valid at Amul ice cream parlours",
        expiryDays: 45
      },
      {
        title: "Patanjali Store ₹350 Voucher",
        description: "Shop for natural and ayurvedic products",
        type: "gift_card",
        brand: "Patanjali",
        value: 350,
        carbonCreditsCost: 45,
        ecoScoreRequired: 65,
        category: "eco",
        icon: "🌱",
        color: "#FF6B35",
        instructions: "Use at any Patanjali store across India",
        expiryDays: 75
      },
      {
        title: "Zomato Gold 1 Month",
        description: "Enjoy 1 month of Zomato Gold membership",
        type: "voucher",
        brand: "Zomato",
        value: 299,
        carbonCreditsCost: 40,
        ecoScoreRequired: 70,
        category: "food",
        icon: "🍽️",
        color: "#E23744",
        instructions: "Apply this code in your Zomato app",
        expiryDays: 30
      },
      
      // Festival & Cultural Rewards
      {
        title: "Diwali Gift Hamper ₹800",
        description: "Traditional Diwali sweets and dry fruits hamper",
        type: "gift_card",
        brand: "Mithai Magic",
        value: 800,
        carbonCreditsCost: 110,
        ecoScoreRequired: 80,
        levelRequired: 3,
        category: "food",
        icon: "🪔",
        color: "#FFD700",
        featured: true,
        instructions: "Home delivery within 7 days of redemption",
        expiryDays: 15
      },
      {
        title: "Handloom Saree ₹1200",
        description: "Beautiful handwoven saree supporting local artisans",
        type: "merchandise",
        brand: "Handloom India",
        value: 1200,
        carbonCreditsCost: 180,
        ecoScoreRequired: 90,
        levelRequired: 5,
        category: "eco",
        icon: "🥻",
        color: "#8B4513",
        instructions: "Choose design and size after redemption",
        expiryDays: 60
      },
      {
        title: "Ayurvedic Spa Session",
        description: "Relaxing 60-minute Ayurvedic massage and treatment",
        type: "experience",
        brand: "Kairali Ayurveda",
        value: 1500,
        carbonCreditsCost: 200,
        ecoScoreRequired: 85,
        levelRequired: 4,
        category: "eco",
        icon: "💆",
        color: "#9ACD32",
        instructions: "Book appointment at participating Ayurvedic centers",
        expiryDays: 90
      },
      
      // More Indian Goodies & Tech
      {
        title: "Paytm Wallet ₹500",
        description: "Get ₹500 added to your Paytm wallet for easy payments",
        type: "voucher",
        brand: "Paytm",
        value: 500,
        carbonCreditsCost: 70,
        ecoScoreRequired: 70,
        levelRequired: 2,
        category: "shopping",
        icon: "💳",
        color: "#00BAF2",
        instructions: "Wallet credit will be added within 24 hours",
        expiryDays: 180
      },
      {
        title: "Swiggy Super 3 Months",
        description: "Free delivery and exclusive discounts for 3 months",
        type: "voucher",
        brand: "Swiggy",
        value: 399,
        carbonCreditsCost: 55,
        ecoScoreRequired: 65,
        category: "food",
        icon: "🛵",
        color: "#FC8019",
        instructions: "Apply code in Swiggy app to activate Super membership",
        expiryDays: 30
      },
      {
        title: "Big Bazaar ₹750 Voucher",
        description: "Shop for groceries, clothing, and household items",
        type: "gift_card",
        brand: "Big Bazaar",
        value: 750,
        carbonCreditsCost: 95,
        ecoScoreRequired: 75,
        levelRequired: 3,
        category: "shopping",
        icon: "🏪",
        color: "#E31837",
        instructions: "Present voucher at any Big Bazaar store",
        expiryDays: 120
      },
      {
        title: "Jio Recharge ₹399",
        description: "Mobile recharge with unlimited calls and data",
        type: "voucher",
        brand: "Jio",
        value: 399,
        carbonCreditsCost: 50,
        ecoScoreRequired: 60,
        category: "shopping",
        icon: "📱",
        color: "#0066CC",
        instructions: "Recharge will be processed within 2 hours",
        expiryDays: 90
      },
      {
        title: "Nykaa Beauty Box ₹600",
        description: "Curated beauty and skincare products box",
        type: "merchandise",
        brand: "Nykaa",
        value: 600,
        carbonCreditsCost: 85,
        ecoScoreRequired: 70,
        levelRequired: 2,
        category: "shopping",
        icon: "💄",
        color: "#FC2779",
        instructions: "Beauty box will be delivered within 7 days",
        expiryDays: 45
      },
      {
        title: "Yoga Class Package",
        description: "5 sessions at premium yoga studios across India",
        type: "experience",
        brand: "The Yoga Institute",
        value: 2000,
        carbonCreditsCost: 250,
        ecoScoreRequired: 85,
        levelRequired: 4,
        category: "eco",
        icon: "🧘",
        color: "#8B4513",
        instructions: "Book sessions at participating yoga centers",
        expiryDays: 120
      },
      {
        title: "Blinkit Grocery ₹400",
        description: "Quick grocery delivery voucher for daily essentials",
        type: "gift_card",
        brand: "Blinkit",
        value: 400,
        carbonCreditsCost: 55,
        ecoScoreRequired: 65,
        category: "shopping",
        icon: "🥬",
        color: "#FFCC00",
        instructions: "Use voucher code in Blinkit app",
        expiryDays: 60
      },
      {
        title: "Tata Tea Premium Pack",
        description: "Premium tea collection with traditional Indian flavors",
        type: "merchandise",
        brand: "Tata Tea",
        value: 350,
        carbonCreditsCost: 45,
        ecoScoreRequired: 60,
        category: "food",
        icon: "🍵",
        color: "#8B4513",
        instructions: "Tea pack will be delivered to your address",
        expiryDays: 30
      },
      
      // Indian Tech & Lifestyle
      {
        title: "PhonePe Cashback ₹300",
        description: "Get ₹300 cashback on your next PhonePe transaction",
        type: "voucher",
        brand: "PhonePe",
        value: 300,
        carbonCreditsCost: 40,
        ecoScoreRequired: 60,
        category: "shopping",
        icon: "💜",
        color: "#5F259F",
        instructions: "Cashback will be credited to your PhonePe wallet",
        expiryDays: 60
      },
      {
        title: "Lenskart ₹1000 Voucher",
        description: "Eyewear voucher for glasses, sunglasses, and contact lenses",
        type: "gift_card",
        brand: "Lenskart",
        value: 1000,
        carbonCreditsCost: 130,
        ecoScoreRequired: 75,
        levelRequired: 3,
        category: "shopping",
        icon: "👓",
        color: "#00BAF2",
        instructions: "Use voucher code on Lenskart website or app",
        expiryDays: 180
      },
      {
        title: "Croma Electronics ₹800",
        description: "Shop for electronics, gadgets, and appliances",
        type: "gift_card",
        brand: "Croma",
        value: 800,
        carbonCreditsCost: 110,
        ecoScoreRequired: 80,
        levelRequired: 3,
        category: "shopping",
        icon: "📺",
        color: "#E31837",
        instructions: "Present voucher at Croma stores or use online",
        expiryDays: 120
      },
      {
        title: "Fabindia ₹600 Voucher",
        description: "Ethnic wear and handcrafted products voucher",
        type: "gift_card",
        brand: "Fabindia",
        value: 600,
        carbonCreditsCost: 80,
        ecoScoreRequired: 70,
        levelRequired: 2,
        category: "eco",
        icon: "👘",
        color: "#8B4513",
        instructions: "Shop at Fabindia stores or online",
        expiryDays: 90
      },
      {
        title: "Urban Company Service",
        description: "Home cleaning, beauty, or repair service voucher",
        type: "voucher",
        brand: "Urban Company",
        value: 800,
        carbonCreditsCost: 100,
        ecoScoreRequired: 75,
        levelRequired: 3,
        category: "shopping",
        icon: "🏠",
        color: "#6C5CE7",
        instructions: "Book service through Urban Company app",
        expiryDays: 60
      },
      {
        title: "Boat Headphones",
        description: "Premium wireless headphones from India's favorite audio brand",
        type: "merchandise",
        brand: "boAt",
        value: 1200,
        carbonCreditsCost: 160,
        ecoScoreRequired: 85,
        levelRequired: 4,
        category: "shopping",
        icon: "🎧",
        color: "#000000",
        featured: true,
        instructions: "Product will be shipped within 5 days",
        expiryDays: 15
      }
    ];
    
    await Reward.insertMany(defaultRewards);
    console.log(`Initialized ${defaultRewards.length} default rewards`);
    
  } catch (err) {
    console.error('initializeRewards error', err.message || err);
  }
}

export default {
  getAvailableRewards,
  redeemReward,
  getUserRewards,
  markRewardAsUsed,
  getLeaderboard,
  initializeRewards
};