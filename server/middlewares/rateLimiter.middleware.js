import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../config/redis.js";

const shouldSkip = () => process.env.SKIP_RATE_LIMIT === "true";

const getStore = (prefix) => {
    if (redisClient && redisClient.isOpen) {
        return new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix: `rl:${prefix}:`
        });
    }
    return undefined; // fallback to default MemoryStore
};

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    skip: shouldSkip,
    message: "Too many requests from this IP, please try again after 15 minutes",
    store: getStore("general"),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many requests from this IP, please try again after 15 minutes"
        });
    }
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skip: shouldSkip,
    message: "Too many authentication attempts, please try again after 15 minutes",
    store: getStore("auth"),
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many authentication attempts from this IP, please try again after 15 minutes"
        });
    }
});

export const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    skip: shouldSkip,
    message: "Too many login attempts, please try again after an hour",
    store: getStore("login"),
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many login attempts from this IP, please try again after an hour"
        });
    }
});

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    skip: shouldSkip,
    message: "Too many registration attempts, please try again after an hour",
    store: getStore("register"),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many registration attempts from this IP, please try again after an hour"
        });
    }
});

export const logoutLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    skip: shouldSkip,
    message: "Too many logout requests, please try again later",
    store: getStore("logout"),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many logout requests from this IP, please try again later"
        });
    }
});

export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    skip: shouldSkip,
    message: "Too many password reset attempts, please try again after an hour",
    store: getStore("passwordReset"),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many password reset attempts from this IP, please try again after an hour"
        });
    }
});

