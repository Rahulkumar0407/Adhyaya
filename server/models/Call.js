import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
    // Participants
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor',
        required: true
    },

    // Call Type
    callType: {
        type: String,
        enum: ['instant', 'scheduled'],
        required: true
    },

    // Scheduling (for scheduled calls)
    scheduledFor: Date,
    scheduledDuration: Number, // in minutes
    confirmedAt: Date, // When mentor confirms the scheduled call
    mentorModifiedDuration: Boolean, // If mentor changed the duration

    // Timing
    startedAt: Date,
    endedAt: Date,
    durationMinutes: {
        type: Number,
        default: 0
    },

    // Billing
    ratePerMinute: {
        type: Number,
        required: true
    },
    totalCost: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'refunded', 'failed'],
        default: 'pending'
    },
    transactionId: String,

    // Call Status
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'waiting', 'ongoing', 'completed', 'cancelled', 'missed'],
        default: 'waiting'
    },
    cancelledBy: {
        type: String,
        enum: ['student', 'mentor', 'system']
    },
    cancellationReason: String,

    // WebRTC Info
    roomId: {
        type: String,
        unique: true,
        sparse: true
    },

    // Recording (optional)
    isRecorded: {
        type: Boolean,
        default: false
    },
    recordingUrl: String,
    recordingConsent: {
        student: { type: Boolean, default: false },
        mentor: { type: Boolean, default: false }
    },

    // Quality & Feedback
    callQuality: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor']
    },
    technicalIssues: [String],

    // Notes
    studentNotes: String,
    mentorNotes: String
}, {
    timestamps: true
});

// Indexes
callSchema.index({ student: 1, createdAt: -1 });
callSchema.index({ mentor: 1, createdAt: -1 });
callSchema.index({ status: 1 });
callSchema.index({ roomId: 1 });

// Generate unique room ID
callSchema.pre('save', function (next) {
    if (!this.roomId && this.isNew) {
        this.roomId = `call_${this._id}_${Date.now()}`;
    }
    next();
});

// Calculate cost when call ends
callSchema.methods.endCall = async function () {
    this.endedAt = new Date();

    if (this.startedAt) {
        const durationMs = this.endedAt - this.startedAt;
        this.durationMinutes = Math.ceil(durationMs / (1000 * 60));
        this.totalCost = this.durationMinutes * this.ratePerMinute;
    }

    this.status = 'completed';
    await this.save();

    return {
        duration: this.durationMinutes,
        cost: this.totalCost
    };
};

// Start the call
callSchema.methods.startCall = async function () {
    this.startedAt = new Date();
    this.status = 'ongoing';
    await this.save();
};

// Cancel the call
callSchema.methods.cancelCall = async function (cancelledBy, reason) {
    this.status = 'cancelled';
    this.cancelledBy = cancelledBy;
    this.cancellationReason = reason;
    await this.save();
};

const Call = mongoose.model('Call', callSchema);

export default Call;
