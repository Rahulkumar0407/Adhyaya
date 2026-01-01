import mongoose from 'mongoose';

const patternSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Pattern name is required'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    category: {
        type: String,
        enum: ['foundational', 'intermediate', 'advanced'],
        required: true
    },
    subcategory: {
        type: String,
        required: true,
        // Examples: 'two-pointers', 'sliding-window', 'dp-knapsack', etc.
    },
    description: {
        type: String,
        required: true
    },

    // Learning Content
    videoUrl: {
        type: String,
        default: ''
    },
    videoDuration: {
        type: Number, // in minutes
        default: 0
    },

    // One-page intuition cheatsheet (markdown)
    cheatsheet: {
        type: String,
        default: ''
    },

    // Key concepts for quick reference
    keyConcepts: [{
        title: String,
        description: String
    }],

    // When to use this pattern
    whenToUse: [String],

    // Common mistakes
    commonMistakes: [String],

    // Time & Space complexity typical for this pattern
    typicalComplexity: {
        time: String,
        space: String
    },

    // Related patterns
    relatedPatterns: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pattern'
    }],

    // Order for display
    order: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    },

    // Stats
    totalProblems: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create slug from name before saving
patternSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

const Pattern = mongoose.model('Pattern', patternSchema);

export default Pattern;
