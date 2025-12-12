import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g., "first_trip", "eco_warrior"
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  // Achievement Requirements
  requirements: {
    tripCount: { type: Number },
    totalDistance: { type: Number },
    ecoScoreAverage: { type: Number },
    streakDays: { type: Number },
    co2Saved: { type: Number },
    specificMode: { type: String }, // "PUBLIC", "WALK", etc.
    treesGrown: { type: Number }
  },
  
  // Display Properties
  icon: { type: String, required: true }, // emoji or icon name
  color: { type: String, default: "#10B981" }, // hex color
  rarity: { type: String, enum: ["common", "rare", "epic", "legendary"], default: "common" },
  category: { type: String, enum: ["beginner", "transport", "distance", "efficiency", "environmental", "streak"], required: true },
  
  // Rewards for unlocking
  rewards: {
    xp: { type: Number, default: 0 },
    carbonCredits: { type: Number, default: 0 },
    title: { type: String } // special title for user profile
  },
  
  // Metadata
  isHidden: { type: Boolean, default: false }, // hidden until unlocked
  order: { type: Number, default: 0 } // display order
}, { timestamps: true });

export default mongoose.model('Achievement', achievementSchema);