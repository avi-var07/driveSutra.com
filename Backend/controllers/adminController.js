import Admin from '../models/Admin.js';
import Trip from '../models/Trip.js';
import PublicTransportVerification from '../models/PublicTransportVerification.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { calculateEcoScore } from '../utils/ecoScoreCalculator.js';

// Admin login
export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return res.status(423).json({ 
        message: 'Account locked due to multiple failed attempts. Try again later.' 
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      admin.loginAttempts += 1;
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      }
      await admin.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        email: admin.email, 
        role: admin.role,
        isAdmin: true 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

// Get pending verifications
export async function getPendingVerifications(req, res) {
  try {
    const { page = 1, limit = 20, type } = req.query;

    const query = { status: 'pending' };
    if (type) query.verificationType = type;

    const verifications = await PublicTransportVerification.find(query)
      .populate('user', 'firstName lastName email')
      .populate('trip', 'mode distanceKm startLocation endLocation createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PublicTransportVerification.countDocuments(query);

    return res.json({
      success: true,
      verifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get pending verifications error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

// Get pending trips (awaiting verification)
export async function getPendingTrips(req, res) {
  try {
    const { page = 1, limit = 20, mode } = req.query;

    const query = { 
      status: 'completed',
      mode: 'PUBLIC',
      $or: [
        { 'verification.ticketUploaded': true, 'verification.adminVerified': { $ne: true } },
        { 'verification.transactionVerified': true, 'verification.adminVerified': { $ne: true } }
      ]
    };

    if (mode) query.mode = mode;

    const trips = await Trip.find(query)
      .populate('user', 'firstName lastName email avatar')
      .sort({ endTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trip.countDocuments(query);

    return res.json({
      success: true,
      trips,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get pending trips error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

// Approve trip verification
export async function approveTripVerification(req, res) {
  try {
    const { tripId } = req.params;
    const { notes, adjustedEcoScore } = req.body;

    const trip = await Trip.findById(tripId).populate('user');
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Mark as admin verified
    trip.verification.adminVerified = true;
    trip.verification.adminNotes = notes;
    trip.verification.verifiedBy = req.admin.id;
    trip.verification.verifiedAt = new Date();

    // Adjust EcoScore if provided
    if (adjustedEcoScore && adjustedEcoScore !== trip.ecoScore) {
      const oldScore = trip.ecoScore;
      trip.ecoScore = adjustedEcoScore;
      
      // Recalculate rewards based on new score
      const rewards = calculateTripRewards(adjustedEcoScore, trip.distanceKm, trip.mode);
      trip.xpEarned = rewards.xp;
      trip.carbonCreditsEarned = rewards.carbonCredits;
      trip.co2Saved = rewards.co2Saved;
      trip.treesGrown = rewards.trees;

      // Update user stats
      const user = trip.user;
      const scoreDiff = adjustedEcoScore - oldScore;
      const xpDiff = rewards.xp - trip.xpEarned;
      const creditsDiff = rewards.carbonCredits - trip.carbonCreditsEarned;

      user.ecoScore = Math.round(
        (user.ecoScore * user.totalTrips + scoreDiff) / user.totalTrips
      );
      user.xp += xpDiff;
      user.carbonCredits += creditsDiff;
      await user.save();
    }

    await trip.save();

    return res.json({
      success: true,
      message: 'Trip verification approved',
      trip
    });

  } catch (error) {
    console.error('Approve trip verification error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

// Reject trip verification
export async function rejectTripVerification(req, res) {
  try {
    const { tripId } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason required' });
    }

    const trip = await Trip.findById(tripId).populate('user');
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Mark as rejected
    trip.verification.adminVerified = false;
    trip.verification.rejected = true;
    trip.verification.rejectionReason = reason;
    trip.verification.adminNotes = notes;
    trip.verification.verifiedBy = req.admin.id;
    trip.verification.verifiedAt = new Date();

    // Reduce EcoScore and rewards
    trip.ecoScore = Math.max(0, trip.ecoScore - 30); // Penalty
    trip.xpEarned = Math.floor(trip.xpEarned * 0.5); // 50% reduction
    trip.carbonCreditsEarned = Math.floor(trip.carbonCreditsEarned * 0.5);

    // Add fraud strike to user
    const user = trip.user;
    user.fraudStrikes += 1;
    
    if (user.fraudStrikes >= 3) {
      user.isVerified = false; // Require re-verification
    }

    await user.save();
    await trip.save();

    return res.json({
      success: true,
      message: 'Trip verification rejected',
      trip
    });

  } catch (error) {
    console.error('Reject trip verification error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

// Get admin dashboard stats
export async function getAdminDashboard(req, res) {
  try {
    const [
      pendingVerifications,
      totalTrips,
      totalUsers,
      todayTrips,
      totalCO2Saved,
      totalTreesPlanted
    ] = await Promise.all([
      PublicTransportVerification.countDocuments({ status: 'pending' }),
      Trip.countDocuments({ status: 'completed' }),
      User.countDocuments({}),
      Trip.countDocuments({ 
        status: 'completed',
        endTime: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      Trip.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$co2Saved' } } }
      ]),
      Trip.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$treesGrown' } } }
      ])
    ]);

    // Mode distribution
    const modeDistribution = await Trip.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$mode', count: { $sum: 1 } } }
    ]);

    // Recent verifications
    const recentVerifications = await PublicTransportVerification.find({ status: 'pending' })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      stats: {
        pendingVerifications,
        totalTrips,
        totalUsers,
        todayTrips,
        totalCO2Saved: totalCO2Saved[0]?.total || 0,
        totalTreesPlanted: totalTreesPlanted[0]?.total || 0,
        modeDistribution,
        recentVerifications
      }
    });

  } catch (error) {
    console.error('Get admin dashboard error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

// Helper function to calculate trip rewards
function calculateTripRewards(ecoScore, distanceKm, mode) {
  const baseXP = Math.round(ecoScore * 0.5 + distanceKm * 2);
  const modeMultiplier = {
    'PUBLIC': 1.5,
    'WALK': 1.8,
    'CYCLE': 1.6,
    'CAR': 1.0,
    'BIKE': 1.1
  };
  
  const xp = Math.round(baseXP * (modeMultiplier[mode] || 1));
  const carbonCredits = Math.round(ecoScore * 0.1 + distanceKm * 0.5);
  const co2Saved = calculateCO2Saved(distanceKm, mode);
  const trees = Math.round(co2Saved / 22);
  
  return { xp, carbonCredits, co2Saved, trees };
}

function calculateCO2Saved(distanceKm, mode) {
  const carEmission = 0.21;
  const modeEmissions = {
    'PUBLIC': 0.05,
    'WALK': 0,
    'CYCLE': 0,
    'CAR': carEmission,
    'BIKE': 0.15
  };
  
  const modeEmission = modeEmissions[mode] || carEmission;
  return Math.max(0, (carEmission - modeEmission) * distanceKm);
}

export default {
  adminLogin,
  getPendingVerifications,
  getPendingTrips,
  approveTripVerification,
  rejectTripVerification,
  getAdminDashboard
};
