import Trip from '../models/Trip.js';
import User from '../models/User.js';
import TreePlanting from '../models/TreePlanting.js';

// Donate carbon credits to plant trees
export async function donateForTrees(req, res) {
    try {
        const { creditsToSpend, message } = req.body;

        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        if (!creditsToSpend || creditsToSpend < 10) {
            return res.status(400).json({ message: 'Minimum 10 credits required for donation' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.carbonCredits < creditsToSpend) {
            return res.status(400).json({
                message: `Insufficient credits. You have ${user.carbonCredits}, need ${creditsToSpend}`
            });
        }

        // Calculate trees: 50 credits = 1 tree
        const treesPlanted = Math.floor(creditsToSpend / 50);
        if (treesPlanted < 1) {
            return res.status(400).json({ message: 'Need at least 50 credits to plant 1 tree' });
        }

        const actualCreditsSpent = treesPlanted * 50;

        // Deduct credits
        user.carbonCredits -= actualCreditsSpent;
        user.treesGrown += treesPlanted;
        await user.save();

        // Create tree planting record
        const donation = await TreePlanting.create({
            user: user._id,
            treesPlanted,
            creditsSpent: actualCreditsSpent,
            donorName: `${user.firstName} ${user.lastName}`,
            message: message || `Donated by ${user.firstName} for a greener planet 🌍`,
            type: 'donation',
            status: 'confirmed'
        });

        return res.json({
            success: true,
            message: `🌳 ${treesPlanted} tree(s) will be planted in your name!`,
            donation: {
                id: donation._id,
                treesPlanted,
                creditsSpent: actualCreditsSpent,
                donorName: donation.donorName,
                message: donation.message
            },
            remainingCredits: user.carbonCredits,
            totalTreesGrown: user.treesGrown
        });

    } catch (error) {
        console.error('Donate for trees error:', error);
        return res.status(500).json({ message: error.message || 'Server error' });
    }
}

// Get donation history
export async function getDonationHistory(req, res) {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const donations = await TreePlanting.find({
            user: req.user._id,
            type: 'donation'
        }).sort({ createdAt: -1 }).limit(20);

        return res.json({ success: true, donations });
    } catch (error) {
        console.error('Get donation history error:', error);
        return res.status(500).json({ message: error.message || 'Server error' });
    }
}

// Get all donations (public leaderboard)
export async function getTreePlantingWall(req, res) {
    try {
        const donations = await TreePlanting.find({ type: 'donation', status: 'confirmed' })
            .populate('user', 'firstName lastName avatar')
            .sort({ createdAt: -1 })
            .limit(50);

        const totalTrees = await TreePlanting.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$treesPlanted' } } }
        ]);

        return res.json({
            success: true,
            donations,
            totalTreesPlanted: totalTrees[0]?.total || 0
        });
    } catch (error) {
        console.error('Get tree planting wall error:', error);
        return res.status(500).json({ message: error.message || 'Server error' });
    }
}

export default { donateForTrees, getDonationHistory, getTreePlantingWall };
