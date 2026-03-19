import TreePlanting from '../models/TreePlanting.js';
import User from '../models/User.js';

/**
 * Plant trees for completed trip
 */
export async function plantTreesForTrip(req, res) {
  try {
    const userId = req.user?.id;
    const { tripId, treeCount, location } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const treePlanting = new TreePlanting({
      userId,
      tripId,
      treeCount: treeCount || 1,
      location: location || 'Unknown Location',
      status: 'pending',
      plantedDate: new Date()
    });

    await treePlanting.save();

    // Update user tree count
    user.treesGrown = (user.treesGrown || 0) + treeCount || 1;
    await user.save();

    res.json({
      success: true,
      message: `${treeCount || 1} trees planted successfully! 🌳`,
      treePlanting
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get user's planted trees
 */
export async function getUserTrees(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const trees = await TreePlanting.find({ userId })
      .sort({ plantedDate: -1 });

    const stats = {
      totalTrees: trees.reduce((sum, t) => sum + t.treeCount, 0),
      plantedTrees: trees.filter(t => t.status === 'planted').reduce((sum, t) => sum + t.treeCount, 0),
      pendingTrees: trees.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.treeCount, 0),
      trees
    };

    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get tree certificate
 */
export async function getTreeCertificate(req, res) {
  try {
    const userId = req.user?.id;
    const { treeId } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const tree = await TreePlanting.findById(treeId);

    if (!tree || tree.userId.toString() !== userId) {
      return res.status(404).json({ success: false, message: 'Tree not found' });
    }

    const user = await User.findById(userId);

    const certificate = {
      certificateNumber: `TREE-${tree._id.toString().substr(-8).toUpperCase()}`,
      userName: `${user.firstName} ${user.lastName}`,
      treeCount: tree.treeCount,
      location: tree.location,
      plantedDate: tree.plantedDate,
      certificateDate: new Date(),
      message: `Thank you for contributing to a greener planet!`
    };

    res.json({ success: true, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Update tree growth status (admin function)
 */
export async function updateTreeGrowth(req, res) {
  try {
    const { treeId } = req.params;
    const { status, growthHeight } = req.body;

    const tree = await TreePlanting.findByIdAndUpdate(
      treeId,
      {
        status,
        growthHeight: growthHeight || 0,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!tree) {
      return res.status(404).json({ success: false, message: 'Tree not found' });
    }

    res.json({ success: true, message: 'Tree updated successfully', tree });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
