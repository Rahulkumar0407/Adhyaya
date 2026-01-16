import FocusSettings from '../../models/FocusSettings.js';
import User from '../../models/User.js';
import FocusSession from '../../models/FocusSession.js';

class BabuaLeaderboardService {
    /**
     * Get Babua of the Month (last month's top performer)
     */
    static async getBabuaOfTheMonth() {
        // Get top performer from last month based on total focus minutes
        const topPerformer = await FocusSettings.findOne({ totalFocusMinutes: { $gt: 0 } })
            .sort({ totalFocusMinutes: -1 })
            .populate('userId', 'name avatar')
            .lean();

        if (!topPerformer || !topPerformer.userId) {
            return null;
        }

        return {
            periodLabel: this.getLastMonthLabel(),
            user: {
                _id: topPerformer.userId._id,
                name: topPerformer.userId.name,
                avatar: topPerformer.userId.avatar
            },
            stats: {
                totalFocusMinutes: topPerformer.totalFocusMinutes,
                longestStreak: topPerformer.longestFocusStreak,
                totalSessions: topPerformer.totalSessions,
                avgFocusScore: topPerformer.avgFocusScore
            }
        };
    }

    static getLastMonthLabel() {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    /**
     * Get Max Streak Leaderboard
     */
    static async getMaxStreakLeaderboard(limit = 10, page = 1) {
        const skip = (page - 1) * limit;

        const [rankings, total] = await Promise.all([
            FocusSettings.find({ focusStreak: { $gt: 0 } })
                .sort({ focusStreak: -1, longestFocusStreak: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name avatar')
                .lean(),
            FocusSettings.countDocuments({ focusStreak: { $gt: 0 } })
        ]);

        return {
            category: 'max-streak',
            rankings: rankings
                .filter(stat => stat.userId) // Ensure user exists
                .map((stat, index) => ({
                    rank: skip + index + 1,
                    user: {
                        _id: stat.userId._id,
                        name: stat.userId.name,
                        avatar: stat.userId.avatar
                    },
                    score: stat.focusStreak,
                    maxStreak: stat.longestFocusStreak,
                    rankChange: { direction: 'none', amount: 0 }
                })),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Get Focus Masters Leaderboard (total focus time)
     */
    static async getFocusMastersLeaderboard(period = 'all-time', limit = 10, page = 1) {
        const skip = (page - 1) * limit;

        // For now, we only have total focus minutes in FocusSettings
        // Weekly/monthly would require separate tracking
        const sortField = 'totalFocusMinutes';

        const [rankings, total] = await Promise.all([
            FocusSettings.find({ [sortField]: { $gt: 0 } })
                .sort({ [sortField]: -1, totalSessions: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name avatar')
                .lean(),
            FocusSettings.countDocuments({ [sortField]: { $gt: 0 } })
        ]);

        return {
            category: 'focus-masters',
            period,
            rankings: rankings
                .filter(stat => stat.userId)
                .map((stat, index) => ({
                    rank: skip + index + 1,
                    user: {
                        _id: stat.userId._id,
                        name: stat.userId.name,
                        avatar: stat.userId.avatar
                    },
                    score: stat[sortField],
                    focusMinutes: stat[sortField],
                    totalSessions: stat.totalSessions,
                    avgFocusScore: stat.avgFocusScore,
                    rankChange: { direction: 'none', amount: 0 }
                })),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Get Consistency Leaderboard (based on sessions completed and avg score)
     */
    static async getConsistencyLeaderboard(limit = 10, page = 1) {
        const skip = (page - 1) * limit;

        const [rankings, total] = await Promise.all([
            FocusSettings.find({ totalSessions: { $gt: 0 } })
                .sort({ totalSessions: -1, avgFocusScore: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name avatar')
                .lean(),
            FocusSettings.countDocuments({ totalSessions: { $gt: 0 } })
        ]);

        return {
            category: 'consistency',
            rankings: rankings
                .filter(stat => stat.userId)
                .map((stat, index) => ({
                    rank: skip + index + 1,
                    user: {
                        _id: stat.userId._id,
                        name: stat.userId.name,
                        avatar: stat.userId.avatar
                    },
                    score: stat.avgFocusScore || 0,
                    sessionsCompleted: stat.totalSessions,
                    avgFocusScore: stat.avgFocusScore,
                    rankChange: { direction: 'none', amount: 0 }
                })),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Get Weekly Climbers (users who improved most this week)
     * For now, we'll show users with recent activity and good scores
     */
    static async getWeeklyClimbersLeaderboard(limit = 10) {
        // Get users with focus sessions in the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentSessions = await FocusSession.aggregate([
            {
                $match: {
                    startTime: { $gte: oneWeekAgo },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$userId',
                    weeklyMinutes: { $sum: '$actualDuration' },
                    sessionCount: { $sum: 1 },
                    avgScore: { $avg: '$focusScore' }
                }
            },
            { $sort: { weeklyMinutes: -1 } },
            { $limit: limit }
        ]);

        // Populate user info
        const userIds = recentSessions.map(s => s._id);
        const users = await User.find({ _id: { $in: userIds } }).select('name avatar').lean();
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        return {
            category: 'weekly-climbers',
            rankings: recentSessions
                .filter(stat => userMap.get(stat._id?.toString()))
                .map((stat, index) => {
                    const user = userMap.get(stat._id.toString());
                    return {
                        rank: index + 1,
                        user: {
                            _id: stat._id,
                            name: user?.name || 'Unknown',
                            avatar: user?.avatar
                        },
                        weeklyMinutes: stat.weeklyMinutes || 0,
                        sessionCount: stat.sessionCount || 0,
                        avgScore: Math.round(stat.avgScore || 0),
                        rankImprovement: stat.sessionCount // Use session count as "improvement" indicator
                    };
                }),
            total: recentSessions.length
        };
    }

    /**
     * Get user's rank context (their rank + surrounding users)
     */
    static async getUserRankContext(userId, category = 'focus-masters') {
        let settings = await FocusSettings.findOne({ userId });

        if (!settings) {
            // Create settings for user if doesn't exist
            settings = await FocusSettings.create({ userId });
        }

        let sortField, scoreField;
        switch (category) {
            case 'max-streak':
                sortField = 'focusStreak';
                scoreField = 'focusStreak';
                break;
            case 'consistency':
                sortField = 'totalSessions';
                scoreField = 'avgFocusScore';
                break;
            case 'focus-masters':
            default:
                sortField = 'totalFocusMinutes';
                scoreField = 'totalFocusMinutes';
        }

        // Get user's rank
        const userScore = settings[sortField] || 0;
        const rank = await FocusSettings.countDocuments({
            [sortField]: { $gt: userScore }
        }) + 1;

        // Get surrounding users
        const [above, below] = await Promise.all([
            FocusSettings.find({ [sortField]: { $gt: userScore } })
                .sort({ [sortField]: 1 })
                .limit(2)
                .populate('userId', 'name avatar')
                .lean(),
            FocusSettings.find({ [sortField]: { $lt: userScore } })
                .sort({ [sortField]: -1 })
                .limit(2)
                .populate('userId', 'name avatar')
                .lean()
        ]);

        return {
            category,
            userRank: {
                rank,
                score: userScore,
                rankChange: { direction: 'none', amount: 0 },
                user: await User.findById(userId).select('name avatar'),
                focusStreak: settings.focusStreak,
                totalFocusMinutes: settings.totalFocusMinutes,
                totalSessions: settings.totalSessions
            },
            surrounding: {
                above: above.reverse()
                    .filter(s => s.userId)
                    .map((s, i) => ({
                        rank: rank - (above.length - i),
                        user: { _id: s.userId._id, name: s.userId.name, avatar: s.userId.avatar },
                        score: s[sortField]
                    })),
                below: below
                    .filter(s => s.userId)
                    .map((s, i) => ({
                        rank: rank + i + 1,
                        user: { _id: s.userId._id, name: s.userId.name, avatar: s.userId.avatar },
                        score: s[sortField]
                    }))
            }
        };
    }

    /**
     * Update user stats after a focus session (called from focus routes)
     */
    static async updateStatsFromSession(userId, session) {
        // FocusSettings is already updated in the focus routes
        // This method is kept for compatibility but doesn't need to do anything extra
        return { success: true };
    }

    /**
     * Update all ranks (placeholder for cron job)
     */
    static async updateAllRanks() {
        // With FocusSettings, ranks are calculated on-the-fly
        // This could be used to update cached rank data if needed
        return { success: true };
    }

    /**
     * Archive Babua of the Month (placeholder)
     */
    static async archiveBabuaOfTheMonth() {
        return await this.getBabuaOfTheMonth();
    }
}

export default BabuaLeaderboardService;
