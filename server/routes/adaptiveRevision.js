import express from 'express';
import { protect } from '../middleware/auth.js';
import AdaptiveRevision from '../models/AdaptiveRevision.js';
import LectureProgress from '../models/LectureProgress.js';
import {
    generateRevisionSchedule,
    adjustScheduleBasedOnPerformance,
    generateCatchupPlan,
    getSmartSuggestions
} from '../services/revisionScheduler.js';

const router = express.Router();

// ========================================
// LECTURE UNDERSTANDING FEEDBACK
// ========================================

/**
 * @route   POST /api/adaptive-revision/feedback
 * @desc    Submit understanding after completing a lecture
 * @access  Private
 */
router.post('/feedback', protect, async (req, res) => {
    try {
        const {
            course,
            topicId,
            topicTitle,
            lessonId,
            lessonTitle,
            understandingLevel,
            notes,
            timeSpent,
            videoWatchedFully
        } = req.body;

        // Validate required fields
        if (!course || !topicId || !topicTitle || !understandingLevel) {
            return res.status(400).json({
                success: false,
                message: 'course, topicId, topicTitle, and understandingLevel are required'
            });
        }

        // Check if progress already exists
        let lectureProgress = await LectureProgress.findOne({
            user: req.user._id,
            course,
            topicId,
            lessonId: lessonId || null
        });

        if (lectureProgress) {
            // Update existing progress
            await lectureProgress.updateUnderstanding(understandingLevel);
            if (notes) lectureProgress.notes = notes;
            if (timeSpent) lectureProgress.timeSpent = timeSpent;
            if (videoWatchedFully !== undefined) lectureProgress.videoWatchedFully = videoWatchedFully;
            await lectureProgress.save();
        } else {
            // Create new progress
            lectureProgress = await LectureProgress.create({
                user: req.user._id,
                course,
                topicId,
                topicTitle,
                lessonId,
                lessonTitle,
                understandingLevel,
                notes,
                timeSpent,
                videoWatchedFully
            });
        }

        // Generate revision schedule if not already done
        let revisions = [];
        if (!lectureProgress.revisionGenerated) {
            const result = await generateRevisionSchedule(lectureProgress._id);
            revisions = result.revisions;
        }

        // Award points for completing lecture
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(req.user._id);
        user.babuaCoins += 5; // 5 coins for completing with feedback
        user.updateStreak();
        await user.save();

        res.json({
            success: true,
            data: {
                lectureProgress,
                revisionsCreated: revisions.length,
                coinsEarned: 5
            }
        });
    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========================================
// REVISION PLAN VIEWS
// ========================================

/**
 * @route   GET /api/adaptive-revision/plan
 * @desc    Get revision plan (day/week/month view)
 * @access  Private
 */
router.get('/plan', protect, async (req, res) => {
    try {
        const { view = 'week' } = req.query;

        const revisions = await AdaptiveRevision.getRevisionPlan(req.user._id, view);

        // Group by date
        const grouped = {};
        revisions.forEach(rev => {
            const dateKey = rev.scheduledDate.toISOString().split('T')[0];
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(rev);
        });

        res.json({
            success: true,
            data: {
                view,
                total: revisions.length,
                revisions,
                grouped
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
 * @route   GET /api/adaptive-revision/today
 * @desc    Get today's revision targets
 * @access  Private
 */
router.get('/today', protect, async (req, res) => {
    try {
        const revisions = await AdaptiveRevision.getTodayRevisions(req.user._id);
        const overdue = await AdaptiveRevision.getOverdueRevisions(req.user._id);

        res.json({
            success: true,
            data: {
                today: revisions,
                todayCount: revisions.length,
                overdue,
                overdueCount: overdue.length,
                totalPending: revisions.length + overdue.length
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
 * @route   GET /api/adaptive-revision/missed
 * @desc    Get overdue/missed revisions
 * @access  Private
 */
router.get('/missed', protect, async (req, res) => {
    try {
        const missed = await AdaptiveRevision.getOverdueRevisions(req.user._id);

        res.json({
            success: true,
            data: {
                missed,
                count: missed.length
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
 * @route   GET /api/adaptive-revision/upcoming
 * @desc    Get upcoming revisions (next N days)
 * @access  Private
 */
router.get('/upcoming', protect, async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const revisions = await AdaptiveRevision.getUpcomingRevisions(req.user._id, parseInt(days));

        res.json({
            success: true,
            data: {
                revisions,
                count: revisions.length,
                days: parseInt(days)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========================================
// REVISION COMPLETION
// ========================================

/**
 * @route   POST /api/adaptive-revision/complete/:id
 * @desc    Mark a revision as complete with performance
 * @access  Private
 */
router.post('/complete/:id', protect, async (req, res) => {
    try {
        const { accuracy, timeSpent, quizId } = req.body;

        const revision = await AdaptiveRevision.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!revision) {
            return res.status(404).json({
                success: false,
                message: 'Revision not found'
            });
        }

        await revision.complete({
            accuracy,
            attempts: (revision.performance?.attempts || 0) + 1,
            quizId
        });

        revision.actualTimeSpent = timeSpent;
        await revision.save();

        // Adjust future schedule based on performance
        let adjustment = null;
        if (accuracy !== undefined) {
            adjustment = await adjustScheduleBasedOnPerformance(
                req.user._id,
                revision.topicId,
                revision.course,
                accuracy
            );
        }

        // Award coins
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(req.user._id);

        let coinsEarned = 5;
        if (accuracy >= 85) coinsEarned = 15;
        else if (accuracy >= 70) coinsEarned = 10;

        user.babuaCoins += coinsEarned;
        user.updateStreak();
        await user.save();

        res.json({
            success: true,
            data: {
                revision,
                adjustment,
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

/**
 * @route   POST /api/adaptive-revision/reschedule/:id
 * @desc    Reschedule a revision to a new date
 * @access  Private
 */
router.post('/reschedule/:id', protect, async (req, res) => {
    try {
        const { newDate, reason } = req.body;

        const revision = await AdaptiveRevision.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!revision) {
            return res.status(404).json({
                success: false,
                message: 'Revision not found'
            });
        }

        if (revision.rescheduleCount >= 3) {
            return res.status(400).json({
                success: false,
                message: 'Maximum reschedule limit (3) reached'
            });
        }

        await revision.reschedule(new Date(newDate), reason);

        res.json({
            success: true,
            data: revision
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========================================
// STATS & INSIGHTS
// ========================================

/**
 * @route   GET /api/adaptive-revision/stats
 * @desc    Get retention score, streak, completion stats
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
    try {
        const { course } = req.query;

        const retentionScore = await AdaptiveRevision.getRetentionScore(req.user._id, course);
        const streak = await AdaptiveRevision.getRevisionStreak(req.user._id);
        const todayCount = (await AdaptiveRevision.getTodayRevisions(req.user._id)).length;
        const overdueCount = (await AdaptiveRevision.getOverdueRevisions(req.user._id)).length;

        // Understanding distribution
        const understandingStats = course
            ? await LectureProgress.getUnderstandingStats(req.user._id, course)
            : null;

        res.json({
            success: true,
            data: {
                retentionScore: retentionScore.score,
                streak,
                todayCount,
                overdueCount,
                completionRate: retentionScore.completionRate,
                avgAccuracy: retentionScore.avgAccuracy,
                totalRevisions: retentionScore.total,
                completedRevisions: retentionScore.completed,
                missedRevisions: retentionScore.missed,
                understandingStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========================================
// SMART FEATURES
// ========================================

/**
 * @route   POST /api/adaptive-revision/catchup
 * @desc    Generate smart catch-up plan for missed revisions
 * @access  Private
 */
router.post('/catchup', protect, async (req, res) => {
    try {
        const result = await generateCatchupPlan(req.user._id);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   GET /api/adaptive-revision/suggestions
 * @desc    Get smart suggestions for weak topics
 * @access  Private
 */
router.get('/suggestions', protect, async (req, res) => {
    try {
        const suggestions = await getSmartSuggestions(req.user._id);

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   POST /api/adaptive-revision/custom
 * @desc    User creates their own custom revision
 * @access  Private
 */
router.post('/custom', protect, async (req, res) => {
    try {
        const {
            course,
            topicId,
            topicTitle,
            lessonId,
            lessonTitle,
            scheduledDate,
            revisionType,
            estimatedMinutes
        } = req.body;

        if (!course || !topicId || !topicTitle || !scheduledDate) {
            return res.status(400).json({
                success: false,
                message: 'course, topicId, topicTitle, and scheduledDate are required'
            });
        }

        const revision = await AdaptiveRevision.create({
            user: req.user._id,
            course,
            topicId,
            topicTitle,
            lessonId,
            lessonTitle,
            initialUnderstanding: 'partial', // Default for custom
            scheduledDate: new Date(scheduledDate),
            intervalDay: 0, // Custom
            revisionType: revisionType || 'recall',
            priority: 'medium',
            whyScheduled: 'Self-scheduled revision',
            estimatedMinutes: estimatedMinutes || 10
        });

        res.json({
            success: true,
            data: revision
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
