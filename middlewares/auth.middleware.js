import { verifyAccessToken } from "../utils/jwt.js";

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

        const decoded = verifyAccessToken(token);

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

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