import User from '../../models/User.js';
import { generateTokens, verifyRefreshToken } from '../middlewares/auth.js';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
    /**
     * Register a new user with email/password
     */
    async register({ email, password, name }) {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw { status: 400, message: 'User already exists with this email' };
        }

        // Create user
        const user = await User.create({
            email,
            password,
            name,
            authProvider: 'local',
            isEmailVerified: false,
            emailVerificationToken: crypto.randomBytes(32).toString('hex'),
            emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        // Generate tokens
        const tokens = generateTokens(user._id);

        // Create session
        user.createSession('web', null, null, tokens.refreshToken);
        await user.save();

        return {
            user: this._sanitizeUser(user),
            ...tokens
        };
    }

    /**
     * Login with email/password
     */
    async login({ email, password, deviceInfo, ipAddress, userAgent }) {
        // Find user with password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            throw { status: 401, message: 'Invalid credentials' };
        }

        if (user.authProvider !== 'local') {
            throw { status: 401, message: 'Please login with Google' };
        }

        if (!user.isActive) {
            throw { status: 401, message: 'Account has been deactivated' };
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw { status: 401, message: 'Invalid credentials' };
        }

        // Update streak
        user.updateStreak();

        // Generate tokens
        const tokens = generateTokens(user._id);

        // Create session
        user.createSession(deviceInfo, ipAddress, userAgent, tokens.refreshToken);
        await user.save();

        return {
            user: this._sanitizeUser(user),
            ...tokens
        };
    }

    /**
     * Authenticate with Google ID token
     */
    async googleAuth({ idToken, deviceInfo, ipAddress, userAgent }) {
        // Verify the ID token
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        // Validate required fields
        if (!payload.email_verified) {
            throw { status: 401, message: 'Google email not verified' };
        }

        const { sub: googleId, email, name, picture } = payload;

        // Find or create user
        let user = await User.findOne({ googleId });

        if (!user) {
            // Check if email exists (link accounts)
            user = await User.findOne({ email });

            if (user) {
                // Link Google account to existing user
                user.googleId = googleId;
                user.avatar = user.avatar || picture;
                user.isEmailVerified = true; // Google verified
            } else {
                // Create new user
                user = new User({
                    googleId,
                    email,
                    name: name || 'User',
                    avatar: picture,
                    authProvider: 'google',
                    isEmailVerified: true
                });
            }
        }

        // Update streak
        user.updateStreak();

        // Generate tokens
        const tokens = generateTokens(user._id);

        // Create session
        user.createSession(deviceInfo, ipAddress, userAgent, tokens.refreshToken);
        await user.save();

        return {
            user: this._sanitizeUser(user),
            ...tokens,
            isNewUser: !user.createdAt || (Date.now() - user.createdAt < 60000)
        };
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken) {
        // Verify token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user with sessions
        const user = await User.findById(decoded.id).select('+sessions.refreshToken');

        if (!user) {
            throw { status: 401, message: 'Invalid refresh token' };
        }

        // Find the session with this refresh token
        const session = user.sessions.find(
            s => s.refreshToken === refreshToken && s.isActive
        );

        if (!session) {
            // Token reuse detected - invalidate all sessions
            user.invalidateAllSessions();
            await user.save();
            throw { status: 401, message: 'Invalid refresh token - please login again' };
        }

        // Generate new tokens (rotation)
        const tokens = generateTokens(user._id);

        // Update session with new refresh token
        session.refreshToken = tokens.refreshToken;
        session.lastActive = new Date();
        await user.save();

        return tokens;
    }

    /**
     * Logout user
     */
    async logout(userId, refreshToken) {
        const user = await User.findById(userId).select('+sessions.refreshToken');

        if (user) {
            // Find and invalidate the session
            const session = user.sessions.find(s => s.refreshToken === refreshToken);
            if (session) {
                user.invalidateSession(session._id);
                await user.save();
            }
        }

        return { message: 'Logged out successfully' };
    }

    /**
     * Logout from all devices
     */
    async logoutAll(userId) {
        const user = await User.findById(userId);

        if (user) {
            user.invalidateAllSessions();
            await user.save();
        }

        return { message: 'Logged out from all devices' };
    }

    /**
     * Get current user
     */
    async getCurrentUser(userId) {
        const user = await User.findById(userId)
            .populate('currentPod', 'name members')
            .populate('patternProgress.pattern', 'name slug category');

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        return this._sanitizeUser(user);
    }

    /**
     * Request password reset
     */
    async forgotPassword(email) {
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists
            return { message: 'If an account exists, a reset email will be sent' };
        }

        if (user.authProvider !== 'local') {
            throw { status: 400, message: 'This account uses Google login' };
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

        await user.save();

        // TODO: Send email with reset link
        // await emailService.sendPasswordResetEmail(user.email, resetToken);

        return {
            message: 'If an account exists, a reset email will be sent',
            // Only for development
            ...(process.env.NODE_ENV === 'development' && { resetToken })
        };
    }

    /**
     * Reset password with token
     */
    async resetPassword(token, newPassword) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw { status: 400, message: 'Invalid or expired reset token' };
        }

        // Update password
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        // Invalidate all sessions for security
        user.invalidateAllSessions();

        await user.save();

        return { message: 'Password reset successful' };
    }

    /**
     * Verify email
     */
    async verifyEmail(token) {
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw { status: 400, message: 'Invalid or expired verification token' };
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        return { message: 'Email verified successfully' };
    }

    /**
     * Sanitize user object for response
     */
    _sanitizeUser(user) {
        const userObj = user.toObject ? user.toObject() : user;
        const {
            password,
            refreshToken,
            sessions,
            emailVerificationToken,
            passwordResetToken,
            ...safeUser
        } = userObj;
        return safeUser;
    }
}

export default new AuthService();
