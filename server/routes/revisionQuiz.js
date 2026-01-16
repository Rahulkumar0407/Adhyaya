import express from 'express';
import { protect } from '../middleware/auth.js';
import RevisionQuiz from '../models/RevisionQuiz.js';
import AdaptiveRevision from '../models/AdaptiveRevision.js';
import { adjustScheduleBasedOnPerformance } from '../services/revisionScheduler.js';

import { checkGlobalLimit } from '../middleware/checkLimit.js';

const router = express.Router();

// ... (existing code)

/**
 * @route   POST /api/revision-quiz/generate
 * @desc    Generate an adaptive quiz for a topic
 * @access  Private
 */
const questionBank = {
    dsa: {
        arrays: [
            { questionText: "What is the time complexity of accessing an element by index in an array?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correctAnswer: 0, explanation: "Arrays provide constant-time access by index.", difficulty: 'easy' },
            { questionText: "Which operation has O(1) complexity in an array?", options: ["Search", "Insert at end", "Delete middle", "Reverse"], correctAnswer: 1, explanation: "Inserting at the end is constant time.", difficulty: 'easy' },
            { questionText: "Which sorting algorithm has the best average case time complexity?", options: ["Bubble Sort", "Quick Sort", "Insertion Sort", "Selection Sort"], correctAnswer: 1, explanation: "Quick Sort has O(n log n) average case.", difficulty: 'medium' },
            { questionText: "What is the space complexity of merge sort?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctAnswer: 2, explanation: "Merge sort requires O(n) auxiliary space.", difficulty: 'medium' },
            { questionText: "What data structure is best for implementing a queue?", options: ["Stack", "Linked List", "Binary Tree", "Hash Table"], correctAnswer: 1, explanation: "Linked List allows O(1) insertion and deletion at both ends.", difficulty: 'hard' },
            { questionText: "What is the worst-case time complexity of quicksort?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correctAnswer: 2, explanation: "Worst case occurs when pivot is always smallest/largest.", difficulty: 'hard' },
        ],
        graphs: [
            { questionText: "What is a graph?", options: ["Linear structure", "Non-linear structure", "Sequential structure", "Random structure"], correctAnswer: 1, explanation: "Graphs are non-linear data structures.", difficulty: 'easy' },
            { questionText: "What is the time complexity of BFS?", options: ["O(V)", "O(E)", "O(V + E)", "O(V * E)"], correctAnswer: 2, explanation: "BFS visits every vertex and edge once.", difficulty: 'medium' },
            { questionText: "Which algorithm finds the shortest path in a weighted graph?", options: ["BFS", "DFS", "Dijkstra's", "Kruskal's"], correctAnswer: 2, explanation: "Dijkstra's algorithm finds shortest paths in weighted graphs.", difficulty: 'hard' },
        ],
        dp: [
            { questionText: "What does DP stand for?", options: ["Data Processing", "Dynamic Programming", "Database Pointer", "Direct Path"], correctAnswer: 1, explanation: "DP is Dynamic Programming.", difficulty: 'easy' },
            { questionText: "What is the key characteristic of Dynamic Programming?", options: ["Greedy approach", "Overlapping subproblems", "Binary division", "Random selection"], correctAnswer: 1, explanation: "DP solves problems by breaking them into overlapping subproblems.", difficulty: 'medium' },
            { questionText: "Which approach builds solution from smallest subproblems?", options: ["Top-down", "Bottom-up", "Divide and conquer", "Backtracking"], correctAnswer: 1, explanation: "Bottom-up builds from base cases upward.", difficulty: 'hard' },
        ]
    },
    'system-design': {
        scaling: [
            { questionText: "What is scaling?", options: ["Making system bigger", "Handling more load", "Adding features", "Refactoring code"], correctAnswer: 1, explanation: "Scaling means handling increased load.", difficulty: 'easy' },
            { questionText: "What is horizontal scaling?", options: ["Adding more RAM", "Adding more servers", "Adding more CPU cores", "Adding more storage"], correctAnswer: 1, explanation: "Horizontal scaling means adding more servers to handle load.", difficulty: 'medium' },
        ],
        databases: [
            { questionText: "What does ACID stand for?", options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Index, Data", "Always Click Insert Delete", "None"], correctAnswer: 0, explanation: "ACID ensures reliable database transactions.", difficulty: 'medium' },
        ]
    },
    dbms: {
        normalization: [
            { questionText: "What is normalization?", options: ["Data encryption", "Organizing data", "Data backup", "Data deletion"], correctAnswer: 1, explanation: "Normalization organizes data to reduce redundancy.", difficulty: 'easy' },
            { questionText: "What does 1NF eliminate?", options: ["Redundancy", "Multi-valued attributes", "Transitive dependency", "Partial dependency"], correctAnswer: 1, explanation: "1NF requires atomic values, eliminating multi-valued attributes.", difficulty: 'medium' },
            { questionText: "Which normal form removes partial dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], correctAnswer: 1, explanation: "2NF removes partial dependencies on the primary key.", difficulty: 'hard' },
        ],
        sql: [
            { questionText: "Which SQL clause filters grouped data?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], correctAnswer: 1, explanation: "HAVING filters after GROUP BY aggregation.", difficulty: 'medium' },
        ]
    }
};

/**
 * @route   POST /api/revision-quiz/generate
 * @desc    Generate an adaptive quiz for a topic
 * @access  Private
 */
router.post('/generate', protect, async (req, res) => {
    try {
        const {
            course,
            topicId,
            topicTitle,
            revisionId,
            questionCount = 5,
            startDifficulty = 'easy',
            adaptiveDifficulty = true,
            quizType = 'mcq'
        } = req.body;

        if (!course || !topicId || !topicTitle) {
            return res.status(400).json({
                success: false,
                message: 'course, topicId, and topicTitle are required'
            });
        }

        // Get questions from bank
        let availableQuestions = [];
        const courseQuestions = questionBank[course];

        if (courseQuestions) {
            if (courseQuestions[topicId]) {
                availableQuestions = [...courseQuestions[topicId]];
            } else {
                Object.values(courseQuestions).forEach(questions => {
                    availableQuestions.push(...questions);
                });
            }
        }

        // Fallback questions
        if (availableQuestions.length === 0) {
            availableQuestions = [
                { questionText: `What is the core concept of ${topicTitle}?`, options: ["Option A", "Option B", "Option C", "Option D"], correctAnswer: 0, explanation: "Review your notes.", difficulty: 'easy' },
                { questionText: `Which best describes ${topicTitle}?`, options: ["Definition A", "Definition B", "Definition C", "Definition D"], correctAnswer: 1, explanation: "This is recall-based.", difficulty: 'medium' },
            ];
        }

        // Adaptive difficulty selection
        let selectedQuestions = [];
        if (adaptiveDifficulty) {
            // Start with startDifficulty and adapt
            const difficultyOrder = { 'easy': 0, 'medium': 1, 'hard': 2 };
            let currentDifficultyIndex = difficultyOrder[startDifficulty] || 0;

            // Group questions by difficulty
            const questionsByDifficulty = {
                easy: availableQuestions.filter(q => q.difficulty === 'easy'),
                medium: availableQuestions.filter(q => q.difficulty === 'medium'),
                hard: availableQuestions.filter(q => q.difficulty === 'hard')
            };

            // Ensure each difficulty has questions
            Object.keys(questionsByDifficulty).forEach(diff => {
                if (questionsByDifficulty[diff].length === 0) {
                    questionsByDifficulty[diff] = availableQuestions.slice(0, 2);
                }
            });

            // Build adaptive question set:
            // - Start with startDifficulty (40% of total)
            // - Include some medium (40%)
            // - Include some hard (20%) for challenge
            const easyCount = Math.ceil(questionCount * (startDifficulty === 'easy' ? 0.5 : 0.3));
            const mediumCount = Math.ceil(questionCount * 0.3);
            const hardCount = questionCount - easyCount - mediumCount;

            const shuffleArray = (arr) => arr.sort(() => 0.5 - Math.random());

            selectedQuestions = [
                ...shuffleArray(questionsByDifficulty.easy).slice(0, easyCount),
                ...shuffleArray(questionsByDifficulty.medium).slice(0, mediumCount),
                ...shuffleArray(questionsByDifficulty.hard).slice(0, hardCount)
            ];

            // Shuffle final order but keep some easy ones at start
            selectedQuestions = [
                ...selectedQuestions.filter(q => q.difficulty === 'easy').slice(0, 2),
                ...shuffleArray(selectedQuestions.slice(2))
            ];
        } else {
            // Random selection
            selectedQuestions = availableQuestions
                .sort(() => 0.5 - Math.random())
                .slice(0, questionCount);
        }

        // Create quiz questions
        const questions = selectedQuestions.map((q, idx) => ({
            questionId: `q_${Date.now()}_${idx}`,
            questionText: q.questionText,
            questionType: 'mcq',
            options: q.options,
            correctAnswer: q.correctAnswer,
            difficulty: q.difficulty || 'medium',
            userAnswer: null,
            isCorrect: null,
            timeSpent: 0,
            explanation: q.explanation
        }));

        const quiz = await RevisionQuiz.create({
            user: req.user._id,
            revisionSchedule: revisionId,
            course,
            topicId,
            topicTitle,
            quizType,
            difficulty: startDifficulty,
            questions,
            totalQuestions: questions.length,
            status: 'in_progress'
        });

        // Don't send correct answers to client
        const safeQuestions = questions.map(q => ({
            questionId: q.questionId,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            difficulty: q.difficulty
        }));

        res.json({
            success: true,
            data: {
                quizId: quiz._id,
                course,
                topicId,
                topicTitle,
                totalQuestions: questions.length,
                questions: safeQuestions
            }
        });
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   POST /api/revision-quiz/submit
 * @desc    Submit quiz answers and get results
 * @access  Private
 */
router.post('/submit', protect, async (req, res) => {
    try {
        const { quizId, answers, totalTimeSpent } = req.body;

        if (!quizId || !answers) {
            return res.status(400).json({
                success: false,
                message: 'quizId and answers are required'
            });
        }

        const quiz = await RevisionQuiz.findOne({
            _id: quizId,
            user: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        if (quiz.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Quiz already completed'
            });
        }

        // Grade answers
        let correctCount = 0;
        quiz.questions.forEach(q => {
            const userAnswer = answers[q.questionId];
            q.userAnswer = userAnswer;
            q.isCorrect = userAnswer === q.correctAnswer;
            if (q.isCorrect) correctCount++;
        });

        quiz.correctAnswers = correctCount;
        quiz.accuracy = Math.round((correctCount / quiz.totalQuestions) * 100);
        quiz.totalTimeSpent = totalTimeSpent || 0;
        quiz.completedAt = new Date();
        quiz.status = 'completed';

        await quiz.save();

        // Adjust revision schedule based on performance
        let adjustment = null;
        if (quiz.revisionSchedule) {
            adjustment = await adjustScheduleBasedOnPerformance(
                req.user._id,
                quiz.topicId,
                quiz.course,
                quiz.accuracy
            );

            // Update the revision with quiz reference
            await AdaptiveRevision.findByIdAndUpdate(quiz.revisionSchedule, {
                'performance.accuracy': quiz.accuracy,
                'performance.quizId': quiz._id
            });
        }

        // Award coins based on performance
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(req.user._id);

        let coinsEarned = 3;
        if (quiz.accuracy >= 90) coinsEarned = 20;
        else if (quiz.accuracy >= 80) coinsEarned = 15;
        else if (quiz.accuracy >= 70) coinsEarned = 10;
        else if (quiz.accuracy >= 50) coinsEarned = 5;

        user.babuaCoins += coinsEarned;
        await user.save();

        // Prepare results with explanations
        const results = quiz.questions.map(q => ({
            questionId: q.questionId,
            questionText: q.questionText,
            options: q.options,
            userAnswer: q.userAnswer,
            correctAnswer: q.correctAnswer,
            isCorrect: q.isCorrect,
            difficulty: q.difficulty,
            explanation: q.explanation
        }));

        res.json({
            success: true,
            data: {
                quizId: quiz._id,
                totalQuestions: quiz.totalQuestions,
                correctAnswers: quiz.correctAnswers,
                accuracy: quiz.accuracy,
                totalTimeSpent: quiz.totalTimeSpent,
                scheduleAdjustment: quiz.scheduleAdjustment,
                adjustment,
                coinsEarned,
                results
            }
        });
    } catch (error) {
        console.error('Quiz submit error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   GET /api/revision-quiz/history
 * @desc    Get user's quiz history
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
    try {
        const { course, topicId, limit = 20 } = req.query;

        const query = { user: req.user._id, status: 'completed' };
        if (course) query.course = course;
        if (topicId) query.topicId = topicId;

        const quizzes = await RevisionQuiz.find(query)
            .sort({ completedAt: -1 })
            .limit(parseInt(limit))
            .select('course topicId topicTitle accuracy totalQuestions correctAnswers completedAt');

        res.json({
            success: true,
            data: quizzes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   GET /api/revision-quiz/stats
 * @desc    Get quiz performance stats
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
    try {
        const { course } = req.query;

        const avgStats = await RevisionQuiz.getAverageAccuracy(req.user._id, course);
        const weakTopics = await RevisionQuiz.getWeakTopicsFromQuizzes(req.user._id);

        res.json({
            success: true,
            data: {
                averageAccuracy: Math.round(avgStats.avgAccuracy || 0),
                totalQuizzes: avgStats.totalQuizzes,
                weakTopics
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
