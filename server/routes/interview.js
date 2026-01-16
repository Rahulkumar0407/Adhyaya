import express from 'express';
import { protect } from '../middleware/auth.js';
import Interview from '../models/Interview.js';
import InterviewPattern from '../models/InterviewPattern.js';

const router = express.Router();

// Save completed interview
router.post('/', protect, async (req, res) => {
    try {
        const {
            interviewType,
            customRole,
            config,
            overallScore,
            scores,
            patternsAsked,
            conversation,
            problems,
            strengths,
            weakPoints,
            suggestions,
            timeTaken,
            questionsAttempted,
            questionsTotal
        } = req.body;

        // Normalize problem difficulties to lowercase (schema expects: easy, medium, hard)
        const normalizedProblems = problems?.map(p => ({
            ...p,
            difficulty: p.difficulty?.toLowerCase() || 'medium'
        })) || [];

        const interview = new Interview({
            userId: req.user.id,
            interviewType,
            customRole,
            config,
            overallScore,
            scores,
            patternsAsked,
            conversation,
            problems: normalizedProblems,
            strengths,
            weakPoints,
            suggestions,
            timeTaken,
            questionsAttempted,
            questionsTotal,
            status: 'completed'
        });

        await interview.save();

        res.status(201).json({
            success: true,
            message: 'Interview saved successfully',
            data: interview
        });
    } catch (error) {
        console.error('Error saving interview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save interview',
            error: error.message
        });
    }
});

// Get interview history
router.get('/history', protect, async (req, res) => {
    try {
        const { limit = 10, page = 1, type } = req.query;

        const query = { userId: req.user.id, status: 'completed' };
        if (type) query.interviewType = type;

        const interviews = await Interview.find(query)
            .sort({ completedAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .select('-conversation'); // Exclude full conversation for list view

        const total = await Interview.countDocuments(query);

        res.json({
            success: true,
            data: {
                interviews,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching interview history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch interview history',
            error: error.message
        });
    }
});

// Get single interview details
router.get('/:id', protect, async (req, res) => {
    try {
        const interview = await Interview.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        res.json({
            success: true,
            data: interview
        });
    } catch (error) {
        console.error('Error fetching interview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch interview',
            error: error.message
        });
    }
});

// Get placement readiness stats
router.get('/stats/readiness', protect, async (req, res) => {
    try {
        const readinessStats = await Interview.getReadinessStats(req.user.id);

        res.json({
            success: true,
            data: readinessStats
        });
    } catch (error) {
        console.error('Error fetching readiness stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch readiness stats',
            error: error.message
        });
    }
});

// Get pattern analysis
router.get('/stats/patterns', protect, async (req, res) => {
    try {
        const patternAnalysis = await Interview.getPatternAnalysis(req.user.id);

        res.json({
            success: true,
            data: patternAnalysis
        });
    } catch (error) {
        console.error('Error fetching pattern analysis:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pattern analysis',
            error: error.message
        });
    }
});

// Get interview streak
router.get('/stats/streak', protect, async (req, res) => {
    try {
        const streak = await Interview.getStreak(req.user.id);

        res.json({
            success: true,
            data: { streak }
        });
    } catch (error) {
        console.error('Error fetching streak:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch streak',
            error: error.message
        });
    }
});

// Get all patterns (reference data)
router.get('/patterns/all', protect, async (req, res) => {
    try {
        const { category } = req.query;

        const query = category ? { category } : {};
        const patterns = await InterviewPattern.find(query).sort('name');

        res.json({
            success: true,
            data: patterns
        });
    } catch (error) {
        console.error('Error fetching patterns:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch patterns',
            error: error.message
        });
    }
});

// Seed patterns (admin only - can be called once during setup)
router.post('/patterns/seed', protect, async (req, res) => {
    try {
        await InterviewPattern.seedPatterns();

        res.json({
            success: true,
            message: 'Patterns seeded successfully'
        });
    } catch (error) {
        console.error('Error seeding patterns:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to seed patterns',
            error: error.message
        });
    }
});

export default router;
