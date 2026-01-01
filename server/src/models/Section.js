import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Section title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },

    // Parent module
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },

    // Order
    order: {
        type: Number,
        default: 0
    },

    // Topics in this section
    topics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    }],

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
sectionSchema.index({ module: 1, order: 1 });

// Virtual for topic count
sectionSchema.virtual('topicCount').get(function () {
    return this.topics?.length || 0;
});

const Section = mongoose.model('Section', sectionSchema);

export default Section;
