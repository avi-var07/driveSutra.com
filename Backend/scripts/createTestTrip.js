import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Trip from '../models/Trip.js';

dotenv.config();

async function createTestTrip() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      testUser = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Test@123',
        isVerified: true,
        xp: 100,
        level: 2,
        ecoScore: 75,
        carbonCredits: 50,
        totalTrips: 5,
        totalDistance: 25
      });
      console.log('✅ Created test user');
    } else {
      console.log('✅ Found existing test user');
    }

    // Create a completed trip pending verification
    const trip = await Trip.create({
      user: testUser._id,
      startLocation: {
        lat: 28.6139,
        lng: 77.2090,
        address: 'Connaught Place, New Delhi'
      },
      endLocation: {
        lat: 28.7041,
        lng: 77.1025,
        address: 'Rajiv Chowk Metro Station'
      },
      mode: 'PUBLIC',
      distanceKm: 12.5,
      etaMinutes: 35,
      actualMinutes: 38,
      status: 'completed',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      ecoScore: 85,
      ecoComponents: {
        modeComponent: 95,
        efficiencyComponent: 85,
        behaviorComponent: 90,
        weatherComponent: 75,
        verificationComponent: 70
      },
      xpEarned: 45,
      carbonCreditsEarned: 25,
      co2Saved: 2.4,
      weather: {
        condition: 'clear',
        temp: 28,
        description: 'Clear sky'
      },
      verification: {
        ticketUploaded: true,
        ticketImageUrl: 'https://example.com/ticket.jpg',
        transactionVerified: false,
        transactionId: 'TXN123456789',
        publicTransport: {
          metroStation: 'Rajiv Chowk',
          fare: 40,
          verificationStatus: 'pending'
        }
      },
      tracking: {
        locationHistory: [
          { lat: 28.6139, lng: 77.2090, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
          { lat: 28.6500, lng: 77.1800, timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000) },
          { lat: 28.7041, lng: 77.1025, timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000) }
        ],
        speedAnalysis: {
          avgSpeed: 19.7,
          maxSpeed: 45,
          speedViolations: 0,
          realTimeTracking: true
        }
      }
    });

    console.log('\n✅ Test trip created successfully!');
    console.log('\n📊 Trip Details:');
    console.log(`   Trip ID: ${trip._id}`);
    console.log(`   User: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   Mode: ${trip.mode}`);
    console.log(`   Distance: ${trip.distanceKm} km`);
    console.log(`   EcoScore: ${trip.ecoScore}`);
    console.log(`   Status: ${trip.status}`);
    console.log(`   Verification: Pending`);
    console.log('\n🌐 View in admin dashboard: http://localhost:5173/admin/dashboard');
    console.log('\n📧 Test User Credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: Test@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test trip:', error);
    process.exit(1);
  }
}

createTestTrip();
