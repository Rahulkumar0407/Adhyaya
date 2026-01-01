import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    companyTags: [{ type: String }], // e.g., ['Google', 'Amazon']
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    topics: [{ type: String }], // e.g., ['Arrays', 'Dynamic Programming']
    estimatedTime: { type: Number }, // minutes
    solution: { type: String }, // reference solution code or markdown
    hints: [{ type: String }],
    // Existing fields (if any) can be added later
}, { timestamps: true });

// Indexes for efficient queries
problemSchema.index({ companyTags: 1 });
problemSchema.index({ difficulty: 1 });

// Virtual to check if a specific user has solved this problem
problemSchema.virtual('isSolvedByUser').get(function () {
    // Placeholder – actual implementation will use Submission model
    return false;
});

export default mongoose.model('Problem', problemSchema);
