import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const jobSchema = new mongoose.Schema({
    jobId: {
        type: String,
        default: uuidv4,
        unique: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    salaryRange: {
        min: { type: Number },
        max: { type: Number }
    },
    jobType: {
        type: String,
        enum: ['Intern', 'FTE'],
        default: 'Intern'
    },
    experienceLevel: {
        type: String,
        enum: ['Fresher', '0-2 yrs'],
        default: 'Fresher'
    },
    requiredSkills: [{
        type: String,
        trim: true
    }],
    applicationType: {
        type: String,
        enum: ['ExternalLink', 'InternalApply'],
        default: 'ExternalLink'
    },
    applyLink: {
        type: String,
        trim: true
    },
    deadline: {
        type: Date
    },
    verifiedStatus: {
        type: Boolean,
        default: false
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        enum: ['Hot', 'Mentor Referred', 'Adhyaya Recommended']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for searching and filtering
jobSchema.index({ role: 'text', companyName: 'text', requiredSkills: 'text' });
jobSchema.index({ isActive: 1, verifiedStatus: 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
