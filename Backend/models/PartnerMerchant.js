import mongoose from 'mongoose';

const partnerMerchantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['food', 'transport', 'fitness', 'retail', 'entertainment', 'green_products', 'services'],
    required: true 
  },
  logo: { type: String },
  description: { type: String },
  
  // Offer Details
  offerType: {
    type: String,
    enum: ['discount', 'cashback', 'voucher', 'free_item', 'points'],
    required: true
  },
  offerValue: { type: String, required: true }, // e.g., "20% off", "₹100 cashback"
  offerDescription: { type: String },
  
  // Redemption
  carbonCreditsCost: { type: Number, required: true },
  minEcoScoreRequired: { type: Number, default: 0 },
  minLevelRequired: { type: Number, default: 1 },
  
  // Availability
  isActive: { type: Boolean, default: true },
  stockAvailable: { type: Number, default: -1 }, // -1 = unlimited
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date },
  
  // Usage Limits
  maxRedemptionsPerUser: { type: Number, default: 1 },
  totalRedemptions: { type: Number, default: 0 },
  maxTotalRedemptions: { type: Number, default: -1 }, // -1 = unlimited
  
  // Partner Info
  partnerWebsite: { type: String },
  partnerContact: { type: String },
  termsAndConditions: { type: String },
  howToRedeem: { type: String },
  
  // Locations (if physical stores)
  locations: [{
    city: String,
    address: String,
    lat: Number,
    lng: Number
  }],
  
  // Online/Offline
  redeemOnline: { type: Boolean, default: true },
  redeemOffline: { type: Boolean, default: false },
  
  // Featured
  isFeatured: { type: Boolean, default: false },
  priority: { type: Number, default: 0 }, // Higher = shown first
  
  // Analytics
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  
}, { timestamps: true });

// Index for efficient queries
partnerMerchantSchema.index({ category: 1, isActive: 1 });
partnerMerchantSchema.index({ carbonCreditsCost: 1 });
partnerMerchantSchema.index({ isFeatured: -1, priority: -1 });

export default mongoose.model('PartnerMerchant', partnerMerchantSchema);
