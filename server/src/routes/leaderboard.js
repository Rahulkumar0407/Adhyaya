import express from 'express';
import { getLeaderboard, refreshLeaderboard } from '../controllers/leaderboardController.js';
import {
    getBabuaOfMonth,
    getMaxStreakLeaderboard,
    getFocusMastersLeaderboard,
    getConsistencyLeaderboard,
    getWeeklyClimbersLeaderboard,
    getMyRank,
    updateAllRanks,
    archiveBabuaOfMonth
} from '../controllers/babuaLeaderboardController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Legacy routes
router.get('/', getLeaderboard);
router.post('/refresh', refreshLeaderboard);

// Babua Leaderboard routes
router.get('/babua-of-month', getBabuaOfMonth);
router.get('/max-streak', getMaxStreakLeaderboard);
router.get('/focus-masters', getFocusMastersLeaderboard);
router.get('/consistency', getConsistencyLeaderboard);
router.get('/weekly-climbers', getWeeklyClimbersLeaderboard);

// Authenticated routes
router.get('/my-rank', protect, getMyRank);

// Admin routes
router.post('/update-ranks', protect, restrictTo('admin'), updateAllRanks);
router.post('/archive-babua-of-month', protect, restrictTo('admin'), archiveBabuaOfMonth);

export default router;
