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

// LeetCode integration routes
router.post('/leetcode/link', profileController.linkLeetCode);
router.post('/leetcode/sync', profileController.syncLeetCode);
router.delete('/leetcode/unlink', profileController.unlinkLeetCode);

export default router;
