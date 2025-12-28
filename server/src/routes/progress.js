import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getDailyProgress, updateVideoProgress, completeTopic } from '../controllers/progressController.js';

const router = express.Router();

router.use(protect);

router.get('/daily', getDailyProgress);
router.post('/video', updateVideoProgress);
router.post('/complete-topic', completeTopic);

export default router;
