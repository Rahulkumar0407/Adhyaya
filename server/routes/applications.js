import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Notification from '../src/models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get my applications (Student)
// @route   GET /api/applications/my
// @access  Private (Student)
router.get('/my', protect, authorize('student'), async (req, res) => {
    try {
        const applications = await Application.find({ studentId: req.user._id })
            .populate({
                path: 'jobId',
                select: 'companyName role jobType status experienceLevel'
            })
            .sort('-appliedAt');

        res.json({ success: true, data: applications });
    } catch (error) {
        console.error('Error fetching my applications:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Get applicants for a specific job (Recruiter)
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter/Admin)
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check ownership
        if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view applicants for this job' });
        }

        const applications = await Application.find({ jobId: req.params.jobId })
            .populate('studentId', 'name email skillGraph') // Populate basic user info
            .sort('-matchPercentage'); // Sort by match % desc

        res.json({ success: true, data: applications });
    } catch (error) {
        console.error('Error fetching job applicants:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Recruiter/Admin)
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findById(req.params.id).populate('jobId');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const job = application.jobId;

        // Check ownership
        if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this application' });
        }

        application.status = status;
        await application.save();

        // Notify Student
        await Notification.create({
            user: application.studentId,
            type: 'application-status',
            title: 'Application Update',
            message: `Your application for ${job.role} at ${job.companyName} has been ${status}`,
            relatedTo: {
                entityType: 'application',
                entityId: application._id
            }
        });

        // Audit Log
        await AuditLog.create({
            action: 'UPDATE_APPLICATION_STATUS',
            performedBy: req.user._id,
            resourceType: 'Application',
            resourceId: application._id,
            payload: { status, jobId: job._id }
        });

        res.json({ success: true, data: application });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

export default router;
