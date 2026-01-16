import BabuaLeaderboardService from '../services/babuaLeaderboardService.js';
import CacheService from '../services/cacheService.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Get Babua of the Month (last month's top performer)
 */
export const getBabuaOfMonth = catchAsync(async (req, res) => {
    const cacheKey = 'leaderboard:babua-of-month';

    // Try cache first (cache for 1 hour)
    const cached = await CacheService.get(cacheKey);
    if (cached) {
        return res.status(200).json({
            success: true,
            source: 'cache',
            data: cached
        });
    }

    const winner = await BabuaLeaderboardService.getBabuaOfTheMonth();

    if (winner) {
        await CacheService.set(cacheKey, winner, 3600);
    }

    res.status(200).json({
        success: true,
        data: winner
    });
});

/**
 * Get Max Streak Leaderboard
 */
export const getMaxStreakLeaderboard = catchAsync(async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
    const cacheKey = `leaderboard:max-streak:${limit}:${page}`;

    // Try cache (5 minutes)
    const cached = await CacheService.get(cacheKey);
    if (cached) {
        return res.status(200).json({
            success: true,
            source: 'cache',
            data: cached
        });
    }

    const leaderboard = await BabuaLeaderboardService.getMaxStreakLeaderboard(
        parseInt(limit),
        parseInt(page)
    );

    await CacheService.set(cacheKey, leaderboard, 300);

    res.status(200).json({
        success: true,
        data: leaderboard
    });
});

/**
 * Get Focus Masters Leaderboard (combined focus time + deep focus)
 */
export const getFocusMastersLeaderboard = catchAsync(async (req, res) => {
    const { period = 'all-time', limit = 10, page = 1 } = req.query;
    const cacheKey = `leaderboard:focus-masters:${period}:${limit}:${page}`;

    // Try cache (5 minutes)
    const cached = await CacheService.get(cacheKey);
    if (cached) {
        return res.status(200).json({
            success: true,
            source: 'cache',
            data: cached
        });
    }

    const leaderboard = await BabuaLeaderboardService.getFocusMastersLeaderboard(
        period,
        parseInt(limit),
        parseInt(page)
    );

    await CacheService.set(cacheKey, leaderboard, 300);

    res.status(200).json({
        success: true,
        data: leaderboard
    });
});

/**
 * Get Consistency Leaderboard
 */
export const getConsistencyLeaderboard = catchAsync(async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
    const cacheKey = `leaderboard:consistency:${limit}:${page}`;

    // Try cache (5 minutes)
    const cached = await CacheService.get(cacheKey);
    if (cached) {
        return res.status(200).json({
            success: true,
            source: 'cache',
            data: cached
        });
    }

    const leaderboard = await BabuaLeaderboardService.getConsistencyLeaderboard(
        parseInt(limit),
        parseInt(page)
    );

    await CacheService.set(cacheKey, leaderboard, 300);

    res.status(200).json({
        success: true,
        data: leaderboard
    });
});

/**
 * Get Weekly Climbers Leaderboard
 */
export const getWeeklyClimbersLeaderboard = catchAsync(async (req, res) => {
    const { limit = 10 } = req.query;
    const cacheKey = `leaderboard:weekly-climbers:${limit}`;

    // Try cache (10 minutes)
    const cached = await CacheService.get(cacheKey);
    if (cached) {
        return res.status(200).json({
            success: true,
            source: 'cache',
            data: cached
        });
    }

    const leaderboard = await BabuaLeaderboardService.getWeeklyClimbersLeaderboard(
        parseInt(limit)
    );

    await CacheService.set(cacheKey, leaderboard, 600);

    res.status(200).json({
        success: true,
        data: leaderboard
    });
});

/**
 * Get current user's rank and context
 */
export const getMyRank = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { category = 'focus-masters' } = req.query;

    const rankContext = await BabuaLeaderboardService.getUserRankContext(userId, category);

    res.status(200).json({
        success: true,
        data: rankContext
    });
});

/**
 * Admin: Trigger rank update
 */
export const updateAllRanks = catchAsync(async (req, res) => {
    await BabuaLeaderboardService.updateAllRanks();

    res.status(200).json({
        success: true,
        message: 'All ranks updated successfully'
    });
});

/**
 * Admin: Archive Babua of the Month
 */
export const archiveBabuaOfMonth = catchAsync(async (req, res) => {
    const archive = await BabuaLeaderboardService.archiveBabuaOfTheMonth();

    res.status(200).json({
        success: true,
        data: archive
    });
});
