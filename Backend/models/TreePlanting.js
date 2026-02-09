import mongoose from 'mongoose';

const treePlantingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  
  // Tree Details
  treeCount: { type: Number, required: true, default: 1 },
  species: { type: String, default: 'Mixed Native Species' },
  location: {
    name: { type: String, required: true }, // e.g., "Sundarbans, West Bengal"
    lat: { type: Number },
    lng: { type: Number },
    region: { type: String } // e.g., "Eastern India"
  },
  
  // Planting Status
  status: {
    type: String,
    enum: ['pending', 'planted', 'verified', 'failed'],
    default: 'pending'
  },
  plantedDate: { type: Date },
  verifiedDate: { type: Date },
  
  // Carbon Impact
  co2OffsetKg: { type: Number, required: true }, // CO2 offset from this tree
  estimatedAnnualOffset: { type: Number, default: 22 }, // kg CO2 per year
  
  // Verification
  verification: {
    method: { 
      type: String, 
      enum: ['gps', 'photo', 'certificate', 'partner_api'],
      default: 'certificate'
    },
    photoUrl: { type: String },
    certificateUrl: { type: String },
    gpsCoordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    verifiedBy: { type: String }, // Partner organization
    verificationDate: { type: Date }
  },
  
  // Partner Information
  partner: {
    name: { type: String, default: 'EcoDrive India' },
    organizationType: { type: String, default: 'NGO' },
    website: { type: String },
    contactEmail: { type: String }
  },
  
  // User Certificate
  certificate: {
    certificateNumber: { type: String, unique: true, sparse: true },
    issuedDate: { type: Date },
    downloadUrl: { type: String },
    qrCode: { type: String }
  },
  
  // Tracking
  growthUpdates: [{
    date: { type: Date },
    heightCm: { type: Number },
    healthStatus: { type: String, enum: ['healthy', 'moderate', 'poor'] },
    photoUrl: { type: String },
    notes: { type: String }
  }],
  
  // Metadata
  metadata: {
    campaignName: { type: String },
    seasonPlanted: { type: String }, // e.g., "Monsoon 2024"
    estimatedMaturityYears: { type: Number, default: 5 }
  }
}, { timestamps: true });

// Generate unique certificate number before saving
treePlantingSchema.pre('save', async function(next) {
  if (this.isNew && !this.certificate.certificateNumber) {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.certificate.certificateNumber = `TREE-${year}-${random}`;
  }
  next();
});

export default mongoose.model('TreePlanting', treePlantingSchema);
