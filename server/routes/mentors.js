import express from 'express';
import Mentor from '../models/Mentor.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

// Mock mentor data for development
const mockMentors = [
    {
        _id: 'mock1',
        user: { name: 'Rahul Sharma', avatar: null },
        headline: 'SDE @ Google | DSA Expert',
        expertise: ['DSA', 'System Design', 'Python', 'Interview Prep'],
        yearsOfExperience: 5,
        ratePerMinute: 5,
        minCallDuration: 5,
        rating: 4.9,
        totalReviews: 127,
        totalSessions: 89,
        isOnline: true,
        isVerified: true,
        instantCallEnabled: true,
        scheduledCallEnabled: true
    },
    {
        _id: 'mock2',
        user: { name: 'Priya Singh', avatar: null },
        headline: 'Backend Lead @ Flipkart',
        expertise: ['Node.js', 'MongoDB', 'System Design', 'AWS'],
        yearsOfExperience: 6,
        ratePerMinute: 4,
        minCallDuration: 10,
        rating: 4.8,
        totalReviews: 89,
        totalSessions: 67,
        isOnline: true,
        isVerified: true,
        instantCallEnabled: true,
        scheduledCallEnabled: true
    }
];

const router = express.Router();

// Get all approved mentors with filters
// Get current mentor profile (Protected)
router.get('/me', protect, async (req, res) => {
    try {
        const mentor = await Mentor.findOne({ user: req.user._id })
            .populate('user', 'name avatar email');

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor profile not found'
            });
        }

        res.json({ success: true, data: mentor });
    } catch (error) {
        console.error('Error fetching mentor profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching mentor profile'
        });
    }
});

// Get all approved mentors with filters
router.get('/', async (req, res) => {
    try {
        const {
            expertise,
            minRate,
            maxRate,
            minRating,
            isOnline,
            sortBy = 'rating',
            sortOrder = 'desc',
            page = 1,
            limit = 12
        } = req.query;

        // Build filter query
        const filter = {
            applicationStatus: 'approved'
        };

        if (expertise) {
            filter.expertise = { $in: expertise.split(',') };
        }

        if (minRate || maxRate) {
            filter.ratePerMinute = {};
            if (minRate) filter.ratePerMinute.$gte = parseInt(minRate);
            if (maxRate) filter.ratePerMinute.$lte = parseInt(maxRate);
        }

        if (minRating) {
            filter.rating = { $gte: parseFloat(minRating) };
        }

        if (isOnline === 'true') {
            filter.isOnline = true;
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Fetch mentors with pagination
        let mentors = await Mentor.find(filter)
            .populate('user', 'name avatar email')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));
        let total = await Mentor.countDocuments(filter);
        // If no mentors in DB, use mock data for development
        if (mentors.length === 0) {
            mentors = mockMentors.slice(skip, skip + parseInt(limit));
            total = mockMentors.length;
        }

        res.json({
            success: true,
            data: mentors,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching mentors'
        });
    }
});

// Get single mentor profile
router.get('/:id', async (req, res) => {
    try {
        // Handle Mock IDs
        if (req.params.id.startsWith('mock')) {
            const mockMentor = mockMentors.find(m => m._id === req.params.id);
            if (mockMentor) {
                return res.json({ success: true, data: mockMentor });
            }
        }

        const mentor = await Mentor.findById(req.params.id)
            .populate('user', 'name avatar email');

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        res.json({ success: true, data: mentor });
    } catch (error) {
        console.error('Error fetching mentor:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching mentor'
        });
    }
});

// Get mentor reviews
router.get('/:id/reviews', async (req, res) => {
    try {
        // Handle Mock Reviews
        if (req.params.id.startsWith('mock')) {
            return res.json({
                success: true,
                data: [
                    {
                        _id: 'rev1',
                        student: { name: 'Aman गुप्ता', avatar: null },
                        rating: 5,
                        comment: 'Bhaiya ne kaafi acche se concept samjhaya. Recommended!',
                        createdAt: new Date()
                    },
                    {
                        _id: 'rev2',
                        student: { name: 'Sohan Singh', avatar: null },
                        rating: 4,
                        comment: 'Good session, cleared my doubts.',
                        createdAt: new Date(Date.now() - 86400000)
                    }
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 2,
                    pages: 1
                }
            });
        }

        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [reviews, total] = await Promise.all([
            Review.find({
                mentor: req.params.id,
                isPublic: true,
                isHidden: false
            })
                .populate('student', 'name avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Review.countDocuments({
                mentor: req.params.id,
                isPublic: true,
                isHidden: false
            })
        ]);

        res.json({
            success: true,
            data: reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews'
        });
    }
});

// Apply to become a mentor (authenticated)
router.post('/apply', protect, async (req, res) => {
    try {
        const {
            headline,
            bio,
            expertise,
            yearsOfExperience,
            currentCompany,
            currentRole,
            workHistory,
            ratePerMinute,
            linkedinUrl
        } = req.body;

        // Check if already applied
        const existingMentor = await Mentor.findOne({ user: req.user._id });
        if (existingMentor) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied as a mentor'
            });
        }

        const mentor = new Mentor({
            user: req.user._id,
            headline,
            bio,
            expertise,
            yearsOfExperience,
            currentCompany,
            currentRole,
            workHistory,
            ratePerMinute,
            verificationDocs: { linkedinUrl },
            applicationStatus: 'pending'
        });

        await mentor.save();

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: mentor
        });
    } catch (error) {
        console.error('Error applying as mentor:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting application'
        });
    }
});

// Toggle online status (authenticated mentor)
router.patch('/availability', protect, async (req, res) => {
    try {
        const { isOnline } = req.body;

        let mentor = await Mentor.findOne({ user: req.user._id });

        // Auto-create mentor profile if it doesn't exist
        if (!mentor) {
            mentor = new Mentor({
                user: req.user._id,
                headline: 'New Mentor',
                ratePerMinute: 5,
                applicationStatus: 'approved',
                isOnline: isOnline
            });
            await mentor.save();
            return res.json({
                success: true,
                message: `Profile created. You are now ${isOnline ? 'online' : 'offline'}`,
                data: { isOnline: mentor.isOnline }
            });
        }

        if (mentor.applicationStatus !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Your mentor application is not approved yet'
            });
        }

        await mentor.toggleOnline(isOnline);

        res.json({
            success: true,
            message: `You are now ${isOnline ? 'online' : 'offline'}`,
            data: { isOnline: mentor.isOnline }
        });
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating availability'
        });
    }
});

// Update mentor profile (authenticated mentor)
router.patch('/profile', protect, async (req, res) => {
    try {
        const allowedUpdates = [
            'headline', 'bio', 'expertise', 'yearsOfExperience',
            'currentCompany', 'currentRole', 'workHistory',
            'ratePerMinute', 'minCallDuration', 'availableSlots',
            'instantCallEnabled', 'scheduledCallEnabled'
        ];

        const updates = {};
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        // Ensure required fields have defaults for upsert (new profile creation)
        // Only setOnInsert for fields NOT already being updated to avoid conflicts
        const setOnInsert = { applicationStatus: 'approved' };
        if (!updates.headline) setOnInsert.headline = 'New Mentor';
        if (!updates.ratePerMinute) setOnInsert.ratePerMinute = 5;

        const updateOperation = {
            $set: updates,
            $setOnInsert: setOnInsert
        };

        const mentor = await Mentor.findOneAndUpdate(
            { user: req.user._id },
            updateOperation,
            { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor profile not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: mentor
        });
    } catch (error) {
        console.error('Error updating profile:', error.message, error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating profile'
        });
    }
});

// Get featured/top mentors
router.get('/featured/list', async (req, res) => {
    try {
        const mentors = await Mentor.find({
            applicationStatus: 'approved',
            rating: { $gte: 4 },
            totalSessions: { $gte: 5 }
        })
            .populate('user', 'name avatar')
            .sort({ rating: -1, totalSessions: -1 })
            .limit(6);

        res.json({ success: true, data: mentors });
    } catch (error) {
        console.error('Error fetching featured mentors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured mentors'
        });
    }
});

// Get mentor application status (authenticated)
router.get('/application/status', protect, async (req, res) => {
    try {
        const mentor = await Mentor.findOne({ user: req.user._id });

        if (!mentor) {
            return res.json({
                success: true,
                data: { hasApplied: false }
            });
        }

        res.json({
            success: true,
            data: {
                hasApplied: true,
                status: mentor.applicationStatus,
                appliedAt: mentor.appliedAt,
                rejectionReason: mentor.rejectionReason
            }
        });
    } catch (error) {
        console.error('Error fetching application status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching application status'
        });
    }
});

// Activate mentor role (Quick enablement for demo functionality)
router.post('/activate', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Upgrade role if needed
        if (user.role !== 'mentor') {
            user.role = 'mentor';
            await user.save();
        }

        // Ensure mentor profile exists
        let mentor = await Mentor.findOne({ user: req.user._id });
        if (!mentor) {
            mentor = new Mentor({
                user: req.user._id,
                headline: 'New Mentor',
                bio: 'Passionate about teaching and guiding students.',
                expertise: ['General Mentorship'],
                applicationStatus: 'approved', // Auto-approve for seamless onboarding
                isOnline: true
            });
            await mentor.save();
        } else if (mentor.applicationStatus !== 'approved') {
            mentor.applicationStatus = 'approved';
            await mentor.save();
        }

        res.json({ success: true, data: { role: 'mentor', mentorId: mentor._id } });
    } catch (error) {
        console.error('Error activating mentor role:', error);
        res.status(500).json({
            success: false,
            message: 'Error activating mentor role'
        });
    }
});

export default router;
