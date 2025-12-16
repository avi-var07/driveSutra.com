import mongoose from 'mongoose';
import crypto from 'crypto';

const sessionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Session Information
  sessionToken: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  // Device & Location Info
  deviceInfo: {
    userAgent: { type: String },
    browser: { type: String },
    os: { type: String },
    device: { type: String },
    ip: { type: String }
  },
  
  // Location Data (optional)
  location: {
    country: { type: String },
    city: { type: String },
    region: { type: String },
    timezone: { type: String }
  },
  
  // Session Status
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // Timestamps
  loginTime: { 
    type: Date, 
    default: Date.now 
  },
  
  logoutTime: { 
    type: Date 
  },
  
  lastActivity: { 
    type: Date, 
    default: Date.now 
  },
  
  // Session Duration (calculated on logout)
  duration: { 
    type: Number // in minutes
  },
  
  // Session Type
  loginMethod: {
    type: String,
    enum: ['email', 'google', 'facebook'],
    default: 'email'
  },
  
  // Security
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, { 
  timestamps: true
});

// Index for better query performance
sessionSchema.index({ user: 1, isActive: 1 });
sessionSchema.index({ sessionToken: 1 }, { unique: true });
sessionSchema.index({ loginTime: -1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to end session
sessionSchema.methods.endSession = function() {
  this.isActive = false;
  this.logoutTime = new Date();
  this.duration = Math.round((this.logoutTime - this.loginTime) / (1000 * 60)); // minutes
  return this.save();
};

// Static method to create new session
sessionSchema.statics.createSession = async function(userId, deviceInfo, location, loginMethod = 'email') {
  // End any existing active sessions for this user (optional - for single session per user)
  // await this.updateMany({ user: userId, isActive: true }, { isActive: false, logoutTime: new Date() });
  
  // Generate unique session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  
  const session = new this({
    user: userId,
    sessionToken,
    deviceInfo,
    location,
    loginMethod
  });
  
  return session.save();
};

// Static method to find active session
sessionSchema.statics.findActiveSession = function(sessionToken) {
  return this.findOne({ 
    sessionToken, 
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).populate('user', '-password');
};

// Update last activity
sessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

export default mongoose.model('Session', sessionSchema);