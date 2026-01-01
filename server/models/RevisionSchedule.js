import mongoose from 'mongoose';

// Babua Revision Protocol: Day 1 → Day 3 → Day 7 → Day 30
const revisionScheduleSchema = new mongoose.Schema({
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

    // Day 1: Learn + Solve
    day1: {
        date: {
            type: Date,
            required: true
        },
        completed: {
            type: Boolean,
            default: true // Day 1 is when they first solve it
        },
        completedAt: Date,
        usedHelp: {
            type: Boolean,
            default: false
        }
    },

    // Day 3: Solve without help
    day3: {
        date: {
            type: Date,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: Date,
        usedHelp: {
            type: Boolean,
            default: false
        },
        attempts: {
            type: Number,
            default: 0
        }
    },

    // Day 7: Pattern variations
    day7: {
        date: {
            type: Date,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: Date,
        variationsSolved: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Problem'
        }]
    },

    // Day 30: Spaced repetition challenge
    day30: {
        date: {
            type: Date,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: Date,
        timeTaken: Number, // in seconds
        wasTimedChallenge: {
            type: Boolean,
            default: false
        }
    },

    // Current phase
    currentPhase: {
        type: Number,
        enum: [1, 3, 7, 30],
        default: 3 // After day 1 is complete, move to day 3
    },

    // Overall mastery
    masteryLevel: {
        type: String,
        enum: ['learning', 'practicing', 'mastering', 'mastered'],
        default: 'learning'
    },

    // Completion status
    isFullyCompleted: {
        type: Boolean,
        default: false
    },

    // Notification preferences
    reminderSent: {
        day3: { type: Boolean, default: false },
        day7: { type: Boolean, default: false },
        day30: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

// Calculate dates for revision schedule
revisionScheduleSchema.statics.createSchedule = function (userId, problemId, patternId) {
    const now = new Date();

    return this.create({
        user: userId,
        problem: problemId,
        pattern: patternId,
        day1: {
            date: now,
            completed: true,
            completedAt: now
        },
        day3: {
            date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // +2 days
        },
        day7: {
            date: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000) // +6 days
        },
        day30: {
            date: new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000) // +29 days
        },
        currentPhase: 3
    });
};

// Get due revisions for a user
revisionScheduleSchema.statics.getDueRevisions = async function (userId) {
    const now = new Date();

    return this.find({
        user: userId,
        isFullyCompleted: false,
        $or: [
            { 'day3.date': { $lte: now }, 'day3.completed': false },
            { 'day7.date': { $lte: now }, 'day7.completed': false },
            { 'day30.date': { $lte: now }, 'day30.completed': false }
        ]
    })
        .populate('problem', 'title slug difficulty')
        .populate('pattern', 'name slug')
        .sort({ currentPhase: 1 });
};

// Update mastery level based on completion
revisionScheduleSchema.methods.updateMastery = function () {
    if (this.day30.completed) {
        this.masteryLevel = 'mastered';
        this.isFullyCompleted = true;
    } else if (this.day7.completed) {
        this.masteryLevel = 'mastering';
    } else if (this.day3.completed) {
        this.masteryLevel = 'practicing';
    } else {
        this.masteryLevel = 'learning';
    }
};

// Index for faster queries
revisionScheduleSchema.index({ user: 1, isFullyCompleted: 1 });
revisionScheduleSchema.index({ user: 1, problem: 1 }, { unique: true });

const RevisionSchedule = mongoose.model('RevisionSchedule', revisionScheduleSchema);

export default RevisionSchedule;
