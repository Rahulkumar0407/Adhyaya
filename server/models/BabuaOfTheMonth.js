import mongoose from 'mongoose';

const babuaOfTheMonthSchema = new mongoose.Schema({
    // Period identifier
    month: {
        type: Number, // 0-11
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    periodLabel: {
        type: String, // "December 2025"
        required: true
    },

    // The winner
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Snapshot of winner's stats at time of winning
    stats: {
        maxStreak: { type: Number, default: 0 },
        totalFocusMinutes: { type: Number, default: 0 },
        monthlyFocusMinutes: { type: Number, default: 0 },
        deepFocusSessions: { type: Number, default: 0 },
        consistencyScore: { type: Number, default: 0 },
        focusMastersScore: { type: Number, default: 0 }
    },

    // Winner's profile snapshot
    profile: {
        name: String,
        avatar: String,
        activeTitle: String
    },

    // Archived at
    archivedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for unique month-year
babuaOfTheMonthSchema.index({ month: 1, year: 1 }, { unique: true });

// Static method to get last month's winner
babuaOfTheMonthSchema.statics.getLastMonthWinner = async function () {
    const now = new Date();
    let month = now.getMonth() - 1;
    let year = now.getFullYear();

    if (month < 0) {
        month = 11;
        year -= 1;
    }

    return this.findOne({ month, year }).populate('userId', 'name avatar');
};

// Static method to archive current month's top performer
babuaOfTheMonthSchema.statics.archiveMonthlyWinner = async function (BabuaStats, User) {
    const now = new Date();
    let month = now.getMonth() - 1;
    let year = now.getFullYear();

    if (month < 0) {
        month = 11;
        year -= 1;
    }

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const periodLabel = `${monthNames[month]} ${year}`;

    // Check if already archived
    const existing = await this.findOne({ month, year });
    if (existing) {
        return existing;
    }

    // Find top performer by focusMastersScore
    const topPerformer = await BabuaStats.findOne()
        .sort({ focusMastersScore: -1 })
        .populate('userId', 'name avatar');

    if (!topPerformer || !topPerformer.userId) {
        return null;
    }

    // Create archive entry
    const archive = new this({
        month,
        year,
        periodLabel,
        userId: topPerformer.userId._id,
        stats: {
            maxStreak: topPerformer.maxStreak,
            totalFocusMinutes: topPerformer.totalFocusMinutes,
            monthlyFocusMinutes: topPerformer.monthlyFocusMinutes,
            deepFocusSessions: topPerformer.deepFocusSessions,
            consistencyScore: topPerformer.consistencyScore,
            focusMastersScore: topPerformer.focusMastersScore
        },
        profile: {
            name: topPerformer.userId.name,
            avatar: topPerformer.userId.avatar,
            activeTitle: topPerformer.activeTitle
        }
    });

    await archive.save();

    // Award Legend Babua title to winner (Top 1%)
    if (!topPerformer.titles.find(t => t.titleId === 'legend-babua')) {
        topPerformer.titles.push({
            titleId: 'legend-babua',
            title: 'Legend Babua',
            emoji: '👑'
        });
        await topPerformer.save();
    }

    return archive;
};

const BabuaOfTheMonth = mongoose.model('BabuaOfTheMonth', babuaOfTheMonthSchema);

export default BabuaOfTheMonth;
