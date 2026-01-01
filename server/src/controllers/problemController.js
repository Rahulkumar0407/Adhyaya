import Problem from '../models/Problem.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

/**
 * @desc    Create a new problem
 * @route   POST /api/problems
 * @access  Private/Admin (for now using protect, but role check should be added)
 */
export const createProblem = catchAsync(async (req, res, next) => {
    const problem = await Problem.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            problem
        }
    });
});

/**
 * @desc    Get all problems
 * @route   GET /api/problems
 * @access  Private
 */
export const listProblems = catchAsync(async (req, res, next) => {
    // Basic pagination and filtering logic can be added here
    const problems = await Problem.find();

    res.status(200).json({
        status: 'success',
        results: problems.length,
        data: {
            problems
        }
    });
});

/**
 * @desc    Get single problem
 * @route   GET /api/problems/:id
 * @access  Private
 */
export const getProblem = catchAsync(async (req, res, next) => {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
        return next(new AppError('No problem found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            problem
        }
    });
});

/**
 * @desc    Update problem
 * @route   PUT /api/problems/:id
 * @access  Private/Admin
 */
export const updateProblem = catchAsync(async (req, res, next) => {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!problem) {
        return next(new AppError('No problem found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            problem
        }
    });
});

/**
 * @desc    Delete problem
 * @route   DELETE /api/problems/:id
 * @access  Private/Admin
 */
export const deleteProblem = catchAsync(async (req, res, next) => {
    const problem = await Problem.findByIdAndDelete(req.params.id);

    if (!problem) {
        return next(new AppError('No problem found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});
