import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    // Number of activities (videos watched, quizzes taken, etc.)
    count: {
        type: Number,
        default: 0
    },
    // Types of activities performed
    activities: [{
        type: {
            type: String,
            enum: ['video_watched', 'quiz_taken', 'problem_solved', 'lesson_completed'],
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        metadata: {
            courseId: String,
            lessonId: String,
            videoId: String,
            quizId: String
        }
    }]
}, {
    timestamps: true
});

// Compound index for efficient queries
activitySchema.index({ user: 1, date: 1 }, { unique: true });
activitySchema.index({ user: 1, createdAt: -1 });

/**
 * Record an activity for a user
 * @param {ObjectId} userId 
 * @param {String} activityType 
 * @param {Object} metadata 
 */
activitySchema.statics.recordActivity = async function (userId, activityType, metadata = {}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activity = await this.findOneAndUpdate(
        { user: userId, date: today },
        {
            $inc: { count: 1 },
            $push: {
                activities: {
                    type: activityType,
                    timestamp: new Date(),
                    metadata
                }
            }
        },
        { upsert: true, new: true }
    );

    return activity;
};

/**
 * Get activity data for the past year
 * @param {ObjectId} userId 
 */
activitySchema.statics.getYearActivity = async function (userId) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    const activities = await this.find({
        user: userId,
        date: { $gte: oneYearAgo }
    }).sort({ date: 1 });

    return activities;
};

/**
 * Check if user was active today
 * @param {ObjectId} userId 
 */
activitySchema.statics.wasActiveToday = async function (userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activity = await this.findOne({
        user: userId,
        date: today
    });

    return activity && activity.count > 0;
};

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
