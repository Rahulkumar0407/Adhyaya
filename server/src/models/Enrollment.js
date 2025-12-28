import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },

    // Enrollment details
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    expiresAt: Date, // For subscription-based courses

    // Progress tracking
    progress: {
        percentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        lastAccessedTopic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Topic'
        },
        completedTopics: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Topic'
        }],
        completedModules: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module'
        }],
        lastAccessedAt: Date
    },

    // Payment reference
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },

    // Certificate
    certificate: {
        issued: { type: Boolean, default: false },
        issuedAt: Date,
        certificateUrl: String,
        certificateId: String
    },

    // Rating & Review
    rating: {
        score: {
            type: Number,
            min: 1,
            max: 5
        },
        review: String,
        ratedAt: Date
    },

    // Status
    status: {
        type: String,
        enum: ['active', 'completed', 'expired', 'cancelled'],
        default: 'active'
    },

    // Access
    accessType: {
        type: String,
        enum: ['full', 'preview', 'trial'],
        default: 'full'
    }
}, {
    timestamps: true
});

// Indexes
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ user: 1, status: 1 });
enrollmentSchema.index({ course: 1 });

// Calculate progress percentage
enrollmentSchema.methods.calculateProgress = async function () {
    const course = await mongoose.model('Course').findById(this.course).populate({
        path: 'modules',
        populate: {
            path: 'sections',
            populate: {
                path: 'topics'
            }
        }
    });

    if (!course || !course.modules.length) {
        this.progress.percentage = 0;
        return this.progress.percentage;
    }

    let totalTopics = 0;
    course.modules.forEach(module => {
        module.sections.forEach(section => {
            totalTopics += section.topics.length;
        });
    });

    if (totalTopics === 0) {
        this.progress.percentage = 0;
        return this.progress.percentage;
    }

    this.progress.percentage = Math.round((this.progress.completedTopics.length / totalTopics) * 100);
    return this.progress.percentage;
};

// Mark topic as complete
enrollmentSchema.methods.completeTop ic = function (topicId) {
    if (!this.progress.completedTopics.includes(topicId)) {
        this.progress.completedTopics.push(topicId);
    }
    this.progress.lastAccessedTopic = topicId;
    this.progress.lastAccessedAt = new Date();
};

// Check if course is completed
enrollmentSchema.methods.checkCompletion = async function () {
    await this.calculateProgress();

    if (this.progress.percentage >= 100 && this.status !== 'completed') {
        this.status = 'completed';
        this.completedAt = new Date();
        return true;
    }
    return false;
};

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
