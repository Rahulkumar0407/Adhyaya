import express from 'express';
import crypto from 'crypto';
import Wallet from '../models/Wallet.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get wallet balance
router.get('/', protect, async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ user: req.user._id });

        // Create wallet if doesn't exist
        if (!wallet) {
            wallet = new Wallet({ user: req.user._id });
            await wallet.save();
        }

        res.json({
            success: true,
            data: {
                balance: wallet.balance,
                currency: wallet.currency,
                totalSpent: wallet.totalSpent,
                totalTopups: wallet.totalTopups
            }
        });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching wallet'
        });
    }
});

// Get transaction history
router.get('/transactions', protect, async (req, res) => {
    try {
        const { page = 1, limit = 20, type } = req.query;

        const wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) {
            return res.json({
                success: true,
                data: [],
                pagination: { total: 0 }
            });
        }

        let transactions = wallet.transactions;

        // Filter by type if specified
        if (type) {
            transactions = transactions.filter(t => t.type === type);
        }

        // Sort by newest first
        transactions.sort((a, b) => b.createdAt - a.createdAt);

        // Paginate
        const total = transactions.length;
        const start = (parseInt(page) - 1) * parseInt(limit);
        transactions = transactions.slice(start, start + parseInt(limit));

        res.json({
            success: true,
            data: transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transactions'
        });
    }
});

// Create Razorpay order for top-up
router.post('/topup/create-order', protect, async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount < 50) {
            return res.status(400).json({
                success: false,
                message: 'Minimum top-up amount is ₹50'
            });
        }

        if (amount > 10000) {
            return res.status(400).json({
                success: false,
                message: 'Maximum top-up amount is ₹10,000'
            });
        }

        // For now, create a mock order ID
        // In production, integrate with Razorpay SDK
        const orderId = `order_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

        res.json({
            success: true,
            data: {
                orderId,
                amount: amount * 100, // Razorpay expects paise
                currency: 'INR',
                key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment order'
        });
    }
});

// Verify and complete top-up
router.post('/topup/verify', protect, async (req, res) => {
    try {
        const { orderId, paymentId, signature, amount } = req.body;

        // In production, verify signature with Razorpay
        // const expectedSignature = crypto
        //     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        //     .update(orderId + '|' + paymentId)
        //     .digest('hex');
        // if (expectedSignature !== signature) { throw new Error('Invalid signature'); }

        // Find or create wallet
        let wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) {
            wallet = new Wallet({ user: req.user._id });
        }

        // Add funds
        await wallet.addFunds(amount, {
            gateway: 'razorpay',
            transactionId: paymentId,
            orderId: orderId
        });

        res.json({
            success: true,
            message: `₹${amount} added to wallet successfully`,
            data: {
                newBalance: wallet.balance
            }
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payment'
        });
    }
});

// Manual top-up for testing (development only)
router.post('/topup/test', protect, async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                success: false,
                message: 'Test top-up not allowed in production'
            });
        }

        const { amount = 500 } = req.body;

        let wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) {
            wallet = new Wallet({ user: req.user._id });
        }

        await wallet.addFunds(amount, {
            gateway: 'manual',
            transactionId: `test_${Date.now()}`,
            orderId: `test_order_${Date.now()}`
        });

        res.json({
            success: true,
            message: `Test: ₹${amount} added to wallet`,
            data: {
                newBalance: wallet.balance
            }
        });
    } catch (error) {
        console.error('Error in test top-up:', error);
        res.status(500).json({
            success: false,
            message: 'Error in test top-up'
        });
    }
});

// Charge for AI Mock Interview (100 points)
router.post('/interview/charge', protect, async (req, res) => {
    try {
        const { interviewType } = req.body;
        const INTERVIEW_COST = 100; // 100 babua points

        // Find or create wallet
        let wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) {
            wallet = new Wallet({ user: req.user._id });
            await wallet.save();
        }

        // Check balance
        if (!wallet.hasSufficientBalance(INTERVIEW_COST)) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance. You need 100 babua points to start an AI interview.',
                required: INTERVIEW_COST,
                currentBalance: wallet.balance
            });
        }

        // Charge for interview
        await wallet.chargeForInterview(INTERVIEW_COST, interviewType || 'General');

        res.json({
            success: true,
            message: 'Interview session started',
            data: {
                charged: INTERVIEW_COST,
                newBalance: wallet.balance
            }
        });
    } catch (error) {
        console.error('Error charging for interview:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error processing interview charge'
        });
    }
});

export default router;
