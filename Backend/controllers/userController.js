import User from '../models/User.js';
import Trip from '../models/Trip.js';
import { checkAchievements } from './achievementController.js';

// Get user dashboard stats
export async function getDashboardStats(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Get recent trips
    const recentTrips = await Trip.find({ 
      user: req.user._id, 
      status: 'completed' 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('mode distanceKm ecoScore createdAt startLocation endLocation');
    
    // Calculate level progress
    const currentLevelXP = (user.level - 1) * 1000;
    const nextLevelXP = user.level * 1000;
    const levelProgress = ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    
    // Get level title
    const levelTitles = [
      'Seedling', 'Sprout', 'Sapling', 'Young Tree', 'Growing Tree',
      'Mature Tree', 'Forest Guardian', 'Eco Warrior', 'Green Champion', 'Planet Protector'
    ];
    const levelTitle = levelTitles[Math.min(user.level - 1, levelTitles.length - 1)] || 'Planet Protector';
    
    // Calculate this week's stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekTrips = await Trip.find({
      user: req.user._id,
      status: 'completed',
      createdAt: { $gte: weekStart }
    });
    
    const weekStats = {
      trips: weekTrips.length,
      distance: weekTrips.reduce((sum, trip) => sum + trip.distanceKm, 0),
      co2Saved: weekTrips.reduce((sum, trip) => sum + (trip.co2Saved || 0), 0),
      avgEcoScore: weekTrips.length > 0 
        ? Math.round(weekTrips.reduce((sum, trip) => sum + trip.ecoScore, 0) / weekTrips.length)
        : 0
    };
    
    const dashboardData = {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        levelTitle,
        xp: user.xp,
        levelProgress: Math.round(levelProgress),
        ecoScore: user.ecoScore,
        carbonCredits: user.carbonCredits,
        treesGrown: user.treesGrown,
        co2Saved: user.co2Saved,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalTrips: user.totalTrips,
        totalDistance: user.totalDistance
      },
      recentTrips,
      weekStats,
      achievements: {
        total: user.unlockedAchievements?.length || 0,
        recent: [] // TODO: Add recent achievements
      }
    };
    
    return res.json({ success: true, data: dashboardData });
    
  } catch (err) {
    console.error('getDashboardStats error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Get user profile
export async function getUserProfile(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    return res.json({ success: true, user });
    
  } catch (err) {
    console.error('getUserProfile error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Update user profile
export async function updateUserProfile(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const { firstName, lastName, avatar, city, vehicleType, fuelType } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (typeof avatar !== 'undefined') user.avatar = avatar;
    if (city) user.city = city;
    if (vehicleType) user.vehicleType = vehicleType;
    if (fuelType) user.fuelType = fuelType;
    
    await user.save();
    
    // Return updated user (exclude password)
    const updatedUser = await User.findById(req.user._id).select('-password');
    
    return res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
    
  } catch (err) {
    console.error('updateUserProfile error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Get leaderboard
export async function getLeaderboard(req, res) {
  try {
    const { type = 'xp', limit = 10 } = req.query;
    
    let sortField = 'xp';
    switch (type) {
      case 'ecoScore':
        sortField = 'ecoScore';
        break;
      case 'co2Saved':
        sortField = 'co2Saved';
        break;
      case 'streak':
        sortField = 'currentStreak';
        break;
      case 'distance':
        sortField = 'totalDistance';
        break;
      default:
        sortField = 'xp';
    }
    
    const users = await User.find({})
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .select('firstName lastName avatar level xp ecoScore co2Saved currentStreak totalDistance treesGrown');
    
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      level: user.level,
      value: user[sortField],
      stats: {
        xp: user.xp,
        ecoScore: user.ecoScore,
        co2Saved: user.co2Saved,
        currentStreak: user.currentStreak,
        totalDistance: user.totalDistance,
        treesGrown: user.treesGrown
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
      type 
    });
    
  } catch (err) {
    console.error('getLeaderboard error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Get user statistics
export async function getUserStats(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Get trip statistics by mode
    const tripsByMode = await Trip.aggregate([
      { $match: { user: req.user._id, status: 'completed' } },
      { 
        $group: {
          _id: '$mode',
          count: { $sum: 1 },
          totalDistance: { $sum: '$distanceKm' },
          avgEcoScore: { $avg: '$ecoScore' },
          totalCO2Saved: { $sum: '$co2Saved' }
        }
      }
    ]);
    
    // Get monthly trip statistics
    const monthlyStats = await Trip.aggregate([
      { $match: { user: req.user._id, status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          trips: { $sum: 1 },
          distance: { $sum: '$distanceKm' },
          co2Saved: { $sum: '$co2Saved' },
          avgEcoScore: { $avg: '$ecoScore' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    const stats = {
      overview: {
        totalTrips: user.totalTrips,
        totalDistance: user.totalDistance,
        co2Saved: user.co2Saved,
        treesGrown: user.treesGrown,
        avgEcoScore: user.ecoScore,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak
      },
      tripsByMode,
      monthlyStats: monthlyStats.reverse() // Show oldest to newest
    };
    
    return res.json({ success: true, stats });
    
  } catch (err) {
    console.error('getUserStats error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Trigger achievement check (can be called after trip completion)
export async function triggerAchievementCheck(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const newAchievements = await checkAchievements(req.user._id);
    
    return res.json({ 
      success: true, 
      newAchievements,
      message: newAchievements.length > 0 
        ? `Congratulations! You unlocked ${newAchievements.length} new achievement(s)!`
        : 'No new achievements unlocked'
    });
    
  } catch (err) {
    console.error('triggerAchievementCheck error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

export default {
  getDashboardStats,
  getUserProfile,
  updateUserProfile,
  getLeaderboard,
  getUserStats,
  triggerAchievementCheck
};