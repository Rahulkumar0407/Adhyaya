import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const applicationSchema = new mongoose.Schema({
    applicationId: {
        type: String,
        default: uuidv4,
        unique: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resumeSnapshot: {
        type: String, // URL to the resume file
        required: false // May not be required if applying with profile only
    },
    skillSnapshot: {
        dsa: { type: Number, default: 0 },
        sql: { type: Number, default: 0 },
        systemDesign: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['Applied', 'Viewed', 'Shortlisted', 'Rejected'],
        default: 'Applied'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    mentorApproval: {
        requested: { type: Boolean, default: false },
        approved: { type: Boolean, default: null }, // null = pending, true = approved, false = rejected
        comments: { type: String }
    },
    matchPercentage: {
        type: Number
    }
});

// Ensure a student applies to a job only once (unless rejected, perhaps? Enforcing unique per job for now)
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
