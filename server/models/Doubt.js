import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema({
    // Student & Assignment
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedMentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    mentorMatchScore: {
        type: Number,
        min: 0,
        max: 100
    },

    // Doubt Details
    subject: {
        type: String,
        required: true,
        enum: ['dsa', 'dbms', 'cn', 'os', 'system-design', 'frontend', 'backend']
    },
    subTopic: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 5000
    },

    // Code & Attachments
    codeBlocks: [{
        language: {
            type: String,
            default: 'javascript'
        },
        code: String
    }],
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'pdf', 'document']
        },
        url: String,
        filename: String,
        size: Number
    }],

    // Status & Priority
    status: {
        type: String,
        enum: ['pending', 'ai-reviewed', 'mentor-assigned', 'in-progress', 'answered', 'resolved'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['normal', 'stuck', 'urgent'],
        default: 'normal'
    },
    stuckSince: Date,

    // Pricing
    basePrice: {
        type: Number,
        required: true
    },
    priorityMultiplier: {
        type: Number,
        default: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paymentId: String,

    // Analytics
    estimatedResponseTime: {
        type: Number, // in minutes
        default: 120
    },
    actualResponseTime: Number,
    firstResponseAt: Date,
    resolvedAt: Date,
    followUpCount: {
        type: Number,
        default: 0
    },
    followUpLimit: {
        type: Number,
        default: 2 // First 2 are free
    },

    // Quality & Feedback
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: String,
    isResolved: {
        type: Boolean,
        default: false
    },
    isHelpful: Boolean,

    // AI Metadata
    aiHintGenerated: {
        type: Boolean,
        default: false
    },
    aiComplexityScore: {
        type: Number,
        min: 1,
        max: 10
    },
    aiSuggestedMentors: [{
        mentor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        matchScore: Number
    }]

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
doubtSchema.index({ student: 1, createdAt: -1 });
doubtSchema.index({ assignedMentor: 1, status: 1 });
doubtSchema.index({ subject: 1, subTopic: 1 });
doubtSchema.index({ status: 1, priority: -1 });

// Virtual for total messages
doubtSchema.virtual('messageCount', {
    ref: 'DoubtMessage',
    localField: '_id',
    foreignField: 'doubt',
    count: true
});

// Calculate actual response time
doubtSchema.methods.calculateResponseTime = function () {
    if (this.firstResponseAt && this.createdAt) {
        this.actualResponseTime = Math.round((this.firstResponseAt - this.createdAt) / (1000 * 60));
    }
};

// Check if follow-up is allowed
doubtSchema.methods.canFollowUp = function () {
    return this.followUpCount < this.followUpLimit;
};

// Static method to get student's doubt history
doubtSchema.statics.getStudentHistory = function (studentId, limit = 20) {
    return this.find({ student: studentId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('assignedMentor', 'name avatar')
        .select('-description -codeBlocks');
};

// Static method to get mentor's assigned doubts
doubtSchema.statics.getMentorDoubts = function (mentorId, status) {
    const query = { assignedMentor: mentorId };
    if (status) query.status = status;

    return this.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .populate('student', 'name avatar')
        .select('-aiSuggestedMentors');
};

// Static method to get available doubts for claiming
doubtSchema.statics.getAvailableDoubts = function (mentorId, subject) {
    const query = {
        status: { $in: ['pending', 'ai-reviewed'] },
        $or: [
            { assignedMentor: null },
            { 'aiSuggestedMentors.mentor': mentorId }
        ]
    };

    if (subject) {
        query.subject = subject;
    }

    return this.find(query)
        .sort({ priority: -1, createdAt: 1 })
        .limit(10)
        .populate('student', 'name avatar');
};

const Doubt = mongoose.model('Doubt', doubtSchema);

export default Doubt;
