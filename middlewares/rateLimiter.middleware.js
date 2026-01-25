import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../config/redis.js";

const store = new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
});

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes",
    store: store,
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
    message: "Too many authentication attempts, please try again after 15 minutes",
    store: store,
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
    message: "Too many login attempts, please try again after an hour",
    store: store,
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
    message: "Too many registration attempts, please try again after an hour",
    store: store,
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
    message: "Too many logout requests, please try again later",
    store: store,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many logout requests from this IP, please try again later"
        });
    }
});

