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
            // Password required only if not using OAuth
            return !this.googleId;
        },
        minlength: 6,
        select: false
    },
    googleId: {
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


    // Community
    currentPod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pod'
    },

    // Hiring Profile (for reverse recruiting)
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
