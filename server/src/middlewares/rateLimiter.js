import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis.js';

/**
 * Create a rate limiter with optional Redis store
 * Falls back to in-memory store if Redis is unavailable
 */
export const rateLimiter = (options = {}) => {
    const defaultOptions = {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests, please try again later',
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                success: false,
                message: options.message || 'Too many requests, please try again later',
                code: 'RATE_LIMIT_EXCEEDED'
            });
        }
    };

    const config = { ...defaultOptions, ...options };

    // Try to use Redis store, fall back to memory store
    try {
        if (redisClient.isReady) {
            config.store = new RedisStore({
                client: redisClient,
                prefix: 'rl:'
            });
        }
    } catch (error) {
        console.warn('Redis not available for rate limiting, using memory store');
    }

    return rateLimit(config);
};

// Preset rate limiters
export const authLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many authentication attempts, please try again later'
});

export const apiLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100
});

export const strictLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many requests, please try again in 15 minutes'
});
