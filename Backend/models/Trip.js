import mongoose from 'mongoose'

const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Route Information
  startLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  endLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },

  // Trip Details
  mode: {
    type: String,
    enum: ["PUBLIC", "WALK", "CYCLE", "CAR", "BIKE"],
    required: true
  },
  distanceKm: { type: Number, required: true },
  etaMinutes: { type: Number, required: true }, // expected time from ORS
  actualMinutes: { type: Number }, // actual time taken (for completed trips)

  // Trip Status
  status: {
    type: String,
    enum: ["planned", "in_progress", "paused", "completed", "cancelled"],
    default: "planned"
  },
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  startTime: { type: Date },
  endTime: { type: Date },

  // Scoring & Rewards
  ecoScore: { type: Number, default: 0 },
  ecoComponents: {
    modeComponent: { type: Number, default: 0 },
    efficiencyComponent: { type: Number, default: 0 },
    behaviorComponent: { type: Number, default: 0 },
    weatherComponent: { type: Number, default: 0 },
    verificationComponent: { type: Number, default: 0 }
  },
  xpEarned: { type: Number, default: 0 },
  carbonCreditsEarned: { type: Number, default: 0 },
  co2Saved: { type: Number, default: 0 }, // in kg
  treesGrown: { type: Number, default: 0 },

  // Weather Conditions
  weather: {
    condition: { type: String }, // "clear", "rain", "fog", etc.
    temp: { type: Number }, // in Celsius
    description: { type: String }
  },

  // Booking Type
  bookedWithUs: { type: Boolean, default: false },
  bookingRef: { type: String },
  ticketBookedAt: { type: Date },
  ticketExpiresAt: { type: Date },

  // Verification Data
  verification: {
    ticketUploaded: { type: Boolean, default: false },
    ticketImageUrl: { type: String },
    transactionVerified: { type: Boolean, default: false },
    transactionId: { type: String },
    stepsData: {
      steps: { type: Number },
      distance: { type: Number },
      calories: { type: Number },
      avgHeartRate: { type: Number },
      source: { type: String } // "google_fit", "apple_health", "samsung_health", "manual"
    },
    speedAnalysis: {
      avgSpeed: { type: Number },
      maxSpeed: { type: Number },
      speedViolations: { type: Number, default: 0 },
      realTimeTracking: { type: Boolean, default: false }
    },
    publicTransport: {
      metroStation: { type: String },
      busRoute: { type: String },
      fare: { type: Number },
      verificationMethod: { type: String } // "ticket", "transaction", "metro_card"
    },
    // Selfie verification for CAR/BIKE
    selfieRequired: { type: Boolean, default: false },
    selfieUrls: [{ type: String }],
    selfieVerified: { type: Boolean, default: false },
    selfieAttempts: { type: Number, default: 0 },
    // Fraud detection results
    fraudCheck: {
      fraudScore: { type: Number },
      confidenceScore: { type: Number },
      status: { type: String },
      flags: [{ type: String }],
      requiresManualReview: { type: Boolean },
      checkedAt: { type: Date }
    },
    // Admin verification
    adminVerified: { type: Boolean, default: false },
    rejected: { type: Boolean, default: false },
    rejectionReason: { type: String },
    adminNotes: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    verifiedAt: { type: Date },
    // Lag detection events (GPS gaps > 60s)
    lagEvents: [{
      detectedAt: { type: Date },
      gapDurationSec: { type: Number },
      selfieProvided: { type: Boolean, default: false },
      selfieUrl: { type: String }
    }],
    lagCount: { type: Number, default: 0 },
    tripFlagged: { type: Boolean, default: false },
    flagReason: { type: String }
  },

  // Real-time Tracking Data
  tracking: {
    enabled: { type: Boolean, default: false },
    locationHistory: [{
      lat: { type: Number },
      lng: { type: Number },
      accuracy: { type: Number },
      speed: { type: Number }, // m/s
      timestamp: { type: Date }
    }],
    totalDistanceTracked: { type: Number, default: 0 },
    maxSpeedRecorded: { type: Number, default: 0 },
    avgSpeedRecorded: { type: Number, default: 0 }
  },

  // Route Geometry & Metadata
  routeGeometry: { type: Object }, // GeoJSON or encoded polyline
  metadata: {
    source: { type: String, default: "MAPPLS" }, // "MAPPLS" or "OSRM"
    apiResponse: { type: Object }
  }
}, { timestamps: true })

export default mongoose.model('Trip', tripSchema)
