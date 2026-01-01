import User from '../../models/User.js';
import Activity from '../../models/Activity.js';
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
        const allowedFields = [
            'name', 'bio', 'avatar', 'phone', 'location',
            'college', 'course', 'graduationYear', 'socialLinks', 'hiringProfile',
            'revisionMode'
        ];
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
 * Record activity (video watched, quiz taken, etc.)
 * This also updates the streak
 */
export const recordActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, metadata } = req.body;

        if (!type) {
            return res.status(400).json({
                success: false,
                message: 'Activity type is required'
            });
        }

        // Check if user was active today before recording
        const wasActiveToday = await Activity.wasActiveToday(userId);

        // Record the activity
        const activity = await Activity.recordActivity(userId, type, metadata || {});

        // Update streak only if this is the first activity today
        if (!wasActiveToday) {
            const user = await User.findById(userId);

            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const lastActive = new Date(user.lastActive);
            lastActive.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day - increase streak
                user.streakCount += 1;
                if (user.streakCount > user.longestStreak) {
                    user.longestStreak = user.streakCount;
                }
            } else if (diffDays > 1) {
                // Streak broken, start new streak
                user.streakCount = 1;
            } else if (diffDays === 0) {
                // Same day, ensure streak is at least 1
                if (user.streakCount === 0) {
                    user.streakCount = 1;
                }
            }

            user.lastActive = new Date();
            await user.save();
        }

        // Get updated user for response
        const updatedUser = await User.findById(userId).select('streakCount longestStreak lastActive');

        res.json({
            success: true,
            data: {
                activity,
                streak: {
                    current: updatedUser.streakCount,
                    longest: updatedUser.longestStreak
                }
            },
            message: 'Activity recorded successfully'
        });
    } catch (error) {
        console.error('Record activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record activity'
        });
    }
};

/**
 * Get activity calendar data for the past year
 */
export const getActivityCalendar = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all activities for the past year
        const activities = await Activity.getYearActivity(userId);

        // Get user streak info
        const user = await User.findById(userId).select('streakCount longestStreak lastActive');

        // Create a map of date -> count for easy lookup
        const activityMap = {};
        let totalSubmissions = 0;
        let activeDays = 0;

        activities.forEach(activity => {
            const dateStr = activity.date.toISOString().split('T')[0];
            activityMap[dateStr] = activity.count;
            totalSubmissions += activity.count;
            if (activity.count > 0) activeDays++;
        });

        res.json({
            success: true,
            data: {
                activities: activityMap,
                stats: {
                    totalSubmissions,
                    activeDays,
                    currentStreak: user.streakCount,
                    longestStreak: user.longestStreak
                }
            }
        });
    } catch (error) {
        console.error('Get activity calendar error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity calendar'
        });
    }
};

/**
 * Get user's streak information
 */
export const getStreak = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('streakCount longestStreak lastActive');

        res.json({
            success: true,
            data: {
                currentStreak: user.streakCount,
                longestStreak: user.longestStreak,
                lastActive: user.lastActive
            }
        });
    } catch (error) {
        console.error('Get streak error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch streak'
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
    recordActivity,
    getActivityCalendar,
    getStreak,
    linkLeetCode,
    syncLeetCode,
    unlinkLeetCode
};
