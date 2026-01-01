import express from 'express';
import Pod from '../models/Pod.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/pods
// @desc    Get all available pods
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status } = req.query;

        const query = { isActive: true, isPublic: true };

        const pods = await Pod.find(query)
            .populate('members.user', 'name avatar streakCount')
            .sort({ createdAt: -1 });

        // Filter out full pods if requested
        const availablePods = pods.filter(p => p.members.length < p.maxMembers);

        res.json({
            success: true,
            data: {
                pods: availablePods,
                total: availablePods.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/pods/my
// @desc    Get user's current pod
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const pod = await Pod.findOne({
            'members.user': req.user._id,
            isActive: true
        })
            .populate('members.user', 'name avatar streakCount babuaCoins')
            .populate('weeklyGoals.createdBy', 'name');

        if (!pod) {
            return res.json({
                success: true,
                data: null,
                message: 'Not in a pod'
            });
        }

        // Get member progress for current week
        const weekNumber = getWeekNumber(new Date());
        const memberProgress = pod.memberProgress.filter(
            mp => mp.weekNumber === weekNumber
        );

        res.json({
            success: true,
            data: {
                pod,
                memberProgress
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/pods
// @desc    Create a new pod
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name, description, isPublic } = req.body;

        // Check if user is already in a pod
        const existingPod = await Pod.findOne({
            'members.user': req.user._id,
            isActive: true
        });

        if (existingPod) {
            return res.status(400).json({
                success: false,
                message: 'You are already in a pod. Leave your current pod first.'
            });
        }

        const pod = await Pod.create({
            name,
            description,
            isPublic: isPublic !== false,
            members: [{
                user: req.user._id,
                role: 'leader',
                joinedAt: new Date()
            }]
        });

        // Update user's current pod
        await User.findByIdAndUpdate(req.user._id, { currentPod: pod._id });

        res.status(201).json({
            success: true,
            data: pod
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/pods/:id/join
// @desc    Join a pod
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
    try {
        const pod = await Pod.findById(req.params.id);

        if (!pod) {
            return res.status(404).json({
                success: false,
                message: 'Pod not found'
            });
        }

        // Check if user is already in a pod
        const existingPod = await Pod.findOne({
            'members.user': req.user._id,
            isActive: true
        });

        if (existingPod) {
            return res.status(400).json({
                success: false,
                message: 'You are already in a pod'
            });
        }

        // Try to add member
        try {
            pod.addMember(req.user._id);
            await pod.save();
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        // Update user's current pod
        await User.findByIdAndUpdate(req.user._id, { currentPod: pod._id });

        // Emit socket event for real-time update
        const io = req.app.get('io');
        io.to(`pod-${pod._id}`).emit('member-joined', {
            podId: pod._id,
            user: {
                id: req.user._id,
                name: req.user.name
            }
        });

        res.json({
            success: true,
            message: 'Joined pod successfully',
            data: pod
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/pods/join/:inviteCode
// @desc    Join a pod by invite code
// @access  Private
router.post('/join/:inviteCode', protect, async (req, res) => {
    try {
        const pod = await Pod.findOne({ inviteCode: req.params.inviteCode });

        if (!pod) {
            return res.status(404).json({
                success: false,
                message: 'Invalid invite code'
            });
        }

        // Check if user is already in a pod
        const existingPod = await Pod.findOne({
            'members.user': req.user._id,
            isActive: true
        });

        if (existingPod) {
            return res.status(400).json({
                success: false,
                message: 'You are already in a pod'
            });
        }

        try {
            pod.addMember(req.user._id);
            await pod.save();
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        await User.findByIdAndUpdate(req.user._id, { currentPod: pod._id });

        res.json({
            success: true,
            message: 'Joined pod successfully',
            data: pod
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/pods/:id/leave
// @desc    Leave a pod
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
    try {
        const pod = await Pod.findById(req.params.id);

        if (!pod) {
            return res.status(404).json({
                success: false,
                message: 'Pod not found'
            });
        }

        try {
            pod.removeMember(req.user._id);
            await pod.save();
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        // Clear user's current pod
        await User.findByIdAndUpdate(req.user._id, { currentPod: null });

        // Emit socket event
        const io = req.app.get('io');
        io.to(`pod-${pod._id}`).emit('member-left', {
            podId: pod._id,
            userId: req.user._id
        });

        res.json({
            success: true,
            message: 'Left pod successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/pods/:id/stats
// @desc    Get pod statistics (pod-only comparison)
// @access  Private
router.get('/:id/stats', protect, async (req, res) => {
    try {
        const pod = await Pod.findById(req.params.id)
            .populate('members.user', 'name avatar streakCount babuaCoins');

        if (!pod) {
            return res.status(404).json({
                success: false,
                message: 'Pod not found'
            });
        }

        // Verify user is a member
        if (!pod.isMember(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not a member of this pod'
            });
        }

        // Get member stats
        const Submission = (await import('../models/Submission.js')).default;
        const RevisionSchedule = (await import('../models/RevisionSchedule.js')).default;

        const memberStats = await Promise.all(pod.members.map(async (member) => {
            const problemsSolved = await Submission.countDocuments({
                user: member.user._id,
                status: 'passed'
            });

            const revisionsCompleted = await RevisionSchedule.countDocuments({
                user: member.user._id,
                isFullyCompleted: true
            });

            return {
                user: member.user,
                problemsSolved,
                revisionsCompleted,
                streakCount: member.user.streakCount,
                babuaCoins: member.user.babuaCoins
            };
        }));

        // Sort by problems solved (pod-only comparison)
        memberStats.sort((a, b) => b.problemsSolved - a.problemsSolved);

        res.json({
            success: true,
            data: {
                pod: {
                    name: pod.name,
                    memberCount: pod.members.length
                },
                memberStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/pods/:id/goals
// @desc    Create weekly goal
// @access  Private (leader only)
router.post('/:id/goals', protect, async (req, res) => {
    try {
        const pod = await Pod.findById(req.params.id);

        if (!pod) {
            return res.status(404).json({
                success: false,
                message: 'Pod not found'
            });
        }

        // Check if user is leader
        const member = pod.members.find(
            m => m.user.toString() === req.user._id.toString()
        );

        if (!member || member.role !== 'leader') {
            return res.status(403).json({
                success: false,
                message: 'Only pod leader can create goals'
            });
        }

        const { title, description, targetProblems, targetPatterns } = req.body;

        const now = new Date();
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

        const goal = {
            title,
            description,
            targetProblems: targetProblems || 5,
            targetPatterns: targetPatterns || [],
            startDate: now,
            endDate: endOfWeek,
            createdBy: req.user._id
        };

        pod.weeklyGoals.push(goal);
        pod.currentGoal = pod.weeklyGoals[pod.weeklyGoals.length - 1]._id;

        await pod.save();

        // Notify members
        const io = req.app.get('io');
        io.to(`pod-${pod._id}`).emit('new-goal', goal);

        res.json({
            success: true,
            data: goal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Helper function to get week number
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export default router;
