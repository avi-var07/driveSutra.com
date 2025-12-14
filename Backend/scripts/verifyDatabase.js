import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Reward from '../models/Reward.js';
import UserReward from '../models/UserReward.js';
import Challenge from '../models/Challenge.js';
import Achievement from '../models/Achievement.js';

dotenv.config();

async function verifyDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check Users collection
    const userCount = await User.countDocuments();
    console.log(`👥 Users: ${userCount} documents`);
    
    if (userCount > 0) {
      const sampleUser = await User.findOne().select('firstName lastName email xp level ecoScore carbonCredits');
      console.log('   Sample user:', {
        name: `${sampleUser.firstName} ${sampleUser.lastName}`,
        email: sampleUser.email,
        xp: sampleUser.xp,
        level: sampleUser.level,
        ecoScore: sampleUser.ecoScore,
        carbonCredits: sampleUser.carbonCredits
      });
    }

    // Check Trips collection
    const tripCount = await Trip.countDocuments();
    console.log(`🚗 Trips: ${tripCount} documents`);
    
    if (tripCount > 0) {
      const sampleTrip = await Trip.findOne().select('mode distanceKm ecoScore status createdAt');
      console.log('   Sample trip:', {
        mode: sampleTrip.mode,
        distance: `${sampleTrip.distanceKm}km`,
        ecoScore: sampleTrip.ecoScore,
        status: sampleTrip.status,
        date: sampleTrip.createdAt.toDateString()
      });
      
      // Trip status breakdown
      const statusBreakdown = await Trip.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      console.log('   Trip status breakdown:', statusBreakdown);
    }

    // Check Rewards collection
    const rewardCount = await Reward.countDocuments();
    console.log(`🎁 Rewards: ${rewardCount} documents`);
    
    if (rewardCount > 0) {
      const sampleReward = await Reward.findOne().select('title brand value carbonCreditsCost category');
      console.log('   Sample reward:', {
        title: sampleReward.title,
        brand: sampleReward.brand,
        value: `₹${sampleReward.value}`,
        cost: `${sampleReward.carbonCreditsCost} credits`,
        category: sampleReward.category
      });
    }

    // Check User Rewards collection
    const userRewardCount = await UserReward.countDocuments();
    console.log(`🏆 User Rewards: ${userRewardCount} documents`);
    
    if (userRewardCount > 0) {
      const sampleUserReward = await UserReward.findOne()
        .populate('reward', 'title brand')
        .populate('user', 'firstName lastName')
        .select('status carbonCreditsSpent redeemedAt');
      
      console.log('   Sample user reward:', {
        user: `${sampleUserReward.user.firstName} ${sampleUserReward.user.lastName}`,
        reward: `${sampleUserReward.reward.brand} - ${sampleUserReward.reward.title}`,
        status: sampleUserReward.status,
        cost: `${sampleUserReward.carbonCreditsSpent} credits`,
        date: sampleUserReward.redeemedAt.toDateString()
      });
    }

    // Check Challenges collection
    const challengeCount = await Challenge.countDocuments();
    console.log(`🎯 Challenges: ${challengeCount} documents`);
    
    if (challengeCount > 0) {
      const sampleChallenge = await Challenge.findOne().select('title type isActive currentParticipants');
      console.log('   Sample challenge:', {
        title: sampleChallenge.title,
        type: sampleChallenge.type,
        active: sampleChallenge.isActive,
        participants: sampleChallenge.currentParticipants
      });
    }

    // Check Achievements collection
    const achievementCount = await Achievement.countDocuments();
    console.log(`🏅 Achievements: ${achievementCount} documents`);
    
    if (achievementCount > 0) {
      const sampleAchievement = await Achievement.findOne().select('title category rarity');
      console.log('   Sample achievement:', {
        title: sampleAchievement.title,
        category: sampleAchievement.category,
        rarity: sampleAchievement.rarity
      });
    }

    // Database health summary
    console.log('\n📊 Database Health Summary:');
    console.log(`   Total Collections: 6`);
    console.log(`   Total Documents: ${userCount + tripCount + rewardCount + userRewardCount + challengeCount + achievementCount}`);
    console.log(`   Database Size: ${(await mongoose.connection.db.stats()).dataSize} bytes`);

    // Check for any issues
    const issues = [];
    
    if (userCount === 0) issues.push('No users found');
    if (rewardCount === 0) issues.push('No rewards found');
    if (challengeCount === 0) issues.push('No challenges found');
    if (achievementCount === 0) issues.push('No achievements found');

    if (issues.length > 0) {
      console.log('\n⚠️  Issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log('\n💡 Run "npm run init-data" to initialize missing data');
    } else {
      console.log('\n✅ Database is healthy and properly populated!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  }
}

verifyDatabase();