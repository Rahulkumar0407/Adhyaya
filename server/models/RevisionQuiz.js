import mongoose from 'mongoose';

/**
 * RevisionQuiz Model
 * Stores quiz questions and results for revision sessions
 */
const revisionQuizSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Reference to the revision schedule entry
    revisionSchedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdaptiveRevision'
    },

    // Topic reference
    course: {
        type: String,
        enum: ['dsa', 'system-design', 'dbms', 'os', 'cn'],
        required: true
    },

    topicId: {
        type: String,
        required: true
    },

    topicTitle: {
        type: String,
        required: true
    },

    // Quiz configuration
    quizType: {
        type: String,
        enum: ['mcq', 'recall', 'coding', 'mixed'],
        default: 'mcq'
    },

    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'adaptive'],
        default: 'adaptive'
    },

    // Questions and answers
    questions: [{
        questionId: String,
        questionText: String,
        questionType: {
            type: String,
            enum: ['mcq', 'true_false', 'fill_blank', 'short_answer', 'code'],
            default: 'mcq'
        },
        options: [String],
        correctAnswer: mongoose.Schema.Types.Mixed,
        userAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
        timeSpent: Number, // seconds
        hints: [String],
        hintUsed: {
            type: Boolean,
            default: false
        },
        explanation: String
    }],

    // Results
    totalQuestions: {
        type: Number,
        required: true
    },

    correctAnswers: {
        type: Number,
        default: 0
    },

    accuracy: {
        type: Number, // Percentage 0-100
        default: 0
    },

    // Timing
    timeLimitMinutes: {
        type: Number,
        default: null // null = no limit
    },

    totalTimeSpent: {
        type: Number, // seconds
        default: 0
    },

    startedAt: {
        type: Date,
        default: Date.now
    },

    completedAt: Date,

    // Status
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'abandoned'],
        default: 'in_progress'
    },

    // Performance impact
    scheduleAdjustment: {
        type: String,
        enum: ['accelerate', 'maintain', 'delay', 'none'],
        default: 'none'
    },

    nextRevisionAdjusted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
revisionQuizSchema.index({ user: 1, completedAt: -1 });
revisionQuizSchema.index({ user: 1, course: 1, topicId: 1 });
revisionQuizSchema.index({ revisionSchedule: 1 });

// Calculate accuracy and schedule adjustment on completion
revisionQuizSchema.pre('save', function (next) {
    if (this.isModified('questions') && this.status === 'completed') {
        // Calculate correct answers
        this.correctAnswers = this.questions.filter(q => q.isCorrect).length;
        this.accuracy = Math.round((this.correctAnswers / this.totalQuestions) * 100);

        // Determine schedule adjustment based on accuracy
        if (this.accuracy < 50) {
            this.scheduleAdjustment = 'accelerate'; // Add more revisions
        } else if (this.accuracy >= 85) {
            this.scheduleAdjustment = 'delay'; // Can delay next revision
        } else {
            this.scheduleAdjustment = 'maintain';
        }
    }
    next();
});

// Static: Get user's quiz history for a topic
revisionQuizSchema.statics.getTopicHistory = async function (userId, course, topicId) {
    return this.find({
        user: userId,
        course,
        topicId,
        status: 'completed'
    })
        .sort({ completedAt: -1 })
        .limit(10);
};

// Static: Get average accuracy for user
revisionQuizSchema.statics.getAverageAccuracy = async function (userId, course = null) {
    const match = { user: new mongoose.Types.ObjectId(userId), status: 'completed' };
    if (course) match.course = course;

    const result = await this.aggregate([
        { $match: match },
        { $group: { _id: null, avgAccuracy: { $avg: '$accuracy' }, totalQuizzes: { $sum: 1 } } }
    ]);

    return result[0] || { avgAccuracy: 0, totalQuizzes: 0 };
};

// Static: Get weak topics based on quiz performance
revisionQuizSchema.statics.getWeakTopicsFromQuizzes = async function (userId) {
    return this.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), status: 'completed' } },
        {
            $group: {
                _id: { course: '$course', topicId: '$topicId', topicTitle: '$topicTitle' },
                avgAccuracy: { $avg: '$accuracy' },
                quizCount: { $sum: 1 },
                lastAttempt: { $max: '$completedAt' }
            }
        },
        { $match: { avgAccuracy: { $lt: 70 } } },
        { $sort: { avgAccuracy: 1 } },
        { $limit: 10 }
    ]);
};

const RevisionQuiz = mongoose.model('RevisionQuiz', revisionQuizSchema);

export default RevisionQuiz;
