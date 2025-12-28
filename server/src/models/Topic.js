import mongoose from 'mongoose';
import slugify from 'slugify';

const topicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Topic title is required'],
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

    // Parent section
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    },

    // Order
    order: {
        type: Number,
        default: 0
    },

    // Content type
    type: {
        type: String,
        enum: ['video', 'article', 'problem', 'quiz', 'assignment'],
        required: true
    },

    // Video content
    video: {
        url: String, // Cloudinary or YouTube URL
        duration: Number, // in seconds
        provider: {
            type: String,
            enum: ['cloudinary', 'youtube', 'vimeo'],
            default: 'cloudinary'
        },
        thumbnail: String,
        subtitles: [{
            language: String,
            url: String
        }]
    },

    // Article content
    article: {
        content: String, // Markdown
        readingTime: Number // in minutes
    },

    // PDF/Notes
    attachments: [{
        name: String,
        url: String, // Cloudinary URL
        type: {
            type: String,
            enum: ['pdf', 'doc', 'ppt', 'zip'],
            default: 'pdf'
        },
        size: Number // in bytes
    }],

    // Code snippets
    codeSnippets: [{
        language: String,
        code: String,
        description: String
    }],

    // Problems (for DSA topics)
    problems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }],

    // Quiz
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },

    // Free preview
    isPreview: {
        type: Boolean,
        default: false
    },

    // Estimated time
    estimatedTime: {
        type: Number, // in minutes
        default: 0
    },

    // External resources
    externalLinks: [{
        title: String,
        url: String,
        type: { type: String, enum: ['article', 'video', 'documentation', 'other'] }
    }],

    // Status
    isPublished: {
        type: Boolean,
        default: false
    },

    // Discussion
    allowComments: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
topicSchema.index({ section: 1, order: 1 });
topicSchema.index({ slug: 1, section: 1 });
topicSchema.index({ type: 1 });

// Pre-save hook to generate slug
topicSchema.pre('save', function (next) {
    if (!this.slug || this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;
