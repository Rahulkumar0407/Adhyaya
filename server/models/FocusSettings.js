import mongoose from 'mongoose';

const focusSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    // Pomodoro Preferences
    defaultWorkDuration: {
        type: Number,
        default: 25,
        min: 5,
        max: 120
    },
    defaultBreakDuration: {
        type: Number,
        default: 5,
        min: 1,
        max: 30
    },
    longBreakDuration: {
        type: Number,
        default: 15,
        min: 5,
        max: 60
    },
    cyclesBeforeLongBreak: {
        type: Number,
        default: 4,
        min: 2,
        max: 10
    },

    // AI Adaptation
    enableAdaptiveTimer: {
        type: Boolean,
        default: true
    },

    // Webcam Settings (Privacy-First)
    webcamMonitoringEnabled: {
        type: Boolean,
        default: false
    },
    webcamConsentGiven: {
        type: Boolean,
        default: false
    },
    webcamConsentDate: Date,
    webcamConsentRevoked: {
        type: Boolean,
        default: false
    },

    // Distraction Alerts
    alertSensitivity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    enableSoundAlerts: {
        type: Boolean,
        default: false
    },
    enableVisualAlerts: {
        type: Boolean,
        default: true
    },
    gazeAwayThreshold: {
        type: Number, // seconds before alert
        default: 5
    },

    // Gamification (Controlled)
    enableFocusStreaks: {
        type: Boolean,
        default: true
    },
    enableChallenges: {
        type: Boolean,
        default: false
    },

    // Focus Stats (aggregated)
    focusStreak: {
        type: Number,
        default: 0
    },
    longestFocusStreak: {
        type: Number,
        default: 0
    },
    lastFocusDate: Date,
    totalFocusMinutes: {
        type: Number,
        default: 0
    },
    totalSessions: {
        type: Number,
        default: 0
    },
    avgFocusScore: {
        type: Number,
        default: 0
    },

    // Best focus time analysis
    bestFocusHour: {
        type: Number, // 0-23
        default: null
    },
    bestFocusDay: {
        type: String, // 'monday', 'tuesday', etc.
        default: null
    }
}, {
    timestamps: true
});

// Method to update focus streak
focusSettingsSchema.methods.updateFocusStreak = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!this.lastFocusDate) {
        this.focusStreak = 1;
        this.lastFocusDate = today;
        return;
    }

    const lastDate = new Date(this.lastFocusDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Same day, no change
        return;
    } else if (diffDays === 1) {
        // Consecutive day - increase streak
        this.focusStreak += 1;
        if (this.focusStreak > this.longestFocusStreak) {
            this.longestFocusStreak = this.focusStreak;
        }
    } else {
        // Streak broken
        this.focusStreak = 1;
    }

    this.lastFocusDate = today;
};

// Method to revoke webcam consent and clear related data
focusSettingsSchema.methods.revokeWebcamConsent = function () {
    this.webcamMonitoringEnabled = false;
    this.webcamConsentGiven = false;
    this.webcamConsentRevoked = true;
    this.webcamConsentDate = null;
};

const FocusSettings = mongoose.model('FocusSettings', focusSettingsSchema);

export default FocusSettings;
