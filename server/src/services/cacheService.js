import redisClient from '../config/redis.js';

class CacheService {
    /**
     * Check if Redis is connected
     */
    static isConnected() {
        try {
            return redisClient && redisClient.isOpen;
        } catch {
            return false;
        }
    }

    /**
     * Get value from cache
     */
    static async get(key) {
        try {
            if (!this.isConnected()) return null;
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Cache get error:', error.message);
            return null;
        }
    }

    /**
     * Set value in cache with expiration
     */
    static async set(key, value, expirationInSeconds = 3600) {
        try {
            if (!this.isConnected()) return;
            await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
        } catch (error) {
            console.warn('Cache set error:', error.message);
        }
    }

    /**
     * Delete from cache
     */
    static async delete(key) {
        try {
            if (!this.isConnected()) return;
            await redisClient.del(key);
        } catch (error) {
            console.warn('Cache delete error:', error.message);
        }
    }

    /**
     * Delete keys by pattern (e.g., 'leaderboard:*')
     */
    static async deleteByPattern(pattern) {
        try {
            if (!this.isConnected()) return;
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
        } catch (error) {
            console.warn('Cache deleteByPattern error:', error.message);
        }
    }
}

export default CacheService;
