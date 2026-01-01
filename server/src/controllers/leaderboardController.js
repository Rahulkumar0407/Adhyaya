import LeaderboardService from '../services/leaderboardService.js';
import CacheService from '../services/cacheService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getLeaderboard = catchAsync(async (req, res, next) => {
    const { type = 'all-time', category = 'overall' } = req.query;
    const cacheKey = `leaderboard:${type}:${category}`;

    // Try cache first
    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) {
        return res.status(200).json({
            status: 'success',
            source: 'cache',
            data: { leaderboard: cachedData }
        });
    }

    const leaderboard = await LeaderboardService.getLeaderboard(type, category);

    // Cache result for 5 minutes
    await CacheService.set(cacheKey, leaderboard, 300);

    res.status(200).json({
        status: 'success',
        source: 'db',
        data: {
            leaderboard
        }
    });
});

export const refreshLeaderboard = catchAsync(async (req, res, next) => {
    const { type, category } = req.body;
    const leaderboard = await LeaderboardService.updateLeaderboard(type, category);

    res.status(200).json({
        status: 'success',
        data: {
            leaderboard
        }
    });
});
