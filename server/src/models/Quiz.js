import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    questions: [{
        questionText: { type: String, required: true },
        options: [{ type: String }],
        correctOption: { type: String },
        explanation: { type: String }
    }],
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: false }
}, { timestamps: true });

quizSchema.index({ course: 1 });
quizSchema.index({ module: 1 });

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
