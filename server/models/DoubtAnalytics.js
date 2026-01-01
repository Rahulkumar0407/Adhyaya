import mongoose from 'mongoose';

const doubtAnalyticsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['student', 'mentor']
    },

    // Student Analytics
    studentAnalytics: {
        // Weak Topics Analysis
        weakTopics: [{
            subject: String,
            subTopic: String,
            doubtCount: { type: Number, default: 0 },
            avgResolutionTime: Number,
            lastAsked: Date
        }],

        // Repeated Mistakes
        repeatedMistakes: [{
            pattern: String,
            count: { type: Number, default: 0 },
            keywords: [String]
        }],

        // Overall Stats
        totalDoubtsAsked: {
            type: Number,
            default: 0
        },
        resolvedDoubts: {
            type: Number,
            default: 0
        },
        avgResolutionSpeed: {
            type: Number, // in minutes
            default: 0
        },
        totalSpent: {
            type: Number,
            default: 0
        },
        avgSpentPerDoubt: {
            type: Number,
            default: 0
        },

        // Subject-wise breakdown
        subjectBreakdown: [{
            subject: String,
            count: Number,
            avgRating: Number
        }],

        // Preferred mentors
        preferredMentors: [{
            mentor: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            doubtCount: Number,
            avgRating: Number
        }]
    },

    // Mentor Analytics
    mentorAnalytics: {
        // Topic Strengths
        topicStrengths: [{
            subject: String,
            subTopics: [String],
            doubtsResolved: { type: Number, default: 0 },
            avgRating: Number,
            avgResponseTime: Number
        }],

        // Earnings
        earnings: {
            total: {
                type: Number,
                default: 0
            },
            thisMonth: {
                type: Number,
                default: 0
            },
            lastMonth: {
                type: Number,
                default: 0
            },
            avgPerDoubt: {
                type: Number,
                default: 0
            },
            earningsHistory: [{
                month: String, // "2025-01"
                amount: Number,
                doubtCount: Number
            }]
        },

        // Performance Metrics
        performance: {
            avgResponseTime: {
                type: Number, // in minutes
                default: 0
            },
            resolutionRate: {
                type: Number, // percentage
                default: 0
            },
            satisfactionScore: {
                type: Number,
                default: 0
            },
            responseTimeDistribution: {
                under30min: { type: Number, default: 0 },
                under1hour: { type: Number, default: 0 },
                under2hours: { type: Number, default: 0 },
                over2hours: { type: Number, default: 0 }
            }
        },

        // Activity Stats
        totalDoubtsResolved: {
            type: Number,
            default: 0
        },
        activeDoubts: {
            type: Number,
            default: 0
        },
        completedDoubts: {
            type: Number,
            default: 0
        },

        // Quality Indicators
        qualityMetrics: {
            helpfulnessRate: Number, // % of doubts marked helpful
            reaskRate: Number, // % of students asking similar doubts again
            followUpRate: Number // avg follow-ups per doubt
        }
    },

    // Heatmap Data (for visualization)
    heatmapData: {
        hourlyActivity: [{
            hour: Number, // 0-23
            count: Number
        }],
        dailyActivity: [{
            day: String, // "Monday"
            count: Number
        }],
        monthlyTrends: [{
            month: String,
            doubtCount: Number,
            avgResolutionTime: Number
        }]
    },

    lastUpdated: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

// Indexes
doubtAnalyticsSchema.index({ user: 1, userType: 1 });
doubtAnalyticsSchema.index({ lastUpdated: 1 });

// Update student analytics after doubt resolution
doubtAnalyticsSchema.methods.updateStudentAnalytics = function (doubt) {
    if (this.userType !== 'student') return;

    // Update total counts
    this.studentAnalytics.totalDoubtsAsked += 1;
    if (doubt.isResolved) {
        this.studentAnalytics.resolvedDoubts += 1;
    }

    // Update spending
    this.studentAnalytics.totalSpent += doubt.totalPrice;
    this.studentAnalytics.avgSpentPerDoubt =
        this.studentAnalytics.totalSpent / this.studentAnalytics.totalDoubtsAsked;

    // Update resolution speed
    if (doubt.actualResponseTime) {
        const currentAvg = this.studentAnalytics.avgResolutionSpeed;
        const count = this.studentAnalytics.resolvedDoubts;
        this.studentAnalytics.avgResolutionSpeed =
            ((currentAvg * (count - 1)) + doubt.actualResponseTime) / count;
    }

    // Update weak topics
    const weakTopicIndex = this.studentAnalytics.weakTopics.findIndex(
        t => t.subject === doubt.subject && t.subTopic === doubt.subTopic
    );

    if (weakTopicIndex >= 0) {
        this.studentAnalytics.weakTopics[weakTopicIndex].doubtCount += 1;
        this.studentAnalytics.weakTopics[weakTopicIndex].lastAsked = new Date();
    } else {
        this.studentAnalytics.weakTopics.push({
            subject: doubt.subject,
            subTopic: doubt.subTopic,
            doubtCount: 1,
            lastAsked: new Date()
        });
    }

    this.lastUpdated = new Date();
};

// Update mentor analytics after doubt resolution
doubtAnalyticsSchema.methods.updateMentorAnalytics = function (doubt) {
    if (this.userType !== 'mentor') return;

    // Update topic strengths
    const topicIndex = this.mentorAnalytics.topicStrengths.findIndex(
        t => t.subject === doubt.subject
    );

    if (topicIndex >= 0) {
        this.mentorAnalytics.topicStrengths[topicIndex].doubtsResolved += 1;
        if (doubt.rating) {
            const currentAvg = this.mentorAnalytics.topicStrengths[topicIndex].avgRating || 0;
            const count = this.mentorAnalytics.topicStrengths[topicIndex].doubtsResolved;
            this.mentorAnalytics.topicStrengths[topicIndex].avgRating =
                ((currentAvg * (count - 1)) + doubt.rating) / count;
        }
    } else {
        this.mentorAnalytics.topicStrengths.push({
            subject: doubt.subject,
            doubtsResolved: 1,
            avgRating: doubt.rating || 0
        });
    }

    // Update earnings
    const mentorEarning = doubt.totalPrice * 0.8; // 80% to mentor
    this.mentorAnalytics.earnings.total += mentorEarning;
    this.mentorAnalytics.earnings.thisMonth += mentorEarning;

    // Update total doubts
    this.mentorAnalytics.totalDoubtsResolved += 1;

    this.lastUpdated = new Date();
};

// Static method to get weak topics heatmap
doubtAnalyticsSchema.statics.getWeakTopicsHeatmap = async function (userId) {
    const analytics = await this.findOne({ user: userId, userType: 'student' });
    if (!analytics) return [];

    return analytics.studentAnalytics.weakTopics
        .sort((a, b) => b.doubtCount - a.doubtCount)
        .slice(0, 10);
};

// Static method to get mentor performance summary
doubtAnalyticsSchema.statics.getMentorPerformance = async function (userId) {
    const analytics = await this.findOne({ user: userId, userType: 'mentor' });
    if (!analytics) return null;

    return {
        totalEarnings: analytics.mentorAnalytics.earnings.total,
        thisMonth: analytics.mentorAnalytics.earnings.thisMonth,
        doubtsResolved: analytics.mentorAnalytics.totalDoubtsResolved,
        avgRating: analytics.mentorAnalytics.performance.satisfactionScore,
        avgResponseTime: analytics.mentorAnalytics.performance.avgResponseTime,
        topStrengths: analytics.mentorAnalytics.topicStrengths
            .sort((a, b) => b.doubtsResolved - a.doubtsResolved)
            .slice(0, 5)
    };
};

const DoubtAnalytics = mongoose.model('DoubtAnalytics', doubtAnalyticsSchema);

export default DoubtAnalytics;
