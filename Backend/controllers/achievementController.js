import Achievement from '../models/Achievement.js';
import User from '../models/User.js';
import Trip from '../models/Trip.js';

// Get all achievements with user's unlock status
export async function getAchievements(req, res) {
  try {
    const achievements = await Achievement.find({}).sort({ category: 1, order: 1 });
    
    if (!req.user) {
      // Return achievements without unlock status for non-authenticated users
      return res.json({ 
        success: true, 
        achievements: achievements.map(a => ({
          ...a.toObject(),
          isUnlocked: false,
          unlockedAt: null
        }))
      });
    }
    
    const user = await User.findById(req.user._id);
    const unlockedAchievements = user.unlockedAchievements || [];
    
    const achievementsWithStatus = achievements.map(achievement => ({
      ...achievement.toObject(),
      isUnlocked: unlockedAchievements.includes(achievement.id),
      unlockedAt: null // TODO: Add unlock timestamp to user model
    }));
    
    return res.json({ success: true, achievements: achievementsWithStatus });
    
  } catch (err) {
    console.error('getAchievements error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Check and unlock achievements for a user
export async function checkAchievements(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    const achievements = await Achievement.find({});
    const unlockedAchievements = user.unlockedAchievements || [];
    const newUnlocks = [];
    
    for (const achievement of achievements) {
      if (unlockedAchievements.includes(achievement.id)) continue;
      
      const isUnlocked = await checkAchievementRequirements(userId, achievement.requirements);
      
      if (isUnlocked) {
        unlockedAchievements.push(achievement.id);
        newUnlocks.push(achievement);
        
        // Award achievement rewards
        if (achievement.rewards.xp) user.xp += achievement.rewards.xp;
        if (achievement.rewards.carbonCredits) user.carbonCredits += achievement.rewards.carbonCredits;
      }
    }
    
    if (newUnlocks.length > 0) {
      user.unlockedAchievements = unlockedAchievements;
      await user.save();
      
      console.log(`User ${userId} unlocked ${newUnlocks.length} new achievements:`, 
        newUnlocks.map(a => a.title));
    }
    
    return newUnlocks;
    
  } catch (err) {
    console.error('checkAchievements error', err.message || err);
    return [];
  }
}

// Helper function to check if achievement requirements are met
async function checkAchievementRequirements(userId, requirements) {
  const user = await User.findById(userId);
  if (!user) return false;
  
  // Check trip count
  if (requirements.tripCount && user.totalTrips < requirements.tripCount) {
    return false;
  }
  
  // Check total distance
  if (requirements.totalDistance && user.totalDistance < requirements.totalDistance) {
    return false;
  }
  
  // Check eco score average
  if (requirements.ecoScoreAverage && user.ecoScore < requirements.ecoScoreAverage) {
    return false;
  }
  
  // Check streak days
  if (requirements.streakDays && user.longestStreak < requirements.streakDays) {
    return false;
  }
  
  // Check CO2 saved
  if (requirements.co2Saved && user.co2Saved < requirements.co2Saved) {
    return false;
  }
  
  // Check trees grown
  if (requirements.treesGrown && user.treesGrown < requirements.treesGrown) {
    return false;
  }
  
  // Check specific mode usage
  if (requirements.specificMode) {
    const modeTrips = await Trip.countDocuments({
      user: userId,
      mode: requirements.specificMode,
      status: 'completed'
    });
    
    if (modeTrips === 0) return false;
  }
  
  return true;
}

// Initialize default achievements
export async function initializeAchievements() {
  try {
    const existingCount = await Achievement.countDocuments();
    if (existingCount > 0) return; // Already initialized
    
    const defaultAchievements = [
      // Beginner achievements
      {
        id: 'first_trip',
        title: 'First Journey',
        description: 'Complete your first eco-friendly trip',
        requirements: { tripCount: 1 },
        icon: '🌱',
        category: 'beginner',
        rarity: 'common',
        rewards: { xp: 50, carbonCredits: 10 }
      },
      {
        id: 'early_adopter',
        title: 'Early Adopter',
        description: 'Complete 5 trips',
        requirements: { tripCount: 5 },
        icon: '🚀',
        category: 'beginner',
        rarity: 'common',
        rewards: { xp: 100, carbonCredits: 25 }
      },
      
      // Transport mode achievements
      {
        id: 'public_transport_hero',
        title: 'Public Transport Hero',
        description: 'Take 10 public transport trips',
        requirements: { specificMode: 'PUBLIC', tripCount: 10 },
        icon: '🚌',
        category: 'transport',
        rarity: 'rare',
        rewards: { xp: 200, carbonCredits: 50 }
      },
      {
        id: 'walking_warrior',
        title: 'Walking Warrior',
        description: 'Walk a total of 50km',
        requirements: { specificMode: 'WALK', totalDistance: 50 },
        icon: '🚶',
        category: 'transport',
        rarity: 'rare',
        rewards: { xp: 300, carbonCredits: 75 }
      },
      {
        id: 'cycling_champion',
        title: 'Cycling Champion',
        description: 'Cycle a total of 100km',
        requirements: { specificMode: 'CYCLE', totalDistance: 100 },
        icon: '🚴',
        category: 'transport',
        rarity: 'epic',
        rewards: { xp: 500, carbonCredits: 100 }
      },
      
      // Distance achievements
      {
        id: 'distance_explorer',
        title: 'Distance Explorer',
        description: 'Travel a total of 500km eco-friendly',
        requirements: { totalDistance: 500 },
        icon: '🗺️',
        category: 'distance',
        rarity: 'epic',
        rewards: { xp: 750, carbonCredits: 150 }
      },
      
      // Efficiency achievements
      {
        id: 'eco_master',
        title: 'Eco Master',
        description: 'Maintain an average ecoScore of 80+',
        requirements: { ecoScoreAverage: 80 },
        icon: '🌟',
        category: 'efficiency',
        rarity: 'epic',
        rewards: { xp: 400, carbonCredits: 100 }
      },
      
      // Environmental achievements
      {
        id: 'carbon_saver',
        title: 'Carbon Saver',
        description: 'Save 100kg of CO2 emissions',
        requirements: { co2Saved: 100 },
        icon: '🌍',
        category: 'environmental',
        rarity: 'legendary',
        rewards: { xp: 1000, carbonCredits: 200 }
      },
      {
        id: 'forest_grower',
        title: 'Forest Grower',
        description: 'Grow 10 virtual trees',
        requirements: { treesGrown: 10 },
        icon: '🌳',
        category: 'environmental',
        rarity: 'epic',
        rewards: { xp: 600, carbonCredits: 120 }
      },
      
      // Streak achievements
      {
        id: 'consistent_traveler',
        title: 'Consistent Traveler',
        description: 'Maintain a 7-day eco-friendly streak',
        requirements: { streakDays: 7 },
        icon: '🔥',
        category: 'streak',
        rarity: 'rare',
        rewards: { xp: 350, carbonCredits: 70 }
      },
      {
        id: 'dedication_master',
        title: 'Dedication Master',
        description: 'Maintain a 30-day eco-friendly streak',
        requirements: { streakDays: 30 },
        icon: '💎',
        category: 'streak',
        rarity: 'legendary',
        rewards: { xp: 1500, carbonCredits: 300 }
      }
    ];
    
    await Achievement.insertMany(defaultAchievements);
    console.log(`Initialized ${defaultAchievements.length} default achievements`);
    
  } catch (err) {
    console.error('initializeAchievements error', err.message || err);
  }
}

export default {
  getAchievements,
  checkAchievements,
  initializeAchievements
};