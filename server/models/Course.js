import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String, // URL
        default: ''
    },
    type: {
        type: String,
        enum: ['dsa', 'system-design', 'dbms', 'full-stack', 'other'],
        default: 'other'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived', 'coming_soon'],
        default: 'draft'
    },
    price: {
        type: Number,
        default: 0
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    features: [{
        type: String
    }],
    sections: [{
        title: { type: String, required: true },
        description: String,
        lessons: [{
            title: { type: String, required: true },
            type: {
                type: String,
                enum: ['video', 'article', 'quiz', 'code'],
                default: 'video'
            },
            contentUrl: String, // Video URL, PDF link, or Quiz ID
            textContent: String, // Markdown content for articles
            duration: { type: Number, default: 0 }, // in minutes
            isFree: { type: Boolean, default: false },
            order: { type: Number, default: 0 }
        }]
    }],
    metadata: {
        totalStudents: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        totalDuration: { type: Number, default: 0 } // total hours
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for search
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ status: 1 });

const Course = mongoose.model('Course', courseSchema);

export default Course;
