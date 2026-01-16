import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure a user cannot bookmark the same problem multiple times
bookmarkSchema.index({ user: 1, problem: 1 }, { unique: true });

export default mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);
