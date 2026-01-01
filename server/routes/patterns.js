import express from 'express';
import Pattern from '../models/Pattern.js';
import Problem from '../models/Problem.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/patterns
// @desc    Get all patterns
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;

        const query = { isActive: true };
        if (category) query.category = category;

        const patterns = await Pattern.find(query)
            .select('name slug category subcategory description videoUrl totalProblems order')
            .sort({ order: 1, category: 1 });

        // Group by category
        const grouped = {
            foundational: patterns.filter(p => p.category === 'foundational'),
            intermediate: patterns.filter(p => p.category === 'intermediate'),
            advanced: patterns.filter(p => p.category === 'advanced')
        };

        res.json({
            success: true,
            data: {
                patterns,
                grouped,
                total: patterns.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/patterns/:slug
// @desc    Get pattern by slug with problems
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const pattern = await Pattern.findOne({
            slug: req.params.slug,
            isActive: true
        }).populate('relatedPatterns', 'name slug category');

        if (!pattern) {
            return res.status(404).json({
                success: false,
                message: 'Pattern not found'
            });
        }

        // Get problems for this pattern
        const problems = await Problem.find({
            pattern: pattern._id,
            isActive: true
        })
            .select('title slug difficulty isCoreProblem isVariation order tags')
            .sort({ isCoreProblem: -1, order: 1 });

        // Separate core and variations
        const coreProblems = problems.filter(p => p.isCoreProblem);
        const variations = problems.filter(p => p.isVariation);
        const practiceProblems = problems.filter(p => !p.isCoreProblem && !p.isVariation);

        res.json({
            success: true,
            data: {
                pattern,
                problems: {
                    core: coreProblems,
                    variations,
                    practice: practiceProblems,
                    total: problems.length
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

// @route   GET /api/patterns/:slug/progress
// @desc    Get user's progress for a pattern
// @access  Private
router.get('/:slug/progress', protect, async (req, res) => {
    try {
        const pattern = await Pattern.findOne({ slug: req.params.slug });

        if (!pattern) {
            return res.status(404).json({
                success: false,
                message: 'Pattern not found'
            });
        }

        // Find user's progress for this pattern
        const user = req.user;
        const patternProgress = user.patternProgress?.find(
            p => p.pattern.toString() === pattern._id.toString()
        );

        // Get all problems in this pattern
        const totalProblems = await Problem.countDocuments({
            pattern: pattern._id,
            isActive: true
        });

        // Get problems solved by user
        const Submission = (await import('../models/Submission.js')).default;
        const solvedProblems = await Submission.distinct('problem', {
            user: user._id,
            pattern: pattern._id,
            status: 'passed'
        });

        res.json({
            success: true,
            data: {
                patternId: pattern._id,
                patternName: pattern.name,
                totalProblems,
                problemsSolved: solvedProblems.length,
                masteryPercent: patternProgress?.masteryPercent || 0,
                lastPracticed: patternProgress?.lastPracticed || null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/patterns/category/:category
// @desc    Get patterns by category
// @access  Public
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;

        if (!['foundational', 'intermediate', 'advanced'].includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        const patterns = await Pattern.find({
            category,
            isActive: true
        })
            .select('name slug subcategory description videoUrl totalProblems order')
            .sort({ order: 1 });

        res.json({
            success: true,
            data: patterns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
