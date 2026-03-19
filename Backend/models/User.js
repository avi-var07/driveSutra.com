import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    isVerified: { type: Boolean, default: false }, // email OTP verification
    
    // Gamification & Progress
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    ecoScore: { type: Number, default: 0 }, // average or latest
    carbonCredits: { type: Number, default: 0 },
    treesGrown: { type: Number, default: 0 },
    co2Saved: { type: Number, default: 0 }, // in kg
    
    // Streaks & Stats
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastTripDate: { type: Date },
    totalTrips: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 }, // in km
    
    // User Preferences
    city: { type: String, default: "" },
    vehicleType: { type: String, enum: ["car", "bike", "none"], default: "car" },
    fuelType: { type: String, enum: ["petrol", "diesel", "electric", "hybrid", "none"], default: "petrol" },
    
    // Achievements & Challenges
    unlockedAchievements: [{ 
      achievementId: { type: String },
      unlockedAt: { type: Date, default: Date.now }
    }],
    activeChallenges: [{ 
      challengeId: String,
      progress: { type: Number, default: 0 },
      joinedAt: { type: Date, default: Date.now }
    }],
    
    // Health Profile for Personalized Recommendations
    healthProfile: {
      age: { type: Number },
      weight: { type: Number }, // in kg
      height: { type: Number }, // in cm
      bmi: { type: Number },
      activityLevel: { 
        type: String, 
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
        default: 'moderate'
      },
      fitnessGoal: {
        type: String,
        enum: ['weight_loss', 'fitness', 'health', 'environment', 'all'],
        default: 'all'
      },
      medicalConditions: [{ type: String }], // e.g., 'asthma', 'knee_pain'
      walkingCapacity: { type: Number, default: 5 }, // max km comfortable walking
      cyclingCapacity: { type: Number, default: 15 }, // max km comfortable cycling
      preferredModes: [{ type: String }], // preferred transport modes
      avoidModes: [{ type: String }] // modes to avoid
    },
    
    // Travel Behavior Analysis
    travelBehavior: {
      avgTripDistance: { type: Number, default: 0 },
      mostUsedMode: { type: String },
      peakTravelTime: { type: String }, // 'morning', 'afternoon', 'evening', 'night'
      weekdayTrips: { type: Number, default: 0 },
      weekendTrips: { type: Number, default: 0 },
      rushHourTrips: { type: Number, default: 0 },
      weatherPreference: { type: String }, // 'all_weather', 'fair_weather_only'
      lastModeUsed: { type: String },
      modeFrequency: {
        PUBLIC: { type: Number, default: 0 },
        WALK: { type: Number, default: 0 },
        CYCLE: { type: Number, default: 0 },
        CAR: { type: Number, default: 0 },
        BIKE: { type: Number, default: 0 }
      }
    },
    
    // Anti-fraud tracking
    fraudStrikes: { type: Number, default: 0 },
    
    // Google integration
    googleId: { type: String }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (plainPassword) {
  try {
    const result = await bcrypt.compare(plainPassword, this.password);
    console.log(`Password comparison for ${this.email}: ${result ? 'SUCCESS' : 'FAILED'}`);
    return result;
  } catch (error) {
    console.error(`Password comparison error for ${this.email}:`, error);
    return false;
  }
};

export default mongoose.model("User", userSchema);
