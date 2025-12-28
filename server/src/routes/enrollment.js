import express from 'express';
import { protect } from '../middlewares/auth.js';
import { enrollInCourse, getMyEnrollments, getEnrollmentDetail } from '../controllers/enrollmentController.js';

const router = express.Router();

router.use(protect);

router.post('/enroll', enrollInCourse);
router.get('/my-courses', getMyEnrollments);
router.get('/:courseId', getEnrollmentDetail);

export default router;
