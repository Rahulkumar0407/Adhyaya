/**
 * Quick Admin Setup Script
 * Promotes an existing user to admin role
 * 
 * Usage: node seeds/promoteAdmin.js <email>
 * Example: node seeds/promoteAdmin.js rahul@example.com
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/adhyaya';

// Get email from command line
const targetEmail = process.argv[2];

if (!targetEmail) {
    console.log('');
    console.log('❌ Please provide an email address');
    console.log('');
    console.log('Usage: node seeds/promoteAdmin.js <email>');
    console.log('Example: node seeds/promoteAdmin.js rahul@example.com');
    console.log('');
    process.exit(1);
}

async function promoteToAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Direct database update
        const result = await mongoose.connection.db.collection('users').findOneAndUpdate(
            { email: targetEmail.toLowerCase() },
            { $set: { role: 'admin' } },
            { returnDocument: 'after' }
        );

        if (result) {
            console.log('');
            console.log('🎉 SUCCESS! User promoted to Admin');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`   📧 Email: ${result.email}`);
            console.log(`   👤 Name:  ${result.name}`);
            console.log(`   🛡️  Role:  ${result.role}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('');
            console.log('🚀 Now login at: http://localhost:5173/login');
            console.log('📊 Admin Dashboard: http://localhost:5173/admin');
        } else {
            console.log('');
            console.log(`❌ User not found with email: ${targetEmail}`);
            console.log('   Make sure the email is correct and the user exists.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('');
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

promoteToAdmin();
