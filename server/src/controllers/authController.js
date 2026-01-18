import authService from '../services/authService.js';

class AuthController {
    /**
     * @route   POST /api/auth/register
     * @desc    Register a new user
     * @access  Public
     */
    async register(req, res, next) {
        try {
            const { email, password, name, username } = req.body;
            const result = await authService.register({ email, password, name, username });

            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   POST /api/auth/login
     * @desc    Login with email/password
     * @access  Public
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const deviceInfo = req.headers['x-device-info'] || 'web';
            const ipAddress = req.ip;
            const userAgent = req.headers['user-agent'];

            const result = await authService.login({
                email,
                password,
                deviceInfo,
                ipAddress,
                userAgent
            });

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   POST /api/auth/google
     * @desc    Authenticate with Google ID token
     * @access  Public
     */
    async googleAuth(req, res, next) {
        try {
            const { idToken } = req.body;
            const deviceInfo = req.headers['x-device-info'] || 'web';
            const ipAddress = req.ip;
            const userAgent = req.headers['user-agent'];

            const result = await authService.googleAuth({
                idToken,
                deviceInfo,
                ipAddress,
                userAgent
            });

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   POST /api/auth/refresh
     * @desc    Refresh access token
     * @access  Public
     */
    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refreshToken(refreshToken);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   POST /api/auth/logout
     * @desc    Logout user
     * @access  Private
     */
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await authService.logout(req.user._id, refreshToken);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   POST /api/auth/logout-all
     * @desc    Logout from all devices
     * @access  Private
     */
    async logoutAll(req, res, next) {
        try {
            const result = await authService.logoutAll(req.user._id);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/auth/me
     * @desc    Get current user
     * @access  Private
     */
    async getMe(req, res, next) {
        try {
            const user = await authService.getCurrentUser(req.user._id);

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   POST /api/auth/forgot-password
     * @desc    Request password reset
     * @access  Public
     */
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   POST /api/auth/reset-password
     * @desc    Reset password with token
     * @access  Public
     */
    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;
            const result = await authService.resetPassword(token, password);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   POST /api/auth/verify-email
     * @desc    Verify email with token
     * @access  Public
     */
    async verifyEmail(req, res, next) {
        try {
            const { token } = req.body;
            const result = await authService.verifyEmail(token);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
