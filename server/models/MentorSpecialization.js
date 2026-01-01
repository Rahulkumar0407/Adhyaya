import mongoose from 'mongoose';

const mentorSpecializationSchema = new mongoose.Schema({
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // Expertise Areas
    specializations: [{
        subject: {
            type: String,
            required: true,
            enum: ['dsa', 'dbms', 'cn', 'os', 'system-design', 'frontend', 'backend']
        },
        subTopics: [{
            type: String
        }],
        proficiencyLevel: {
            type: Number,
            min: 1,
            max: 5,
            default: 3
        },
        doubtsResolved: {
            type: Number,
            default: 0
        },
        avgRating: {
            type: Number,
            default: 0
        }
    }],

    // Availability
    isAvailable: {
        type: Boolean,
        default: true
    },
    availabilityHours: {
        start: String, // "09:00"
        end: String    // "22:00"
    },
    maxConcurrentDoubts: {
        type: Number,
        default: 5
    },
    currentDoubtCount: {
        type: Number,
        default: 0
    },
    avgResponseTime: {
        type: Number, // in minutes
        default: 60
    },

    // Quality Metrics
    qualityScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 70
    },
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        },
        distribution: {
            1: { type: Number, default: 0 },
            2: { type: Number, default: 0 },
            3: { type: Number, default: 0 },
            4: { type: Number, default: 0 },
            5: { type: Number, default: 0 }
        }
    },

    // Performance Stats
    totalDoubtsResolved: {
        type: Number,
        default: 0
    },
    resolutionSuccessRate: {
        type: Number, // percentage
        default: 0
    },
    fastResponses: {
        type: Number, // count of responses < 30 min
        default: 0
    },
    slowResponses: {
        type: Number, // count of responses > 2 hours
        default: 0
    },

    // Earnings
    totalEarnings: {
        type: Number,
        default: 0
    },
    earningsThisMonth: {
        type: Number,
        default: 0
    },
    avgEarningsPerDoubt: {
        type: Number,
        default: 0
    },

    // Status Flags
    isPaused: {
        type: Boolean,
        default: false
    },
    pauseReason: String,
    needsRetraining: {
        type: Boolean,
        default: false
    },
    lastActiveAt: Date,

    // Badges & Achievements
    badges: [{
        type: String,
        enum: ['top-rated', 'quick-responder', 'problem-solver', 'expert', 'helpful']
    }]

}, {
    timestamps: true
});

// Indexes
mentorSpecializationSchema.index({ mentor: 1 });
mentorSpecializationSchema.index({ 'specializations.subject': 1 });
mentorSpecializationSchema.index({ qualityScore: -1 });
mentorSpecializationSchema.index({ isAvailable: 1, currentDoubtCount: 1 });

// Update quality score based on recent performance
mentorSpecializationSchema.methods.updateQualityScore = function () {
    const ratingScore = (this.ratings.average / 5) * 40; // 40% weight
    const responseScore = this.avgResponseTime < 60 ? 30 : this.avgResponseTime < 120 ? 20 : 10; // 30% weight
    const resolutionScore = (this.resolutionSuccessRate / 100) * 30; // 30% weight

    this.qualityScore = Math.round(ratingScore + responseScore + resolutionScore);

    // Quality-based actions
    if (this.qualityScore < 60) {
        this.needsRetraining = true;
        this.maxConcurrentDoubts = Math.max(2, this.maxConcurrentDoubts - 1);
    } else if (this.qualityScore > 90) {
        this.badges = Array.from(new Set([...this.badges, 'top-rated']));
        this.maxConcurrentDoubts = Math.min(10, this.maxConcurrentDoubts + 1);
    }
};

// Add a rating
mentorSpecializationSchema.methods.addRating = function (rating) {
    this.ratings.distribution[rating] += 1;
    this.ratings.count += 1;

    const totalScore = Object.keys(this.ratings.distribution).reduce((sum, star) => {
        return sum + (parseInt(star) * this.ratings.distribution[star]);
    }, 0);

    this.ratings.average = (totalScore / this.ratings.count).toFixed(2);
    this.updateQualityScore();
};

// Get match score for a subject/topic
mentorSpecializationSchema.methods.getMatchScore = function (subject, subTopic) {
    const spec = this.specializations.find(s => s.subject === subject);
    if (!spec) return 0;

    let score = spec.proficiencyLevel * 15; // 15 points per proficiency level (max 75)

    if (spec.subTopics.includes(subTopic)) {
        score += 15; // Bonus for exact sub-topic match
    }

    if (spec.avgRating > 4) {
        score += 10; // Bonus for high ratings
    }

    return Math.min(100, score);
};

// Check if mentor can take more doubts
mentorSpecializationSchema.methods.canTakeDoubts = function () {
    return this.isAvailable &&
        !this.isPaused &&
        this.currentDoubtCount < this.maxConcurrentDoubts &&
        this.qualityScore >= 50;
};

// Static method to find best mentors for a doubt
mentorSpecializationSchema.statics.findBestMentors = async function (subject, subTopic, count = 3) {
    const mentors = await this.find({
        'specializations.subject': subject,
        isAvailable: true,
        isPaused: false,
        qualityScore: { $gte: 50 }
    })
        .populate('mentor', 'name avatar bio')
        .limit(count * 2); // Get more to filter

    // Calculate match scores and sort
    const mentorsWithScores = mentors
        .map(m => ({
            ...m.toObject(),
            matchScore: m.getMatchScore(subject, subTopic),
            canTake: m.canTakeDoubts()
        }))
        .filter(m => m.canTake)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, count);

    return mentorsWithScores;
};

const MentorSpecialization = mongoose.model('MentorSpecialization', mentorSpecializationSchema);

export default MentorSpecialization;
