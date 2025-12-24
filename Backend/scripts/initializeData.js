import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initializeAchievements } from '../controllers/achievementController.js';
import { initializeChallenges } from '../utils/initializeChallenges.js';
import { initializeRewards } from '../controllers/rewardController.js';

dotenv.config();

async function initializeData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Initialize achievements
    console.log('Initializing achievements...');
    await initializeAchievements();

    // Initialize challenges
    console.log('Initializing challenges...');
    await initializeChallenges();

    // Initialize rewards
    console.log('Initializing rewards...');
    await initializeRewards();

    console.log('✅ Data initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing data:', error);
    process.exit(1);
  }
}

initializeData();