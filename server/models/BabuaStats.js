import mongoose from 'mongoose';

const babuaStatsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    // Streak Tracking
    currentStreak: {
        type: Number,
        default: 0
    },
    maxStreak: {
        type: Number,
        default: 0
    },
    lastActiveDate: {
        type: Date,
        default: null
    },

    // Focus Time Stats
    totalFocusMinutes: {
        type: Number,
        default: 0
    },
    weeklyFocusMinutes: {
        type: Number,
        default: 0
    },
    monthlyFocusMinutes: {
        type: Number,
        default: 0
    },
    weekStartDate: Date,
    monthStartDate: Date,

    // Deep Focus (sessions > 50 min with minimal distractions)
    deepFocusSessions: {
        type: Number,
        default: 0
    },
    totalDeepFocusMinutes: {
        type: Number,
        default: 0
    },

    // Consistency Score (sessions completed vs planned)
    sessionsPlanned: {
        type: Number,
        default: 0
    },
    sessionsCompleted: {
        type: Number,
        default: 0
    },
    consistencyScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    // Combined Focus Masters Score
    focusMastersScore: {
        type: Number,
        default: 0
    },

    // Rank History (for tracking changes)
    rankHistory: [{
        date: { type: Date, required: true },
        category: {
            type: String,
            enum: ['max-streak', 'focus-masters', 'consistency', 'weekly-climbers']
        },
        rank: Number,
        score: Number
    }],

    // Current Ranks (cached for fast lookup)
    currentRanks: {
        maxStreak: { type: Number, default: null },
        focusMasters: { type: Number, default: null },
        consistency: { type: Number, default: null }
    },

    // Yesterday's ranks (for change calculation)
    previousRanks: {
        maxStreak: { type: Number, default: null },
        focusMasters: { type: Number, default: null },
        consistency: { type: Number, default: null },
        updatedAt: Date
    },

    // Babua Titles Earned
    titles: [{
        titleId: {
            type: String,
            enum: ['chai-pe-babua', 'pakka-babua', 'legend-babua', 'silent-babua']
        },
        title: String,
        emoji: String,
        earnedAt: { type: Date, default: Date.now },
        displayed: { type: Boolean, default: false }
    }],
    activeTitle: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for efficient leaderboard queries
babuaStatsSchema.index({ currentStreak: -1 });
babuaStatsSchema.index({ focusMastersScore: -1 });
babuaStatsSchema.index({ consistencyScore: -1 });
babuaStatsSchema.index({ totalFocusMinutes: -1 });
babuaStatsSchema.index({ weeklyFocusMinutes: -1 });
babuaStatsSchema.index({ monthlyFocusMinutes: -1 });

// Method to update streak
babuaStatsSchema.methods.updateStreak = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!this.lastActiveDate) {
        this.currentStreak = 1;
        this.lastActiveDate = today;
        if (this.currentStreak > this.maxStreak) {
            this.maxStreak = this.currentStreak;
        }
        return;
    }

    const lastDate = new Date(this.lastActiveDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Same day, no change
        return;
    } else if (diffDays === 1) {
        // Consecutive day
        this.currentStreak += 1;
        if (this.currentStreak > this.maxStreak) {
            this.maxStreak = this.currentStreak;
        }
    } else {
        // Streak broken
        this.currentStreak = 1;
    }

    this.lastActiveDate = today;
};

// Method to reset weekly/monthly stats
babuaStatsSchema.methods.resetPeriodStats = function () {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Reset weekly if new week
    if (!this.weekStartDate || this.weekStartDate < weekStart) {
        this.weeklyFocusMinutes = 0;
        this.weekStartDate = weekStart;
    }

    // Reset monthly if new month
    if (!this.monthStartDate || this.monthStartDate < monthStart) {
        this.monthlyFocusMinutes = 0;
        this.monthStartDate = monthStart;
    }
};

// Method to calculate Focus Masters score
babuaStatsSchema.methods.calculateFocusMastersScore = function () {
    // Weighted score combining focus time and deep focus quality
    const FOCUS_TIME_WEIGHT = 0.6;
    const DEEP_FOCUS_WEIGHT = 0.4;

    // Normalize focus time (max 10000 minutes as reference)
    const focusTimeScore = Math.min(this.totalFocusMinutes / 10000, 1) * 100;

    // Deep focus quality (sessions * avg duration factor)
    const deepFocusScore = this.deepFocusSessions > 0
        ? Math.min((this.deepFocusSessions * 10) + (this.totalDeepFocusMinutes / 100), 100)
        : 0;

    this.focusMastersScore = Math.round(
        (FOCUS_TIME_WEIGHT * focusTimeScore) + (DEEP_FOCUS_WEIGHT * deepFocusScore)
    );

    return this.focusMastersScore;
};

// Method to check and award titles
babuaStatsSchema.methods.checkAndAwardTitles = function () {
    const newTitles = [];

    // ☕ Chai-Pe Babua: 7-day streak
    if (this.currentStreak >= 7 && !this.titles.find(t => t.titleId === 'chai-pe-babua')) {
        newTitles.push({
            titleId: 'chai-pe-babua',
            title: 'Chai-Pe Babua',
            emoji: '☕'
        });
    }

    // 🔥 Pakka Babua: 30-day streak
    if (this.currentStreak >= 30 && !this.titles.find(t => t.titleId === 'pakka-babua')) {
        newTitles.push({
            titleId: 'pakka-babua',
            title: 'Pakka Babua',
            emoji: '🔥'
        });
    }

    // 🧠 Silent Babua: 10+ deep focus sessions
    if (this.deepFocusSessions >= 10 && !this.titles.find(t => t.titleId === 'silent-babua')) {
        newTitles.push({
            titleId: 'silent-babua',
            title: 'Silent Babua',
            emoji: '🧠'
        });
    }

    // Add new titles
    this.titles.push(...newTitles);

    return newTitles;
};

const BabuaStats = mongoose.model('BabuaStats', babuaStatsSchema);

export default BabuaStats;
