import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import Trip from '../models/Trip.js';

// Get all active challenges
export async function getActiveChallenges(req, res) {
  try {
    const now = new Date();
    
    const challenges = await Challenge.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ createdAt: -1 });

    // If user is authenticated, include their progress
    if (req.user) {
      const user = await User.findById(req.user._id);
      const userChallenges = user.activeChallenges || [];
      
      const challengesWithProgress = challenges.map(challenge => {
        const userChallenge = userChallenges.find(uc => uc.challengeId === challenge._id.toString());
        return {
          ...challenge.toObject(),
          userProgress: userChallenge ? userChallenge.progress : 0,
          isJoined: !!userChallenge,
          joinedAt: userChallenge?.joinedAt
        };
      });
      
      return res.json({ success: true, challenges: challengesWithProgress });
    }

    return res.json({ success: true, challenges });
    
  } catch (err) {
    console.error('getActiveChallenges error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Join a challenge
export async function joinChallenge(req, res) {
  try {
    const { challengeId } = req.params;
    
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    
    if (!challenge.isActive || new Date() > challenge.endDate) {
      return res.status(400).json({ message: 'Challenge is not active' });
    }
    
    const user = await User.findById(req.user._id);
    const alreadyJoined = user.activeChallenges.some(uc => uc.challengeId === challengeId);
    
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }
    
    // Check participant limit
    if (challenge.maxParticipants && challenge.currentParticipants >= challenge.maxParticipants) {
      return res.status(400).json({ message: 'Challenge is full' });
    }
    
    // Add challenge to user
    user.activeChallenges.push({
      challengeId: challengeId,
      progress: 0,
      joinedAt: new Date()
    });
    
    // Update challenge participant count
    challenge.currentParticipants += 1;
    
    await Promise.all([user.save(), challenge.save()]);
    
    return res.json({ 
      success: true, 
      message: 'Successfully joined challenge!',
      challenge: {
        ...challenge.toObject(),
        userProgress: 0,
        isJoined: true,
        joinedAt: new Date()
      }
    });
    
  } catch (err) {
    console.error('joinChallenge error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Get user's challenge progress
export async function getUserChallengeProgress(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const user = await User.findById(req.user._id);
    const activeChallengeIds = user.activeChallenges.map(uc => uc.challengeId);
    
    if (activeChallengeIds.length === 0) {
      return res.json({ success: true, challenges: [] });
    }
    
    const challenges = await Challenge.find({ _id: { $in: activeChallengeIds } });
    
    const challengesWithProgress = await Promise.all(
      challenges.map(async (challenge) => {
        const userChallenge = user.activeChallenges.find(uc => uc.challengeId === challenge._id.toString());
        const progress = await calculateChallengeProgress(req.user._id, challenge, userChallenge.joinedAt);
        
        return {
          ...challenge.toObject(),
          userProgress: progress,
          isJoined: true,
          joinedAt: userChallenge.joinedAt,
          isCompleted: progress >= 100
        };
      })
    );
    
    return res.json({ success: true, challenges: challengesWithProgress });
    
  } catch (err) {
    console.error('getUserChallengeProgress error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Helper function to calculate challenge progress
async function calculateChallengeProgress(userId, challenge, joinedAt) {
  const requirements = challenge.requirements;
  let progress = 0;
  
  // Get user trips since joining the challenge
  const trips = await Trip.find({
    user: userId,
    status: 'completed',
    createdAt: { $gte: joinedAt, $lte: challenge.endDate }
  });
  
  if (requirements.tripCount) {
    let validTrips = trips;
    if (requirements.modeRequired) {
      validTrips = trips.filter(trip => trip.mode === requirements.modeRequired);
    }
    if (requirements.ecoScoreMin) {
      validTrips = validTrips.filter(trip => trip.ecoScore >= requirements.ecoScoreMin);
    }
    progress = Math.min(100, (validTrips.length / requirements.tripCount) * 100);
  }
  
  if (requirements.distanceKm) {
    let validTrips = trips;
    if (requirements.modeRequired) {
      validTrips = trips.filter(trip => trip.mode === requirements.modeRequired);
    }
    const totalDistance = validTrips.reduce((sum, trip) => sum + trip.distanceKm, 0);
    progress = Math.min(100, (totalDistance / requirements.distanceKm) * 100);
  }
  
  if (requirements.consecutiveDays) {
    // Calculate consecutive days with eco-friendly trips
    const tripDates = trips
      .filter(trip => ['PUBLIC', 'WALK', 'CYCLE'].includes(trip.mode))
      .map(trip => trip.createdAt.toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort();
    
    let maxConsecutive = 0;
    let currentConsecutive = 0;
    
    for (let i = 0; i < tripDates.length; i++) {
      if (i === 0 || isConsecutiveDay(tripDates[i-1], tripDates[i])) {
        currentConsecutive++;
      } else {
        currentConsecutive = 1;
      }
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    }
    
    progress = Math.min(100, (maxConsecutive / requirements.consecutiveDays) * 100);
  }
  
  return Math.round(progress);
}

// Helper function to check if two date strings are consecutive days
function isConsecutiveDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

// Create a new challenge (admin function)
export async function createChallenge(req, res) {
  try {
    const challengeData = req.body;
    
    // Validate required fields
    if (!challengeData.title || !challengeData.description || !challengeData.type) {
      return res.status(400).json({ message: 'Missing required challenge data' });
    }
    
    const challenge = await Challenge.create(challengeData);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Challenge created successfully',
      challenge 
    });
    
  } catch (err) {
    console.error('createChallenge error', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

export default {
  getActiveChallenges,
  joinChallenge,
  getUserChallengeProgress,
  createChallenge
};