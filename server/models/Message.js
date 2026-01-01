import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    channel: {
        type: String,
        required: true,
        enum: ['dsa', 'system-design', 'dbms', 'career', 'announcements', 'general'],
        default: 'general'
    },
    content: {
        type: String,
        required: true,
        maxlength: 2000
    },
    code: {
        language: String,
        content: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
messageSchema.index({ channel: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
