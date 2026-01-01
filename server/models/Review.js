import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    // References
    call: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Call',
        required: true,
        unique: true // One review per call
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Rating
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },

    // Review Content
    content: {
        type: String,
        maxlength: 500,
        trim: true
    },

    // Quick Tags
    tags: [{
        type: String,
        enum: [
            'helpful',
            'knowledgeable',
            'patient',
            'clear-explanation',
            'good-examples',
            'encouraging',
            'professional',
            'punctual',
            'solved-my-doubt'
        ]
    }],

    // Visibility
    isPublic: {
        type: Boolean,
        default: true
    },

    // Mentor Response
    mentorResponse: {
        content: String,
        respondedAt: Date
    },

    // Moderation
    isApproved: {
        type: Boolean,
        default: true
    },
    reportedReason: String,
    isHidden: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
reviewSchema.index({ mentor: 1, createdAt: -1 });
reviewSchema.index({ student: 1 });
reviewSchema.index({ rating: 1 });

// Update mentor rating after review
reviewSchema.post('save', async function () {
    const Mentor = mongoose.model('Mentor');
    const mentor = await Mentor.findById(this.mentor);

    if (mentor) {
        // Recalculate average rating
        const Review = mongoose.model('Review');
        const reviews = await Review.find({
            mentor: this.mentor,
            isApproved: true,
            isHidden: false
        });

        if (reviews.length > 0) {
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            mentor.rating = Math.round(avgRating * 10) / 10;
            mentor.totalReviews = reviews.length;
            await mentor.save();
        }
    }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
