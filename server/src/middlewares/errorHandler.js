/**
 * Error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
            code: 'DUPLICATE_KEY'
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format',
            code: 'INVALID_ID'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            code: 'INVALID_TOKEN'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
            code: 'TOKEN_EXPIRED'
        });
    }

    // Custom error with status
    if (err.status) {
        return res.status(err.status).json({
            success: false,
            message: err.message,
            ...(err.code && { code: err.code }),
            ...(process.env.NODE_ENV === 'development' && err.stack && { stack: err.stack })
        });
    }

    // Default error
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * 404 handler
 */
export const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        code: 'NOT_FOUND'
    });
};
