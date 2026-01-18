import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 5) {
                console.log('Redis: Max retries exceeded, giving up.');
                return new Error('Redis connection failed');
            }
            return Math.min(retries * 50, 1000);
        }
    }
});

redisClient.on('error', (err) => {
    // Suppress ENOTFOUND errors to avoid log spam if env is bad
    if (err.code === 'ENOTFOUND') return;
    console.error('Redis Client Error', err.message);
});

redisClient.on('connect', () => console.log('Redis Client Connected'));

try {
    await redisClient.connect();
} catch (err) {
    console.log('Redis connection failed. Running without cache.');
}

export default redisClient;
