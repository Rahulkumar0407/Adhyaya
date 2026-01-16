// Script to add points to user wallet
import mongoose from 'mongoose';
import User from './models/User.js';
import Wallet from './models/Wallet.js';

const MONGODB_URI = 'mongodb+srv://nexagen0_db_user:nexa007@cluster0.n9xpzxe.mongodb.net/?appName=Cluster0';

async function addPointsToUser(email, points) {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found: ${email}`);
            return;
        }
        console.log(`Found user: ${user.name} (${user.email})`);

        // Find or create wallet
        let wallet = await Wallet.findOne({ user: user._id });
        if (!wallet) {
            wallet = new Wallet({ user: user._id });
            console.log('Created new wallet for user');
        }

        const oldBalance = wallet.balance;

        // Add bonus points
        wallet.balance += points;
        wallet.transactions.push({
            type: 'bonus',
            amount: points,
            description: `Admin bonus: ${points} points added`,
            status: 'completed',
            balanceAfter: wallet.balance
        });

        await wallet.save();
        console.log(`\n✅ Success!`);
        console.log(`   Old Balance: ${oldBalance} points`);
        console.log(`   Added: ${points} points`);
        console.log(`   New Balance: ${wallet.balance} points`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the script
addPointsToUser('rahulbornking@gmail.com', 1000);
