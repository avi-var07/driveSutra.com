import TreePlanting from '../models/TreePlanting.js';
import User from '../models/User.js';
import Trip from '../models/Trip.js';

// Plant trees based on CO2 saved
export async function plantTreesForTrip(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { tripId } = req.body;

    const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'completed') {
      return res.status(400).json({ message: 'Trip must be completed first' });
    }

    // Calculate trees to plant based on CO2 saved
    const treesToPlant = Math.floor(trip.co2Saved / 22); // 22kg CO2 per tree per year

    if (treesToPlant === 0) {
      return res.json({
        success: true,
        message: 'Not enough CO2 saved to plant a tree yet',
        co2Saved: trip.co2Saved,
        treesRequired: 22
      });
    }

    // Create tree planting record
    const treePlanting = await TreePlanting.create({
      user: req.user._id,
      trip: tripId,
      treeCount: treesToPlant,
      co2OffsetKg: trip.co2Saved,
      location: {
        name: 'Sundarbans, West Bengal',
        region: 'Eastern India'
      },
      status: 'pending',
      partner: {
        name: 'EcoDrive India',
        organizationType: 'NGO'
      },
      certificate: {
        issuedDate: new Date()
      }
    });

    // Update user's tree count
    const user = await User.findById(req.user._id);
    user.treesGrown += treesToPlant;
    await user.save();

    return res.json({
      success: true,
      message: `${treesToPlant} tree(s) will be planted in your name!`,
      treePlanting,
      certificateNumber: treePlanting.certificate.certificateNumber
    });

  } catch (error) {
    console.error('Tree planting error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

// Get user's planted trees
export async function getUserTrees(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { page = 1, limit = 10 } = req.query;

    const trees = await TreePlanting.find({ user: req.user._id })
      .populate('trip', 'mode distanceKm co2Saved createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TreePlanting.countDocuments({ user: req.user._id });

    // Calculate total impact
    const totalTrees = await TreePlanting.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, totalTrees: { $sum: '$treeCount' }, totalCO2: { $sum: '$co2OffsetKg' } } }
    ]);

    return res.json({
      success: true,
      trees,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      impact: totalTrees[0] || { totalTrees: 0, totalCO2: 0 }
    });

  } catch (error) {
    console.error('Get user trees error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

// Get tree certificate
export async function getTreeCertificate(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { treeId } = req.params;

    const tree = await TreePlanting.findOne({ _id: treeId, user: req.user._id })
      .populate('user', 'firstName lastName email')
      .populate('trip', 'mode distanceKm co2Saved createdAt');

    if (!tree) {
      return res.status(404).json({ message: 'Tree planting record not found' });
    }

    // Generate certificate data
    const certificate = {
      certificateNumber: tree.certificate.certificateNumber,
      userName: `${tree.user.firstName} ${tree.user.lastName}`,
      treeCount: tree.treeCount,
      species: tree.species,
      location: tree.location.name,
      plantedDate: tree.plantedDate || tree.createdAt,
      co2Offset: tree.co2OffsetKg,
      estimatedAnnualOffset: tree.estimatedAnnualOffset * tree.treeCount,
      partner: tree.partner.name,
      issuedDate: tree.certificate.issuedDate
    };

    return res.json({
      success: true,
      certificate
    });

  } catch (error) {
    console.error('Get certificate error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

// Update tree growth status (admin function)
export async function updateTreeGrowth(req, res) {
  try {
    const { treeId } = req.params;
    const { heightCm, healthStatus, photoUrl, notes } = req.body;

    const tree = await TreePlanting.findById(treeId);
    if (!tree) {
      return res.status(404).json({ message: 'Tree not found' });
    }

    tree.growthUpdates.push({
      date: new Date(),
      heightCm,
      healthStatus,
      photoUrl,
      notes
    });

    // Update status if not already verified
    if (tree.status === 'planted' && !tree.verifiedDate) {
      tree.status = 'verified';
      tree.verifiedDate = new Date();
    }

    await tree.save();

    return res.json({
      success: true,
      message: 'Tree growth updated successfully',
      tree
    });

  } catch (error) {
    console.error('Update tree growth error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

export default {
  plantTreesForTrip,
  getUserTrees,
  getTreeCertificate,
  updateTreeGrowth
};
