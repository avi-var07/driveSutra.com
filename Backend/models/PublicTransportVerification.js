import mongoose from 'mongoose';

const publicTransportVerificationSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Verification Method
  verificationType: {
    type: String,
    enum: ['ticket_image', 'transaction', 'metro_card', 'qr_scan', 'manual'],
    required: true
  },
  
  // Ticket Details
  ticket: {
    imageUrl: { type: String },
    ticketNumber: { type: String },
    issueDate: { type: Date },
    validFrom: { type: Date },
    validTo: { type: Date },
    fare: { type: Number },
    currency: { type: String, default: 'INR' }
  },
  
  // Transaction Details
  transaction: {
    transactionId: { type: String },
    amount: { type: Number },
    timestamp: { type: Date },
    paymentMethod: { type: String }, // 'upi', 'card', 'wallet', 'cash'
    provider: { type: String }, // 'paytm', 'gpay', 'phonepe', etc.
    merchantName: { type: String },
    merchantId: { type: String }
  },
  
  // Metro Card Details
  metroCard: {
    cardNumber: { type: String },
    cardType: { type: String }, // 'smart_card', 'token', 'qr'
    entryStation: { type: String },
    exitStation: { type: String },
    entryTime: { type: Date },
    exitTime: { type: Date },
    fare: { type: Number },
    balance: { type: Number }
  },
  
  // Route Information
  route: {
    startLocation: {
      name: { type: String },
      lat: { type: Number },
      lng: { type: Number }
    },
    endLocation: {
      name: { type: String },
      lat: { type: Number },
      lng: { type: Number }
    },
    transportMode: { type: String }, // 'metro', 'bus', 'train', 'tram'
    routeNumber: { type: String },
    operator: { type: String }
  },
  
  // OCR Verification (if ticket image provided)
  ocrData: {
    extractedText: { type: String },
    confidence: { type: Number }, // 0-100
    detectedFields: {
      ticketNumber: { type: Boolean, default: false },
      date: { type: Boolean, default: false },
      fare: { type: Boolean, default: false },
      route: { type: Boolean, default: false }
    }
  },
  
  // Verification Status
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'manual_review'],
    default: 'pending'
  },
  verifiedAt: { type: Date },
  verificationScore: { type: Number, min: 0, max: 100 }, // Confidence score
  
  // Rejection Details
  rejection: {
    reason: { type: String },
    details: { type: String },
    rejectedAt: { type: Date }
  },
  
  // Fraud Detection
  fraudChecks: {
    duplicateTicket: { type: Boolean, default: false },
    expiredTicket: { type: Boolean, default: false },
    invalidFormat: { type: Boolean, default: false },
    suspiciousPattern: { type: Boolean, default: false },
    locationMismatch: { type: Boolean, default: false }
  },
  
  // Additional Verification Data
  metadata: {
    ipAddress: { type: String },
    deviceInfo: { type: String },
    gpsLocation: {
      lat: { type: Number },
      lng: { type: Number },
      accuracy: { type: Number }
    },
    timestamp: { type: Date, default: Date.now }
  }
}, { timestamps: true });

// Index for quick lookups
publicTransportVerificationSchema.index({ trip: 1, user: 1 });
publicTransportVerificationSchema.index({ 'transaction.transactionId': 1 });
publicTransportVerificationSchema.index({ 'ticket.ticketNumber': 1 });
publicTransportVerificationSchema.index({ status: 1 });

export default mongoose.model('PublicTransportVerification', publicTransportVerificationSchema);
