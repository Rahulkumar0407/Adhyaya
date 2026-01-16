/**
 * Admin User Seed Script
 * Creates a super admin user for the God Mode Admin Dashboard
 * 
 * Run with: node seeds/adminUser.js (from server directory)
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
config({ path: join(__dirname, '..', '.env') });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/adhyaya';

// Admin user details
const ADMIN_USER = {
    email: 'admin@adhyaya.com',
    password: 'Admin@123', // Will be hashed
    name: 'Super Admin',
    role: 'admin',
    isActive: true,
    avatar: '',
    xpPoints: 0,
    level: 99,
    streakCount: 0,
    problemsSolved: 0,
    babuaCoins: 10000, // Give some coins for testing
    revisionMode: 'adaptive'
};

// User Schema (simplified for seeding)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
    xpPoints: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streakCount: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    problemsSolved: { type: Number, default: 0 },
    babuaCoins: { type: Number, default: 0 },
    revisionMode: { type: String, enum: ['adaptive', 'manual', 'unset'], default: 'unset' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: ADMIN_USER.email });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Role: ${existingAdmin.role}`);

            // Update to admin role if not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Updated user role to admin');
            }
        } else {
            // Hash password
            const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 12);

            // Create new admin user
            const adminUser = new User({
                ...ADMIN_USER,
                password: hashedPassword
            });

            await adminUser.save();

            console.log('');
            console.log('🎉 Admin user created successfully!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`   📧 Email:    ${ADMIN_USER.email}`);
            console.log(`   🔑 Password: ${ADMIN_USER.password}`);
            console.log(`   👤 Name:     ${ADMIN_USER.name}`);
            console.log(`   🛡️  Role:     ${ADMIN_USER.role}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('');
            console.log('🚀 Login at: http://localhost:5173/login');
            console.log('📊 Dashboard: http://localhost:5173/admin');
        }

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('');
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the script
createAdminUser();
