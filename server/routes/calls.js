import express from 'express';
import Call from '../models/Call.js';
import Mentor from '../models/Mentor.js';
import Wallet from '../models/Wallet.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Initiate a call
router.post('/initiate', protect, async (req, res) => {
    try {
        const { mentorId, callType = 'instant', scheduledFor, scheduledDuration } = req.body;

        // Find mentor
        const mentor = await Mentor.findById(mentorId).populate('user');
        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        // Check if mentor is available for instant calls
        if (callType === 'instant' && !mentor.isOnline) {
            return res.status(400).json({
                success: false,
                message: 'Mentor is currently offline'
            });
        }

        // Check user wallet balance
        const wallet = await Wallet.findOne({ user: req.user._id });
        const minBalance = mentor.ratePerMinute * mentor.minCallDuration;

        if (!wallet || wallet.balance < minBalance) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Minimum required: ₹${minBalance}`,
                requiredBalance: minBalance,
                currentBalance: wallet?.balance || 0
            });
        }

        // Create call
        const call = new Call({
            student: req.user._id,
            mentor: mentorId,
            callType,
            ratePerMinute: mentor.ratePerMinute,
            status: callType === 'instant' ? 'waiting' : 'scheduled',
            scheduledFor: callType === 'scheduled' ? new Date(scheduledFor) : undefined,
            scheduledDuration
        });

        await call.save();

        res.status(201).json({
            success: true,
            message: callType === 'instant' ? 'Call initiated' : 'Call scheduled',
            data: {
                callId: call._id,
                roomId: call.roomId,
                mentor: {
                    name: mentor.user.name,
                    avatar: mentor.user.avatar,
                    headline: mentor.headline
                },
                ratePerMinute: mentor.ratePerMinute
            }
        });
    } catch (error) {
        console.error('Error initiating call:', error);
        res.status(500).json({
            success: false,
            message: 'Error initiating call'
        });
    }
});

// Get pending scheduled calls for mentor (MUST be before /:id routes)
router.get('/mentor/pending', protect, async (req, res) => {
    try {
        const mentor = await Mentor.findOne({ user: req.user._id });
        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor profile not found'
            });
        }

        const pendingCalls = await Call.find({
            mentor: mentor._id,
            callType: 'scheduled',
            status: 'scheduled'
        })
            .populate('student', 'name avatar email')
            .sort({ scheduledFor: 1 });

        res.json({
            success: true,
            data: pendingCalls
        });
    } catch (error) {
        console.error('Error fetching pending calls:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending calls'
        });
    }
});

// Get confirmed scheduled calls for mentor (upcoming schedule)
router.get('/mentor/confirmed', protect, async (req, res) => {
    try {
        const mentor = await Mentor.findOne({ user: req.user._id });
        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor profile not found'
            });
        }

        const confirmedCalls = await Call.find({
            mentor: mentor._id,
            callType: 'scheduled',
            status: 'confirmed',
            scheduledFor: { $gte: new Date() } // Only future calls
        })
            .populate('student', 'name avatar email')
            .sort({ scheduledFor: 1 });

        res.json({
            success: true,
            data: confirmedCalls
        });
    } catch (error) {
        console.error('Error fetching confirmed calls:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching confirmed calls'
        });
    }
});

// Start a call (WebRTC connected)
router.patch('/:id/start', protect, async (req, res) => {
    try {
        const call = await Call.findById(req.params.id);

        if (!call) {
            return res.status(404).json({
                success: false,
                message: 'Call not found'
            });
        }

        // Verify user is part of the call
        const mentor = await Mentor.findById(call.mentor);
        if (call.student.toString() !== req.user._id.toString() &&
            mentor?.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized for this call'
            });
        }

        await call.startCall();

        res.json({
            success: true,
            message: 'Call started',
            data: {
                startedAt: call.startedAt,
                ratePerMinute: call.ratePerMinute
            }
        });
    } catch (error) {
        console.error('Error starting call:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting call'
        });
    }
});

// End a call
router.patch('/:id/end', protect, async (req, res) => {
    try {
        const call = await Call.findById(req.params.id);

        if (!call) {
            return res.status(404).json({
                success: false,
                message: 'Call not found'
            });
        }

        // Verify user is part of the call
        const mentor = await Mentor.findById(call.mentor);
        if (call.student.toString() !== req.user._id.toString() &&
            mentor?.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized for this call'
            });
        }

        const result = await call.endCall();

        // Charge student's wallet
        const wallet = await Wallet.findOne({ user: call.student });
        if (wallet) {
            await wallet.chargeForCall(result.cost, call._id);
        }

        // Credit mentor (after platform fee)
        // Dynamic Platform Fee based on Student Streak
        // >= 30 days streak: 20% fee
        // < 30 days streak: 25% fee
        const student = await User.findById(call.student);
        let platformFee = 0.25; // Default 25%

        if (student && student.streakCount >= 30) {
            platformFee = 0.20; // Discounted fee for consistent learners
        }

        const mentorEarning = result.cost * (1 - platformFee);
        mentor.totalEarned += mentorEarning;
        mentor.pendingPayout += mentorEarning;
        mentor.totalSessions += 1;
        mentor.totalMinutes += result.duration;
        await mentor.save();

        res.json({
            success: true,
            message: 'Call ended',
            data: {
                duration: result.duration,
                totalCost: result.cost,
                endedAt: call.endedAt
            }
        });
    } catch (error) {
        console.error('Error ending call:', error);
        res.status(500).json({
            success: false,
            message: 'Error ending call'
        });
    }
});

// Cancel a call
router.patch('/:id/cancel', protect, async (req, res) => {
    try {
        const { reason } = req.body;
        const call = await Call.findById(req.params.id);

        if (!call) {
            return res.status(404).json({
                success: false,
                message: 'Call not found'
            });
        }

        // Determine who is cancelling
        const mentor = await Mentor.findById(call.mentor);
        let cancelledBy = 'student';
        if (mentor?.user.toString() === req.user._id.toString()) {
            cancelledBy = 'mentor';
        }

        await call.cancelCall(cancelledBy, reason);

        res.json({
            success: true,
            message: 'Call cancelled',
            data: { status: call.status }
        });
    } catch (error) {
        console.error('Error cancelling call:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling call'
        });
    }
});

// Submit review after call
router.post('/:id/review', protect, async (req, res) => {
    try {
        const { rating, content, tags, callQuality } = req.body;
        const call = await Call.findById(req.params.id);

        if (!call) {
            return res.status(404).json({
                success: false,
                message: 'Call not found'
            });
        }

        if (call.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the student can review this call'
            });
        }

        if (call.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only review completed calls'
            });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ call: call._id });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this call'
            });
        }

        // Update call quality
        if (callQuality) {
            call.callQuality = callQuality;
            await call.save();
        }

        // Create review
        const review = new Review({
            call: call._id,
            mentor: call.mentor,
            student: req.user._id,
            rating,
            content,
            tags
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: review
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting review'
        });
    }
});

// Get call history
router.get('/history', protect, async (req, res) => {
    try {
        const { page = 1, limit = 10, role = 'student' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let filter;
        if (role === 'mentor') {
            const mentor = await Mentor.findOne({ user: req.user._id });
            if (!mentor) {
                return res.json({ success: true, data: [], pagination: { total: 0 } });
            }
            filter = { mentor: mentor._id };
        } else {
            filter = { student: req.user._id };
        }

        const [calls, total] = await Promise.all([
            Call.find(filter)
                .populate({
                    path: 'mentor',
                    populate: { path: 'user', select: 'name avatar' }
                })
                .populate('student', 'name avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Call.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: calls,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching call history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching call history'
        });
    }
});

// Get call details
router.get('/:id', protect, async (req, res) => {
    try {
        const call = await Call.findById(req.params.id)
            .populate({
                path: 'mentor',
                populate: { path: 'user', select: 'name avatar' }
            })
            .populate('student', 'name avatar');

        if (!call) {
            return res.status(404).json({
                success: false,
                message: 'Call not found'
            });
        }

        res.json({ success: true, data: call });
    } catch (error) {
        console.error('Error fetching call:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching call'
        });
    }
});

// Get pending scheduled calls for mentor
router.get('/mentor/pending', protect, async (req, res) => {
    try {
        const mentor = await Mentor.findOne({ user: req.user._id });
        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor profile not found'
            });
        }

        const pendingCalls = await Call.find({
            mentor: mentor._id,
            callType: 'scheduled',
            status: 'scheduled'
        })
            .populate('student', 'name avatar email')
            .sort({ scheduledFor: 1 });

        res.json({
            success: true,
            data: pendingCalls
        });
    } catch (error) {
        console.error('Error fetching pending calls:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending calls'
        });
    }
});

// Mentor modifies scheduled call duration
router.patch('/:id/modify-duration', protect, async (req, res) => {
    try {
        const { newDuration } = req.body;

        if (!newDuration || newDuration < 5 || newDuration > 120) {
            return res.status(400).json({
                success: false,
                message: 'Duration must be between 5 and 120 minutes'
            });
        }

        const call = await Call.findById(req.params.id);
        if (!call) {
            return res.status(404).json({
                success: false,
                message: 'Call not found'
            });
        }

        // Verify mentor owns this call
        const mentor = await Mentor.findOne({ user: req.user._id });
        if (!mentor || call.mentor.toString() !== mentor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this call'
            });
        }

        // Only allow modification of scheduled calls
        if (call.status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Can only modify scheduled calls'
            });
        }

        call.scheduledDuration = newDuration;
        call.mentorModifiedDuration = true;
        await call.save();

        res.json({
            success: true,
            message: `Duration updated to ${newDuration} minutes`,
            data: call
        });
    } catch (error) {
        console.error('Error modifying call duration:', error);
        res.status(500).json({
            success: false,
            message: 'Error modifying call duration'
        });
    }
});

// Mentor accepts scheduled call
router.patch('/:id/accept', protect, async (req, res) => {
    try {
        const call = await Call.findById(req.params.id);
        if (!call) {
            return res.status(404).json({
                success: false,
                message: 'Call not found'
            });
        }

        const mentor = await Mentor.findOne({ user: req.user._id });
        if (!mentor || call.mentor.toString() !== mentor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (call.status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Call is not in scheduled status'
            });
        }

        call.status = 'confirmed';
        call.confirmedAt = new Date();
        await call.save();

        res.json({
            success: true,
            message: 'Call confirmed',
            data: call
        });
    } catch (error) {
        console.error('Error accepting call:', error);
        res.status(500).json({
            success: false,
            message: 'Error accepting call'
        });
    }
});

// Mentor accepts scheduled call
router.patch('/:id/accept', protect, async (req, res) => {
    try {
        const call = await Call.findById(req.params.id);
        if (!call) {
            return res.status(404).json({
                success: false,
                message: 'Call not found'
            });
        }

        const mentor = await Mentor.findOne({ user: req.user._id });
        if (!mentor || call.mentor.toString() !== mentor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (call.status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Call is not in scheduled status'
            });
        }

        call.status = 'confirmed';
        call.confirmedAt = new Date();
        await call.save();

        res.json({
            success: true,
            message: 'Call confirmed',
            data: call
        });
    } catch (error) {
        console.error('Error accepting call:', error);
        res.status(500).json({
            success: false,
            message: 'Error accepting call'
        });
    }
});

// Mentor declines scheduled call
router.patch('/:id/decline', protect, async (req, res) => {
    try {
        const { reason } = req.body;
        const call = await Call.findById(req.params.id);

        if (!call) {
            return res.status(404).json({
                success: false,
                message: 'Call not found'
            });
        }

        const mentor = await Mentor.findOne({ user: req.user._id });
        if (!mentor || call.mentor.toString() !== mentor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        call.status = 'cancelled';
        call.cancelledBy = 'mentor';
        call.cancellationReason = reason || 'Mentor unavailable';
        await call.save();

        res.json({
            success: true,
            message: 'Call declined',
            data: call
        });
    } catch (error) {
        console.error('Error declining call:', error);
        res.status(500).json({
            success: false,
            message: 'Error declining call'
        });
    }
});

export default router;
