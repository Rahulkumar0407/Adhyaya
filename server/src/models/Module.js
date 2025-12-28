import mongoose from 'mongoose';
import slugify from 'slug ify';

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Module title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        lowercase: true
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },

    // Parent course
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },

    // Order
    order: {
        type: Number,
        default: 0
    },

    // Lock mechanism
    isLocked: {
        type: Boolean,
        default: false
    },
    unlockAfter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module' // Previous module that must be completed
    },

    // Sections in this module
    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    }],

    // Duration
    estimatedDuration: {
        type: Number, // in minutes
        default: 0
    },

    // Status
    isPublished: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
moduleSchema.index({ course: 1, order: 1 });
moduleSchema.index({ slug: 1, course: 1 });

// Pre-save hook to generate slug
moduleSchema.pre('save', function (next) {
    if (!this.slug || this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});

// Virtual for section count
moduleSchema.virtual('sectionCount').get(function () {
    return this.sections?.length || 0;
});

const Module = mongoose.model('Module', moduleSchema);

export default Module;
