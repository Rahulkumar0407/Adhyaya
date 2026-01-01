import express from 'express';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import RevisionSchedule from '../models/RevisionSchedule.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/problems/:slug
// @desc    Get problem by slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const problem = await Problem.findOne({
            slug: req.params.slug,
            isActive: true
        })
            .populate('pattern', 'name slug category')
            .populate('variations', 'title slug difficulty')
            .populate('parentProblem', 'title slug');

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        res.json({
            success: true,
            data: problem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/problems/:slug/submit
// @desc    Submit a solution
// @access  Private
router.post('/:slug/submit', protect, async (req, res) => {
    try {
        const { code, language, timeTaken, usedHints, hintsUsedCount } = req.body;

        const problem = await Problem.findOne({ slug: req.params.slug });

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Check if first successful submission
        const existingSuccess = await Submission.findOne({
            user: req.user._id,
            problem: problem._id,
            status: 'passed'
        });

        // Simulate test results (UI only - no real execution)
        // In a real scenario, you'd run the code against test cases
        const testResults = problem.testCases?.map((tc, idx) => ({
            testCase: idx + 1,
            passed: true, // Simulated
            input: tc.isHidden ? '[Hidden]' : tc.input,
            expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
            actualOutput: tc.expectedOutput, // Simulated
            executionTime: Math.floor(Math.random() * 100) + 10
        })) || [];

        const allPassed = testResults.every(r => r.passed);

        // Create submission
        const submission = await Submission.create({
            user: req.user._id,
            problem: problem._id,
            pattern: problem.pattern,
            code,
            language,
            status: allPassed ? 'passed' : 'failed',
            testResults,
            executionTime: testResults.reduce((acc, r) => acc + r.executionTime, 0),
            timeTaken: timeTaken || 0,
            usedHints: usedHints || false,
            hintsUsedCount: hintsUsedCount || 0,
            isFirstSuccess: allPassed && !existingSuccess
        });

        // Update problem stats
        problem.totalSubmissions += 1;
        if (allPassed) problem.successfulSubmissions += 1;
        await problem.save();

        // If first success, create revision schedule
        if (allPassed && !existingSuccess) {
            await RevisionSchedule.createSchedule(
                req.user._id,
                problem._id,
                problem.pattern
            );

            // Update user's pattern progress
            const user = await User.findById(req.user._id);
            const patternProgress = user.patternProgress.find(
                p => p.pattern.toString() === problem.pattern.toString()
            );

            if (patternProgress) {
                patternProgress.problemsSolved += 1;
                patternProgress.lastPracticed = new Date();
            } else {
                user.patternProgress.push({
                    pattern: problem.pattern,
                    problemsSolved: 1,
                    masteryPercent: 0,
                    lastPracticed: new Date()
                });
            }

            // Award Babua Coins for first solve
            user.babuaCoins += 10;

            // Update streak
            user.updateStreak();

            await user.save();
        }

        res.json({
            success: true,
            data: {
                submission,
                isFirstSuccess: allPassed && !existingSuccess,
                coinsEarned: allPassed && !existingSuccess ? 10 : 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/problems/:slug/revision
// @desc    Mark problem for revision (manual)
// @access  Private
router.post('/:slug/revision', protect, async (req, res) => {
    try {
        const problem = await Problem.findOne({ slug: req.params.slug });

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Check if revision already exists
        const existingRevision = await RevisionSchedule.findOne({
            user: req.user._id,
            problem: problem._id
        });

        if (existingRevision) {
            return res.json({
                success: true,
                message: 'Already in revision schedule',
                data: existingRevision
            });
        }

        // Create revision schedule
        const revision = await RevisionSchedule.createSchedule(
            req.user._id,
            problem._id,
            problem.pattern
        );

        res.json({
            success: true,
            message: 'Added to revision schedule',
            data: revision
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/problems/:slug/submissions
// @desc    Get user's submissions for a problem
// @access  Private
router.get('/:slug/submissions', protect, async (req, res) => {
    try {
        const problem = await Problem.findOne({ slug: req.params.slug });

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        const submissions = await Submission.find({
            user: req.user._id,
            problem: problem._id
        })
            .select('code language status executionTime timeTaken createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: submissions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/problems/:slug/hints/:level
// @desc    Get hints for a problem (costs Babua Coins after first)
// @access  Private
router.get('/:slug/hints/:level', protect, async (req, res) => {
    try {
        const { level } = req.params;
        const hintLevel = parseInt(level);

        const problem = await Problem.findOne({ slug: req.params.slug });

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        const hint = problem.hints.find(h => h.level === hintLevel);

        if (!hint) {
            return res.status(404).json({
                success: false,
                message: 'Hint not found'
            });
        }

        // First hint is free, subsequent cost coins
        if (hintLevel > 1) {
            const user = await User.findById(req.user._id);
            const cost = hintLevel * 2; // 4 coins for level 2, 6 for level 3

            if (user.babuaCoins < cost) {
                return res.status(400).json({
                    success: false,
                    message: 'Not enough Babua Coins',
                    required: cost,
                    current: user.babuaCoins
                });
            }

            user.babuaCoins -= cost;
            await user.save();
        }

        res.json({
            success: true,
            data: hint
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
