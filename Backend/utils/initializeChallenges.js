import Challenge from '../models/Challenge.js';

export async function initializeChallenges() {
  try {
    const existingCount = await Challenge.countDocuments();
    if (existingCount > 0) return; // Already initialized
    
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of current week
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of current week
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const defaultChallenges = [
      // Daily Challenges
      {
        title: 'Green Commute Today',
        description: 'Use public transport or eco-friendly mode for your commute today',
        type: 'daily',
        requirements: {
          tripCount: 1,
          modeRequired: 'PUBLIC'
        },
        rewards: {
          xp: 50,
          carbonCredits: 10,
          trees: 1
        },
        startDate: now,
        endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours
        icon: '🚌',
        difficulty: 'easy',
        category: 'transport'
      },
      {
        title: 'Walk It Off',
        description: 'Take a walking trip today',
        type: 'daily',
        requirements: {
          tripCount: 1,
          modeRequired: 'WALK'
        },
        rewards: {
          xp: 40,
          carbonCredits: 8,
          trees: 1
        },
        startDate: now,
        endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        icon: '🚶',
        difficulty: 'easy',
        category: 'transport'
      },
      
      // Weekly Challenges
      {
        title: 'Public Transport Hero',
        description: 'Use public transport for 5 trips this week',
        type: 'weekly',
        requirements: {
          tripCount: 5,
          modeRequired: 'PUBLIC'
        },
        rewards: {
          xp: 200,
          carbonCredits: 50,
          badge: 'weekly_public_hero',
          trees: 3
        },
        startDate: weekStart,
        endDate: weekEnd,
        icon: '🚇',
        difficulty: 'medium',
        category: 'transport'
      },
      {
        title: 'Eco Distance Champion',
        description: 'Travel 25km using eco-friendly modes this week',
        type: 'weekly',
        requirements: {
          distanceKm: 25
        },
        rewards: {
          xp: 300,
          carbonCredits: 75,
          badge: 'distance_champion',
          trees: 5
        },
        startDate: weekStart,
        endDate: weekEnd,
        icon: '🏆',
        difficulty: 'medium',
        category: 'distance'
      },
      {
        title: 'Efficiency Master',
        description: 'Maintain an average ecoScore of 75+ for 3 trips this week',
        type: 'weekly',
        requirements: {
          tripCount: 3,
          ecoScoreMin: 75
        },
        rewards: {
          xp: 250,
          carbonCredits: 60,
          badge: 'efficiency_master',
          trees: 4
        },
        startDate: weekStart,
        endDate: weekEnd,
        icon: '⭐',
        difficulty: 'hard',
        category: 'efficiency'
      },
      {
        title: 'Cycling Enthusiast',
        description: 'Cycle for 15km total this week',
        type: 'weekly',
        requirements: {
          distanceKm: 15,
          modeRequired: 'CYCLE'
        },
        rewards: {
          xp: 350,
          carbonCredits: 80,
          badge: 'cycling_enthusiast',
          trees: 6
        },
        startDate: weekStart,
        endDate: weekEnd,
        icon: '🚴',
        difficulty: 'medium',
        category: 'transport'
      },
      
      // Monthly Challenges
      {
        title: 'Consistency Champion',
        description: 'Take eco-friendly trips for 15 days this month',
        type: 'monthly',
        requirements: {
          consecutiveDays: 15
        },
        rewards: {
          xp: 1000,
          carbonCredits: 200,
          badge: 'consistency_champion',
          trees: 15
        },
        startDate: monthStart,
        endDate: monthEnd,
        icon: '🔥',
        difficulty: 'hard',
        category: 'streak'
      },
      {
        title: 'Carbon Warrior',
        description: 'Complete 30 eco-friendly trips this month',
        type: 'monthly',
        requirements: {
          tripCount: 30
        },
        rewards: {
          xp: 1500,
          carbonCredits: 300,
          badge: 'carbon_warrior',
          trees: 20
        },
        startDate: monthStart,
        endDate: monthEnd,
        icon: '🌍',
        difficulty: 'hard',
        category: 'transport'
      }
    ];
    
    await Challenge.insertMany(defaultChallenges);
    console.log(`Initialized ${defaultChallenges.length} default challenges`);
    
  } catch (err) {
    console.error('initializeChallenges error', err.message || err);
  }
}

export default { initializeChallenges };