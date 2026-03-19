import Challenge from '../models/Challenge.js';
import User from '../models/User.js';

/**
 * Get all active challenges
 */
async function getActiveChallenges(req, res) {
  try {
    const now = new Date();
    const challenges = await Challenge.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ difficulty: 1, createdAt: -1 });

    const userId = req.user?.id;
    let userChallenges = [];

    if (userId) {
      const user = await User.findById(userId);
      userChallenges = user?.activeChallenges || [];
    }

    const challengesWithProgress = challenges.map(challenge => {
      const userChallenge = userChallenges.find(uc => uc.challengeId === challenge._id.toString());
      return {
        ...challenge.toObject(),
        progress: userChallenge?.progress || 0,
        joined: !!userChallenge,
        daysRemaining: Math.ceil((challenge.endDate - now) / (1000 * 60 * 60 * 24))
      };
    });

    res.json({ success: true, challenges: challengesWithProgress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Join a challenge
 */
async function joinChallenge(req, res) {
  try {
    const userId = req.user?.id;
    const { challengeId } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId);
    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Check if already joined
    const alreadyJoined = user.activeChallenges.some(uc => uc.challengeId === challengeId);
    if (alreadyJoined) {
      return res.status(400).json({ success: false, message: 'Already joined this challenge' });
    }

    // Check participant limit
    if (challenge.maxParticipants && challenge.currentParticipants >= challenge.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Challenge is full' });
    }

    // Add to user's active challenges
    user.activeChallenges.push({
      challengeId: challenge._id,
      progress: 0,
      joinedAt: new Date()
    });

    // Update participant count
    challenge.currentParticipants += 1;

    await user.save();
    await challenge.save();

    res.json({
      success: true,
      message: 'Successfully joined challenge',
      challenge: {
        ...challenge.toObject(),
        progress: 0,
        joined: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get user's challenge progress
 */
async function getUserChallengeProgress(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId);

    if (!user || !user.activeChallenges.length) {
      return res.json({ success: true, challenges: [] });
    }

    // Get full challenge details
    const challengeIds = user.activeChallenges.map(uc => uc.challengeId);
    const challenges = await Challenge.find({ _id: { $in: challengeIds } });

    const challengeProgress = user.activeChallenges.map(userChallenge => {
      const challenge = challenges.find(c => c._id.toString() === userChallenge.challengeId.toString());
      return {
        challenge: challenge.toObject(),
        progress: userChallenge.progress,
        joinedAt: userChallenge.joinedAt,
        completionPercentage: Math.min(100, (userChallenge.progress / (challenge.requirements.tripCount || 1)) * 100)
      };
    });

    res.json({ success: true, challenges: challengeProgress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Create a new challenge (admin only)
 */
async function createChallenge(req, res) {
  try {
    const { title, description, type, requirements, rewards, startDate, endDate, icon, difficulty, category } = req.body;

    if (!title || !type || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const challenge = new Challenge({
      title,
      description,
      type,
      requirements,
      rewards,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      icon,
      difficulty,
      category,
      isActive: true
    });

    await challenge.save();

    res.json({
      success: true,
      message: 'Challenge created successfully',
      challenge
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Update user challenge progress (called after trip completion)
 */
export async function updateChallengeProgress(userId, tripData) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.activeChallenges.length) return;

    const now = new Date();
    const activeChallenges = user.activeChallenges.filter(uc => {
      const challenge = new Challenge({ endDate: now }); // dummy for comparison
      return uc.endDate > now;
    });

    for (let i = 0; i < activeChallenges.length; i++) {
      const userChallenge = activeChallenges[i];
      const challenge = await Challenge.findById(userChallenge.challengeId);

      if (!challenge) continue;

      const { requirements } = challenge;
      let shouldProgress = false;

      // Check if trip matches requirements
      if (requirements.tripCount) {
        shouldProgress = true;
        userChallenge.progress += 1;
      }

      if (requirements.modeRequired && tripData.mode === requirements.modeRequired) {
        shouldProgress = true;
      }

      if (requirements.distanceKm && tripData.distanceKm >= requirements.distanceKm) {
        shouldProgress = true;
      }

      if (requirements.ecoScoreMin && tripData.ecoScore >= requirements.ecoScoreMin) {
        shouldProgress = true;
      }

      // Check if challenge is completed
      if (userChallenge.progress >= (requirements.tripCount || 1)) {
        // Award rewards
        challenge.rewards.xp && (user.xp += challenge.rewards.xp);
        challenge.rewards.carbonCredits && (user.carbonCredits += challenge.rewards.carbonCredits);
        challenge.rewards.trees && (user.treesGrown += challenge.rewards.trees);

        // Remove from active challenges
        userChallenge.completedAt = new Date();
      }
    }

    await user.save();
  } catch (error) {
    console.error('Error updating challenge progress:', error);
  }
}

export default {
  getActiveChallenges,
  joinChallenge,
  getUserChallengeProgress,
  createChallenge,
  updateChallengeProgress
};
