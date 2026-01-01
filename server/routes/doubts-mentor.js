import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import Doubt from '../models/Doubt.js';
import DoubtMessage from '../models/DoubtMessage.js';
import MentorSpecialization from '../models/MentorSpecialization.js';

const router = express.Router();

// All routes require mentor role
router.use(protect);
router.use(restrictTo('mentor'));

/**
 * @route   GET /api/doubts/mentor/assigned
 * @desc    Get mentor's assigned doubts
 * @access  Private (Mentor)
 */
router.get('/assigned', async (req, res) => {
    try {
        const { status } = req.query;

        const doubts = await Doubt.getMentorDoubts(req.user._id, status);

        const doubtStats = {
            active: await Doubt.countDocuments({ assignedMentor: req.user._id, status: { $in: ['mentor-assigned', 'in-progress', 'answered'] } }),
            resolved: await Doubt.countDocuments({ assignedMentor: req.user._id, status: 'resolved' })
        };

        res.json({
            success: true,
            data: {
                doubts,
                stats: doubtStats
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
 * @route   GET /api/doubts/mentor/available
 * @desc    Get available doubts that mentor can claim
 * @access  Private (Mentor)
 */
router.get('/available', async (req, res) => {
    try {
        const { subject } = req.query;

        // Check or create mentor's specialization
        let mentorSpec = await MentorSpecialization.findOne({ mentor: req.user._id });

        // Auto-create specialization for new mentors
        if (!mentorSpec) {
            mentorSpec = new MentorSpecialization({
                mentor: req.user._id,
                specializations: [
                    { subject: 'dsa' },
                    { subject: 'frontend' },
                    { subject: 'backend' }
                ],
                isAvailable: true,
                maxConcurrentDoubts: 5,
                currentDoubtCount: 0
            });
            await mentorSpec.save();
        }

        if (!mentorSpec.canTakeDoubts()) {
            return res.json({
                success: true,
                data: {
                    doubts: [],
                    message: 'You have reached your maximum doubt capacity or are not available'
                }
            });
        }

        const doubts = await Doubt.getAvailableDoubts(req.user._id, subject);

        // Add match scores
        const doubtsWithScores = doubts.map(doubt => ({
            ...doubt.toObject(),
            matchScore: mentorSpec.getMatchScore(doubt.subject, doubt.subTopic)
        }));

        res.json({
            success: true,
            data: {
                doubts: doubtsWithScores,
                remainingCapacity: mentorSpec.maxConcurrentDoubts - mentorSpec.currentDoubtCount
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
 * @route   POST /api/doubts/mentor/claim/:doubtId
 * @desc    Claim an available doubt
 * @access  Private (Mentor)
 */
router.post('/claim/:doubtId', async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.doubtId);

        if (!doubt) {
            return res.status(404).json({
                success: false,
                message: 'Doubt not found'
            });
        }

        if (doubt.assignedMentor) {
            return res.status(400).json({
                success: false,
                message: 'Doubt already assigned to another mentor'
            });
        }

        // Check mentor capacity
        const mentorSpec = await MentorSpecialization.findOne({ mentor: req.user._id });
        if (!mentorSpec || !mentorSpec.canTakeDoubts()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot take more doubts at this time'
            });
        }

        // Assign doubt
        doubt.assignedMentor = req.user._id;
        doubt.mentorMatchScore = mentorSpec.getMatchScore(doubt.subject, doubt.subTopic);
        doubt.status = 'mentor-assigned';
        await doubt.save();

        // Update mentor's current doubt count
        mentorSpec.currentDoubtCount += 1;
        mentorSpec.lastActiveAt = new Date();
        await mentorSpec.save();

        // TODO: Send notification to student

        res.json({
            success: true,
            message: 'Doubt claimed successfully',
            data: doubt
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   POST /api/doubts/mentor/:doubtId/reply
 * @desc    Reply to a doubt
 * @access  Private (Mentor)
 */
router.post('/:doubtId/reply', async (req, res) => {
    try {
        const { content, messageType, codeBlock } = req.body;

        const doubt = await Doubt.findById(req.params.doubtId);

        if (!doubt) {
            return res.status(404).json({
                success: false,
                message: 'Doubt not found'
            });
        }

        if (doubt.assignedMentor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'This doubt is not assigned to you'
            });
        }

        // Create message
        const message = await DoubtMessage.create({
            doubt: doubt._id,
            sender: req.user._id,
            senderType: 'mentor',
            messageType: messageType || 'text',
            content,
            codeBlock
        });

        await message.populate('sender', 'name avatar role');

        // Update doubt status
        if (doubt.status !== 'answered') {
            doubt.status = 'answered';
            if (!doubt.firstResponseAt) {
                doubt.firstResponseAt = new Date();
                doubt.calculateResponseTime();
                await doubt.save();

                // Update mentor's response time stats
                const mentorSpec = await MentorSpecialization.findOne({ mentor: req.user._id });
                if (mentorSpec) {
                    const responseTimeMin = doubt.actualResponseTime;

                    // Update fast/slow response counts
                    if (responseTimeMin < 30) {
                        mentorSpec.fastResponses += 1;
                    } else if (responseTimeMin > 120) {
                        mentorSpec.slowResponses += 1;
                    }

                    // Update average response time
                    const totalResponses = mentorSpec.totalDoubtsResolved || 1;
                    mentorSpec.avgResponseTime =
                        ((mentorSpec.avgResponseTime * (totalResponses - 1)) + responseTimeMin) / totalResponses;

                    await mentorSpec.save();
                }
            }
        }

        // TODO: Send real-time notification to student

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
 * @route   POST /api/doubts/mentor/:doubtId/voice
 * @desc    Upload voice note reply
 * @access  Private (Mentor)
 */
router.post('/:doubtId/voice', async (req, res) => {
    try {
        const { voiceUrl, duration, transcript } = req.body;

        const doubt = await Doubt.findById(req.params.doubtId);

        if (!doubt || doubt.assignedMentor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const message = await DoubtMessage.create({
            doubt: doubt._id,
            sender: req.user._id,
            senderType: 'mentor',
            messageType: 'voice',
            content: transcript || 'Voice message',
            voiceNote: {
                url: voiceUrl,
                duration,
                transcript
            }
        });

        await message.populate('sender', 'name avatar role');

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
 * @route   POST /api/doubts/mentor/:doubtId/whiteboard
 * @desc    Upload whiteboard/hand-drawn explanation
 * @access  Private (Mentor)
 */
router.post('/:doubtId/whiteboard', async (req, res) => {
    try {
        const { imageUrl, thumbnail, drawingData } = req.body;

        const doubt = await Doubt.findById(req.params.doubtId);

        if (!doubt || doubt.assignedMentor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const message = await DoubtMessage.create({
            doubt: doubt._id,
            sender: req.user._id,
            senderType: 'mentor',
            messageType: 'whiteboard',
            content: 'Whiteboard explanation',
            whiteboard: {
                imageUrl,
                thumbnail,
                drawingData
            }
        });

        await message.populate('sender', 'name avatar role');

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

export default router;
