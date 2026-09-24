import { verifyAccessToken } from "../utils/jwt.js";
import { isTokenBlacklisted } from "../services/redis.service.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Invalid token format. Use 'Bearer <token>'",
            });
        }

        const token = authHeader.substring(7);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Token is missing.",
            });
        }

        // Check Redis Blacklist
        const isBlacklisted = await isTokenBlacklisted(token);
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: "Token is no longer valid (logged out).",
            });
        }

        const decoded = verifyAccessToken(token);

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
        req.token = token; // Attach raw token for logout/blacklisting

        next();

    } catch (error) {

        if (error.message === 'Access token has expired') {
            return res.status(401).json({
                success: false,
                message: "Token has expired. Please login again.",
            });
        }

        if (error.message === 'Invalid access token') {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Authentication failed.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error authenticating user.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};