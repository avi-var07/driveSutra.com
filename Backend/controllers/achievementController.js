import Achievement from '../models/Achievement.js';

/**
 * Initialize default achievements
 */
export async function initializeAchievements() {
  try {
    const existingCount = await Achievement.countDocuments();
    if (existingCount > 0) return; // Already initialized
    
    const defaultAchievements = [
      // Beginner Achievements
      {
        id: 'first_trip',
        title: 'First Step to Green',
        description: 'Complete your first trip',
        requirements: { tripCount: 1 },
        icon: '🚗',
        color: '#3b82f6',
        rarity: 'common',
        category: 'beginner',
        rewards: { xp: 50, carbonCredits: 5 },
        order: 1
      },
      {
        id: 'welcome_traveler',
        title: 'Welcome Traveler',
        description: 'Complete 5 trips of any kind',
        requirements: { tripCount: 5 },
        icon: '🗺️',
        color: '#3b82f6',
        rarity: 'common',
        category: 'beginner',
        rewards: { xp: 100, carbonCredits: 10 },
        order: 2
      },

      // Distance Achievements
      {
        id: 'ten_km_milestone',
        title: 'First 10 KM',
        description: 'Travel 10 kilometers in a single trip',
        requirements: { totalDistance: 10 },
        icon: '📍',
        color: '#06b6d4',
        rarity: 'common',
        category: 'distance',
        rewards: { xp: 75, carbonCredits: 8 },
        order: 3
      },
      {
        id: 'hundred_km_explorer',
        title: '100 KM Explorer',
        description: 'Accumulate 100 kilometers across all trips',
        requirements: { totalDistance: 100 },
        icon: '🌍',
        color: '#06b6d4',
        rarity: 'rare',
        category: 'distance',
        rewards: { xp: 300, carbonCredits: 50 },
        order: 4
      },
      {
        id: 'thousand_km_wanderer',
        title: '1000 KM Wanderer',
        description: 'Accumulate 1000 kilometers across all trips',
        requirements: { totalDistance: 1000 },
        icon: '🧭',
        color: '#06b6d4',
        rarity: 'epic',
        category: 'distance',
        rewards: { xp: 1000, carbonCredits: 200, title: 'Wanderer' },
        order: 5
      },

      // Transport Mode Achievements
      {
        id: 'public_transport_advocate',
        title: 'Public Transport Advocate',
        description: 'Take 10 public transport trips',
        requirements: { tripCount: 10, specificMode: 'PUBLIC' },
        icon: '🚌',
        color: '#8b5cf6',
        rarity: 'common',
        category: 'transport',
        rewards: { xp: 150, carbonCredits: 30 },
        order: 6
      },
      {
        id: 'eco_walker',
        title: 'Eco Walker',
        description: 'Complete 5 walking trips',
        requirements: { tripCount: 5, specificMode: 'WALK' },
        icon: '🚶',
        color: '#10b981',
        rarity: 'common',
        category: 'transport',
        rewards: { xp: 100, carbonCredits: 20 },
        order: 7
      },
      {
        id: 'cycle_champion',
        title: 'Cycle Champion',
        description: 'Complete 10 cycling trips',
        requirements: { tripCount: 10, specificMode: 'CYCLE' },
        icon: '🚴',
        color: '#10b981',
        rarity: 'rare',
        category: 'transport',
        rewards: { xp: 250, carbonCredits: 50, title: 'Champion Cyclist' },
        order: 8
      },

      // Eco Impact Achievements
      {
        id: 'green_guardian',
        title: 'Green Guardian',
        description: 'Plant 10 trees through donations',
        requirements: { treesGrown: 10 },
        icon: '🌳',
        color: '#10b981',
        rarity: 'rare',
        category: 'environmental',
        rewards: { xp: 350, carbonCredits: 75, title: 'Guardian' },
        order: 9
      },
      {
        id: 'carbon_neutral_hero',
        title: 'Carbon Neutral Hero',
        description: 'Save 50 kg of CO₂ through eco-friendly trips',
        requirements: { co2Saved: 50 },
        icon: '♻️',
        color: '#059669',
        rarity: 'epic',
        category: 'environmental',
        rewards: { xp: 500, carbonCredits: 100, title: 'Eco Hero' },
        order: 10
      },

      // Streak Achievements
      {
        id: 'week_warrior',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        requirements: { streakDays: 7 },
        icon: '🔥',
        color: '#f59e0b',
        rarity: 'rare',
        category: 'streak',
        rewards: { xp: 200, carbonCredits: 40 },
        order: 11
      },
      {
        id: 'month_master',
        title: 'Month Master',
        description: 'Maintain a 30-day streak',
        requirements: { streakDays: 30 },
        icon: '🏆',
        color: '#f59e0b',
        rarity: 'legendary',
        category: 'streak',
        rewards: { xp: 1000, carbonCredits: 250, title: 'Master' },
        order: 12
      },

      // Efficiency Achievements
      {
        id: 'ecowarrior',
        title: 'Eco Warrior',
        description: 'Achieve 100+ EcoScore',
        requirements: { ecoScoreAverage: 100 },
        icon: '⚡',
        color: '#f59e0b',
        rarity: 'epic',
        category: 'efficiency',
        rewards: { xp: 400, carbonCredits: 80, title: 'Warrior' },
        order: 13
      },
      {
        id: 'perfect_eco_score',
        title: 'Perfect Eco Score',
        description: 'Achieve 200+ EcoScore',
        requirements: { ecoScoreAverage: 200 },
        icon: '⭐',
        color: '#f59e0b',
        rarity: 'legendary',
        category: 'efficiency',
        rewards: { xp: 800, carbonCredits: 200, title: 'Legend' },
        order: 14
      }
    ];

    await Achievement.insertMany(defaultAchievements);
    console.log('✅ Achievements initialized:', defaultAchievements.length);
  } catch (error) {
    console.error('❌ Error initializing achievements:', error.message);
  }
}

/**
 * Get all achievements
 */
export async function getAllAchievements(req, res) {
  try {
    const achievements = await Achievement.find().sort({ order: 1 });
    res.json({ success: true, achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Alias for routes
export async function getAchievements(req, res) {
  return getAllAchievements(req, res);
}

/**
 * Get achievement by ID
 */
export async function getAchievementById(req, res) {
  try {
    const achievement = await Achievement.findOne({ id: req.params.id });
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }
    res.json({ success: true, achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Check user achievements
 */
export async function checkUserAchievements(userId) {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);
    
    if (!user) return [];

    const achievements = await Achievement.find();
    const unlockedAchievements = [];

    for (const achievement of achievements) {
      const { requirements } = achievement;
      let qualified = true;

      if (requirements.tripCount && user.totalTrips < requirements.tripCount) qualified = false;
      if (requirements.totalDistance && user.totalDistance < requirements.totalDistance) qualified = false;
      if (requirements.ecoScoreAverage && user.ecoScore < requirements.ecoScoreAverage) qualified = false;
      if (requirements.streakDays && user.currentStreak < requirements.streakDays) qualified = false;
      if (requirements.co2Saved && user.co2Saved < requirements.co2Saved) qualified = false;
      if (requirements.treesGrown && user.treesGrown < requirements.treesGrown) qualified = false;

      if (qualified) {
        unlockedAchievements.push({
          achievementId: achievement._id,
          id: achievement.id,
          title: achievement.title,
          unlockedAt: new Date()
        });
      }
    }

    return unlockedAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

export default {
  initializeAchievements,
  getAllAchievements,
  getAchievements,
  getAchievementById,
  checkUserAchievements,
  checkAchievements: checkUserAchievements
};

// Export as checkAchievements for direct imports
export { checkUserAchievements as checkAchievements };
