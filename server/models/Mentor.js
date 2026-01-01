import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // Professional Info
    headline: {
        type: String,
        required: [true, 'Headline is required'],
        maxlength: 100,
        trim: true
        // e.g., "SDE @ Google | DSA Expert"
    },
    bio: {
        type: String,
        maxlength: 1000,
        trim: true
    },
    expertise: [{
        type: String,
        trim: true
    }],
    yearsOfExperience: {
        type: Number,
        min: 0,
        default: 0
    },

    // Work Experience
    currentCompany: {
        type: String,
        trim: true
    },
    currentRole: {
        type: String,
        trim: true
    },
    workHistory: [{
        company: String,
        role: String,
        duration: String,
        isCurrent: { type: Boolean, default: false }
    }],

    // Pricing
    ratePerMinute: {
        type: Number,
        required: [true, 'Rate per minute is required'],
        min: [9, 'Rate must be at least ₹9/min'],
        max: [100, 'Rate cannot exceed ₹100/min']
    },
    minCallDuration: {
        type: Number,
        default: 5,
        min: 1,
        max: 30
        // in minutes
    },

    // Availability
    isOnline: {
        type: Boolean,
        default: false
    },
    lastOnline: {
        type: Date,
        default: Date.now
    },
    availableSlots: [{
        dayOfWeek: {
            type: Number,
            min: 0,
            max: 6
            // 0 = Sunday, 6 = Saturday
        },
        startTime: String, // "09:00"
        endTime: String    // "17:00"
    }],

    // Stats & Ratings
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    totalSessions: {
        type: Number,
        default: 0
    },
    totalMinutes: {
        type: Number,
        default: 0
    },

    // Verification
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: Date,
    verificationDocs: {
        linkedinUrl: String,
        idProofUrl: String
    },

    // Application Status
    applicationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    rejectionReason: String,

    // Earnings
    totalEarned: {
        type: Number,
        default: 0
    },
    pendingPayout: {
        type: Number,
        default: 0
    },

    // Settings
    instantCallEnabled: {
        type: Boolean,
        default: true
    },
    scheduledCallEnabled: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
mentorSchema.index({ expertise: 1 });
mentorSchema.index({ ratePerMinute: 1 });
mentorSchema.index({ rating: -1 });
mentorSchema.index({ isOnline: 1 });
mentorSchema.index({ applicationStatus: 1 });

// Virtual for formatted rate
mentorSchema.virtual('formattedRate').get(function () {
    return `₹${this.ratePerMinute}/min`;
});

// Method to update stats after a call
mentorSchema.methods.updateAfterCall = async function (callDuration, rating) {
    this.totalSessions += 1;
    this.totalMinutes += callDuration;

    if (rating) {
        // Calculate new average rating
        const totalRatingPoints = this.rating * this.totalReviews + rating;
        this.totalReviews += 1;
        this.rating = totalRatingPoints / this.totalReviews;
    }

    await this.save();
};

// Method to toggle online status
mentorSchema.methods.toggleOnline = async function (status) {
    this.isOnline = status;
    if (status) {
        this.lastOnline = new Date();
    }
    await this.save();
};

const Mentor = mongoose.model('Mentor', mentorSchema);

export default Mentor;
