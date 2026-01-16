import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },

    // Answers
    answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOptions: [Number], // Index of selected options
        isCorrect: Boolean,
        pointsEarned: Number
    }],

    // Results
    score: {
        earned: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
    },

    passed: {
        type: Boolean,
        default: false
    },

    // Timing
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    timeTaken: Number, // in seconds

    // Status
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'abandoned'],
        default: 'in-progress'
    }
}, {
    timestamps: true
});

// Indexes
quizAttemptSchema.index({ user: 1, quiz: 1 });
quizAttemptSchema.index({ quiz: 1, completedAt: -1 });

const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
