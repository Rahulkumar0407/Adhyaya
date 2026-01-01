import express from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';
import {
    registerSchema,
    loginSchema,
    googleAuthSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from '../validators/authValidator.js';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: 'Too many auth attempts, please try again later'
});

// Public routes
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/google', authLimiter, validate(googleAuthSchema), authController.googleAuth);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);

// Protected routes
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);
router.post('/logout-all', protect, authController.logoutAll);

// Google OAuth Redirect Routes (Passport flow)
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_auth_failed' }),
    (req, res) => {
        // Generate JWT tokens for the authenticated user
        const accessToken = jwt.sign(
            { id: req.user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '15m' }
        );
        const refreshToken = jwt.sign(
            { id: req.user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
        );

        // Redirect to frontend with tokens
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/auth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
);

export default router;
