import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const enrollInCourse = catchAsync(async (req, res, next) => {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    // If course is not free, redirect to order creation
    if (course.pricing.type !== 'free') {
        return res.status(400).json({ status: 'fail', message: 'This course is paid. Please create an order first.' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ user: req.user.id, course: courseId });
    if (existingEnrollment) {
        return res.status(200).json({ status: 'success', message: 'Already enrolled', data: { enrollment: existingEnrollment } });
    }

    const enrollment = await Enrollment.create({
        user: req.user.id,
        course: courseId,
        status: 'active'
    });

    // Update course enrollment count
    course.enrollmentCount += 1;
    await course.save();

    res.status(201).json({
        status: 'success',
        data: { enrollment }
    });
});

export const getMyEnrollments = catchAsync(async (req, res, next) => {
    const enrollments = await Enrollment.find({ user: req.user.id }).populate('course');

    res.status(200).json({
        status: 'success',
        results: enrollments.length,
        data: { enrollments }
    });
});

export const getEnrollmentDetail = catchAsync(async (req, res, next) => {
    const enrollment = await Enrollment.findOne({ user: req.user.id, course: req.params.courseId }).populate('course');

    if (!enrollment) {
        return next(new AppError('No enrollment found for this course', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { enrollment }
    });
});
