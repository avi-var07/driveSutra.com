import mongoose from 'mongoose';

const userRewardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reward: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
  
  // Redemption Details
  status: { 
    type: String, 
    enum: ["redeemed", "used", "expired"], 
    default: "redeemed" 
  },
  redeemedAt: { type: Date, default: Date.now },
  usedAt: { type: Date },
  expiresAt: { type: Date, required: true },
  
  // Generated Content
  couponCode: { type: String, required: true }, // unique generated code
  qrCode: { type: String }, // QR code for easy redemption
  
  // Cost Tracking
  carbonCreditsSpent: { type: Number, required: true },
  userEcoScoreAtRedemption: { type: Number },
  userLevelAtRedemption: { type: Number },
  
  // Usage Tracking
  usageInstructions: { type: String },
  usageNotes: { type: String } // user can add notes about usage
}, { timestamps: true });

// Index for efficient queries
userRewardSchema.index({ user: 1, status: 1 });
userRewardSchema.index({ expiresAt: 1 });

export default mongoose.model('UserReward', userRewardSchema);