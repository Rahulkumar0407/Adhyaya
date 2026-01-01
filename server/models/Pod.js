import mongoose from 'mongoose';

const podSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Pod name is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },

    // Members (3-6 students)
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        role: {
            type: String,
            enum: ['leader', 'member'],
            default: 'member'
        }
    }],

    // Limits
    minMembers: {
        type: Number,
        default: 3
    },
    maxMembers: {
        type: Number,
        default: 6
    },

    // Weekly Goals
    weeklyGoals: [{
        title: String,
        description: String,
        targetProblems: Number,
        targetPatterns: [mongoose.Schema.Types.ObjectId],
        startDate: Date,
        endDate: Date,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],

    // Current week's goal
    currentGoal: {
        type: mongoose.Schema.Types.ObjectId
    },

    // Member Progress (for pod-only comparison)
    memberProgress: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        weekNumber: Number,
        problemsSolved: Number,
        streakMaintained: Boolean,
        revisionsCompleted: Number,
        lastUpdated: Date
    }],

    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    isPublic: {
        type: Boolean,
        default: true // Can be discovered and joined
    },

    // Invite code for private pods
    inviteCode: {
        type: String,
        unique: true,
        sparse: true
    }
}, {
    timestamps: true
});

// Generate invite code
podSchema.pre('save', function (next) {
    if (!this.inviteCode) {
        this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

// Check if pod is full
podSchema.methods.isFull = function () {
    return this.members.length >= this.maxMembers;
};

// Check if user is member
podSchema.methods.isMember = function (userId) {
    return this.members.some(m => m.user.toString() === userId.toString());
};

// Add member
podSchema.methods.addMember = function (userId, role = 'member') {
    if (this.isFull()) {
        throw new Error('Pod is full');
    }
    if (this.isMember(userId)) {
        throw new Error('User is already a member');
    }

    this.members.push({
        user: userId,
        role: role,
        joinedAt: new Date()
    });
};

// Remove member
podSchema.methods.removeMember = function (userId) {
    const memberIndex = this.members.findIndex(
        m => m.user.toString() === userId.toString()
    );

    if (memberIndex === -1) {
        throw new Error('User is not a member');
    }

    this.members.splice(memberIndex, 1);
};

// Index for faster queries
podSchema.index({ 'members.user': 1 });

const Pod = mongoose.model('Pod', podSchema);

export default Pod;
