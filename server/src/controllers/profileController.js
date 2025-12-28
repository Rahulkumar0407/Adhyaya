import User from '../../models/User.js';
import leetcodeService from '../services/leetcodeService.js';

/**
 * Get current user's full profile
 */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -refreshToken -sessions');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
    try {
        const allowedFields = ['name', 'bio', 'avatar', 'hiringProfile'];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password -refreshToken -sessions');

        res.json({
            success: true,
            data: user,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

/**
 * Link LeetCode account
 */
export const linkLeetCode = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || !username.trim()) {
            return res.status(400).json({
                success: false,
                message: 'LeetCode username is required'
            });
        }

        // Validate username exists on LeetCode
        const validation = await leetcodeService.validateUsername(username.trim());
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: `LeetCode user not found: ${username}`
            });
        }

        // Fetch initial stats
        const leetcodeData = await leetcodeService.getUserStats(username.trim());

        // Update user's coding profile
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    'codingProfiles.leetcode': {
                        username: leetcodeData.username,
                        verified: true,
                        lastSynced: leetcodeData.lastSynced,
                        stats: leetcodeData.stats
                    }
                }
            },
            { new: true }
        ).select('codingProfiles');

        res.json({
            success: true,
            data: user.codingProfiles.leetcode,
            message: `LeetCode account "${leetcodeData.username}" linked successfully!`
        });
    } catch (error) {
        console.error('Link LeetCode error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to link LeetCode account'
        });
    }
};

/**
 * Sync LeetCode stats
 */
export const syncLeetCode = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('codingProfiles.leetcode');

        if (!user?.codingProfiles?.leetcode?.username) {
            return res.status(400).json({
                success: false,
                message: 'No LeetCode account linked. Please link your account first.'
            });
        }

        // Fetch fresh stats
        const leetcodeData = await leetcodeService.getUserStats(
            user.codingProfiles.leetcode.username
        );

        // Update stats
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    'codingProfiles.leetcode.lastSynced': leetcodeData.lastSynced,
                    'codingProfiles.leetcode.stats': leetcodeData.stats
                }
            },
            { new: true }
        ).select('codingProfiles.leetcode');

        res.json({
            success: true,
            data: updatedUser.codingProfiles.leetcode,
            message: 'LeetCode stats synced successfully!'
        });
    } catch (error) {
        console.error('Sync LeetCode error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to sync LeetCode stats'
        });
    }
};

/**
 * Unlink LeetCode account
 */
export const unlinkLeetCode = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            $unset: { 'codingProfiles.leetcode': 1 }
        });

        res.json({
            success: true,
            message: 'LeetCode account unlinked successfully'
        });
    } catch (error) {
        console.error('Unlink LeetCode error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unlink LeetCode account'
        });
    }
};

export default {
    getProfile,
    updateProfile,
    linkLeetCode,
    syncLeetCode,
    unlinkLeetCode
};
