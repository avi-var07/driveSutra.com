import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["discount", "voucher", "gift_card", "merchandise", "experience"], 
    required: true 
  },
  
  // Reward Details
  brand: { type: String, required: true }, // e.g., "Starbucks", "Amazon", "Uber"
  value: { type: Number, required: true }, // monetary value or percentage
  currency: { type: String, default: "INR" },
  discountPercentage: { type: Number }, // for discount type rewards
  
  // Cost & Availability
  carbonCreditsCost: { type: Number, required: true },
  ecoScoreRequired: { type: Number, default: 0 }, // minimum ecoScore to unlock
  levelRequired: { type: Number, default: 1 }, // minimum level to unlock
  
  // Stock Management
  totalStock: { type: Number, default: -1 }, // -1 means unlimited
  remainingStock: { type: Number, default: -1 },
  
  // Reward Content
  couponCode: { type: String }, // for static coupon codes
  instructions: { type: String }, // how to redeem
  termsAndConditions: { type: String },
  expiryDays: { type: Number, default: 30 }, // days until reward expires after redemption
  
  // Display Properties
  image: { type: String }, // reward image URL
  icon: { type: String, default: "🎁" },
  color: { type: String, default: "#10B981" },
  featured: { type: Boolean, default: false },
  category: { 
    type: String, 
    enum: ["food", "transport", "shopping", "entertainment", "eco", "travel"],
    default: "shopping"
  },
  
  // Status
  isActive: { type: Boolean, default: true },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date },
  
  // Analytics
  totalRedemptions: { type: Number, default: 0 },
  popularity: { type: Number, default: 0 } // calculated based on views/redemptions
}, { timestamps: true });

export default mongoose.model('Reward', rewardSchema);