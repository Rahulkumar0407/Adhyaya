import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: { type: String, enum: ['pending', 'passed', 'failed'], default: 'pending' },
    runtime: { type: Number }, // in ms
    memory: { type: Number }, // in KB
    passedTestCases: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Virtual for accuracy
submissionSchema.virtual('accuracy').get(function () {
    if (this.totalTestCases === 0) return 0;
    return this.passedTestCases / this.totalTestCases;
});

// Pre-save hook to update updatedAt
submissionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

submissionSchema.index({ user: 1, problem: 1 });

export default mongoose.model('Submission', submissionSchema);
