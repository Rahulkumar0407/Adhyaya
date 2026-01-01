import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    pattern: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pattern',
        required: true
    },

    // Code
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ['javascript', 'python', 'java', 'cpp'],
        required: true
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'running', 'passed', 'failed', 'error'],
        default: 'pending'
    },

    // Results
    testResults: [{
        testCase: Number,
        passed: Boolean,
        input: mongoose.Schema.Types.Mixed,
        expectedOutput: mongoose.Schema.Types.Mixed,
        actualOutput: mongoose.Schema.Types.Mixed,
        executionTime: Number,
        error: String
    }],

    // Performance (UI only - no real execution)
    executionTime: {
        type: Number,
        default: 0
    },
    memoryUsed: {
        type: Number,
        default: 0
    },

    // For timed practice mode
    isTimedAttempt: {
        type: Boolean,
        default: false
    },
    timeTaken: {
        type: Number, // in seconds
        default: 0
    },

    // Was help used?
    usedHints: {
        type: Boolean,
        default: false
    },
    hintsUsedCount: {
        type: Number,
        default: 0
    },
    viewedSolution: {
        type: Boolean,
        default: false
    },

    // First successful submission for this problem?
    isFirstSuccess: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ user: 1, pattern: 1 });
submissionSchema.index({ createdAt: -1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
