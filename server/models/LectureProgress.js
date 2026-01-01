import mongoose from 'mongoose';

/**
 * LectureProgress Model
 * Tracks user understanding after completing a lecture/topic
 */
const lectureProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Reference to the content
    course: {
        type: String,
        enum: ['dsa', 'system-design', 'dbms', 'os', 'cn'],
        required: true
    },

    // Section/Topic identifier (e.g., "arrays", "graphs", "normalization")
    topicId: {
        type: String,
        required: true
    },

    topicTitle: {
        type: String,
        required: true
    },

    // Individual lesson/lecture within the topic
    lessonId: {
        type: String,
        default: null
    },

    lessonTitle: {
        type: String,
        default: null
    },

    // Understanding level after lecture
    understandingLevel: {
        type: String,
        enum: ['confused', 'partial', 'clear', 'crystal'],
        required: true
    },

    // Emoji representation for UI
    understandingEmoji: {
        type: String,
        default: function () {
            const emojiMap = {
                'confused': '😕',
                'partial': '🙂',
                'clear': '😄',
                'crystal': '🚀'
            };
            return emojiMap[this.understandingLevel] || '🙂';
        }
    },

    // When the lecture was completed
    completedAt: {
        type: Date,
        default: Date.now
    },

    // User notes (optional)
    notes: {
        type: String,
        maxlength: 1000
    },

    // Time spent on the lecture (in seconds)
    timeSpent: {
        type: Number,
        default: 0
    },

    // Was video watched fully?
    videoWatchedFully: {
        type: Boolean,
        default: false
    },

    // Has revision been generated for this lecture?
    revisionGenerated: {
        type: Boolean,
        default: false
    },

    // Number of times user has revisited this lecture
    revisitCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index for unique user + course + topic + lesson
lectureProgressSchema.index(
    { user: 1, course: 1, topicId: 1, lessonId: 1 },
    { unique: true }
);

// Index for querying user's progress
lectureProgressSchema.index({ user: 1, course: 1 });
lectureProgressSchema.index({ user: 1, completedAt: -1 });

// Static: Get all lectures needing revision generation
lectureProgressSchema.statics.getPendingRevisionGeneration = async function (userId) {
    return this.find({
        user: userId,
        revisionGenerated: false
    }).sort({ completedAt: -1 });
};

// Static: Get user's understanding distribution for a course
lectureProgressSchema.statics.getUnderstandingStats = async function (userId, course) {
    const stats = await this.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), course } },
        { $group: { _id: '$understandingLevel', count: { $sum: 1 } } }
    ]);

    const result = { confused: 0, partial: 0, clear: 0, crystal: 0, total: 0 };
    stats.forEach(s => {
        result[s._id] = s.count;
        result.total += s.count;
    });

    return result;
};

// Static: Get weak topics (confused or partial understanding)
lectureProgressSchema.statics.getWeakTopics = async function (userId, course = null) {
    const query = {
        user: userId,
        understandingLevel: { $in: ['confused', 'partial'] }
    };

    if (course) query.course = course;

    return this.find(query)
        .sort({ understandingLevel: 1, completedAt: -1 })
        .limit(20);
};

// Instance: Update understanding level
lectureProgressSchema.methods.updateUnderstanding = async function (newLevel) {
    this.understandingLevel = newLevel;
    this.understandingEmoji = {
        'confused': '😕',
        'partial': '🙂',
        'clear': '😄',
        'crystal': '🚀'
    }[newLevel];
    this.revisitCount += 1;
    return this.save();
};

const LectureProgress = mongoose.model('LectureProgress', lectureProgressSchema);

export default LectureProgress;
