import mongoose from 'mongoose';

/**
 * AdaptiveRevision Model
 * Enhanced revision scheduling with adaptive intelligence
 */
const adaptiveRevisionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Content reference
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

    lessonId: String,
    lessonTitle: String,

    // Link to original lecture progress
    lectureProgress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LectureProgress'
    },

    // Understanding level that triggered this revision
    initialUnderstanding: {
        type: String,
        enum: ['confused', 'partial', 'clear', 'crystal'],
        required: true
    },

    // Revision scheduling
    scheduledDate: {
        type: Date,
        required: true,
        index: true
    },

    intervalDay: {
        type: Number, // 1, 3, 7, 14, 21, 30
        required: true
    },

    // Type of revision activity
    revisionType: {
        type: String,
        enum: ['notes', 'quiz', 'recall', 'coding', 'explain'],
        required: true
    },

    // Priority (higher = more urgent)
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },

    // Transparency - why this revision was scheduled
    whyScheduled: {
        type: String,
        required: true
    },

    // Estimated time in minutes
    estimatedMinutes: {
        type: Number,
        default: 10
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'completed', 'missed', 'skipped', 'rescheduled'],
        default: 'pending'
    },

    // Completion details
    completedAt: Date,

    actualTimeSpent: Number, // minutes

    // Performance on this revision (if quiz)
    performance: {
        accuracy: Number, // 0-100
        attempts: { type: Number, default: 0 },
        hintsUsed: { type: Number, default: 0 },
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'RevisionQuiz' }
    },

    // Rescheduling
    originalDate: Date, // if rescheduled
    rescheduleCount: { type: Number, default: 0 },
    rescheduleReason: String,

    // Did this revision spawn new revisions?
    triggedAdditionalRevisions: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
adaptiveRevisionSchema.index({ user: 1, scheduledDate: 1, status: 1 });
adaptiveRevisionSchema.index({ user: 1, course: 1, topicId: 1 });
adaptiveRevisionSchema.index({ user: 1, status: 1, priority: -1 });

// Virtual: Is this revision overdue?
adaptiveRevisionSchema.virtual('isOverdue').get(function () {
    if (this.status !== 'pending') return false;
    return new Date() > this.scheduledDate;
});

// Virtual: Days until/since scheduled
adaptiveRevisionSchema.virtual('daysFromNow').get(function () {
    const now = new Date();
    const scheduled = new Date(this.scheduledDate);
    const diffTime = scheduled - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static: Get today's revisions
adaptiveRevisionSchema.statics.getTodayRevisions = async function (userId) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.find({
        user: userId,
        scheduledDate: { $gte: startOfDay, $lte: endOfDay },
        status: 'pending'
    })
        .sort({ priority: -1, scheduledDate: 1 })
        .populate('lectureProgress');
};

// Static: Get overdue revisions
adaptiveRevisionSchema.statics.getOverdueRevisions = async function (userId) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return this.find({
        user: userId,
        scheduledDate: { $lt: now },
        status: 'pending'
    })
        .sort({ priority: -1, scheduledDate: 1 });
};

// Static: Get upcoming revisions (next N days)
adaptiveRevisionSchema.statics.getUpcomingRevisions = async function (userId, days = 7) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return this.find({
        user: userId,
        scheduledDate: { $gte: now, $lte: future },
        status: 'pending'
    })
        .sort({ scheduledDate: 1 });
};

// Static: Get revision plan by view (day/week/month)
adaptiveRevisionSchema.statics.getRevisionPlan = async function (userId, view = 'week') {
    const now = new Date();
    let endDate;

    switch (view) {
        case 'day':
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'week':
            endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    return this.find({
        user: userId,
        scheduledDate: { $lte: endDate },
        status: { $in: ['pending', 'missed'] }
    })
        .sort({ status: 1, priority: -1, scheduledDate: 1 });
};

// Static: Calculate retention score
adaptiveRevisionSchema.statics.getRetentionScore = async function (userId, course = null) {
    const matchQuery = { user: new mongoose.Types.ObjectId(userId) };
    if (course) matchQuery.course = course;

    const stats = await this.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                missed: { $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] } },
                avgAccuracy: { $avg: '$performance.accuracy' }
            }
        }
    ]);

    if (!stats[0]) return { score: 0, completionRate: 0, avgAccuracy: 0 };

    const { total, completed, missed, avgAccuracy } = stats[0];
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Retention score = weighted combination of completion rate and accuracy
    const score = Math.round(
        (completionRate * 0.4) +
        ((avgAccuracy || 0) * 0.6)
    );

    return { score, completionRate, avgAccuracy: avgAccuracy || 0, total, completed, missed };
};

// Static: Get revision streak
adaptiveRevisionSchema.statics.getRevisionStreak = async function (userId) {
    const revisions = await this.find({
        user: userId,
        status: 'completed'
    })
        .sort({ completedAt: -1 })
        .select('completedAt');

    if (revisions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Group completions by date
    const completionDates = new Set();
    revisions.forEach(r => {
        if (r.completedAt) {
            const dateStr = r.completedAt.toISOString().split('T')[0];
            completionDates.add(dateStr);
        }
    });

    // Count consecutive days backwards from today
    while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (completionDates.has(dateStr)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (streak === 0) {
            // Check yesterday if today hasn't been completed yet
            currentDate.setDate(currentDate.getDate() - 1);
            const yesterdayStr = currentDate.toISOString().split('T')[0];
            if (completionDates.has(yesterdayStr)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        } else {
            break;
        }
    }

    return streak;
};

// Instance: Mark as completed with performance
adaptiveRevisionSchema.methods.complete = async function (performance = {}) {
    this.status = 'completed';
    this.completedAt = new Date();
    this.performance = { ...this.performance, ...performance };
    return this.save();
};

// Instance: Reschedule to new date
adaptiveRevisionSchema.methods.reschedule = async function (newDate, reason = '') {
    if (!this.originalDate) {
        this.originalDate = this.scheduledDate;
    }
    this.scheduledDate = newDate;
    this.rescheduleCount += 1;
    this.rescheduleReason = reason;
    this.status = 'pending';
    return this.save();
};

const AdaptiveRevision = mongoose.model('AdaptiveRevision', adaptiveRevisionSchema);

export default AdaptiveRevision;
