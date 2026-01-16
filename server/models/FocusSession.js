import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Session Core
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: Date,
    plannedDuration: {
        type: Number, // minutes
        required: true,
        default: 25
    },
    actualDuration: {
        type: Number, // minutes
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'completed', 'abandoned'],
        default: 'active'
    },

    // Context
    sessionType: {
        type: String,
        enum: ['study', 'coding', 'revision', 'interview-prep', 'general'],
        default: 'general'
    },
    topic: {
        type: String,
        trim: true,
        maxlength: 200
    },
    linkedResource: {
        type: {
            type: String,
            enum: ['course', 'pattern', 'problem', 'revision']
        },
        resourceId: mongoose.Schema.Types.ObjectId
    },

    // Pomodoro Cycles
    cycles: [{
        cycleNumber: { type: Number, required: true },
        workDuration: { type: Number, default: 25 },
        breakDuration: { type: Number, default: 5 },
        completed: { type: Boolean, default: false },
        distractionCount: { type: Number, default: 0 },
        startTime: Date,
        endTime: Date
    }],
    currentCycle: {
        type: Number,
        default: 1
    },

    // Focus Metrics
    focusScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    distractionEvents: [{
        timestamp: { type: Date, default: Date.now },
        type: {
            type: String,
            enum: ['gaze_away', 'drowsy', 'tab_switch', 'manual_pause', 'idle', 'no_face']
        },
        duration: Number // seconds
    }],
    totalDistractionTime: {
        type: Number, // seconds
        default: 0
    },

    // Webcam Metrics (aggregated only, no raw data)
    webcamEnabled: {
        type: Boolean,
        default: false
    },
    attentionMetrics: {
        avgGazeScore: { type: Number, min: 0, max: 100 },
        blinkRatePerMin: Number,
        lookAwayCount: { type: Number, default: 0 },
        drowsinessEvents: { type: Number, default: 0 }
    },

    // Breaks
    breaks: [{
        startTime: { type: Date, required: true },
        endTime: Date,
        type: {
            type: String,
            enum: ['scheduled', 'user_initiated', 'ai_suggested'],
            default: 'user_initiated'
        },
        activity: {
            type: String,
            enum: ['eye_rest', 'stretch', 'walk', 'hydration', 'other'],
            default: 'other'
        }
    }],

    // Pause tracking
    pausedAt: Date,
    totalPausedTime: {
        type: Number, // seconds
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
focusSessionSchema.index({ userId: 1, startTime: -1 });
focusSessionSchema.index({ userId: 1, status: 1 });
focusSessionSchema.index({ userId: 1, createdAt: -1 });

// Calculate focus score before saving completed session
focusSessionSchema.methods.calculateFocusScore = function () {
    let TIME_WEIGHT = 0.4;
    let DISTRACTION_WEIGHT = 0.35;
    let COMPLETION_WEIGHT = 0.25;
    let ATTENTION_WEIGHT = 0;

    // Adjust weights if webcam monitoring was used
    if (this.webcamEnabled && this.attentionMetrics && this.attentionMetrics.avgGazeScore > 0) {
        TIME_WEIGHT = 0.3;
        DISTRACTION_WEIGHT = 0.3;
        COMPLETION_WEIGHT = 0.2;
        ATTENTION_WEIGHT = 0.2;
    }

    // Time Score: How much of planned time was completed
    const timeRatio = Math.min(this.actualDuration / this.plannedDuration, 1.2);
    const timeScore = timeRatio * 100;

    // Distraction Score: Fewer distractions = higher score
    const distractionCount = this.distractionEvents.length;
    const distractionScore = Math.max(0, 100 - (distractionCount * 5));

    // Attention Score: From webcam metrics
    const attentionScore = this.attentionMetrics ? (this.attentionMetrics.avgGazeScore || 0) : 0;

    // Completion Score: Based on session status
    let completionScore = 0;
    if (this.status === 'completed') {
        completionScore = 100;
    } else if (this.status === 'paused') {
        completionScore = 50;
    } else if (this.status === 'abandoned') {
        completionScore = 0;
    }

    // Weighted final score (capped at 100 to match schema max)
    this.focusScore = Math.min(100, Math.round(
        (TIME_WEIGHT * timeScore) +
        (DISTRACTION_WEIGHT * distractionScore) +
        (ATTENTION_WEIGHT * attentionScore) +
        (COMPLETION_WEIGHT * completionScore)
    ));

    return this.focusScore;
};

// Calculate actual duration
focusSessionSchema.methods.calculateActualDuration = function () {
    if (!this.endTime) {
        this.endTime = new Date();
    }

    const totalMs = this.endTime - this.startTime;
    const totalMinutes = totalMs / (1000 * 60);
    const pausedMinutes = this.totalPausedTime / 60;

    this.actualDuration = Math.round(totalMinutes - pausedMinutes);
    return this.actualDuration;
};

const FocusSession = mongoose.model('FocusSession', focusSessionSchema);

export default FocusSession;
