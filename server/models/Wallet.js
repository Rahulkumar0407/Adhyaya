import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['topup', 'call_charge', 'doubt_charge', 'interview_charge', 'refund', 'bonus', 'withdrawal', 'subscription'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: String,

    // Reference to related entities
    callId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Call'
    },
    doubtId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doubt'
    },

    // Payment gateway info
    paymentGateway: {
        type: String,
        enum: ['razorpay', 'stripe', 'manual', 'coupon_free']
    },
    gatewayTransactionId: String,
    gatewayOrderId: String,

    // Status
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },

    // Balance after transaction
    balanceAfter: Number
}, {
    timestamps: true
});

const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // Balance (₹100 welcome bonus for new users)
    balance: {
        type: Number,
        default: 0,
        min: 0
    },

    // Currency
    currency: {
        type: String,
        default: 'INR'
    },

    // Transactions
    transactions: [transactionSchema],

    // Stats
    totalSpent: {
        type: Number,
        default: 0
    },
    totalTopups: {
        type: Number,
        default: 0
    },

    // Low balance alert
    lowBalanceThreshold: {
        type: Number,
        default: 50
    },
    lowBalanceAlertEnabled: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index
walletSchema.index({ user: 1 });

// Add funds to wallet
walletSchema.methods.addFunds = async function (amount, paymentDetails) {
    const transaction = {
        type: 'topup',
        amount: amount,
        description: `Added ₹${amount} to wallet`,
        paymentGateway: paymentDetails.gateway,
        gatewayTransactionId: paymentDetails.transactionId,
        gatewayOrderId: paymentDetails.orderId,
        status: 'completed',
        balanceAfter: this.balance + amount
    };

    this.balance += amount;
    this.totalTopups += amount;
    this.transactions.push(transaction);

    await this.save();
    return transaction;
};

// Deduct for call
walletSchema.methods.chargeForCall = async function (amount, callId) {
    if (this.balance < amount) {
        throw new Error('Insufficient balance');
    }

    const transaction = {
        type: 'call_charge',
        amount: -amount,
        description: `Call charge: ₹${amount}`,
        callId: callId,
        status: 'completed',
        balanceAfter: this.balance - amount
    };

    this.balance -= amount;
    this.totalSpent += amount;
    this.transactions.push(transaction);

    await this.save();
    return transaction;
};

// Refund
walletSchema.methods.refund = async function (amount, callId, reason) {
    const transaction = {
        type: 'refund',
        amount: amount,
        description: reason || `Refund: ₹${amount}`,
        callId: callId,
        status: 'completed',
        balanceAfter: this.balance + amount
    };

    this.balance += amount;
    this.transactions.push(transaction);

    await this.save();
    return transaction;
};

// Check if sufficient balance
walletSchema.methods.hasSufficientBalance = function (amount) {
    return this.balance >= amount;
};

// Get recent transactions
walletSchema.methods.getRecentTransactions = function (limit = 10) {
    return this.transactions
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
};

// Deduct for doubt
walletSchema.methods.chargeForDoubt = async function (amount, doubtId) {
    if (this.balance < amount) {
        throw new Error('Insufficient balance');
    }

    const transaction = {
        type: 'doubt_charge',
        amount: -amount,
        description: `Doubt resolution charge: ₹${amount}`,
        doubtId: doubtId,
        status: 'completed',
        balanceAfter: this.balance - amount
    };

    this.balance -= amount;
    this.totalSpent += amount;
    this.transactions.push(transaction);

    await this.save();
    return transaction;
};

// Deduct for AI mock interview
walletSchema.methods.chargeForInterview = async function (amount, interviewType) {
    if (this.balance < amount) {
        throw new Error('Insufficient balance');
    }

    const transaction = {
        type: 'interview_charge',
        amount: -amount,
        description: `AI Mock Interview (${interviewType}): ${amount} points`,
        status: 'completed',
        balanceAfter: this.balance - amount
    };

    this.balance -= amount;
    this.totalSpent += amount;
    this.transactions.push(transaction);

    await this.save();
    return transaction;
};

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;
