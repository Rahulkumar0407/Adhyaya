import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/babua-lms');
        console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        // Don't exit in development - allow server to start anyway
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

export default connectDB;
