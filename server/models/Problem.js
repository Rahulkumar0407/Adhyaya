import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Problem title is required'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },

    // Difficulty
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },

    // Pattern association
    pattern: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pattern',
        required: true
    },

    // Problem type
    isCoreProblem: {
        type: Boolean,
        default: false
    },
    isVariation: {
        type: Boolean,
        default: false
    },

    // Parent problem for variations
    parentProblem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    },

    // Variations of this problem
    variations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }],

    // Examples
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],

    // Constraints
    constraints: [String],

    // Hints (progressive)
    hints: [{
        level: Number, // 1, 2, 3 - increasingly helpful
        content: String
    }],

    // Solution Templates
    starterCode: {
        javascript: String,
        python: String,
        java: String,
        cpp: String
    },

    // Solution
    solution: {
        approach: String, // markdown explanation
        code: {
            javascript: String,
            python: String,
            java: String,
            cpp: String
        },
        complexity: {
            time: String,
            space: String
        }
    },

    // Test cases (for validation)
    testCases: [{
        input: mongoose.Schema.Types.Mixed,
        expectedOutput: mongoose.Schema.Types.Mixed,
        isHidden: Boolean
    }],

    // External links
    leetcodeLink: String,

    // Tags for filtering
    tags: [String],

    // Stats
    totalSubmissions: {
        type: Number,
        default: 0
    },
    successfulSubmissions: {
        type: Number,
        default: 0
    },

    // Order within pattern
    order: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create slug from title before saving
problemSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

// Virtual for success rate
problemSchema.virtual('successRate').get(function () {
    if (this.totalSubmissions === 0) return 0;
    return Math.round((this.successfulSubmissions / this.totalSubmissions) * 100);
});

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
