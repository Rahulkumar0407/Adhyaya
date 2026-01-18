import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const sessionSchema = new mongoose.Schema({
    deviceInfo: String,
    ipAddress: String,
    userAgent: String,
    lastActive: { type: Date, default: Date.now },
    refreshToken: { type: String, select: false },
    isActive: { type: Boolean, default: true }
}, { _id: true });

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    username: {
        type: String,
        unique: true,
        sparse: true, // Allows null values while maintaining uniqueness for non-null
        lowercase: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    password: {
        type: String,
        required: function () {
            return this.authProvider === 'local';
        },
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },

    // Auth Provider
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },

    // Profile
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },

    // Role-Based Access Control
    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student'
    },
    permissions: [{
        type: String,
        enum: [
            'create_course', 'edit_course', 'delete_course',
            'create_problem', 'edit_problem', 'delete_problem',
            'manage_users', 'view_analytics', 'manage_payments'
        ]
    }],

    // Email Verification
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Password Reset
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Account Status
    isActive: {
        type: Boolean,
        default: true
    },
    deactivatedAt: Date,

    // Streak & Engagement
    streakCount: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastActive: {
        type: Date,
        default: Date.now
    },

    // Gamification
    babuaCoins: {
        type: Number,
        default: 0
    },
    xpPoints: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    badges: [{
        name: String,
        earnedAt: Date,
        icon: String
    }],

    // Pattern Mastery Tracking
    patternProgress: [{
        pattern: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pattern'
        },
        masteryPercent: { type: Number, default: 0 },
        problemsSolved: { type: Number, default: 0 },
        lastPracticed: Date
    }],

    // Community
    currentPod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pod'
    },

    // Sessions (for multi-device tracking)
    sessions: [sessionSchema],

    // Hiring Profile
    hiringProfile: {
        isActive: { type: Boolean, default: false },
        resumeUrl: String,
        githubUrl: String,
        linkedinUrl: String,
        skills: [String],
        experience: String,
        preferredRoles: [String],
        expectedSalary: String,
        location: String,
        remotePreference: {
            type: String,
            enum: ['remote', 'onsite', 'hybrid', 'any'],
            default: 'any'
        }
    },

    // Coding Platform Profiles (LeetCode, CodeForces, etc.)
    codingProfiles: {
        leetcode: {
            username: { type: String, trim: true },
            verified: { type: Boolean, default: false },
            lastSynced: Date,
            stats: {
                totalSolved: { type: Number, default: 0 },
                easySolved: { type: Number, default: 0 },
                mediumSolved: { type: Number, default: 0 },
                hardSolved: { type: Number, default: 0 },
                ranking: Number,
                contestRating: Number,
                streak: { type: Number, default: 0 }
            }
        },
        codeforces: {
            username: { type: String, trim: true },
            verified: { type: Boolean, default: false },
            lastSynced: Date,
            stats: {
                rating: Number,
                maxRating: Number,
                rank: String,
                solved: { type: Number, default: 0 }
            }
        },
        hackerrank: {
            username: { type: String, trim: true },
            verified: { type: Boolean, default: false },
            lastSynced: Date,
            stats: {
                badges: { type: Number, default: 0 },
                certificates: { type: Number, default: 0 }
            }
        }
    },

    // Instructor-specific fields
    instructorProfile: {
        isApproved: { type: Boolean, default: false },
        approvedAt: Date,
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        bio: String,
        expertise: [String],
        socialLinks: {
            youtube: String,
            linkedin: String,
            twitter: String,
            website: String
        },
        totalStudents: { type: Number, default: 0 },
        rating: { average: Number, count: Number }
    },

    // Legacy refresh token (deprecated, use sessions)
    refreshToken: {
        type: String,
        select: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'sessions.refreshToken': 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Update streak
userSchema.methods.updateStreak = function () {
    const now = new Date();
    const lastActive = new Date(this.lastActive);
    const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        this.streakCount += 1;
        if (this.streakCount > this.longestStreak) {
            this.longestStreak = this.streakCount;
        }
    } else if (diffDays > 1) {
        this.streakCount = 1;
    }
    this.lastActive = now;
};

// Add XP and check level up
userSchema.methods.addXP = function (amount) {
    this.xpPoints += amount;
    const newLevel = Math.floor(this.xpPoints / 1000) + 1;
    if (newLevel > this.level) {
        this.level = newLevel;
        return true; // Level up occurred
    }
    return false;
};

// Check if user has permission
userSchema.methods.hasPermission = function (permission) {
    if (this.role === 'admin') return true;
    return this.permissions.includes(permission);
};

// Create session
userSchema.methods.createSession = function (deviceInfo, ipAddress, userAgent, refreshToken) {
    this.sessions.push({
        deviceInfo,
        ipAddress,
        userAgent,
        refreshToken,
        lastActive: new Date(),
        isActive: true
    });

    // Limit to 5 active sessions
    if (this.sessions.length > 5) {
        this.sessions.shift();
    }

    return this.sessions[this.sessions.length - 1];
};

// Invalidate session
userSchema.methods.invalidateSession = function (sessionId) {
    const session = this.sessions.id(sessionId);
    if (session) {
        session.isActive = false;
    }
};

// Invalidate all sessions
userSchema.methods.invalidateAllSessions = function () {
    this.sessions.forEach(session => {
        session.isActive = false;
    });
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
