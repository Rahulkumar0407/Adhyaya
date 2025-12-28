import express from 'express';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createProblem, getProblem, updateProblem, deleteProblem, listProblems } from '../controllers/problemController.js';
import { problemValidator } from '../validators/problemValidator.js';

const router = express.Router();

// Create a new problem (protected)
router.post('/', protect, validate(problemValidator.create), createProblem);

// Get a single problem by ID
router.get('/:id', protect, getProblem);

// Update a problem
router.put('/:id', protect, validate(problemValidator.update), updateProblem);

// Delete a problem
router.delete('/:id', protect, deleteProblem);

// List all problems (optional query params)
router.get('/', protect, listProblems);

export default router;
