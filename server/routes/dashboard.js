import express from 'express';
import User from '../models/User.js';
import Pattern from '../models/Pattern.js';
import Submission from '../models/Submission.js';
import RevisionSchedule from '../models/RevisionSchedule.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/dashboard
// @desc    Get dashboard data for student
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // Get pattern mastery overview
        const patterns = await Pattern.find({ isActive: true })
            .select('name slug category order');

        // Get user's pattern progress
        const user = await User.findById(userId);
        const patternProgress = user.patternProgress || [];

        // Calculate mastery for each category
        const patternMastery = patterns.map(pattern => {
            const progress = patternProgress.find(
                p => p.pattern?.toString() === pattern._id.toString()
            );
            return {
                pattern: {
                    id: pattern._id,
                    name: pattern.name,
                    slug: pattern.slug,
                    category: pattern.category
                },
                masteryPercent: progress?.masteryPercent || 0,
                problemsSolved: progress?.problemsSolved || 0,
                lastPracticed: progress?.lastPracticed || null
            };
        });

        // Group by category
        const masteryByCategory = {
            foundational: patternMastery.filter(p => p.pattern.category === 'foundational'),
            intermediate: patternMastery.filter(p => p.pattern.category === 'intermediate'),
            advanced: patternMastery.filter(p => p.pattern.category === 'advanced')
        };

        // Get due revisions
        const dueRevisions = await RevisionSchedule.getDueRevisions(userId);

        // Get upcoming revisions (next 3 days)
        const now = new Date();
        const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        const upcomingRevisions = await RevisionSchedule.find({
            user: userId,
            isFullyCompleted: false,
            $or: [
                { 'day3.date': { $gte: now, $lte: threeDaysLater }, 'day3.completed': false },
                { 'day7.date': { $gte: now, $lte: threeDaysLater }, 'day7.completed': false },
                { 'day30.date': { $gte: now, $lte: threeDaysLater }, 'day30.completed': false }
            ]
        })
            .populate('problem', 'title slug difficulty')
            .limit(5);

        // Get total stats
        const totalProblemsSolved = await Submission.distinct('problem', {
            user: userId,
            status: 'passed'
        });

        const totalRevisions = await RevisionSchedule.countDocuments({ user: userId });
        const completedRevisions = await RevisionSchedule.countDocuments({
            user: userId,
            isFullyCompleted: true
        });

        // Recent activity
        const recentSubmissions = await Submission.find({
            user: userId,
            status: 'passed'
        })
            .populate('problem', 'title slug difficulty')
            .populate('pattern', 'name slug')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                user: {
                    name: user.name,
                    streakCount: user.streakCount,
                    longestStreak: user.longestStreak,
                    babuaCoins: user.babuaCoins,
                    lastActive: user.lastActive
                },
                stats: {
                    problemsSolved: totalProblemsSolved.length,
                    totalRevisions,
                    completedRevisions,
                    revisionAdherence: totalRevisions > 0
                        ? Math.round((completedRevisions / totalRevisions) * 100)
                        : 0,
                    dueRevisionsCount: dueRevisions.length
                },
                patternMastery: masteryByCategory,
                revisions: {
                    due: dueRevisions.slice(0, 5),
                    upcoming: upcomingRevisions
                },
                recentActivity: recentSubmissions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/dashboard/metrics
// @desc    Get detailed metrics (for demo/mock data)
// @access  Private
router.get('/metrics', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // Last 30 days activity
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyActivity = await Submission.aggregate([
            {
                $match: {
                    user: userId,
                    status: 'passed',
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Difficulty breakdown
        const difficultyStats = await Submission.aggregate([
            {
                $match: { user: userId, status: 'passed' }
            },
            {
                $lookup: {
                    from: 'problems',
                    localField: 'problem',
                    foreignField: '_id',
                    as: 'problemData'
                }
            },
            { $unwind: '$problemData' },
            {
                $group: {
                    _id: '$problemData.difficulty',
                    count: { $sum: 1 }
                }
            }
        ]);

        const difficulty = {
            easy: 0,
            medium: 0,
            hard: 0
        };
        difficultyStats.forEach(d => {
            difficulty[d._id] = d.count;
        });

        // Mock readiness score (weighted calculation)
        const totalProblems = difficulty.easy + difficulty.medium + difficulty.hard;
        const mockReadiness = Math.min(100, Math.round(
            (difficulty.easy * 1 + difficulty.medium * 2 + difficulty.hard * 3) /
            Math.max(1, totalProblems) * 20
        ));

        res.json({
            success: true,
            data: {
                dailyActivity,
                difficulty,
                mockReadiness,
                totalProblems
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
