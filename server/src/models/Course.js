import mongoose from 'mongoose';
import slugify from 'slugify';

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Course title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Course description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    thumbnail: {
        type: String, // Cloudinary URL
        default: ''
    },

    // Instructor
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coInstructors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Categorization
    category: {
        type: String,
        enum: ['dsa', 'lld', 'system-design', 'ai-ml', 'web-dev', 'other'],
        required: true
    },
    subcategory: {
        type: String,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },

    // Pricing
    pricing: {
        type: {
            type: String,
            enum: ['free', 'paid', 'subscription'],
            default: 'free'
        },
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' },
        discountedPrice: Number,
        discountExpiry: Date
    },

    // Structure
    modules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    }],

    // Status
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    publishedAt: Date,

    // Metadata
    tags: [String],
    prerequisites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    learningOutcomes: [String],
    targetAudience: [String],

    // Stats
    enrollmentCount: {
        type: Number,
        default: 0
    },
    completionCount: {
        type: Number,
        default: 0
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },

    // Duration
    estimatedDuration: {
        type: Number, // in hours
        default: 0
    },

    // SEO
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],

    // Certificate
    certificate: {
        enabled: { type: Boolean, default: true },
        templateUrl: String,
        passingScore: { type: Number, default: 70 }
    },

    // Access control
    isPublic: {
        type: Boolean,
        default: true
    },
    accessCode: {
        type: String,
        unique: true,
        sparse: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
courseSchema.index({ slug: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1, difficulty: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ 'pricing.type': 1 });

// Pre-save hook to generate slug
courseSchema.pre('save', function (next) {
    if (!this.slug || this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});

// Virtual for module count
courseSchema.virtual('moduleCount').get(function () {
    return this.modules?.length || 0;
});

// Virtual for completion rate
courseSchema.virtual('completionRate').get(function () {
    if (this.enrollmentCount === 0) return 0;
    return Math.round((this.completionCount / this.enrollmentCount) * 100);
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

export default Course;
