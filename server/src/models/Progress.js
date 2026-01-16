import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },

    // Daily activities
    problemsSolved: {
        type: Number,
        default: 0
    },
    problemsAttempted: {
        type: Number,
        default: 0
    },
    topicsCompleted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    }],
    videosWatched: [{
        topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
        duration: Number // seconds watched
    }],
    quizzesTaken: [{
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        score: Number
    }],

    // Time tracking
    timeSpent: {
        total: { type: Number, default: 0 }, // minutes
        video: { type: Number, default: 0 },
        coding: { type: Number, default: 0 },
        reading: { type: Number, default: 0 }
    },

    // Streak
    streakMaintained: {
        type: Boolean,
        default: false
    },

    // XP & Coins earned today
    xpEarned: {
        type: Number,
        default: 0
    },
    coinsEarned: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index for user + date (one document per user per day)
progressSchema.index({ user: 1, date: 1 }, { unique: true });

const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema);

export default Progress;
