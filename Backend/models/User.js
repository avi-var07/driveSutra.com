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
    unlockedAchievements: [{ type: String }], // achievement IDs
    activeChallenges: [{ 
      challengeId: String,
      progress: { type: Number, default: 0 },
      joinedAt: { type: Date, default: Date.now }
    }],
    
    // Anti-fraud tracking
    fraudStrikes: { type: Number, default: 0 },
    
    // Google Fit integration (optional)
    googleFitConnected: { type: Boolean, default: false },
    googleFitToken: { type: String, default: "" }
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
  return await bcrypt.compare(plainPassword, this.password);
};

export default mongoose.model("User", userSchema);
