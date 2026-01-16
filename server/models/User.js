import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function () {
            // Password required only if not using OAuth or Firebase
            return !this.googleId && !this.firebaseUid;
        },
        minlength: 6,
        select: false
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    firebaseUid: {
        type: String,
        sparse: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ['student', 'mentor', 'admin'],
        default: 'student'
    },
    avatar: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        maxlength: 200
    },
    location: {
        type: String,
        trim: true
    },
    college: {
        type: String,
        trim: true
    },
    course: {
        type: String,
        trim: true
    },
    graduationYear: {
        type: Number
    },
    socialLinks: {
        linkedin: { type: String, trim: true },
        github: { type: String, trim: true },
        portfolio: { type: String, trim: true }
    },

    // Account Status
    isActive: {
        type: Boolean,
        default: true
    },
    banReason: String,
    bannedUntil: Date,

    // Admin-granted permission to change password
    canChangePassword: {
        type: Boolean,
        default: false
    },

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

    // XP and Level
    xpPoints: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    problemsSolved: {
        type: Number,
        default: 0
    },

    // Gamification
    babuaCoins: {
        type: Number,
        default: 0
    },

    // Coding Platform Profiles
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

    // Pattern Mastery Tracking
    patternProgress: [{
        pattern: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pattern'
        },
        masteryPercent: {
            type: Number,
            default: 0
        },
        problemsSolved: {
            type: Number,
            default: 0
        },
        lastPracticed: Date
    }],

    // Revision Preference
    revisionMode: {
        type: String,
        enum: ['adaptive', 'manual', 'unset'],
        default: 'unset'
    },

    // Adaptive Revision Subscription
    adaptiveRevisionSubscription: {
        plan: {
            type: String,
            enum: ['free_trial', 'premium', 'expired'],
            default: 'free_trial'
        },
        lecturesUsed: {
            type: Number,
            default: 0
        },
        maxFreeLectures: {
            type: Number,
            default: 3
        },
        subscribedAt: Date,
        expiresAt: Date,
        paymentId: String
    },

    // Mentor Circle Subscription
    mentorCircleSubscription: {
        plan: {
            type: String,
            enum: ['free', 'premium', 'expired'],
            default: 'free'
        },
        subscribedAt: Date,
        expiresAt: Date,
        paymentId: String
    },

    // Community
    currentPod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pod'
    },

    // Refer and Earn
    referralCode: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    referralClaimed: {
        type: Boolean,
        default: false
    },
    referralCount: {
        type: Number,
        default: 0
    },


    // Tokens

    // Tokens
    refreshToken: {
        type: String,
        select: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified and exists (not OAuth users)
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
        // Consecutive day - increase streak
        this.streakCount += 1;
        if (this.streakCount > this.longestStreak) {
            this.longestStreak = this.streakCount;
        }
    } else if (diffDays > 1) {
        // Streak broken
        this.streakCount = 1;
    }
    // If diffDays === 0, same day, don't change streak

    this.lastActive = now;
};

const User = mongoose.model('User', userSchema);

export default User;
