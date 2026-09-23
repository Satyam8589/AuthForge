import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
    url: redisUrl,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 5) {
                return new Error("Max retries reached");
            }
            return Math.min(retries * 200, 1000);
        }
    }
});

redisClient.on('error', (err) => {
    if (!redisClient.isOpen) {
    } else {
        return err;
    }
});

redisClient.on('connect', () => { });

redisClient.connect().catch(err => console.error('Redis Connection Error:', err));

export default redisClient;