import express from 'express';
import { getLeaderboard, refreshLeaderboard } from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/', getLeaderboard);
router.post('/refresh', refreshLeaderboard);

export default router;
