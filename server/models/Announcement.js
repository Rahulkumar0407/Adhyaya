import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'urgent', 'maintenance'],
        default: 'info'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    targetAudience: {
        type: String,
        enum: ['all', 'students', 'mentors', 'premium'],
        default: 'all'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    // For action buttons
    action: {
        label: String,
        url: String
    }
}, {
    timestamps: true
});

// Index for faster queries
announcementSchema.index({ isActive: 1, createdAt: -1 });
announcementSchema.index({ targetAudience: 1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
