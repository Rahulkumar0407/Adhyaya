import express from 'express';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Notification from '../src/models/Notification.js';
import User from '../models/User.js'; // Assuming User model exists
import AuditLog from '../models/AuditLog.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all jobs with filters and pagination
// @route   GET /api/jobs
// @access  Public (or Protected based on requirement, usually public for viewing)
router.get('/', async (req, res) => {
    try {
        const {
            role,
            type,
            experience,
            search,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        const query = { isActive: true, verifiedStatus: true };

        if (role) {
            query.role = { $regex: role, $options: 'i' };
        }

        if (type) {
            query.jobType = type;
        }

        if (experience) {
            query.experienceLevel = experience;
        }

        // Search in company name, role, or skills
        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { role: { $regex: search, $options: 'i' } },
                { requiredSkills: { $regex: search, $options: 'i' } }
            ];
        }

        // Execution
        const jobs = await Job.find(query)
            .populate('postedBy', 'name email')
            .sort(sort === 'latest' ? { createdAt: -1 } : { createdAt: -1 }) // Default to latest
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Job.countDocuments(query);

        res.json({
            success: true,
            data: jobs,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalJobs: count
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'name');

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Recruiter/Admin)
router.post('/', protect, authorize('recruiter', 'admin'), async (req, res) => {
    try {
        const jobData = {
            ...req.body,
            postedBy: req.user._id,
            verifiedStatus: req.user.role === 'admin' ? true : false // Auto-verify if admin
        };

        const job = await Job.create(jobData);

        // Audit Log
        await AuditLog.create({
            action: 'CREATE_JOB',
            performedBy: req.user._id,
            resourceType: 'Job',
            resourceId: job._id,
            payload: { jobTitle: job.role, company: job.companyName }
        });

        res.status(201).json({ success: true, data: job });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Update a job
// @route   PATCH /api/jobs/:id
// @access  Private (Recruiter/Admin)
router.patch('/:id', protect, authorize('recruiter', 'admin'), async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check ownership
        if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: job });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter/Admin)
router.delete('/:id', protect, authorize('recruiter', 'admin'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check ownership
        if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
        }

        await job.deleteOne();

        res.json({ success: true, message: 'Job removed' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Student)
router.post('/:id/apply', protect, authorize('student'), async (req, res) => {
    try {
        const jobId = req.params.id;
        const studentId = req.user._id;
        const { resumeSnapshot, skillSnapshot, mentorRequest } = req.body;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({ jobId, studentId });
        if (existingApplication) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job' });
        }

        // Create Application
        const application = await Application.create({
            jobId,
            studentId,
            resumeSnapshot,
            skillSnapshot,
            status: 'Applied',
            mentorApproval: {
                requested: mentorRequest || false
            }
        });

        // Notify Recruiter
        await Notification.create({
            user: job.postedBy,
            type: 'new-application',
            title: 'New Applicant',
            message: `New applicant for ${job.role}: ${req.user.name}`,
            relatedTo: {
                entityType: 'application',
                entityId: application._id
            }
        });

        // Notify Student (Success)
        // Optionally notify via socket if needed immediately

        // Audit Log
        await AuditLog.create({
            action: 'APPLY_JOB',
            performedBy: req.user._id,
            resourceType: 'Application',
            resourceId: application._id,
            payload: { jobId: job._id }
        });

        res.status(201).json({ success: true, data: application });
    } catch (error) {
        console.error('Error applying for job:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

export default router;
