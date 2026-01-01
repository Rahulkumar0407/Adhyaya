import redisClient from '../config/redis.js';

class CacheService {
    /**
     * Get value from cache
     */
    static async get(key) {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Set value in cache with expiration
     */
    static async set(key, value, expirationInSeconds = 3600) {
        await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
    }

    /**
     * Delete from cache
     */
    static async delete(key) {
        await redisClient.del(key);
    }

    /**
     * Delete keys by pattern (e.g., 'leaderboard:*')
     */
    static async deleteByPattern(pattern) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    }
}

export default CacheService;
