import express from 'express';
import RevisionSchedule from '../models/RevisionSchedule.js';
import Problem from '../models/Problem.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/revisions
// @desc    Get user's revision schedule
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status } = req.query;

        const query = { user: req.user._id };

        if (status === 'pending') {
            query.isFullyCompleted = false;
        } else if (status === 'completed') {
            query.isFullyCompleted = true;
        }

        const revisions = await RevisionSchedule.find(query)
            .populate('problem', 'title slug difficulty')
            .populate('pattern', 'name slug')
            .sort({ currentPhase: 1, 'day3.date': 1 });

        res.json({
            success: true,
            data: revisions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/revisions/due
// @desc    Get due revisions
// @access  Private
router.get('/due', protect, async (req, res) => {
    try {
        const dueRevisions = await RevisionSchedule.getDueRevisions(req.user._id);

        // Group by phase
        const grouped = {
            day3: dueRevisions.filter(r => r.currentPhase === 3 && !r.day3.completed),
            day7: dueRevisions.filter(r => r.currentPhase === 7 && !r.day7.completed),
            day30: dueRevisions.filter(r => r.currentPhase === 30 && !r.day30.completed)
        };

        res.json({
            success: true,
            data: {
                revisions: dueRevisions,
                grouped,
                totalDue: dueRevisions.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/revisions/upcoming
// @desc    Get upcoming revisions (next 7 days)
// @access  Private
router.get('/upcoming', protect, async (req, res) => {
    try {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const upcoming = await RevisionSchedule.find({
            user: req.user._id,
            isFullyCompleted: false,
            $or: [
                { 'day3.date': { $gte: now, $lte: nextWeek }, 'day3.completed': false },
                { 'day7.date': { $gte: now, $lte: nextWeek }, 'day7.completed': false },
                { 'day30.date': { $gte: now, $lte: nextWeek }, 'day30.completed': false }
            ]
        })
            .populate('problem', 'title slug difficulty')
            .populate('pattern', 'name slug')
            .sort({ 'day3.date': 1 });

        res.json({
            success: true,
            data: upcoming
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/revisions/:id/complete
// @desc    Mark revision phase as complete
// @access  Private
router.put('/:id/complete', protect, async (req, res) => {
    try {
        const { phase, usedHelp, variationsSolved, timeTaken } = req.body;

        const revision = await RevisionSchedule.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!revision) {
            return res.status(404).json({
                success: false,
                message: 'Revision not found'
            });
        }

        const now = new Date();

        // Update the appropriate phase
        if (phase === 3) {
            revision.day3.completed = true;
            revision.day3.completedAt = now;
            revision.day3.usedHelp = usedHelp || false;
            revision.currentPhase = 7;
        } else if (phase === 7) {
            revision.day7.completed = true;
            revision.day7.completedAt = now;
            if (variationsSolved) {
                revision.day7.variationsSolved = variationsSolved;
            }
            revision.currentPhase = 30;
        } else if (phase === 30) {
            revision.day30.completed = true;
            revision.day30.completedAt = now;
            revision.day30.timeTaken = timeTaken || 0;
            revision.day30.wasTimedChallenge = !!timeTaken;
        }

        // Update mastery level
        revision.updateMastery();

        await revision.save();

        // Award coins for completing revisions
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(req.user._id);

        let coinsEarned = 0;
        if (phase === 3) coinsEarned = 5;
        else if (phase === 7) coinsEarned = 10;
        else if (phase === 30) coinsEarned = 20;

        user.babuaCoins += coinsEarned;
        user.updateStreak();
        await user.save();

        res.json({
            success: true,
            data: {
                revision,
                coinsEarned
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/revisions/stats
// @desc    Get revision stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const totalRevisions = await RevisionSchedule.countDocuments({
            user: req.user._id
        });

        const completedRevisions = await RevisionSchedule.countDocuments({
            user: req.user._id,
            isFullyCompleted: true
        });

        const dueRevisions = await RevisionSchedule.getDueRevisions(req.user._id);

        // Mastery breakdown
        const masteryStats = await RevisionSchedule.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$masteryLevel', count: { $sum: 1 } } }
        ]);

        const mastery = {
            learning: 0,
            practicing: 0,
            mastering: 0,
            mastered: 0
        };

        masteryStats.forEach(s => {
            mastery[s._id] = s.count;
        });

        res.json({
            success: true,
            data: {
                total: totalRevisions,
                completed: completedRevisions,
                due: dueRevisions.length,
                adherenceRate: totalRevisions > 0
                    ? Math.round((completedRevisions / totalRevisions) * 100)
                    : 0,
                mastery
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
