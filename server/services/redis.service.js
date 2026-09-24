import redisClient from "../config/redis.js";

export const blacklistToken = async (token, expiryInSeconds) => {
    try {
        await redisClient.set(`bl_${token}`, 'true', {
            EX: expiryInSeconds
        });
    } catch (error) {
        console.error("Redis Blacklist Error:", error);
    }
};

export const isTokenBlacklisted = async (token) => {
    try {
        const result = await redisClient.get(`bl_${token}`);
        return result === 'true';
    } catch (error) {
        console.error("Redis Check Error:", error);
        return false;
    }
};
