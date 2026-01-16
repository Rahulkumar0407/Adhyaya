import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error', 'system', 'wallet-credit', 'announcement', 'achievement'],
        default: 'info'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    link: String,

    // Extended fields for service compatibility
    relatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'onModel'
    },
    onModel: {
        type: String,
        enum: ['Course', 'Doubt', 'Call', 'User', 'Post', 'Wallet']
    },
    action: {
        label: String,
        url: String
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    data: Object
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
