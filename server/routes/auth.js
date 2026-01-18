import express from 'express';
import passport from 'passport';
import User from '../models/User.js';
import { generateTokens, verifyRefreshToken } from '../middleware/auth.js';
import admin from '../config/firebase.js';

const router = express.Router();

// @route   POST /api/auth/check-provider
// @desc    Check if email exists and return provider type
// @access  Public
router.post('/check-provider', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ provider: 'none', exists: false });
        }

        if (user.googleId) {
            return res.json({ provider: 'google', exists: true });
        }

        if (user.firebaseUid) {
            return res.json({ provider: 'email', exists: true });
        }

        // Legacy email users (if any)
        return res.json({ provider: 'legacy_email', exists: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/auth/firebase-login
// @desc    Login/Register using Firebase Token
// @access  Public
router.post('/firebase-login', async (req, res) => {
    try {
        const { idToken, name } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, message: 'ID Token is required' });
        }

        // Verify Firebase Token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, picture } = decodedToken;

        // Find or Create User
        let user = await User.findOne({ email });

        if (user) {
            // If user exists but has different provider info, update it?
            // If it's a Google user trying to login via password (should be blocked by UI, but safety check)
            if (user.googleId) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is linked to a Google account. Please use Google Sign-In.'
                });
            }

            // Check if user is banned
            if (user.isActive === false) {
                return res.status(403).json({
                    success: false,
                    message: user.banReason ? `Account deactivated: ${user.banReason}` : 'Account is deactivated. Please contact support.'
                });
            }

            // If legacy user, link firebaseUid?
            if (!user.firebaseUid) {
                user.firebaseUid = uid;
                await user.save();
            }
        } else {
            // Create new user
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                firebaseUid: uid,
                avatar: picture || '',
                isActive: true
            });
        }

        // Update streak
        user.updateStreak();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar,
                    streakCount: user.streakCount,
                    longestStreak: user.longestStreak,
                    babuaCoins: user.babuaCoins,
                    currentPod: user.currentPod
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Firebase Auth Error:', error);
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
});

// @route   POST /api/auth/register
// @desc    Register a new user (Legacy/Fallback)// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            name
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    streakCount: user.streakCount,
                    babuaCoins: user.babuaCoins
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user with password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is banned
        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: user.banReason ? `Account deactivated: ${user.banReason}` : 'Account is deactivated. Please contact support.'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update streak
        user.updateStreak();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar,
                    streakCount: user.streakCount,
                    longestStreak: user.longestStreak,
                    babuaCoins: user.babuaCoins,
                    currentPod: user.currentPod
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        // Verify token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user._id);

        // Save new refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.json({
            success: true,
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
import { protect } from '../middleware/auth.js';

router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('currentPod', 'name members')
            .populate('patternProgress.pattern', 'name slug category');

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, async (req, res) => {
    try {
        // Clear refresh token
        await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/change-password
// @desc    Change user password (only if admin granted permission)
// @access  Private
import bcrypt from 'bcryptjs';

router.post('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        // Get user with password and check permission
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has permission to change password
        if (!user.canChangePassword) {
            return res.status(403).json({
                success: false,
                message: 'Password change is not enabled for your account. Please contact admin.'
            });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        // Revoke permission after successful change (one-time use)
        user.canChangePassword = false;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        if (err) {
            console.error('Google Auth Error:', err);
            // Handle specific errors
            let errorMsg = 'auth_failed';
            if (err.message) errorMsg = encodeURIComponent(err.message);
            return res.redirect(`${frontendUrl}/login?error=${errorMsg}`);
        }

        if (!user) {
            return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
        }

        // Check if user is banned
        if (user.isActive === false) {
            const banReason = user.banReason ? encodeURIComponent(`Account deactivated: ${user.banReason}`) : 'Account_deactivated';
            return res.redirect(`${frontendUrl}/login?error=${banReason}`);
        }

        try {
            // Update streak
            user.updateStreak();

            // Generate tokens
            const { accessToken, refreshToken } = generateTokens(user._id);

            user.refreshToken = refreshToken;
            await user.save();

            // Redirect to frontend with tokens
            res.redirect(`${frontendUrl}/auth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
        } catch (error) {
            console.error('Token generation error:', error);
            res.redirect(`${frontendUrl}/login?error=token_generation_failed`);
        }
    })(req, res, next);
});

export default router;
