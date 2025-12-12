import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["daily", "weekly", "monthly", "special"], 
    required: true 
  },
  
  // Challenge Requirements
  requirements: {
    tripCount: { type: Number }, // e.g., "Take 3 trips"
    modeRequired: { type: String }, // e.g., "PUBLIC", "WALK", "CYCLE"
    distanceKm: { type: Number }, // e.g., "Walk total 5km"
    ecoScoreMin: { type: Number }, // e.g., "Achieve 80+ ecoScore"
    consecutiveDays: { type: Number } // e.g., "3 consecutive days"
  },
  
  // Rewards
  rewards: {
    xp: { type: Number, default: 0 },
    carbonCredits: { type: Number, default: 0 },
    badge: { type: String }, // achievement ID to unlock
    trees: { type: Number, default: 0 }
  },
  
  // Challenge Period
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  // Status
  isActive: { type: Boolean, default: true },
  maxParticipants: { type: Number }, // null = unlimited
  currentParticipants: { type: Number, default: 0 },
  
  // Display
  icon: { type: String }, // emoji or icon name
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  category: { type: String, enum: ["transport", "distance", "efficiency", "streak"], default: "transport" }
}, { timestamps: true });

export default mongoose.model('Challenge', challengeSchema);