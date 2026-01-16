import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    interviewType: {
        type: String,
        enum: ['dsa', 'system-design', 'dbms', 'os', 'cn', 'hr', 'custom'],
        required: true
    },
    customRole: {
        type: String,
        default: ''
    },

    // Configuration used
    config: {
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'intermediate'
        },
        companyTarget: {
            type: String,
            enum: ['faang', 'product', 'service', 'startup'],
            default: 'product'
        },
        techStack: {
            type: String,
            default: 'javascript'
        },
        duration: {
            type: Number,
            default: 30
        }
    },

    // Results
    overallScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    scores: {
        problemSolving: { type: Number, min: 0, max: 100, default: 0 },
        communication: { type: Number, min: 0, max: 100, default: 0 },
        confidence: { type: Number, min: 0, max: 100, default: 0 },
        accuracy: { type: Number, min: 0, max: 100, default: 0 }
    },

    // Pattern tracking for DSA/System Design
    patternsAsked: [{
        pattern: String,
        score: { type: Number, min: 0, max: 100 },
        solved: Boolean
    }],

    // Conversation history
    conversation: [{
        role: { type: String, enum: ['ai', 'user'] },
        text: String,
        timestamp: { type: Date, default: Date.now }
    }],

    // Problems solved (for DSA)
    problems: [{
        title: String,
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
        solved: Boolean,
        score: { type: Number, min: 0, max: 100 },
        optimized: Boolean,
        pattern: String
    }],

    // Feedback
    strengths: [String],
    weakPoints: [String],
    suggestions: [String],

    // Timing
    timeTaken: { type: Number, default: 0 }, // in seconds
    questionsAttempted: { type: Number, default: 0 },
    questionsTotal: { type: Number, default: 0 },

    // Status
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'abandoned'],
        default: 'completed'
    },

    completedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Index for efficient querying
InterviewSchema.index({ userId: 1, completedAt: -1 });
InterviewSchema.index({ userId: 1, interviewType: 1 });

// Virtual for calculating interview streak
InterviewSchema.statics.getStreak = async function (userId) {
    const interviews = await this.find({
        userId,
        status: 'completed'
    })
        .sort({ completedAt: -1 })
        .select('completedAt')
        .limit(30);

    if (interviews.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < interviews.length; i++) {
        const interviewDate = new Date(interviews[i].completedAt);
        interviewDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (interviewDate.getTime() === expectedDate.getTime()) {
            streak++;
        } else if (interviewDate.getTime() < expectedDate.getTime()) {
            break;
        }
    }

    return streak;
};

// Get pattern analysis for a user
InterviewSchema.statics.getPatternAnalysis = async function (userId) {
    const interviews = await this.find({
        userId,
        status: 'completed',
        interviewType: { $in: ['dsa', 'system-design'] }
    })
        .select('patternsAsked problems');

    const patternStats = {};

    interviews.forEach(interview => {
        // From patternsAsked
        interview.patternsAsked?.forEach(p => {
            if (!patternStats[p.pattern]) {
                patternStats[p.pattern] = { attempts: 0, solved: 0, totalScore: 0 };
            }
            patternStats[p.pattern].attempts++;
            if (p.solved) patternStats[p.pattern].solved++;
            patternStats[p.pattern].totalScore += p.score || 0;
        });

        // From problems
        interview.problems?.forEach(prob => {
            if (prob.pattern) {
                if (!patternStats[prob.pattern]) {
                    patternStats[prob.pattern] = { attempts: 0, solved: 0, totalScore: 0 };
                }
                patternStats[prob.pattern].attempts++;
                if (prob.solved) patternStats[prob.pattern].solved++;
                patternStats[prob.pattern].totalScore += prob.score || 0;
            }
        });
    });

    // Calculate averages and success rates
    const analysis = Object.entries(patternStats).map(([pattern, stats]) => ({
        pattern,
        attempts: stats.attempts,
        successRate: stats.attempts > 0 ? Math.round((stats.solved / stats.attempts) * 100) : 0,
        avgScore: stats.attempts > 0 ? Math.round(stats.totalScore / stats.attempts) : 0
    }));

    // Sort by weakness (lowest success rate first)
    analysis.sort((a, b) => a.successRate - b.successRate);

    return analysis;
};

// Get readiness stats
InterviewSchema.statics.getReadinessStats = async function (userId) {
    const interviews = await this.find({
        userId,
        status: 'completed'
    })
        .sort({ completedAt: -1 })
        .limit(20);

    if (interviews.length === 0) {
        return {
            overallReadiness: 0,
            totalInterviews: 0,
            avgScore: 0,
            byType: {},
            byCompany: {}
        };
    }

    // Calculate overall stats
    const totalScore = interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0);
    const avgScore = Math.round(totalScore / interviews.length);

    // By interview type
    const byType = {};
    interviews.forEach(i => {
        if (!byType[i.interviewType]) {
            byType[i.interviewType] = { count: 0, totalScore: 0 };
        }
        byType[i.interviewType].count++;
        byType[i.interviewType].totalScore += i.overallScore || 0;
    });

    Object.keys(byType).forEach(type => {
        byType[type].avgScore = Math.round(byType[type].totalScore / byType[type].count);
    });

    // By company target
    const byCompany = {};
    interviews.forEach(i => {
        const company = i.config?.companyTarget || 'product';
        if (!byCompany[company]) {
            byCompany[company] = { count: 0, totalScore: 0 };
        }
        byCompany[company].count++;
        byCompany[company].totalScore += i.overallScore || 0;
    });

    Object.keys(byCompany).forEach(company => {
        byCompany[company].avgScore = Math.round(byCompany[company].totalScore / byCompany[company].count);
    });

    // Calculate overall readiness (weighted average)
    const weights = { faang: 1, product: 0.8, service: 0.6, startup: 0.7 };
    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(byCompany).forEach(([company, stats]) => {
        const weight = weights[company] || 0.5;
        weightedSum += stats.avgScore * weight * stats.count;
        totalWeight += weight * stats.count;
    });

    const overallReadiness = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    return {
        overallReadiness,
        totalInterviews: interviews.length,
        avgScore,
        byType,
        byCompany,
        streak: await this.getStreak(userId)
    };
};

export default mongoose.model('Interview', InterviewSchema);
