import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: [
            'announcement',
            'doubt-reply',
            'progress-milestone',
            'payment-success',
            'payment-failed',
            'course-update',
            'badge-earned',
            'level-up',
            'streak-reminder',
            'certificate-issued',
            'instructor-reply',
            'system'
        ],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    
    // Related entities
    relatedTo: {
        entityType: {
            type: String,
            enum: ['course', 'topic', 'problem', 'quiz', 'order', 'badge', 'user']
        },
        entityId: mongoose.Schema.Types.ObjectId
    },
    
    // Action CTA
    action: {
        label: String,
        url: String
    },
    
    // Priority
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    
    // Status
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    
    // Delivery channels
    channels: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
        push: { type: Boolean, default: false }
    },
    
    // Metadata
    data: mongoose.Schema.Types.Mixed
}, {
    timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
