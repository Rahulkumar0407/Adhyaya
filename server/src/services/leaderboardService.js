import User from '../../models/User.js';
import Leaderboard from '../models/Leaderboard.js';

class LeaderboardService {
    /**
     * Update/Recalculate leaderboard rankings
     * @param {string} type - 'daily' | 'weekly' | 'monthly' | 'all-time'
     */
    static async updateLeaderboard(type = 'all-time', category = 'overall') {
        // Simple implementation: sort users by XP for 'all-time'
        // For daily/weekly, we would aggregate from Progress model

        let users;
        if (type === 'all-time') {
            users = await User.find({ isActive: true })
                .sort({ xpPoints: -1 })
                .limit(100)
                .select('name avatar xpPoints level streakCount');
        } else {
            // Placeholder for time-period based aggregation
            // This would involve joining with Progress collection
            users = await User.find({ isActive: true })
                .sort({ xpPoints: -1 })
                .limit(100)
                .select('name avatar xpPoints level streakCount');
        }

        const rankings = users.map((user, index) => ({
            user: user._id,
            rank: index + 1,
            score: user.xpPoints,
            metrics: {
                xpEarned: user.xpPoints,
                streak: user.streakCount,
                level: user.level
            }
        }));

        const now = new Date();
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);

        const leaderboard = await Leaderboard.findOneAndUpdate(
            { type, category },
            {
                type,
                category,
                period: {
                    start,
                    end: now
                },
                rankings,
                lastUpdated: now,
                totalParticipants: users.length
            },
            { upsert: true, new: true }
        );

        return leaderboard;
    }

    /**
     * Get current leaderboard
     */
    static async getLeaderboard(type = 'all-time', category = 'overall') {
        const leaderboard = await Leaderboard.findOne({ type, category })
            .populate('rankings.user', 'name avatar xpPoints level streakCount');

        if (!leaderboard) {
            return await this.updateLeaderboard(type, category);
        }

        return leaderboard;
    }
}

export default LeaderboardService;
