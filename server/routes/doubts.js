import express from 'express';
import { protect } from '../middleware/auth.js';
import Doubt from '../models/Doubt.js';
import DoubtMessage from '../models/DoubtMessage.js';
import MentorSpecialization from '../models/MentorSpecialization.js';
import DoubtAnalytics from '../models/DoubtAnalytics.js';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import Mentor from '../models/Mentor.js';
import { generateAIHint, analyzeDoubtComplexity } from '../services/aiService.js';
import { calculateDoubtPrice } from '../services/pricingService.js';

const router = express.Router();

/**
 * @route   POST /api/doubts/submit
 * @desc    Submit a new doubt
 * @access  Private (Student)
 */
router.post('/submit', protect, async (req, res) => {
    try {
        const {
            subject,
            subTopic,
            title,
            description,
            codeBlocks,
            attachments,
            priority
        } = req.body;

        // Validation
        if (!subject || !subTopic || !title || !description) {
            return res.status(400).json({
                success: false,
                message: 'subject, subTopic, title, and description are required'
            });
        }

        // Calculate pricing
        const pricing = calculateDoubtPrice(subject, priority || 'normal');

        // Create doubt
        const doubt = await Doubt.create({
            student: req.user._id,
            subject,
            subTopic,
            title,
            description,
            codeBlocks: codeBlocks || [],
            attachments: attachments || [],
            priority: priority || 'normal',
            basePrice: pricing.basePrice,
            priorityMultiplier: pricing.multiplier,
            totalPrice: pricing.totalPrice,
            estimatedResponseTime: pricing.estimatedTime
        });

        // Generate AI hint asynchronously (don't wait)
        generateAIHint(doubt._id, { subject, subTopic, description, codeBlocks })
            .catch(err => console.error('AI hint generation failed:', err));

        // Analyze complexity and suggest mentors
        const complexity = await analyzeDoubtComplexity(description, subject);
        doubt.aiComplexityScore = complexity.score;

        // Find best matching mentors
        const suggestedMentors = await MentorSpecialization.findBestMentors(subject, subTopic, 3);
        doubt.aiSuggestedMentors = suggestedMentors.map(m => ({
            mentor: m.mentor._id,
            matchScore: m.matchScore
        }));

        // Auto-assign to best mentor if available
        if (suggestedMentors.length > 0 && suggestedMentors[0].matchScore >= 80) {
            doubt.assignedMentor = suggestedMentors[0].mentor._id;
            doubt.mentorMatchScore = suggestedMentors[0].matchScore;
            doubt.status = 'mentor-assigned';

            // Update mentor's current doubt count
            await MentorSpecialization.findOneAndUpdate(
                { mentor: suggestedMentors[0].mentor._id },
                { $inc: { currentDoubtCount: 1 } }
            );
        } else {
            doubt.status = 'ai-reviewed';
        }

        await doubt.save();

        // TODO: Send notification to assigned mentor or available mentors

        res.status(201).json({
            success: true,
            data: {
                doubtId: doubt._id,
                status: doubt.status,
                estimatedResponseTime: doubt.estimatedResponseTime,
                totalPrice: doubt.totalPrice,
                assignedMentor: doubt.assignedMentor,
                mentorMatchScore: doubt.mentorMatchScore,
                suggestedMentors: suggestedMentors.map(m => ({
                    mentorId: m.mentor._id,
                    name: m.mentor.name,
                    matchScore: m.matchScore,
                    avatar: m.mentor.avatar
                }))
            }
        });

    } catch (error) {
        console.error('Submit doubt error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   GET /api/doubts/my-doubts
 * @desc    Get student's doubt history
 * @access  Private (Student)
 */
router.get('/my-doubts', protect, async (req, res) => {
    try {
        const { status, limit = 20, page = 1 } = req.query;

        const query = { student: req.user._id };
        if (status) query.status = status;

        const doubts = await Doubt.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .populate('assignedMentor', 'name avatar')
            .select('-description -codeBlocks -aiSuggestedMentors');

        const total = await Doubt.countDocuments(query);

        res.json({
            success: true,
            data: {
                doubts,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   GET /api/doubts/:doubtId
 * @desc    Get doubt details with messages
 * @access  Private
 */
router.get('/:doubtId', protect, async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.doubtId)
            .populate('student', 'name avatar email')
            .populate('assignedMentor', 'name avatar bio');

        if (!doubt) {
            return res.status(404).json({
                success: false,
                message: 'Doubt not found'
            });
        }

        // Check access
        const isStudent = doubt.student._id.toString() === req.user._id.toString();
        const isMentor = doubt.assignedMentor && doubt.assignedMentor._id.toString() === req.user._id.toString();

        if (!isStudent && !isMentor && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get messages
        const messages = await DoubtMessage.getChatThread(doubt._id);

        // Mark messages as read
        if (isStudent || isMentor) {
            await DoubtMessage.markAllAsRead(doubt._id, req.user._id);
        }

        res.json({
            success: true,
            data: {
                doubt,
                messages,
                canFollowUp: doubt.canFollowUp()
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   POST /api/doubts/:doubtId/message
 * @desc    Send message in doubt thread
 * @access  Private
 */
router.post('/:doubtId/message', protect, async (req, res) => {
    try {
        const { content, messageType, codeBlock, attachments } = req.body;

        const doubt = await Doubt.findById(req.params.doubtId);
        if (!doubt) {
            return res.status(404).json({
                success: false,
                message: 'Doubt not found'
            });
        }

        // Check access
        const isStudent = doubt.student.toString() === req.user._id.toString();
        const isMentor = doubt.assignedMentor && doubt.assignedMentor.toString() === req.user._id.toString();

        if (!isStudent && !isMentor) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check follow-up limit for students
        if (isStudent && doubt.status === 'answered' && !doubt.canFollowUp()) {
            return res.status(400).json({
                success: false,
                message: `Follow-up limit reached (${doubt.followUpLimit} free follow-ups allowed)`
            });
        }

        // Create message
        const message = await DoubtMessage.create({
            doubt: doubt._id,
            sender: req.user._id,
            senderType: req.user.role === 'mentor' ? 'mentor' : 'student',
            messageType: messageType || 'text',
            content,
            codeBlock,
            attachments: attachments || []
        });

        await message.populate('sender', 'name avatar role');

        // Update doubt status
        if (isMentor && doubt.status !== 'answered') {
            doubt.status = 'answered';
            if (!doubt.firstResponseAt) {
                doubt.firstResponseAt = new Date();
                doubt.calculateResponseTime();
            }
        }

        if (isStudent && doubt.status === 'answered') {
            doubt.followUpCount += 1;
        }

        await doubt.save();

        // TODO: Send real-time notification

        res.status(201).json({
            success: true,
            data: message
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   PUT /api/doubts/:doubtId/resolve
 * @desc    Mark doubt as resolved
 * @access  Private (Student)
 */
router.put('/:doubtId/resolve', protect, async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.doubtId);

        if (!doubt) {
            return res.status(404).json({
                success: false,
                message: 'Doubt not found'
            });
        }

        if (doubt.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the student can resolve the doubt'
            });
        }

        doubt.isResolved = true;
        doubt.status = 'resolved';
        doubt.resolvedAt = new Date();
        await doubt.save();

        // Process Payment
        if (doubt.totalPrice > 0) {
            const wallet = await Wallet.findOne({ user: req.user._id });
            if (!wallet) {
                // If no wallet (shouldn't happen for pay-per-doubt if we enforced check at creation?), create one
                // But generally users should have funds.
                // Assuming wallet exists or handled. If not, log error or throw.
                console.error('Wallet not found for user', req.user._id);
            } else {
                try {
                    await wallet.chargeForDoubt(doubt.totalPrice, doubt._id);
                } catch (err) {
                    // Payment failed (insufficient funds?)
                    // In real app, we might revert resolution or flag as 'payment-pending'
                    console.error('Payment failed for doubt', doubt._id, err);
                    return res.status(400).json({
                        success: false,
                        message: 'Insufficient balance to resolve doubt'
                    });
                }
            }
        }

        // Update mentor's doubt count and handle commission
        if (doubt.assignedMentor) {
            // Dynamic Platform Fee based on Student Streak
            const student = await User.findById(req.user._id);
            let platformFee = 0.25; // Default 25%
            if (student && student.streakCount >= 30) {
                platformFee = 0.20; // 20% for steak masters
            }

            const mentorEarning = doubt.totalPrice * (1 - platformFee);

            // Update Mentor Wallet/Earning
            const mentor = await Mentor.findById(doubt.assignedMentor);
            if (mentor) {
                mentor.totalEarned += mentorEarning;
                mentor.pendingPayout += mentorEarning;
                // Save happens below via findOneAndUpdate or explicit save?
                // The below findOneAndUpdate only touches `currentDoubtCount`.
                // We should probably explicitly save mentor here.
                await mentor.save();
            }

            // Update specialization stats
            await MentorSpecialization.findOneAndUpdate(
                { mentor: doubt.assignedMentor },
                {
                    $inc: {
                        currentDoubtCount: -1,
                        totalDoubtsResolved: 1
                    }
                }
            );
        }

        // Update analytics
        let studentAnalytics = await DoubtAnalytics.findOne({ user: req.user._id, userType: 'student' });
        if (!studentAnalytics) {
            studentAnalytics = await DoubtAnalytics.create({
                user: req.user._id,
                userType: 'student'
            });
        }
        studentAnalytics.updateStudentAnalytics(doubt);
        await studentAnalytics.save();

        if (doubt.assignedMentor) {
            let mentorAnalytics = await DoubtAnalytics.findOne({ user: doubt.assignedMentor, userType: 'mentor' });
            if (!mentorAnalytics) {
                mentorAnalytics = await DoubtAnalytics.create({
                    user: doubt.assignedMentor,
                    userType: 'mentor'
                });
            }
            mentorAnalytics.updateMentorAnalytics(doubt);
            await mentorAnalytics.save();
        }

        res.json({
            success: true,
            message: 'Doubt marked as resolved'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   PUT /api/doubts/:doubtId/rate
 * @desc    Rate mentor and provide feedback
 * @access  Private (Student)
 */
router.put('/:doubtId/rate', protect, async (req, res) => {
    try {
        const { rating, feedback, isHelpful } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const doubt = await Doubt.findById(req.params.doubtId);

        if (!doubt) {
            return res.status(404).json({
                success: false,
                message: 'Doubt not found'
            });
        }

        if (doubt.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (!doubt.isResolved) {
            return res.status(400).json({
                success: false,
                message: 'Doubt must be resolved before rating'
            });
        }

        doubt.rating = rating;
        doubt.feedback = feedback;
        doubt.isHelpful = isHelpful;
        await doubt.save();

        // Update mentor specialization rating
        if (doubt.assignedMentor) {
            const mentorSpec = await MentorSpecialization.findOne({ mentor: doubt.assignedMentor });
            if (mentorSpec) {
                mentorSpec.addRating(rating);
                await mentorSpec.save();
            }
        }

        res.json({
            success: true,
            message: 'Rating submitted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   PUT /api/doubts/:doubtId/stuck
 * @desc    Mark doubt as stuck (priority escalation)
 * @access  Private (Student)
 */
router.put('/:doubtId/stuck', protect, async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.doubtId);

        if (!doubt) {
            return res.status(404).json({
                success: false,
                message: 'Doubt not found'
            });
        }

        if (doubt.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Update priority and pricing
        doubt.priority = 'stuck';
        doubt.stuckSince = new Date();
        doubt.priorityMultiplier = 1.5;
        doubt.totalPrice = doubt.basePrice * doubt.priorityMultiplier;
        doubt.estimatedResponseTime = Math.round(doubt.estimatedResponseTime * 0.5); // Halve the time

        await doubt.save();

        // Reassign to senior mentor or escalate
        const seniorMentors = await MentorSpecialization.findBestMentors(doubt.subject, doubt.subTopic, 1);
        if (seniorMentors.length > 0) {
            doubt.assignedMentor = seniorMentors[0].mentor._id;
            doubt.mentorMatchScore = seniorMentors[0].matchScore;
            doubt.status = 'mentor-assigned';
            await doubt.save();
        }

        // TODO: Send urgent notification to mentor

        res.json({
            success: true,
            message: 'Doubt marked as stuck and escalated',
            data: {
                newPrice: doubt.totalPrice,
                estimatedTime: doubt.estimatedResponseTime,
                assignedMentor: doubt.assignedMentor
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
