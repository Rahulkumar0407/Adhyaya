import mongoose from 'mongoose';

const doubtMessageSchema = new mongoose.Schema({
    doubt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doubt',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderType: {
        type: String,
        required: true,
        enum: ['student', 'mentor', 'ai']
    },

    // Message Content
    messageType: {
        type: String,
        required: true,
        enum: ['text', 'code', 'voice', 'image', 'pdf', 'whiteboard'],
        default: 'text'
    },
    content: {
        type: String,
        required: function () {
            return this.messageType === 'text' || this.messageType === 'code';
        },
        maxlength: 5000
    },

    // Code Block
    codeBlock: {
        language: String,
        code: String
    },

    // Attachments
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'pdf', 'document']
        },
        url: String,
        filename: String,
        thumbnail: String,
        size: Number
    }],

    // Voice Note
    voiceNote: {
        url: String,
        duration: Number, // in seconds
        transcript: String
    },

    // Whiteboard/Hand-drawn
    whiteboard: {
        imageUrl: String,
        thumbnail: String,
        drawingData: mongoose.Schema.Types.Mixed // For future interactive whiteboard
    },

    // AI Metadata
    aiGenerated: {
        type: Boolean,
        default: false
    },
    aiHint: {
        type: Boolean,
        default: false
    },
    aiModel: String, // 'gpt-4', 'gemini-pro', etc.

    // Message State
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: Date,

    // Reactions (optional for future)
    reactions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        emoji: String
    }]

}, {
    timestamps: true
});

// Indexes
doubtMessageSchema.index({ doubt: 1, createdAt: 1 });
doubtMessageSchema.index({ sender: 1, createdAt: -1 });

// Mark message as read
doubtMessageSchema.methods.markAsRead = function () {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

// Static method to get chat thread
doubtMessageSchema.statics.getChatThread = function (doubtId, limit = 100) {
    return this.find({ doubt: doubtId })
        .sort({ createdAt: 1 })
        .limit(limit)
        .populate('sender', 'name avatar role');
};

// Static method to count unread messages
doubtMessageSchema.statics.getUnreadCount = function (doubtId, userId) {
    return this.countDocuments({
        doubt: doubtId,
        sender: { $ne: userId },
        isRead: false
    });
};

// Static method to mark all messages as read
doubtMessageSchema.statics.markAllAsRead = async function (doubtId, userId) {
    return this.updateMany(
        {
            doubt: doubtId,
            sender: { $ne: userId },
            isRead: false
        },
        {
            $set: {
                isRead: true,
                readAt: new Date()
            }
        }
    );
};

const DoubtMessage = mongoose.model('DoubtMessage', doubtMessageSchema);

export default DoubtMessage;
