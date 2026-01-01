import express from 'express';
import { protect } from '../middlewares/auth.js';
import profileController from '../controllers/profileController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Profile routes
router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);
router.put('/', profileController.updateProfile);

// Activity & Streak routes
router.post('/activity', profileController.recordActivity);
router.get('/activity/calendar', profileController.getActivityCalendar);
router.get('/streak', profileController.getStreak);

// LeetCode integration routes
router.post('/leetcode/link', profileController.linkLeetCode);
router.post('/leetcode/sync', profileController.syncLeetCode);
router.delete('/leetcode/unlink', profileController.unlinkLeetCode);

export default router;
