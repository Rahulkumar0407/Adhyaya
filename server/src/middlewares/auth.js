import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

// Generate Access & Refresh Tokens
export const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    const refreshToken = jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    return { accessToken, refreshToken };
};

// Verify Refresh Token
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

// Protect Route Middleware
export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized - no token provided',
                code: 'NO_TOKEN'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account has been deactivated',
                    code: 'ACCOUNT_DEACTIVATED'
                });
            }

            req.user = user;
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired',
                    code: 'TOKEN_EXPIRED'
                });
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token',
                    code: 'INVALID_TOKEN'
                });
            }
            throw err;
        }
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Not authorized'
        });
    }
};

// Role-based authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this resource`,
                code: 'FORBIDDEN'
            });
        }
        next();
    };
};

// Permission-based authorization
export const requirePermission = (...permissions) => {
    return (req, res, next) => {
        const hasPermission = permissions.some(p => req.user.hasPermission(p));

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action',
                code: 'PERMISSION_DENIED'
            });
        }
        next();
    };
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        }

        next();
    } catch (error) {
        // Token invalid or expired, continue without user
        next();
    }
};

// Verify email is verified
export const requireEmailVerified = (req, res, next) => {
    if (!req.user.isEmailVerified && req.user.authProvider === 'local') {
        return res.status(403).json({
            success: false,
            message: 'Please verify your email to access this resource',
            code: 'EMAIL_NOT_VERIFIED'
        });
    }
    next();
};
