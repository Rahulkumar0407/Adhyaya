import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'all-time'],
        required: true
    },
    category: {
        type: String,
        enum: ['overall', 'dsa', 'lld', 'system-design', 'ai-ml'],
        default: 'overall'
    },
    period: {
        start: { type: Date, required: true },
        end: { type: Date, required: true }
    },
    
    // Rankings
    rankings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rank: Number,
        score: Number, // calculated based on problems + courses + engagement
        metrics: {
            problemsSolved: Number,
            coursesCompleted: Number,
            streak: Number,
            xpEarned: Number,
            timeSpent: Number
        }
    }],
    
    // Metadata
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    totalParticipants: Number
}, {
    timestamps: true
});

// Indexes
leaderboardSchema.index({ type: 1, category: 1, 'period.start': 1 });
leaderboardSchema.index({ 'rankings.user': 1 });

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

export default Leaderboard;
