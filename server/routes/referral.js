import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import crypto from 'crypto';

const router = express.Router();

// Generate a random 6-character alphanumeric code
const generateReferralCode = async () => {
    let code;
    let isUnique = false;
    while (!isUnique) {
        code = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
        const existingUser = await User.findOne({ referralCode: code });
        if (!existingUser) isUnique = true;
    }
    return code;
};

// @route   GET /api/referral
// @desc    Get user's referral code and stats (Generate if missing)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let user = await User.findById(req.user._id);

        if (!user.referralCode) {
            user.referralCode = await generateReferralCode();
            await user.save();
        }

        res.json({
            success: true,
            data: {
                referralCode: user.referralCode,
                referralCount: user.referralCount || 0,
                referralClaimed: user.referralClaimed || false,
                totalEarned: (user.referralCount || 0) * 100 // 100 pts per referral
            }
        });
    } catch (error) {
        console.error('Error fetching referral stats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/referral/claim
// @desc    Claim a referral code
// @access  Private
router.post('/claim', protect, async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user._id;

        if (!code) {
            return res.status(400).json({ success: false, message: 'Please provide a referral code' });
        }

        const user = await User.findById(userId);

        if (user.referralClaimed) {
            return res.status(400).json({ success: false, message: 'You have already claimed a referral reward.' });
        }

        if (user.referralCode === code.toUpperCase()) {
            return res.status(400).json({ success: false, message: 'You cannot use your own referral code.' });
        }

        const referrer = await User.findOne({ referralCode: code.toUpperCase() });

        if (!referrer) {
            return res.status(404).json({ success: false, message: 'Invalid referral code.' });
        }

        // Award points to current user (Claimer)
        user.referralClaimed = true;
        user.referredBy = referrer._id;
        user.babuaCoins = (user.babuaCoins || 0) + 100;
        await user.save();

        // Award points to referrer
        referrer.referralCount = (referrer.referralCount || 0) + 1;
        referrer.babuaCoins = (referrer.babuaCoins || 0) + 100;
        await referrer.save();

        res.json({
            success: true,
            message: 'Referral claimed successfully! You earned 100 Babua Points.',
            data: {
                newBalance: user.babuaCoins
            }
        });

    } catch (error) {
        console.error('Error claiming referral:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

export default router;
