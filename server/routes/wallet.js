import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

import { checkGlobalLimit } from '../middleware/checkLimit.js';

const router = express.Router();

// ... (existing code)

// Charge for AI Mock Interview (100 points)
// router.post('/interview/charge'... moved to correct location below

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

// Check coupon validity
router.post('/check-coupon', protect, async (req, res) => {
    try {
        const { code, amount } = req.body;

        if (!code || !amount) {
            return res.status(400).json({ success: false, message: 'Code and amount are required' });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid coupon code' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ success: false, message: 'Coupon is inactive' });
        }

        if (!coupon.isValid()) {
            return res.status(400).json({ success: false, message: 'Coupon expired or limit reached' });
        }

        if (amount < coupon.minPurchase) {
            return res.status(400).json({
                success: false,
                message: `Minimum purchase amount is ₹${coupon.minPurchase}`
            });
        }

        // Check per-user limit
        const userUsage = coupon.usedBy.filter(u => u.user.toString() === req.user._id.toString()).length;
        if (userUsage >= coupon.perUserLimit) {
            return res.status(400).json({ success: false, message: 'You have already used this coupon' });
        }

        const discount = coupon.calculateDiscount(amount);

        res.json({
            success: true,
            data: {
                code: coupon.code,
                discount,
                finalAmount: amount - discount,
                type: coupon.discountType,
                value: coupon.discountValue
            }
        });

    } catch (error) {
        console.error('Check coupon error:', error);
        res.status(500).json({ success: false, message: 'Error checking coupon' });
    }
});

// Create Razorpay order for top-up
router.post('/topup/create-order', protect, async (req, res) => {
    try {
        const { amount, couponCode } = req.body;

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

        // Calculate payable amount with coupon
        let payableAmount = amount;
        let discount = 0;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (coupon && coupon.isValid()) {
                // Check user limit
                const userUsage = coupon.usedBy.filter(u => u.user.toString() === req.user._id.toString()).length;
                if (userUsage < coupon.perUserLimit && amount >= coupon.minPurchase) {
                    discount = coupon.calculateDiscount(amount);
                    payableAmount = amount - discount;
                }
            }
        }

        // If payable amount is <= 0 (100% discount), process immediately
        if (payableAmount <= 0) {
            let wallet = await Wallet.findOne({ user: req.user._id });
            if (!wallet) {
                wallet = new Wallet({ user: req.user._id });
            }

            // Add funds (Original Amount)
            await wallet.addFunds(amount, {
                gateway: 'coupon_free',
                transactionId: `free_${Date.now()}`,
                orderId: `free_order_${Date.now()}`
            });

            // Mark coupon as used
            if (couponCode) {
                const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
                if (coupon) {
                    coupon.usedCount += 1;
                    coupon.usedBy.push({
                        user: req.user._id,
                        orderId: wallet.transactions[wallet.transactions.length - 1]._id
                    });
                    await coupon.save();
                }
            }

            return res.json({
                success: true,
                message: `₹${amount} added to wallet successfully (100% Discount)`,
                data: {
                    instantSuccess: true,
                    newBalance: wallet.balance
                }
            });
        }

        // For now, create a mock order ID
        // In production, integrate with Razorpay SDK
        const orderId = `order_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
        // Store coupon info in notes (mocking Razorpay notes behavior)
        // In real SDK: notes: { couponCode, originalAmount: amount }

        res.json({
            success: true,
            data: {
                orderId,
                amount: payableAmount * 100, // Payable amount in paise
                originalAmount: amount, // Credit amount
                couponCode: couponCode || null,
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
        const { orderId, paymentId, signature, amount, couponCode } = req.body;
        // Note: 'amount' here should be the ORIGINAL credit amount requested by user, passed from frontend.
        // In a real app, rely on server-side stored order details to prevent tampering.

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

        // Add funds (Original Amount)
        await wallet.addFunds(amount, {
            gateway: 'razorpay',
            transactionId: paymentId,
            orderId: orderId
        });

        // Handle Coupon Usage
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (coupon) {
                // Mark as used
                coupon.usedCount += 1;
                coupon.usedBy.push({
                    user: req.user._id,
                    orderId: wallet.transactions[wallet.transactions.length - 1]._id // Link to transaction
                });
                await coupon.save();

                // Optionally log the discount transaction?
                // Wallet schema handles 'topup', simpler to just log the topup amount.
                // Or maybe log a separate internal transaction for record keeping?
                // For now, we credited the full amount, user paid less. Balance is correct.
            }
        }

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
router.post('/interview/charge', protect, checkGlobalLimit('mockInterview'), async (req, res) => {
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


// Unlock premium feature using wallet balance
router.post('/unlock-feature', protect, async (req, res) => {
    try {
        const { feature } = req.body;
        const COST_MAP = {
            'adaptiveRevision': 60,
            'mentorCircle': 60
        };

        const cost = COST_MAP[feature];
        if (!cost) {
            return res.status(400).json({ success: false, message: 'Invalid feature specified' });
        }

        let wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) {
            wallet = new Wallet({ user: req.user._id });
            await wallet.save();
        }

        if (wallet.balance < cost) {
            return res.status(400).json({ success: false, message: `Insufficient balance. Required: ₹${cost}, Available: ₹${wallet.balance}` });
        }

        // Deduct balance and add transaction
        wallet.balance -= cost;
        wallet.transactions.push({
            type: 'withdrawal', // Using withdrawal or a new type 'purchase' if schema allows. Schema has 'withdrawal', 'call_charge' etc.
            // Let's use 'withdrawal' or generic logic if strict validation exists.
            // Schema has enum: ['topup', 'call_charge', 'doubt_charge', 'interview_charge', 'refund', 'bonus', 'withdrawal']
            // 'withdrawal' implies taking money OUT off platform. 'call_charge' is internal.
            // I should stick to 'call_charge' or maybe I should check if I can add 'feature_unlock' to schema?
            // User schema update is expensive. I'll use 'withdrawal' or 'doubt_charge' as fallback, or just 'call_charge' with description.
            // Actually, I'll use 'doubt_charge' as it is a service charge. Or better, I should check schema again.
            // Schema: ['topup', 'call_charge', 'doubt_charge', 'interview_charge', 'refund', 'bonus', 'withdrawal']
            // I'll use 'withdrawal' for now as it reduces balance. Or 'call_charge'.
            // Let's use 'call_charge' but description "Feature Unlock".
            type: 'call_charge',
            amount: cost,
            description: `Unlocked ${feature}`,
            status: 'completed',
            balanceAfter: wallet.balance
        });

        await wallet.save();

        // Update User Subscription
        const userDoc = await User.findById(req.user._id);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

        if (feature === 'adaptiveRevision') {
            userDoc.adaptiveRevisionSubscription = {
                plan: 'premium',
                lecturesUsed: 0,
                maxFreeLectures: 9999,
                subscribedAt: new Date(),
                expiresAt: expiresAt,
                paymentId: 'wallet_' + Date.now()
            };
        } else if (feature === 'mentorCircle') {
            userDoc.mentorCircleSubscription = {
                plan: 'premium',
                subscribedAt: new Date(),
                expiresAt: expiresAt,
                paymentId: 'wallet_' + Date.now()
            };

            // Create Notification
            await Notification.create({
                user: req.user._id,
                title: 'Mentor Circle Unlocked! 🎉',
                message: 'Welcome to the exclusive Mentor Circle! You will be added to the private mentor group shortly. Check your email for the invitation link.',
                type: 'success',
                link: '/mentor-circle'
            });

            // Update user's mentor circle status
            await userDoc.save();

            return res.json({
                success: true,
                message: 'Mentor Circle unlocked! You will be added to the mentor group shortly. Please check your email.',
                newBalance: wallet.balance
            });
        }

        await userDoc.save();

        res.json({ success: true, message: `${feature} unlocked successfully!`, newBalance: wallet.balance });

    } catch (error) {
        console.error('Wallet unlock error:', error);
        res.status(500).json({ success: false, message: 'Transaction failed' });
    }
});

export default router;
